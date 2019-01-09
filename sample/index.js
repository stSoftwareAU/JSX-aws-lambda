import React from "react";
import ReactDOM from "react-dom";
import Select from 'react-select'

function myFunction(x, y = 10) {
  // y is 10 if not passed or undefined
  return x + y;
}
myFunction(5); // will return 15

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

const MyComponent = () => (
  <Select options={options} />
);
const name = 'Josh Perez';
const element = <div>
<h1>Hello, {name}</h1>
<br/>
<MyComponent/>
</div>
;

ReactDOM.render(
  element,
  document.getElementById('root')
);
