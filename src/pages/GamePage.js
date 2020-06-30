import React from 'react';
import './GamePage.css';
import * as Utils from '../utils';
import * as ROUTES from '../constants/routes';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import Lobby from '../components/game/Lobby';
import Game from '../components/game/Game';


const GamePage = () => (
  <div className='gamepage'>
    <GameForm />
  </div>
);


class GameFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameId: null,
      loading: false,
      error: null,
      db: {
        host: 'ABC123',
        gameInProgress: true,
        players: [
          {
            uid: 'ABC123',
            name: 'Player 1',
            score: 0,
          },
        ],
        currentPlayer: 0,
        
      },
      debugMode: (process.env.NODE_ENV !== 'production'),
      //debugMode: false,
    };
  }
  
  componentDidMount() {
    const pathname = this.props.location.pathname;
    
    if (pathname === ROUTES.GAME){
      //create new game
      let gameId = Utils.getID(6);
      //TODO - check for collisions - although very unlikely!!


      this.setState({ 
        db: {
          host: 'ABC123',
          gameInProgress: false,
          players: [
            {
              uid: 'ABC123',
              name: 'Player 1',
              score: 0,
            },
          ],
        },
      });
      
      this.props.firebase.doLogEvent('game_create', {gameId: gameId});
      
      // Create a new game in Firebase realtime database
      this.saveGame(gameId, this.state.db);

    } 
    else {
      // try to get game id from URL
      let gameId = pathname.replace(ROUTES.GAME + '/','');
      
      //TODO: check it exists in DB - if so load it
      this.loadGame(gameId);
      //if new game then init it:
    }
    
  }

  componentWillUnmount() {
    //free up any resources?
  }

  saveGame(gameId, data) {
    return this.props.firebase
      .game(gameId)
      //.set({
      //  host: authUser.user.uid,
      //  })
      .set(data)
      .then(
        () => {
          console.log('Sucessfully saved game ' + gameId + ' in Firebase DB')
          this.setState({ status: 'Game ' + gameId + ' created', error: null,});
          this.props.history.push(ROUTES.GAME + '/' + gameId); 
        })
      .catch(
        error => {
          console.log('Failed to create game in Firebase DB: ' + error.code + ' - ' + error.message)
          this.setState({ status: 'Failed to create game', error });
        });
  }

  loadGame(gameId) {
    this.setState({ loading: true });
 
    this.props.firebase.game(gameId).on('value', snapshot => {
      this.setState({
        db: snapshot.val(),
        loading: false,
        gameId: gameId, 
        error: null,
        status: 'Game ' + gameId + ' loaded',
      });
    });
  }

  logDebug(text) {
    if (this.state.debugMode) {
      console.log(text);
    }
  }

  

  render() {
    const renderContent = [];

    if (this.state.gameInProgress) {
      renderContent.push( 
        <Game 
          db = {this.state.db}
        />
      );
    }
    else {
      renderContent.push( 
        <Lobby 
        gameId = {this.state.gameId}  
        gameUrl = {window.location.href} 
        db = {this.state.db}
        />
      );
    }
    return (
      <div>
        <p>{this.state.status}</p>
        {this.state.loading && <p>{this.state.loading ? 'Loading...' : ''}</p>}
        {this.state.error && <p className='error'>{this.state.error.message}</p>}
        {renderContent}
      </div>
    );
  }
}

const GameForm = withRouter(withFirebase(GameFormBase));

export default GamePage;