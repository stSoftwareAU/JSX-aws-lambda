const lambda = require('../index');
test('check handler', () => {
  let event={};
  let context={};

  let result="";
  let callback=function( failed,success)
  {
  console.log( "failed: " + failed);
  console.log( "success: " + success);
     result=success;
  };

  console.log( "result->" + result);
  lambda.handler(event,context,callback);
  expect(result).toBe("XYZ");
});


