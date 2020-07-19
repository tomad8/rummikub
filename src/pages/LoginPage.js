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
      .then(() => {
        if (process.env.NODE_ENV !== 'production') console.log('Sucessfully signed in to Firebase')
        this.props.firebase.doLogEvent('login', {method: 'Anonymous'})
        this.setState({ status: null, loading: false, error: null,});
        this.props.history.goBack() //TODO - this doesn't work if user navigates directly to /login page
      })
      .catch(error => {
        console.error('Failed to sign in to Firebase: ' + error.code + ' - ' + error.message)
        this.setState({ status: 'Failed to authenticate with server', loading: false, error: error });
      });
  }
      
  render() {
    const { status, loading, error } = this.state;

    return (
      <div>
        {error && <p className='error notification'>{error.message}</p>}
        {/*status && <p className='notification'>{status}</p>*/}
        {status && <p className='error'>{status}</p>}
        {loading && <Loading />}
      </div>
    );
  }
}

const LoginForm = withRouter(withFirebase(LoginFormBase));
 
export default LoginPage;