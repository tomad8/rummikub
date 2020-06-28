import React from 'react';
 
const FirebaseContext = React.createContext(null);

//Rather than using a render prop component, which is automatically given with React's Context Consumer component, 
//can use a higher-order component (HOC), implemented as follows:
export const withFirebase = Component => props => (
    <FirebaseContext.Consumer>
      {firebase => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
  );

export default FirebaseContext;