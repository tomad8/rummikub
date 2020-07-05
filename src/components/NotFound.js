import React from 'react';
import './Footer.css';
import * as ROUTES from '../constants/routes';
import { Link } from 'react-router-dom';
import Tile from './game/Tile';

const NotFound = () => (
  <div> 
    <div style={{paddingTop: '40px'}}> 
      <Tile overrideText='4' overrideColour='2' />
      <Tile overrideText='0' overrideColour='3' />
      <Tile overrideText='4' overrideColour='4' />
      </div>
    <h2>Sorry, the requested page was not found</h2>
    <p>If you are trying to join a game please double check the link you were sent.</p>
    <p>Go to the <Link to={ROUTES.LANDING}>home page</Link> for more options.</p>
  </div>
);
   
export default NotFound;