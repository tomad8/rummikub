import React from 'react';
import './GamePage.css';
import * as Utils from '../utils';
import * as ROUTES from '../constants/routes';
import { withRouter, Link } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { AuthUserContext } from '../components/Session';
import Lobby from '../components/Lobby/Lobby';
import Game from '../components/game/Game';


const GamePage = () => (
  <AuthUserContext.Consumer>
    {user => (
      <div className='gamepage'>
        <GameForm user={user} />
      </div>
    )}
  </AuthUserContext.Consumer>
);


class GameFormBase extends React.Component {
  _isMounted = false;
    
  constructor(props) {
    super(props);
    this.state = {
      gameId: null,
      loading: false,
      error: null,
      db: {
        gameInProgress: false,
        players: [
          {
            uid: 'ABC123',
            name: this.props.user.displayName,
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
    this._isMounted = true;
    
    const pathname = this.props.location.pathname;
    
    if (pathname === ROUTES.GAME){
      //create new game
      let gameId = Utils.getID(6);
      //TODO - check for collisions - although very unlikely!!

      this.setState({ 
        db: {
          host: this.props.user.authUser.uid,
          gameInProgress: false,
          players: [
            {
              uid: this.props.user.authUser.uid,
              name: this.props.user.displayName,
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
    this._isMounted = false;
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
          if (this._isMounted) {
            this.setState({ status: 'Game ' + gameId + ' created', error: null,});
            // replace not push because we don't want user to be able to browse back to /game
            this.props.history.replace(ROUTES.GAME + '/' + gameId); 
          }
        })
      .catch(
        error => {
          console.log('Failed to create game in Firebase DB: ' + error.code + ' - ' + error.message)
          if (this._isMounted) {
            this.setState({ status: 'Failed to create game', error: error });
          }
        });
  }

  loadGame(gameId) {
    this.setState({ loading: true });
 
    this.props.firebase.game(gameId)
    .on('value', snapshot => {
      if (this._isMounted) {
        this.setState({
          db: snapshot.val(),
          loading: false,
          gameId: gameId, 
          error: null,
          status: (snapshot.val() ? 'Game ' + gameId + ' loaded' : 'Game ' + gameId + ' not found'),
        })
      }
    });
  }

  handleClickStartGame() {
    const gameId = this.state.gameId;
    
    //TODO: do some stuff, determine player order, current player, call resertGame() etc

    this.setState({ 
      db: {
        gameInProgress: true,
      },
    });
    
    this.props.firebase.doLogEvent('game_start', {gameId: this.state.gameId});
    
    this.saveGame(gameId, this.state.db);
  }

 

  render() {
    const gameComponent = 
      <Game 
        db = {this.state.db}
      />;
    
    const lobbyComponent = 
      <Lobby 
        gameId = {this.state.gameId}  
        gameUrl = {window.location.href} 
        db = {this.state.db}
        onClickStartGame={() => this.handleClickStartGame()}
      />;

      return (
      <div>
        {this.state.error && <p className='error'>{this.state.error.message}</p>}
        {this.state.loading && <p>{this.state.loading ? 'Loading...' : ''}</p>}
        <p>{this.state.status}</p>
        {this.state.db ? 
          (this.state.gameInProgress ? gameComponent : lobbyComponent) :
          <p><Link to={ROUTES.LANDING}>Go to home page</Link></p>}
      </div>
    );
  }
}

const GameForm = withRouter(withFirebase(GameFormBase));

export default GamePage;