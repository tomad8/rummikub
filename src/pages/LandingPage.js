import React from 'react';
import './LandingPage.css';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

class LandingPage extends React.Component {
  
  render() {
    
    return (
      <div className='landingpage'>
        <p>Landing Page</p>
        <p><Link to={ROUTES.GAME}>Start Game</Link></p>
      </div>
    );
  }
}


export default LandingPage;