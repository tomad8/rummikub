//import app from 'firebase/app';
//import 'firebase/auth';

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
//import "firebase/firestore";
import 'firebase/database';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
  };

 class Firebase {
    constructor() {
      firebase.initializeApp(config);

      this.auth = firebase.auth();
      this.analytics = firebase.analytics();
      this.db = firebase.database();
    }

    // *** Auth API ***
    
    // Methods for Anonymous auth
    doSignInAnonymously = () => this.auth.signInAnonymously();

    // Methods for Email/Password auth
    doCreateUserWithEmailAndPassword = (email, password) =>
      this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
      this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);


    // *** Analytics API ***
    doLogEvent = (eventName, eventParams, options) => 
      this.analytics.logEvent(eventName, eventParams, options);
    

    // *** DB - User API ***
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    // *** DB - Game API ***
    game = gameid => this.db.ref(`games/${gameid}`);
    games = () => this.db.ref('games');


    

  }

  export default Firebase;