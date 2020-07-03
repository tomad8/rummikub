import React from 'react';
import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
        super(props);
     
        this.state = {
          user: {
            authUser: null,
            dbUser: null,
          },
        };
      }
    
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
        authUser
          ? this.loadDatabaseUser(authUser)
          : this.setState({ 
              user: {
                authUser: null, 
                dbUser: null, 
                displayName: null,
              }, 
            });
      });
    }
    
    componentWillUnmount() {
      this.listener();
    }

    loadDatabaseUser(authUser) {
      this.props.firebase.user(authUser.uid)
      .on('value', snapshot => {
        this.setState({ 
          user: {
            authUser: authUser, 
            dbUser: snapshot.val(), 
            displayName: (snapshot.val() && snapshot.val().displayName ? snapshot.val().displayName : "User " + authUser.uid.substring(0, 6)),
          }, 
        })
      });
    }
    
    render() {
      return (
        <AuthUserContext.Provider value={this.state.user}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }
 
  return withFirebase(WithAuthentication);
};
 
export default withAuthentication;