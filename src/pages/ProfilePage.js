import React from 'react';
import './ProfilePage.css';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { AuthUserContext } from '../components/Session';
import ChangeName from '../components/Profile/ChangeName';


class ProfilePageBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isAnonymous: this.props.user && this.props.user.authUser ? this.props.user.authUser.isAnonymous : null,
      userId: this.props.user && this.props.user.authUser ? this.props.user.authUser.uid : null,
      dbUser: {
        displayName: null,
      },
    };
  }

  nameChangeComplete() {
     //go back to previous screen on completion of name change
     this.props.history.goBack(); 
  }

  render() {
    let userDetails;

    if (this.props.user && this.props.user.authUser) {
      userDetails = 
        <div>
          <div>
            <h2>Change your display name</h2>
          </div>
          <div className="profilebox">
            <ChangeName 
              user = {this.props.user}
              callback = {() => this.nameChangeComplete()}/>
          </div>
          <div>
            <h4>Login information</h4>
          </div>
          <div className="profilefooter">
            <table><tbody>
              {/*<tr><td>Display name: </td><td>{this.props.user.displayName}</td></tr>*/}
              <tr><td>User ID: </td><td>{this.props.user.authUser.uid}</td></tr>
              <tr><td>Anonymous: </td><td>{this.props.user.authUser.isAnonymous ? "True" : "False"}</td></tr>
            </tbody></table>
          </div>
          
          
          {/*
          <p>email: <strong>{this.props.authUser.email}</strong></p>
          <p>emailVerified: <strong>{this.props.authUser.emailVerified ? "True" : "False"}</strong></p>
          <p>photoURL: <strong>{this.props.authUser.photoURL}</strong></p>
          <p>providerData: <strong>{this.props.authUser.providerData}</strong></p>
          */}
        </div>
    }
    else {
      userDetails = <p>Unable to get user details. Please try refreshing the page.</p>
    }
  
    return (
          <div>
            {userDetails}
          </div>
    );
  }
}

const ProfilePage = props => (
  <AuthUserContext.Consumer>
    {user => (
      <div className='profilepage'>
       <ProfilePageBase {...props} user={user} />
      </div>
    )}
  </AuthUserContext.Consumer>
);

export default withRouter(withFirebase(ProfilePage));
