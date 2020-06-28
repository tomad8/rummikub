import React from 'react';
import './TitleBar.css';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import usericon from '../icons/user.svg';
import burgericon from '../icons/burger.svg';
import '../icons/icon.css';


const TitleBar = ({ authUser }) => (
  <div className='titlebarbg'> 
    <div className='titlebar'> 
      <Link className='menulink' to={ROUTES.LANDING}>
        <img src={burgericon} alt="Menu icon" className="menuicon" height="25px" width="25px" />
        <span>Rummi<i>h</i>ub</span>
      </Link>
      <Link className='userlink' to={ROUTES.PROFILE}>
        <span>{authUser ? "User " + authUser.uid.substring(0, 8) : ""}</span>
        <img src={usericon} alt="User icon" className="usericon" height="22px" width="22px" />
      </Link>
    </div>
  </div>
);
   
export default TitleBar;