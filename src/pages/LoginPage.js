import React from 'react';
import './LoginPage.css';
import { withRouter } from 'react-router-dom';
//import * as ROUTES from '../constants/routes';
import { withFirebase } from '../components/Firebase';

const INITIAL_STATE = {
  status: 'Loading...',
  error: null,
};

const LoginPage = () => (
  <div className='loginpage'>
    <LoginForm />
  </div>
);

class LoginFormBase extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.props.firebase
      .doSignInAnonymously()
      .then(authUser => {
        // Create a user in Firebase realtime database
        return this.props.firebase
        //return this.props.firebase
          .user(authUser.user.uid)
          .set({
            anonymous: true,
          });
      }).then(() => {
        console.log("Sucessfully signed in to Firebase")
        this.props.firebase.doLogEvent("login", {method: "Anonymous"})
        this.setState({ status: 'Logged in', error: null,});
        //this.props.history.push(ROUTES.LANDING); 
        //Redirect back to previous route, not always to landing:
        //console.log("Redirecting back to: " + this.props.prevRoute); //undefined :(
        //this.props.history.push(this.props.prevRoute);
        this.props.history.goBack(); //TODO - this doesn't work if user navigates directly to /login page
      })
      .catch(error => {
        console.log('Failed to sign in to Firebase: ' + error.code + ' - ' + error.message)
        this.setState({ status: 'Failed to authenticate with server', error });
      });
  }
      
  render() {
    const { status, error } = this.state;

    return (
      <div>
        <p>{status}</p>
        {error && <p className='error'>{error.message}</p>}
      </div>
    );
  }
}

const LoginForm = withRouter(withFirebase(LoginFormBase));
 
export default LoginPage;