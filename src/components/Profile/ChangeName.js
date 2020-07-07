import React from 'react';
import './ChangeName.css';
import { withFirebase } from '../Firebase';

class ChangeName extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      displayName: this.props.user.displayName,
      error: null, };
  }

  onSubmit = event => {
    this.props.firebase
      .user(this.props.user.authUser.uid)
      .set({
        displayName: this.state.displayName.trim(),
        })
      .then(
        () => {
          console.log('Sucessfully updated displayName to: ' + this.state.displayName)
          this.props.firebase.doLogEvent('change_username', null)
          this.setState({ error: null, });
        })
      .catch(
        error => {
          console.log('Failed to update displayName: ' + error.code + ' - ' + error.message)
          this.setState({ error: error });
        });
  }
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      displayName,
      error,
    } = this.state;

    const isInvalid =
      !displayName.trim() ||
      displayName.trim().length > 20;
    
    const isAmended = displayName.trim() !== this.props.user.displayName;

    return (
      <div className="changename">
        <form onSubmit={this.onSubmit}>  
          <input
            name="displayName"
            value={displayName}
            onChange={this.onChange}
            type="text"
            maxLength="20"
            placeholder="Display name"
          />
          <button className="changenamebutton" disabled={isInvalid || !isAmended} type="submit">Confirm</button>
          {isInvalid && <p className="error">Display name must be between 1 and 20 characters in length</p>}
          {error && <p className="error">{error.message}</p>}
        </form> 
      </div>
    );
  }
}

export default withFirebase(ChangeName);
