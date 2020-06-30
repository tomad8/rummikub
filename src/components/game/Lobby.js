import React from 'react';
import './Lobby.css';

class Lobby extends React.Component {
  
  render() {
    
    return (
      <div>
        <p>Game host: {this.props.db.host}</p>
        <p>Players: <ol>{this.props.db.players.map(player => <li>{player.name}</li>)}</ol></p>
        <p>Share this link: {this.props.gameUrl}</p>
        
      </div>
    );
  }
}

export default Lobby;
