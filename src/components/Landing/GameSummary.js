import React from 'react';
import './GameSummary.css';
import * as Utils from '../../utils';
import * as ROUTES from '../../constants/routes';
import { Link } from 'react-router-dom';

const GameSummary = props => (
  <div className='gamesummary'> 
    <span className='gamesummary-id'>
    <Link to={ROUTES.GAME + '/' + props.gameId}>
      Game {props.gameId} 
      {props.gameInProgress && props.uid === props.currentPlayer && ' - your turn'}</Link>
      {props.gameInProgress && props.uid !== props.currentPlayer && ' - ' + props.players[props.currentPlayer].name + "'s turn"}
      {!props.gameInProgress && ' - waiting to start'}
      </span>
    <span className='gamesummary-time'>
      {Utils.getSmartAgeFromMs(props.gameAge)}
      </span>
    <span className='gamesummary-players'>
      {Object.keys(props.players).map(
          a => props.players[a].name + (a === props.host ? ' (Host)' : '')
        ).join(', ')}
      </span>
  </div>
);

export default GameSummary;