var fs = require('fs');

const lambda = require('../index');
const event_data = require( './event.json');
test('check handler', () => {
  const fn="/tmp/dist/bundle.js";
  if( fs.existsSync(fn))
  {
    fs.unlinkSync(fn);
  }
  //const event=JSON.parse(fs.readFileSync('event.json', 'utf8'));

  let context={};

  let promise=new Promise( function( reslove, reject){
      let callback=function( failed,success)
      {
         if( failed)
         {
           reject( failed);
           console.error( "failed: " + failed);
         }
         else
         {
           reslove( success);
         }
      };
      try{
        lambda.handler(event_data,context,callback);
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
