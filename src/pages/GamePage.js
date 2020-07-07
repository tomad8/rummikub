import React from 'react';
import './GamePage.css';
import * as Utils from '../utils';
import * as Constants from '../constants';
import * as ROUTES from '../constants/routes';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { AuthUserContext } from '../components/Session';
import Lobby from '../components/Lobby/Lobby';
import Game from '../components/game/Game';
import Loading from '../components/Loading'
import NotFound from '../components/NotFound';


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
      saving: false,
      error: null,
      db: {
        gameInProgress: false,
        players: null,
        currentPlayer: null,
      },
    };
  }
  
  componentDidMount() {
    this._isMounted = true;
    
    const pathname = this.props.location.pathname;
    
    // Only continue if user is authenticated. 
    // If user is not authenticated then login redirect will handle it and return to this page in a moment
    if (this.props.user.authUser) {
      
      // Create Game
      if (pathname === ROUTES.GAME){
        let gameId = Utils.getID(Constants.GAME_CODE_CHARACTER_LENGTH);
        //TODO - check for collisions - although very unlikely!!

        if (process.env.NODE_ENV !== 'production') console.log('Creating new game ' + gameId + ' as host user ' + this.props.user.authUser.uid)
        
        // setup state for new game
        this.setState({ 
          gameId: gameId,
          db: {
            host: this.props.user.authUser.uid,
            gameInProgress: false,
            players: {
              [this.props.user.authUser.uid]: {
                name: this.props.user.displayName,
                score: 0,
              },
            }
          },
        },
          () => {
            return this.dbSaveGame(gameId, this.state.db);
          }
        );
        
        this.props.firebase.doLogEvent('game_create', {gameId: gameId});
      } 
      // Join Game
      else {
        // try to get game id from URL
        let gameId = pathname.replace(ROUTES.GAME + '/','');
        
        if (process.env.NODE_ENV !== 'production') console.log('Attempting to join game ' + gameId + ' as user ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName)
        
        this.dbLoadGame(gameId, this.addUserToGame);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Save full game state
  dbSaveGame(gameId, data) {
    this.setState({ saving: true });
    
    return this.props.firebase
      .game(gameId)
      .set(data)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully created game ' + gameId);
          if (this._isMounted) {
            this.setState({ 
              status: 'Game ' + gameId + ' created', 
              saving: false,
              error: null,
            });
            //redirect to
            if (this.props.history.pathname !== ROUTES.GAME + '/' + gameId) {
              // replace not push because we don't want user to be able to browse back to /game
              this.props.history.replace(ROUTES.GAME + '/' + gameId); 
            }
          }
        })
      .catch(
        error => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Failed to create game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to create game', error: error });
          }
        });
  }

  // Load initial game state, then set up an 'on' listener after load completes
  dbLoadGame(gameId, callback) {
    this.setState({ loading: true });
 
    this.props.firebase.game(gameId)
    .on('value', snapshot => {
      let status = (snapshot.val() ? 'Game ' + gameId + ' loaded' : 'Game ' + gameId + ' not found')
      if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: load game: ' + status);
      if (this._isMounted) {
        this.setState({
          db: snapshot.val(),
          loading: false,
          gameId: gameId, 
          error: null,
          status: status,
        }, callback)
      }
    });
  }

  addUserToGame() {
    if (this.state.db && this.state.db.players) {
      if (!Object.keys(this.state.db.players).includes(this.props.user.authUser.uid)) {
        if (process.env.NODE_ENV !== 'production') console.log('Adding new user ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName + ' to game');
        
        let newPlayer = {
          name: this.props.user.displayName,
          score: 0,
        };

        this.setState({ 
          db: {
            players: {
              [this.props.user.authUser.uid]: newPlayer
            }
          },
        },
          () => {
            return this.dbAddGamePlayer(this.state.gameId, this.props.user.authUser.uid, newPlayer);
          }
        );
      }
      else {
        if (process.env.NODE_ENV !== 'production') console.log('User ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName  + ' is already a player in this game');
      }
    }
  }

  // Add a player to the game
  dbAddGamePlayer(gameId, playerId, data) {
    return this.props.firebase
      .gamePlayer(gameId, playerId)
      .set(data)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully added player ' + playerId + ' to game ' + gameId);
          if (this._isMounted) {
            this.setState({ status: 'Joined game', error: null,});
          }
        })
      .catch(
        error => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Failed to add player ' + playerId + ' to game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to join game', error: error });
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
    
    this.props.firebase.doLogEvent('game_start', {gameId: gameId});
    
    //this.dbSaveGame(gameId, this.state.db);
  }

 

  render() {
    const gameComponent = 
      <Game 
        db = {this.state.db}
      />;
    
    const lobbyComponent = 
      <Lobby 
        user = {this.props.user}
        gameId = {this.state.gameId}  
        gameUrl = {window.location.href} 
        db = {this.state.db}
        onClickStartGame={() => this.handleClickStartGame()}
      />;

      return (
      <div>
        {this.state.error && <p className='error'>{this.state.error.message}</p>}
        {(this.state.loading || this.state.saving) && <div style={{padding: '10px', paddingTop: '50px'}} ><Loading /></div>}
        <p>{this.state.status}</p>
        {this.state.db && this.state.db.host ? 
          (this.state.gameInProgress ? gameComponent : lobbyComponent) :
          !this.state.loading && <NotFound />}
      </div>
    );
  }
}

const GameForm = withRouter(withFirebase(GameFormBase));

export default GamePage;