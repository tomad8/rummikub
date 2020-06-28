import React from 'react';
import './ProfilePage.css';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';


const ProfilePage = ({ authUser }) => (
  <div className='profilepage'>
    <p>Profile Page</p>
      <ProfileForm authUser={authUser} />
  </div>
);

class ProfileFormBase extends React.Component {

  render() {
    
    let userDetails;

    if (this.props.authUser) {
      userDetails = 
        <div>
          <p>userID: <strong>{this.props.authUser.uid}</strong></p>
          <p>isAnonymous: <strong>{this.props.authUser.isAnonymous ? "True" : "False"}</strong></p>
          <p>displayName: <strong>{this.props.authUser.displayName}</strong></p>
          <p>email: <strong>{this.props.authUser.email}</strong></p>
          <p>emailVerified: <strong>{this.props.authUser.emailVerified ? "True" : "False"}</strong></p>
          <p>photoURL: <strong>{this.props.authUser.photoURL}</strong></p>
          <p>providerData: <strong>{this.props.authUser.providerData}</strong></p>
        </div>
    }
    else {
      userDetails = <p>Not authenticated</p>
    }
  
    return (
      <div>
        {userDetails}
      </div>
    );
  }
}

const ProfileForm = withRouter(withFirebase(ProfileFormBase));

export default ProfilePage;