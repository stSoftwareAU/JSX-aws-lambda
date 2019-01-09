var fs = require('fs');

const lambda = require('../index');

test('check handler', () => {
  const fn="/tmp/dist/bundle.js";
  if( fs.existsSync(fn))
  {
    fs.unlinkSync(fn);
  }
  //const event=JSON.parse(fs.readFileSync('event.json', 'utf8'));
  let event_data={
      script: fs.readFileSync('./sample/index.js', 'utf8'),
      packages:[
        {"react-select":"2.2.0"}
      ]
  };
  console.info( JSON.stringify(event_data,null, 2));

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
