import React from 'react';
import './TitleBar.css';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';


const TitleBar = () => (
  <div className='titlebarbg'> 
    <div className='titlebar'> 
      <Link className='title' to={ROUTES.LANDING}>Rummi<i>h</i>ub</Link>
      <Link className='usermenu' to={ROUTES.PROFILE}><span role="img">👤</span>Player 1</Link>
    </div>
  </div>
);
   
export default TitleBar;