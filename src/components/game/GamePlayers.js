import React from 'react';
import './GamePlayers.css';

class GamePlayers extends React.Component {
  
  render() {
    const playerList = [];
    if (this.props.playerSequence && this.props.players) {
      const currentPlayerUid = this.props.playerSequence[this.props.currentPlayer];
      //for (const uid of this.props.playerSequence) {
      for (let i = 0; i < this.props.playerSequence.length; i++) {
        const uid = this.props.playerSequence[i];
        const player = this.props.players[uid];
        const playerClass = (uid === currentPlayerUid) ? 'player-current' : 'player';
        playerList.push(
          <div className={playerClass} key={uid}>
            {player && player.name}
            {uid === this.props.host ? <span className="player-host">(Host)</span> : ''}
            <span className="player-tilecount">{this.props.tileCounts && this.props.tileCounts[i]}</span>
          </div>
        )
      }
    }

    return (
      <div className='gameplayers'>
        {playerList}
      </div>
    );
  }
}

export default GamePlayers;
