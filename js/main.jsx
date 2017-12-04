import React from 'react';
import ReactDOM from 'react-dom';
import Tanks from './tanks';

document.addEventListener("DOMContentLoaded", ()=> {
  const main = document.getElementById("root");
   ReactDOM.render(<Tanks />, main);
 });
