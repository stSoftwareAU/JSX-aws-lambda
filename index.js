var spawn = require('child_process').spawn;
var fs = require('fs')

exports.handler = (event, context, callback) => {
    
    //var wp = spawn('./node_modules/.bin/webpack', ['--config', 'webpack.config.js', '--mode', 'production']);
    var wp = spawn('npm', ['run-script', 'build']);
    //var wp = spawn('pwd');
    
    wp.stdout.on('data', function(data){
      console.log('stdout: ' + data);
    });
    
    wp.stderr.on('data', function(err){
      callback("writeFile failed: " + err);
    });
    
    wp.on('close', (code) => {
        fs.readFile('/tmp/bundle.js', 'utf8', function (err,data) {
            if (err) {
                callback("read file failed: " + err);
            }
            callback(null, data);
         });

    });
};
