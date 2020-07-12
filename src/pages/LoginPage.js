import React from 'react';
import './LoginPage.css';
import { withRouter } from 'react-router-dom';
//import * as ROUTES from '../constants/routes';
import { withFirebase } from '../components/Firebase';
import Loading from '../components/Loading';

const INITIAL_STATE = {
  status: null,
  loading: true,
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
        //TODO: investigate this - it is creating a null user if uid is null
        return this.props.firebase
          .user(authUser.uid)
          .set({
            anonymous: true, //don't need, because can get from authUser
            displayName: null,
          });
      }).then(() => {
        console.log('Sucessfully signed in to Firebase')
        this.props.firebase.doLogEvent('login', {method: 'Anonymous'})
        this.setState({ status: null, loading: false, error: null,});
        //this.props.history.push(ROUTES.LANDING); 
        //Redirect back to previous route, not always to landing:
        //console.log("Redirecting back to: " + this.props.prevRoute); //undefined :(
        //this.props.history.push(this.props.prevRoute);
        this.props.history.goBack(); //TODO - this doesn't work if user navigates directly to /login page
      })
      .catch(error => {
        console.log('Failed to sign in to Firebase: ' + error.code + ' - ' + error.message)
        this.setState({ status: 'Failed to authenticate with server', loading: false, error: error });
      });
  }
      
  render() {
    const { status, loading, error } = this.state;

    return (
      <div style={{padding: '10px', paddingTop: '50px'}} >
        {error && <p className='error notification'>{error.message}</p>}
        {status && <p className='notification'>{status}</p>}
        {loading && <Loading />}
      </div>
    );
  }
}

const LoginForm = withRouter(withFirebase(LoginFormBase));
 
export default LoginPage;