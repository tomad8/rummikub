import React from 'react';
import './Loading.css';

const Loading = (props) => (
  <div className={props.inLine  ? "loadingspinner loadingspinner-inline" 
                                : (props.inTitle ? "loadingspinner loadingspinner-title"
                                                 : "loadingspinner loadingspinner-fixed")}>
    <div id="square1"></div>
    <div id="square2"></div>
    <div id="square3"></div>
    <div id="square4"></div>
    <div id="square5"></div>
  </div>
);
   
export default Loading;