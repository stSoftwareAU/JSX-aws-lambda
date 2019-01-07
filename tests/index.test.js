var fs = require('fs')

const lambda = require('../index');
test('check handler', () => {

 fs.unlinkSync("/tmp/bundle.js");
  let event={};
  let context={};

  let result="";
  let callback=function( failed,success)
  {
      expect(success).toMatch(/!function/m);
  };

  lambda.handler(event,context,callback);
});


