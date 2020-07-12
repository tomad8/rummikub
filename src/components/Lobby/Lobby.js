import React from 'react';
import './Lobby.css';
import * as Constants from '../../constants';
import * as TileHelper from '../../utils/tilehelper';
import Loading from '../Loading';

class Lobby extends React.Component {
  
  render() {
    
    const hostId = this.props.dbHost;
    const isHost = this.props.user && this.props.user.authUser && this.props.user.authUser.uid === hostId;
    
    const playerList = [];
    if (this.props.dbPlayers) {
      for (const [playerId, player] of Object.entries(this.props.dbPlayers)) {
      playerList.push(<li key={playerId}>{player.name}{playerId === hostId ? ' (host)' : ''}</li>)
      }
    }

    return (
      <div className="lobby">
        <div className="lobbyheader">
          <h1>Get ready to play!</h1>
          <p>Share this link or code with other players:</p>
          <div className="lobbylink">
            <a href={this.props.gameUrl}>{this.props.gameUrl}</a>
            <p>Game code: <span className="lobbycode">{this.props.gameId}</span></p>
          </div>
        </div>
        <div className="lobbybody">
          <div className="lobbyplayers">
            <h3>Players in the game</h3>
            <ol>{playerList}</ol>
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
          {isHost ?
            <div>
              <p>Wait for other players to join, then start the game:</p>
              <button className="bigbutton" onClick={this.props.onClickStartGame}>Start Game</button> 
            </div> :
            <div>
              <p>Waiting for host to start game...</p>
              <Loading />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Lobby;
