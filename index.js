var exec = require('child_process').exec;
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
const wdDir="/tmp/wd";
// const os = require('os');

exports.handler = (event, context, callback) => {

  if( ! event.scripts )
  {
    callback("ERROR: missing scripts");
  }

  if( fs.existsSync( wdDir)==false)
  {
    console.info( "create: " + wdDir);
    fs.mkdirSync(wdDir);
  }

  const lockFile=wdDir+"/lockFile";

  var lockPromise = new Promise( function(resolve, reject) {
    if( lock( lockFile))
    {
      resolve('locked');
    }
    else{
      var lockInterval = setInterval(
        function()
        {
          if( lock(lockFile))
          {
            resolve( "locked");
            clearInterval(lockInterval);
          }
        },
        100
      );

    }
  });

  lockPromise
    .then( perform(event, context, callback)).then( () =>fs.unlinkSync(lockFile))
    .catch( function(err){fs.unlinkSync(lockFile);throw err});
}
function lock( filename)
{
  try{
    fs.writeFileSync(filename, "locked");
    return true;
  }
  catch( e)
  {
    console.info( "can't lock: " + filename);
    fs.stat( filename, function( err, stat ) {
        if ( err ) return console.error( err );
        var livesUntil = new Date();
        livesUntil.setHours(livesUntil.getHours() - 1);
        if ( stat.ctime < livesUntil ) {
            fs.unlink( filename, function( err ) {
                if ( err ) return console.error( err );
            });
        }
    });

    return false;
  }
}
function perform(event, context, callback){
    const scripts = event.scripts;
    const srcDir=wdDir+"/src";
    const distDir =wdDir+"/dist";
    deleteFolderRecursive( srcDir);
    deleteFolderRecursive( distDir);
    const outFile=distDir + "/bundle.js";

    cp.spawnSync( "cp",["-a","--no-clobber", "./node_modules", wdDir]);
    cp.spawnSync( "cp",["-a","--no-clobber", "./package-lock.json", wdDir]);
    cp.spawnSync( "cp",["./webpack.config.js", wdDir]);
    let currentPackageJSON={};
    if( fs.existsSync( wdDir +'/package.json'))
    {
        currentPackageJSON=JSON.parse(fs.readFileSync(wdDir +'/package.json', 'utf8'));
    }
    let newPackageJSON=JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if( event.devDependencies)
    {
      //console.info( JSON.stringify( packageJSON, null, 2));
      //let packageJSON= JSON.parse(JSON.stringify(newPackageJSON));
      if(event.packageGzipped){
          newPackageJSON.devDependencies = JSON.parse(zlib.gunzipSync(new Buffer(event.devDependencies, 'base64')).toString('utf8'));
      }
      else{
        newPackageJSON.devDependencies=Object.assign( newPackageJSON.devDependencies,event.devDependencies);
      }
      //console.info( JSON.stringify( packageJSON, null, 2));
      //newPackageJSON=packageJSON;
      fs.writeFileSync( wdDir +'/package.json', JSON.stringify(newPackageJSON,null, 2));
    }
    else {
      cp.spawnSync( "cp",["./package.json", wdDir]);
    }
  // console.info( "vvvvvvvvvvvvvvvvvvvvvvvvvv");
  // console.info( JSON.stringify(JSON.parse(fs.readFileSync(wdDir +'/package.json', 'utf8')),null, 2));
  // console.info( "^^^^^^^^^^^^^^^^^^^^^^^^^^");
  // console.log( JSON.stringify(process.env, null, 2));
  // console.log( JSON.stringify(process.argv, null, 2));
  // ls( "./");
  // ls( "/tmp");
      // pwd();
      console.log(JSON.stringify(newPackageJSON));
    if(
    //  fs.existsSync( wdDir +'/node_modules') ==false ||
      JSON.stringify( currentPackageJSON)!= JSON.stringify( newPackageJSON)
    )
    {

      const nodeCmd=process.argv[0];
      const npmCmd=process.cwd() + "/node_modules/npm/bin/npm-cli.js";
      console.info( nodeCmd + " " + npmCmd + " install");

      let p=cp.spawnSync(
        nodeCmd,
        [npmCmd, "install", "--ignore-scripts", "--yes"],
        // ["--version"],
        // [process.env.HOME +"/node_modules/npm/bin/npm-cli.js","install"],
        {
          cwd:wdDir,
          shell:true,
          env:{
            HOME:"/tmp/wd"
          }
        }
      );

      console.info( "pid: " + p.pid +", status: " + p.status + ", signal: " + p.signal);
      var out=p.stdout.toString();
      if( out != "")
      {
        console.info( "[STDOUT]" + out);
      }
      var err=p.stderr.toString();
      if( err !="")
      {
        console.error( "[STDERR]" + err);
      }
      //
      // ls( wdDir);
      // ls( wdDir+"/node_modules/react-select");
    }

    if(
      fs.existsSync( wdDir +'/node_modules') ==false
    )
    {
        return callback("ERROR: no node modules installed");
    }
  // return callback(null, "hack");
    fs.mkdirSync(srcDir);
    for(let i = 0;i < scripts.length;i++){
        const filename = scripts[i].name;
        const script = scripts[i].script;
        
        const fullFilename = srcDir + '/' + filename;
        mkdirIfNotExist(fullFilename);
        if(scripts[i].gzipped){
            const binary = new Buffer(script, 'base64');
            fs.writeFileSync(fullFilename, zlib.gunzipSync(binary));
        }
        else{
            fs.writeFileSync(fullFilename, script);
        }
    }
    //var wp = spawn('./node_modules/.bin/webpack', ['--config', 'webpack.config.js', '--mode', 'production']);
  //  var wp = spawn('npm', ['run-script', 'build']);
    var wp = exec(
        //  'npm run-script build',
        './node_modules/.bin/webpack --config webpack.config.js --mode production',
        {
            cwd: wdDir
        },
        (error, stdout, stderr) => {
            if (error) {
                var msg = '[ERROR]: "' + error.name + '" - ' + error.message + '\n' + stderr;
                msg = msg.trim();
                console.error(msg);
                callback("ERROR: " + msg);
                return;
            }

            if (fs.existsSync(outFile))
            {
                console.log("list of dist files in " + distDir);
                console.log(fs.readdirSync(distDir));
                try {
                    const js = fs.readFileSync(outFile, 'utf8');
                    if(event.uploadToS3 && event.project && event.version)
                    {
                        const bucket = "st-react";
                        const key = event.project + "/index-" + event.version + ".js";
                        
                        const aws = require('aws-sdk');
                        const s3 = new aws.S3();
                        const params = {
                                Bucket : bucket,
                                Key: key,
                                Body: zlib.gzipSync(js, 'utf8'),
                                ContentEncoding: "gzip",
                                ContentType: "text/javascript"
                            };
                            s3.putObject(params, function(err, data) {
                              if (err){
                                  console.log(err, err.stack);
                                  callback(err);
                              }
                              else{
                                  console.log(data);
                                  const copyParams = {
                                    Bucket : bucket,
                                    CopySource: "/" + bucket + "/" + key,
                                    Key: event.project + "/index-latest.js"
                                  }
                                  if(event.publicS3){
                                      copyParams.ACL = "public-read";
                                  }
                                  s3.copyObject(copyParams, function(err, data){
                                      if(err){
                                        console.log(err, err.stack);
                                        callback(err);
                                      }
                                      else{
                                          console.log(data);
                                          callback(null, data);
                                      }
                                  });
                              }
                            });
                    }
                    else{
                        callback(
                                null,
                                js
                                );
                    }
                } catch (e)
                {
                    callback("ERROR: could not read: " + e);
                }
            } else {
                callback("ERROR: No file: " + outFile);
            }
        }
    );
    //var wp = spawn('pwd');

    wp.stdout.on('data', function (data) {
        console.info(data.toString());
    });

    wp.stderr.on('data', function (err) {
        console.error(err.toString());
    });
};

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function mkdirIfNotExist(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  mkdirIfNotExist(dirname);
  fs.mkdirSync(dirname);
}

function ls( dir)
{
  let p=cp.spawnSync(
    "ls",
    ["-la", dir]
  );

  console.info( "ls -la "+ dir);
  console.info( p.stdout.toString());
  if( p.error)
  {
    console.error( "[STDERR]" + p.stderr.toString());
  }
}

// function pwd( )
// {
//   let p=cp.spawnSync(
//     "pwd"
//   );
//
//   console.info( "pwd");
//   console.info( p.stdout.toString());
// }
