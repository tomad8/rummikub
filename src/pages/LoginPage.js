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


class LoginPageBase extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.props.firebase
      .doSignInAnonymously()
      .then(() => {
        if (process.env.NODE_ENV !== 'production') console.log('Sucessfully signed in to Firebase'); 
        this.props.firebase.doLogEvent('login', {method: 'Anonymous'});
        
        let url = this.props.history.pathname;
        let domain;
        if (url) {
          if (process.env.NODE_ENV !== 'production') console.log('Url is: ' + url);
          let matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
          domain = matches && matches[1];  // domain will be null if no match is found
          if (process.env.NODE_ENV !== 'production') console.log('domain is: ' + domain);
        }
        else {
          console.error('URL is unknown, unable to obtain domain for firebase update')
        }

        this.props.firebase
          .user(this.props.user.authUser.uid)
          .update({
            domain: domain,
            lastLogin: this.props.firebase.timestampConstant(),
            })
          .then(
            () => {
        
              this.setState({ status: null, loading: false, error: null,});
              this.props.history.goBack() //TODO - this doesn't work if user navigates directly to /login page
            }
          ).catch(error => {
            console.error('Failed to save user login info to Firebase: ' + error.code + ' - ' + error.message)
            this.setState({ status: 'Failed to save user login info', loading: false, error: error });
          });
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


const LoginPage = props => (
  <div className='loginpage'>
    <LoginPageBase {...props} />
  </div>
);

export default withRouter(withFirebase(LoginPage));
