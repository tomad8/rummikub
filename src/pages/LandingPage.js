import React from 'react';
import './LandingPage.css';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

class LandingPage extends React.Component {
  
  render() {
    
    return (
      <div className='landingpage'>
        <h1 className="landingtitle">Rummi<i>h</i>ub</h1>
        <h3>Play Rummikub online with your friends</h3>
       
        <div className="landingbuttons">
          <span><Link to={ROUTES.GAME}><button className="bigbutton">Create Game</button></Link></span>
          <span><Link to={ROUTES.GAME}><button className="bigbutton">Join Game</button></Link></span>
        </div>
        <div className='landingnote'>
            <h4>This is currently a work in progress</h4>
            <p>Single player only for now. See if you can make valid sets and clear your rack <strong>㋡</strong></p>
        </div>
      </div>
    );
  }
}


export default LandingPage;