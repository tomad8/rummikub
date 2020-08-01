import React from 'react';
import './GameResults.css';
import * as Icons from '../../icons';

class GameResults extends React.Component {
  
  render() {
    
    const playerKeys = Object.keys(this.props.dbPlayers).filter(a => this.props.dbPlayerSequence.includes(a));

    const winningPlayerId = playerKeys.reduce((prev, curr) => (this.props.dbPlayers[prev].lastGameScore > this.props.dbPlayers[curr].lastGameScore) ? prev : curr);
    let winningPlayerName = this.props.dbPlayers[winningPlayerId].name;

    const gameResultTable = playerKeys
    .sort((a, b) => 
      this.props.dbPlayers[b].score - this.props.dbPlayers[a].score
      )
    .map(a => 
      <tr key={a} className={a === winningPlayerId ? "gameresultstable-winner" : ""}>
        <td className="align-left">{this.props.dbPlayers[a].name}</td>
        <td className="align-icon">{a === winningPlayerId && <Icons.MedalIcon className='svg-icon-button' />}</td>
        <td className="align-right">{this.props.dbPlayers[a].lastGameScore}</td>
        <td className="align-right">{this.props.dbPlayers[a].score}</td>
        <td className="align-right">{this.props.dbPlayers[a].gamesPlayed}</td>
        <td className="align-right">{this.props.dbPlayers[a].gamesWon}</td>
      </tr>
      );

    return (
      <div className="gameresults">
        <h1>{winningPlayerName} is the winner!</h1>
        <table className="gameresultstable">
          <thead>
            <tr key="header">
              <th className="align-left">Player</th>
              <th className="align-left"></th>
              <th className="align-right">Points</th>
              <th className="align-right">Total</th>
              <th className="align-right">Played</th>
              <th className="align-right">Won</th>
            </tr>
          </thead>
          <tbody>
            {gameResultTable}
          </tbody>
        </table>
      </div>
    );
  }
}

export default GameResults;
