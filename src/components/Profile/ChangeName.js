import React from 'react';
import './ChangeName.css';
import { withFirebase } from '../Firebase';

class ChangeName extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      displayName: this.props.user.displayName ?? '',
      error: null, };
  }

  onSubmit = event => {
    event.preventDefault();
    this.updateUserName();
  }

  updateUserName() {
    this.props.firebase
      .user(this.props.user.authUser.uid)
      .update({
        displayName: this.state.displayName.trim(),
        })
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Sucessfully updated user displayName to: ' + this.state.displayName)
          this.props.firebase.doLogEvent('change_username', null)
          this.setState({ error: null, });
          //update game player too
          this.updateGamePlayerName();
        })
      .catch(
        error => {
          console.error('Failed to update user displayName: ' + error.code + ' - ' + error.message)
          this.setState({ error: error });
        });
  }

  updateGamePlayerName() {
    if (this.props.gameId) {
      this.props.firebase
        .gamePlayer(this.props.gameId, this.props.user.authUser.uid)
        .update({
          name: this.state.displayName.trim(),
          })
        .then(
          () => {
            if (process.env.NODE_ENV !== 'production') console.log('Sucessfully updated gameplayer displayName to: ' + this.state.displayName)
            this.setState({ error: null, });
            //callback on name update completion
            if (this.props.callback) {
              this.props.callback();
            }
          })
        .catch(
          error => {
            console.error('Failed to update gameplayer displayName: ' + error.code + ' - ' + error.message)
            this.setState({ error: error });
          });
    }
    else {
      //callback on name update completion
      if (this.props.callback) {
        this.props.callback();
      }
    }
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
      !displayName ||
      !displayName.trim() ||
      displayName.trim().length > 20;
    
    const isAmended = displayName && displayName.trim() !== this.props.user.displayName;

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
