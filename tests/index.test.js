const lambda = require('../index');
test('check handler', () => {

  let event={};
  let context={};

  let result="";
  let callback=function( failed,success)
  {
      expect(success).toMatch(/!function/m);
  };

  lambda.handler(event,context,callback);
});


