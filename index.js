
//import createWebpackConfig from './webpack.config.js';
// initialize in-memory filestystem
const MemoryFS = require('memory-fs');
var webpack = require("webpack");

const {promisify} = require("es6-promisify");
//var MemoryFileSystem = require("memory-fs");

// the lambda handler
// event contains information from the source of the lambda invocation
// it could be data provided by manually invoking it, a payload from 
// API Gateway, an S3 putObject event or an SNS topic message.
// we are going to create a scheduled lambda function through CloudWatch
// and don't actually use the event data
exports.handler = async(event, context, callback) => {

  //ca llback(null, "xyz");
    perform()
      .then( function( value) { callback( null, value)})
      .catch( e => {console.warn( e);callback( e);});

}

function loadFiles(fs) {
  fs.mkdirSync("/src");

  var buf = Buffer.from("const iAmJavascriptES6 = () => console.log(...arr);\nwindow.iAmJavascriptES6 = iAmJavascriptES6;", "utf-8");
  fs.writeFileSync("/src/index.js", buf);
}

// for async/await
async function perform() {
  // create webpack config from latest props
  const config = {
//     entry: "/src",
	module: {
	    rules: [
	      {
		test: /\.(js|jsx)$/,
		exclude: /node_modules/,
		use: {
		  loader: "babel-loader"
		}
	      }
	    ]
	  }

  }; // await createWebpackConfig()

  const fs = new MemoryFS();

 // loadFiles(fs);
  // compile with webpack
  const files = await compile(config, fs)
  // upload files to s3
  // await Promise.all(files.map(upload))
  // invalidate cache
  //const invalidation = await invalidate()

  return "XYZ";
}

// compiles the provided config with webpack
// returns the build files
async function compile(config, fs) {
  // initialize compiler
  const compiler = webpack(config)

  // tell webpack to output to the in-memory filesystem
  compiler.outputFileSystem = fs

  // run the compiler
  compiler.run((err,stats )=>{
	  // error will be visible from the Lambda function console
	  if (stats.hasErrors())
	    throw new Error(`Compiler error: ${stats.toJson().errors[0]}`)
  });
  //const stats = await compile()


  // returns a list of file names, their content type and contents
  const files = fs.readdirSync(config.output.path).map((name) => ({
    name,
    type: mime.lookup(name),
    contents: fs.readFileSync(path.resolve(config.output.path, name))
  }))

  return files
}

// upload a file to the S3 bucket
// async function upload(file) {
//   const params = {
//     Bucket: process.env.S3_BUCKET,
//     ACL: 'public-read',
//     Key: file.name,
//     ContentType: file.type,
//     Body: file.contents
//   }

//   return s3.putObject(params).promise()
// }

// create a cloudfront invalidation
// async function invalidate() {
//   const params = {
//     DistributionId: process.env.CF_DISTRIBUTION,
//     InvalidationBatch: {
//       // unique id of the invalidation
//       CallerReference: `${+(new Date())}`,
//       Paths: {
//         Quantity: 1,
//         // invalidates the entire S3 bucket
//         Items: ['/*']
//       }
//     }
//   }

//   return cloudfront.createInvalidation(params).promise()
// }

