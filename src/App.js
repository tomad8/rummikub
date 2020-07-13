import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, withRouter, Switch } from 'react-router-dom';
import { withAuthentication } from './components/Session';
import * as ROUTES from './constants/routes';
import TitleBar from './components/TitleBar';
//import Footer from './components/Footer';
import NotFound from './components/NotFound';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import Footer from './components/Footer';

const App = () => (
  <Router>
    <AppForm />
  </Router>
)

class AppFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      themeToggleLabel: document.getElementsByTagName('body')[0].className === 'theme-light' ? 'Dark mode' : 'Light mode',
    };
  }

  componentDidMount() {
    if (!this.props.authUser /*&& this.props.location.pathname === ROUTES.LANDING*/) {
      this.props.history.push(ROUTES.LOGIN);
    }
  }

  handleThemeToggle () {
    let body = document.getElementsByTagName('body')[0];
    if (body.className === 'theme-light') {
      body.className = 'theme-dark';
      this.setState({themeToggleLabel: 'Light mode',});
    }
    else {
      body.className = 'theme-light';
      this.setState({themeToggleLabel: 'Dark mode',});
    }
  }

  render() {
    return (
      <div className="app">
        <TitleBar />
        {/*<p>{this.props.location.pathname}</p>*/}
        
        {/*<Route exact path={ROUTES.LANDING} component={LandingPage} />*/}
        <Switch>
          <Route exact path={ROUTES.LANDING} component={LandingPage} />
          <Route path={ROUTES.GAME} component={GamePage} />
          <Route exact path={ROUTES.JOIN} component={JoinPage} />
          <Route exact path={ROUTES.LOGIN} component={LoginPage} />
          <Route exact path={ROUTES.PROFILE} component={ProfilePage} />
          {/*<Route path={ROUTES.GAME} render={(routeProps) => (<GamePage {...routeProps} authUser={this.state.authUser} />)} />*/}
          {/*<Route path={ROUTES.LOGIN} render={(routeProps) => (<LoginPage {...routeProps} prevRoute={this.props.location.pathname} />)} />*/}
          {/*<Route path={ROUTES.PROFILE} render={(routeProps) => (<ProfilePage {...routeProps} authUser={this.state.authUser} />)} />*/}
          <Route component={NotFound} />
        </Switch>
        <Footer 
          themeToggleLabel={this.state.themeToggleLabel}
          onThemeToggle={() => this.handleThemeToggle()}
          />
      </div> 
    );
  }
}

const AppForm = withAuthentication(withRouter(AppFormBase));
//const AppForm = withAuthentication(AppFormBase);

export default App;
