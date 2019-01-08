var fs = require('fs')

const lambda = require('../index');
test('check handler', () => {

 fs.unlinkSync("/tmp/bundle.js");
  let event={};
  let context={};

  let promise=new Promise( function( reslove, reject){
      let callback=function( failed,success)
      {
         if( failed)
         {
             reject( failed);
         }
         else
         {
             reslove( success);
         }
      };
      lambda.handler(event,context,callback);
  });

  promise.then( function( result){
      expect(result).toMatch(/!function/m);
  }).catch( error => fail( error));
});


