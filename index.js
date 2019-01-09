var exec = require('child_process').exec;
var cp = require('child_process');
var fs = require('fs')
var path = require('path');

exports.handler = (event, context, callback) => {
  /* Set to false to send the response right away when the callback executes*/
  context.callbackWaitsForEmptyEventLoop=false;
  const wdDir="/tmp/wd";
  deleteFolderRecursive( wdDir);
  const srcDir=wdDir+"/src";
  const distDir =wdDir+"/dist";
  const outFile=distDir + "/bundle.js";

  if( ! event.script )
  {
    callback("missing script");
  }
  else {
    cp.spawnSync( "cp",["-a", "./", wdDir]);

    if( event.devDependencies)
    {
      const packageJSON=JSON.parse(fs.readFileSync(wdDir +'/package.json', 'utf8'));
      console.info( JSON.stringify( packageJSON, null, 2));
      packageJSON.devDependencies=Object.assign( packageJSON.devDependencies,event.devDependencies);
      //console.info( JSON.stringify( packageJSON, null, 2));
      fs.writeFileSync( wdDir +'/package.json', JSON.stringify(packageJSON,null, 2));
      cp.spawnSync(
        "npm",
        ["install"],{
          cwd:wdDir
        }
      );
    }

    fs.mkdirSync(srcDir);
    fs.appendFileSync(srcDir + '/index.js', event.script);
    //var wp = spawn('./node_modules/.bin/webpack', ['--config', 'webpack.config.js', '--mode', 'production']);
  //  var wp = spawn('npm', ['run-script', 'build']);
    var wp = exec(
      'npm run-script build',
      {
          cwd:wdDir
      },
      (error, stdout, stderr) => {
        if (error && error.signal) {
          var msg='[ERROR]: "' + error.name + '{' + error.signal + '}'+ '" - ' + error.message + '\n' + stderr;
          msg=msg.trim();
          console.error( msg );
          callback(msg);
          return;
        }

        if( fs.existsSync( outFile))
        {
          try{
            callback(
              null,
              fs.readFileSync(outFile, 'utf8')
            );
          }
          catch( e)
          {
            callback( "could not read: " + e);
          }
        }
        else {
          callback( "No file: " + outFile);
        }
      }
    );
    //var wp = spawn('pwd');

    wp.stdout.on('data', function(data){
      console.info( data );
    });

    wp.stderr.on('data', function(err){
      console.error( err );
    });

  }
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
