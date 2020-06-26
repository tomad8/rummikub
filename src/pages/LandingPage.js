import React from 'react';
import './LandingPage.css';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

class LandingPage extends React.Component {
  
  render() {
    
    return (
      <div className='landingpage'>
        <p className="landingtitle">Rummi<i>h</i>ub</p>
        <p>Play Rummikub online with your friends</p>
       
        <div className="landingbuttons">
          <span><Link to={ROUTES.GAME}><span className="bigbutton">Create Game</span></Link></span>
          <span><Link to={ROUTES.GAME}><span className="bigbutton">Join Game</span></Link></span>
        </div>
        <div className='landingnote'>
          <p><strong>This is currently a work in progress</strong><br/>
            Single player only for now. See if you can make valid sets and clear your rack ㋡
          </p>
        </div>
      </div>
    );
  }
}


export default LandingPage;