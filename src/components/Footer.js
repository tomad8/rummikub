import React from 'react';
import './Footer.css';

const Footer = (props) => (
  <div className='footerbg'> 
    <div className='footer'> 
      {
        "Made by Tom Adey.  "
      /*[
        "Made by Tom Adey.",
        "Built by Tom Adey.",
        "Designed by Tom Adey.",
        "Debugged by Tom Adey.",
        "Tested by Tom Adey.",
        "Code typed by Tom Adey.",
        "Scrutinised by Tom Adey.",
        "Painstakingly pieced together by Tom Adey.",
        "Assembled by Tom Adey. Batteries not included.",
        "Copying and pasting by Tom Adey.",
        "Bugs splatted by Tom Adey.",
        "Pull requests pulled by Tom Adey.",
        "Branches merged by Tom Adey.",
        "Daily stand-ups chaired by Tom Adey.",
        "Coffee brewed by Tom Adey.",
        "Pizza eaten by Tom Adey.",
        "Tom Adey's blood, sweat and tears can be found within the minified javascript of these pages.",
        "Tom Adey made this.",
        "Tom Adey was here.",
        "Tom Adey. That's Numberwang.",
      ]*/
      }
      <span className="footertextlink" onClick={props.onThemeToggle}>{props.themeToggleLabel}</span>
    </div>
  </div>
);
   
export default Footer;