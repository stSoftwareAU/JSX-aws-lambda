var spawn = require('child_process').spawn;
var fs = require('fs')

var deleteFolderRecursive = function(path) {
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

exports.handler = (event, context, callback) => {
  const srcDir="/tmp/src";
  const outFile="/tmp/bundle.js";

  deleteFolderRecursive( srcDir);

  if( ! event.script )
  {
    callback("missing script");
  }
  else {
    fs.mkdirSync(srcDir);
    fs.appendFileSync(srcDir + '/index.js', event.script);
    //var wp = spawn('./node_modules/.bin/webpack', ['--config', 'webpack.config.js', '--mode', 'production']);
    var wp = spawn('npm', ['run-script', 'build']);
    //var wp = spawn('pwd');

    wp.stdout.on('data', function(data){
      console.log('stdout: ' + data);
    });

    wp.stderr.on('data', function(err){
      callback(err);
    });

    wp.on('close', (code) => {

      if( fs.existsSync( outFile))
      {
        callback(
          null,
          fs.readFileSync(outFile, 'utf8')
        );
      }
      else {
        callback( "No file: " + outFile);
      }
    });
  }
};
