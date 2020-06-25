import React from 'react';
/*import logo from './logo.svg';*/
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import TitleBar from './components/TitleBar';
import * as ROUTES from './constants/routes';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';


function App() {
  return (
    <div className="app">
      <Router>
        <TitleBar />
        
        {/*<Route exact path={ROUTES.LANDING} component={LandingPage} />*/}
        <Route exact path={ROUTES.LANDING} component={LandingPage} />
        <Route path={ROUTES.GAME} component={GamePage} />
        <Route path={ROUTES.PROFILE} component={ProfilePage} />
        
      </Router>
    </div> 
  );
}

export default App;
