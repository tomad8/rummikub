import React from 'react';
import {BrowserRouter as Router, Route, withRouter} from 'react-router-dom';
import './App.css';
import TitleBar from './components/TitleBar';
import * as ROUTES from './constants/routes';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
//import { FirebaseContext } from './components/Firebase';
import { withFirebase } from './components/Firebase';

const App = () => (
  <Router>
    <AppForm  />
  </Router>
)

class AppFormBase extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      authUser: null,
    };
  }
 
  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState({ authUser })
        : this.setState({ authUser: null });
    });

    if (!this.state.authUser /*&& this.props.location.pathname === ROUTES.LANDING*/) {
      this.props.history.push(ROUTES.LOGIN);
    }
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <div className="app">
        
          <TitleBar authUser={this.state.authUser} />
          {/*<p>{this.props.location.pathname}</p>*/}
          
          {/*<Route exact path={ROUTES.LANDING} component={LandingPage} />*/}
          <Route exact path={ROUTES.LANDING} component={LandingPage} />
          <Route path={ROUTES.GAME} render={(routeProps) => (<GamePage {...routeProps} authUser={this.state.authUser} />)} />
          <Route path={ROUTES.LOGIN} component={LoginPage} />
          {/*<Route path={ROUTES.LOGIN} render={(routeProps) => (<LoginPage {...routeProps} prevRoute={this.props.location.pathname} />)} />*/}
          <Route path={ROUTES.PROFILE} render={(routeProps) => (<ProfilePage {...routeProps} authUser={this.state.authUser} />)} />
          
      </div> 
    );
  }
}

const AppForm = withRouter(withFirebase(AppFormBase));
 
export default App;
