import React from 'react';
import './Lobby.css';
import * as Constants from '../../constants';
import * as TileHelper from '../../utils/tilehelper';

class Lobby extends React.Component {
  
  render() {
    
    return (
      <div className="lobby">
        <div className="lobbyheader">
          <h1>Get ready to play!</h1>
          <p>Share this link with other players:</p>
          <a href={this.props.gameUrl}>{this.props.gameUrl}</a>
        </div>
        <div className="lobbybody">
          <div className="lobbyplayers">
            <h3>Players in the game</h3>
            <ol>{this.props.db.players.map(player => <li key={player.uid}>{player.name}</li>)}</ol>
          </div>
          <div className="lobbyinfo">
            <h3>Game parameters</h3>
            <ul>
              <li>{Constants.NUMBER_OF_TILE_DECKS} decks</li>
              <li>{Constants.NUMBER_OF_TILE_SUITS} colours (suits)</li>
              <li>{Constants.NUMBER_OF_TILE_RANKS} numbers (ranks)</li>
              <li>{Constants.NUMBER_OF_TILE_JOKERS} jokers</li>
              <li>{TileHelper.getTotalTileCount()} total tiles</li>
            </ul>
          </div>
        </div>
        <div className="lobbyfooter">
          <button className="bigbutton" onClick={this.props.onClickStartGame}>Start Game</button>
         
        </div>
      </div>
    );
  }
}

export default Lobby;
