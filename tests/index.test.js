import event from "./event.js";

var fs = require('fs')

const lambda = require('../index');
test('check handler', () => {
  const fn="/tmp/bundle.js";
  if( fs.existsSync(fn))
  {
    fs.unlinkSync(fn);
  }

  let context={};

  let promise=new Promise( function( reslove, reject){
      let callback=function( failed,success)
      {
         if( failed)
         {
           reject( failed);
           console.warn( "failed: " + failed);
         }
         else
         {
           reslove( success);
         }
      };
      try{
        lambda.handler(event,context,callback);
      }
      catch( e){
        console.warn( "reject: " + e);
        reject( e);
      }

  });

  promise.then(
    result =>
      expect(result).toMatch(/!function/m)
  ).catch( error => fail( error));

  console.log( "completed");
});
