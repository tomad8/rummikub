import React from 'react';
import './Footer.css';
import * as ROUTES from '../constants/routes';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div > 
    <h2>Page Not Found</h2>
    <p><Link to={ROUTES.LANDING}>Go to home page</Link></p>
  </div>
);
   
export default NotFound;