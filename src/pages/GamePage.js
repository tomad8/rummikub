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
      listening: false,
      error: null,
      localPlayer: null,
      invalidSetCount: 0,
      dbHost: null,
      dbGameInProgress: false,
      dbPlayers: [],
      dbPlayerSequence: [],
      dbCurrentPlayer: null,
      dbTileBag: [],
      dbRacks: [],
      dbSets: [],
      dbLatestMovedTile: null,
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
          dbHost: this.props.user.authUser.uid,
          dbGameInProgress: false,
          dbPlayers: {
            [this.props.user.authUser.uid]: {
              name: this.props.user.displayName,
              score: 0,
            },
          }
        },
          () => {
            return this.dbSaveGame();
          }
        );
        
        this.props.firebase.doLogEvent('game_create', {gameId: gameId});
      } 
      // Join Game
      else {
        // try to get game id from URL
        let gameId = pathname.replace(ROUTES.GAME + '/','');
        
        if (process.env.NODE_ENV !== 'production') console.log('Attempting to join game ' + gameId + ' as user ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName)
        
        this.dbLoadGame(gameId, this.loadComplete);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    this.dbStopListening();
  }


  logDebug(text) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(text);
    }
  }

  /********** DATABASE ACCESS METHODS **********/

  // Load initial game state, then set up an 'on' listener after load completes
  dbLoadGame(gameId, callback) {
    this.setState({ loading: true });

    this.props.firebase.game(gameId)
    .on('value', snapshot => {
      let status = (snapshot.val() ? 'Game ' + gameId + ' loaded' : 'Game ' + gameId + ' not found')
      if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: load game: ' + status);
      if (this._isMounted && snapshot.val()) {
        this.setState({
          /*db: snapshot.val(),*/
          dbHost: snapshot.val().host,
          dbGameInProgress: snapshot.val().gameInProgress, 
          dbPlayers: snapshot.val().players,
          dbPlayerSequence: snapshot.val().playerSequence,
          dbCurrentPlayer: snapshot.val().currentPlayer,
          dbTileBag: snapshot.val().tileBag,
          dbRacks: snapshot.val().racks,
          dbSets: snapshot.val().sets,
          dbPrevRacks: snapshot.val().prevRacks,
          dbPrevSets: snapshot.val().prevSets,
          dbLatestMovedTile: snapshot.val().latestMovedTile,
          localPlayer: snapshot.val().playerSequence && snapshot.val().playerSequence.indexOf(this.props.user.authUser.uid),
          loading: false,
          listening: true,
          gameId: gameId, 
          error: null,
          status: status,
        }, callback)
      }
    });
  }

  dbStopListening() {
    if (this.state.listening) {
      this.props.firebase.game(this.state.gameId).off();
      this.setState({ listening: false });
    }
  }

  // Save full game state
  dbSaveGame() {
    const gameId = this.state.gameId;
    const data = {
      host: this.state.dbHost,
      gameInProgress: this.state.dbGameInProgress,
      players: this.state.dbPlayers,
      playerSequence: this.state.dbPlayerSequence,
      currentPlayer: this.state.dbCurrentPlayer,
    };
    
    //these may be null, only add if they have value
    if (this.state.dbTileBag) {
      data['tileBag'] = this.state.dbTileBag;
    }
    if (this.state.dbRacks) {
      data['racks'] = this.state.dbRacks;
      data['prevRacks'] = this.state.dbRacks;
    }
    if (this.state.dbSets) {
      data['sets'] = this.state.dbSets;
      data['prevSets'] = this.state.dbSets;
    }
    if (this.state.dbLatestMovedTile) {
      data['latestMovedTile'] = this.state.dbLatestMovedTile;
    }
    
    this.setState({ saving: true });
    
    return this.props.firebase
      .game(gameId)
      .set(data)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully saved game ' + gameId);
          if (this._isMounted) {
            this.setState({ 
              status: 'Game ' + gameId + ' saved', 
              saving: false,
              error: null,
            });
            //redirect to gameid url if not already there
            if (this.props.history.pathname !== ROUTES.GAME + '/' + gameId) {
              // replace not push because we don't want user to be able to browse back to /game
              this.props.history.replace(ROUTES.GAME + '/' + gameId); 
            }
            if (!this.state.listening) {
              this.dbLoadGame(gameId, this.loadComplete);
            }
          }
        })
      .catch(
        error => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Failed to save game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to save game', error: error });
          }
        });
  }

  // Save in-turn update
  dbSaveGameUpdate() {
    this.setState({ saving: true });
    
    const gameId = this.state.gameId;
    
    const updates = {};
    updates['/latestMovedTile'] = this.state.dbLatestMovedTile;
    updates['/racks/' + this.state.localPlayer] = this.state.dbRacks[this.state.localPlayer];
    if (this.state.dbSets) {
      updates['/sets'] = this.state.dbSets;
    }
    
    return this.props.firebase
      .game(gameId)
      .update(updates)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully updated game ' + gameId);
          if (this._isMounted) {
            this.setState({ 
              saving: false,
              error: null,
            });
          }
        })
      .catch(
        error => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Failed to update game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to update game', error: error });
          }
        });
  }

  dbSaveGameNextTurn() {
    this.setState({ saving: true });
    
    const gameId = this.state.gameId;
    
    const updates = {};
    updates['/latestMovedTile'] = this.state.dbLatestMovedTile;
    updates['/currentPlayer'] = this.state.dbCurrentPlayer;
    if (this.state.dbTileBag) {
      updates['/tileBag'] = this.state.dbTileBag;
    }
    if (this.state.dbRacks[this.state.localPlayer]) {
      updates['/racks/' + this.state.localPlayer] = this.state.dbRacks[this.state.localPlayer];
      updates['/prevRacks/' + this.state.localPlayer] = this.state.dbRacks[this.state.localPlayer];
    }
    if (this.state.dbSets) {
      updates['/sets'] = this.state.dbSets;
      updates['/prevSets'] = this.state.dbSets;
    }
    
    return this.props.firebase
      .game(gameId)
      .update(updates)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully updated game ' + gameId);
          if (this._isMounted) {
            this.setState({ 
              saving: false,
              error: null,
            },
              this.dbLoadGame(gameId, this.loadComplete) //start listening again
            );
          }
        })
      .catch(
        error => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Failed to update game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to update game', error: error });
          }
        });
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

  /********** BUSINESS LOGIC - state update methods **********/

  loadComplete() {
    if (this.state.dbPlayers) {
      //if (!Object.keys(this.state.dbPlayers).includes(this.props.user.authUser.uid)) {
      if (!this.state.dbPlayers[this.props.user.authUser.uid]) {
        this.addUserToGame();
      }
      else {
        if (process.env.NODE_ENV !== 'production') console.log('User ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName  + ' is already a player in this game');
      
        if (this.state.localPlayer === this.state.dbCurrentPlayer) {
          this.dbStopListening(); //because its our turn - we're gonna be pushing all the updates!
        }
      }
    }
  }


  addUserToGame() {
    if (process.env.NODE_ENV !== 'production') console.log('Adding new user ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName + ' to game');
    
    let newPlayer = {
      name: this.props.user.displayName,
      score: 0,
    };

    this.setState({ 
      dbPlayers: {
        [this.props.user.authUser.uid]: newPlayer
      }
    },
      () => {
        return this.dbAddGamePlayer(this.state.gameId, this.props.user.authUser.uid, newPlayer);
      }
    );
  }

  newGame() {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTiles = (numberOfSuits * numberOfRanks * numberOfDecks) + numberOfJokers;
    
    const playerSequence = Object.keys(this.state.dbPlayers);
    Utils.shuffle(playerSequence);


    // Make some tiles and shuffle them
    const tiles = [];
    for (let i = 0; i < numberOfTiles; i++) {
      tiles.push(i);
    }
    Utils.shuffle(tiles);

    // Deal tiles to players
    const racks = [];
    for (let i = 0; i < playerSequence.length; i++) {
      const rack = tiles.splice(0, Constants.NUMBER_OF_INITIAL_RACK_TILES);
      
      // Fill remainder of rack with empty spaces up to the initial maximum (default 24)
      let j = -1;
      for (let i = rack.length; i < Constants.NUMBER_OF_RACK_SPACES; i++) {
        rack.push(j--);
      }

      racks.push(rack);
    }
    
    //initialise state
    this.setState({
      /*dbHost: this.state.dbHost,*/
      dbGameInProgress: true,
      /*dbPlayers: this.state.dbPlayers,*/
      dbPlayerSequence: playerSequence,
      dbCurrentPlayer: 0,
      dbTileBag: tiles,
      dbRacks: racks,
      dbSets: [],
      dbLatestMovedTile: null,
      /*localSelectedTile: null,
      localSelectedSet: null,*/
      localPlayer: playerSequence.indexOf(this.props.user.authUser.uid),
    }, 
      () => {
        return this.dbSaveGame();
      }
    );
  }
  
  exitGame() {
    //initialise state
    this.setState({
      dbGameInProgress: false,
    }, 
      () => {
        return this.dbSaveGame();
      }
    );
  }

  resetTurn() {
    const sets = this.state.dbPrevSets.slice();
    const racks = this.state.dbRacks.slice();
    racks[this.state.localPlayer] = this.state.dbPrevRacks[this.state.localPlayer].slice();

    this.setState({
      dbSets: sets,
      dbRacks: racks,
    }, 
      () => {
        return this.dbSaveGameUpdate();
      }
    );
  }

  CompleteTurn() {
    const nextPlayer = this.state.dbCurrentPlayer + 1 >= this.state.dbPlayerSequence.length 
      ? 0 
      : this.state.dbCurrentPlayer + 1;
    
    this.setState({
      dbCurrentPlayer: nextPlayer,
      dbLatestMovedTile: null,
    },
      this.dbSaveGameNextTurn
    );
  }

  moveTileFromBagToRackAndSkipTurn() {
    let racks = this.state.dbRacks;
    let bag = this.state.dbTileBag;
    let tileId = null;

    if (this.state.dbTileBag.length > 0) {
      if (this.state.dbRacks) {
        bag = this.state.dbTileBag.slice();
        const tileId = bag.splice(0, 1)[0];
        
        //const rackPosition = this.state.racks[this.state.localPlayer].length - 1;
        this.logDebug('Moving Tile ID ' + tileId + ' from Bag to Rack');
        
        //const targetTileId = this.state.racks[this.state.localPlayer][rackPosition];
        racks = this.addTileToRack(tileId, null, null);
      }
    }
    else {
      this.logDebug('Cannot take new tile - tile bag is empty!');
      //alert('Tile bag is empty!')
    }

    const nextPlayer = this.state.dbCurrentPlayer + 1 >= this.state.dbPlayerSequence.length 
      ? 0 
      : this.state.dbCurrentPlayer + 1;
    
    this.setState({
      dbTileBag: bag,
      dbRacks: racks,
      dbCurrentPlayer: nextPlayer,
      dbLatestMovedTile: tileId,
    },
      this.dbSaveGameNextTurn
    );
  }

  moveTileFromRackToSet(tileId, setId) {
    const racks = this.removeTileFromRack(tileId);
    const sets = this.addTileToSet(tileId, setId);
    this.setState({
      dbSets: sets,
      dbRacks: racks,
      dbLatestMovedTile: tileId,
    },
      this.dbSaveGameUpdate
    );
  }

  moveTileFromSetToRack(tileId, setId, targetTileId) {
    
    // tile in set selected - can we move to rack?
    
    const sets = this.removeTileFromSet(tileId, setId);
    const racks = this.addTileToRack(tileId, targetTileId, null);
  
    this.setState({
      dbSets: sets,
      dbRacks: racks,
      dbLatestMovedTile: tileId,
    },
      this.dbSaveGameUpdate
    );
  }

  moveTileFromSetToSet(tileId, setId, targetSetId) {
    this.logDebug('Moving Tile ID ' + tileId + ' from Set ID ' + setId + ' to Set ID ' + targetSetId);
    
    let sets = this.removeTileFromSet(tileId, setId);
    sets = this.addTileToSet(tileId, targetSetId, sets);
    
    this.setState({
      dbSets: sets,
      dbLatestMovedTile: tileId,
    },
      this.dbSaveGameUpdate
    );
  }

  moveTileWithinRack(tileId, targetTileId) {
    this.logDebug('Moving Tile ID ' + tileId + ' to location ' + targetTileId + ' in Rack');
    
    let racks = this.removeTileFromRack(tileId);
    racks = this.addTileToRack(tileId, targetTileId, racks);
    
    this.setState({
      dbRacks: racks,
      dbLatestMovedTile: tileId,
    },
      this.dbSaveGameUpdate
    );
  } 
  

  /********** BUSINESS LOGIC - helper functions **********/

  removeTileFromRack(tileId) {
    this.logDebug('Removing Tile ID ' + tileId + ' from Rack');
    const racks = this.state.dbRacks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    // don't actually remove, convert to an empty tile (id = unique negative number)
    //const nextId = Math.min(...localRack, 0) - 1;
    let nextId = -1;
    while (localRack.indexOf(nextId) >= 0) {
      nextId--
    }
    this.logDebug(' ...next id: ' + nextId);
    localRack[localRack.indexOf(tileId)] = nextId;
    racks[this.state.localPlayer] = localRack;

    return racks;
  }
  
  addTileToRack(tileId, targetTileId, racks) {
    this.logDebug('Adding Tile ID ' + tileId + ' to Rack at position ' + targetTileId);
    
    if (!racks) {
      racks = this.state.dbRacks.slice();
    }
    const localRack = racks[this.state.localPlayer].slice();
    
    let targetIndex = localRack.indexOf(targetTileId);
    if (targetTileId === null) {
      // No target defined - default to last tile
      targetIndex = localRack.length - 1;
      // Later in this method, if rack is found to be full then will add tile at end, rather than shift existing tiles to right.
    }
    
    // Find the closest empty space to targetTileId
    let i = targetIndex;
    let j = targetIndex + 1;
    let gapFoundIndex = null;
    while (i >= 0 || j < localRack.length) {
      if (i >= 0 && localRack[i] < 0) {
        gapFoundIndex = i;
        break;
      }
      i--;
      if (j < localRack.length && localRack[j] < 0) {
        gapFoundIndex = j;
        break;
      }
      j++;
    }
    
    if (gapFoundIndex === null) {
      if (targetTileId === null) {
        targetIndex = localRack.length;
        this.logDebug(' ...rack full, no gaps. Adding new tile at end of rack at index: ' + targetIndex);
      }
      else {
        gapFoundIndex = localRack.length;
        this.logDebug(' ...rack full, no gaps. Shifting tiles right and adding new tile at index: ' + targetIndex);
      }
    }

    // Shift tiles (unless rack is full and we've already decided to add to a new position at end of rack)
    if (gapFoundIndex !== null) {
      // Shift tiles into gap to make way for new tile
      this.logDebug(' ...targetIndex: ' + targetIndex + '  gapFoundIndex: ' + gapFoundIndex);
      if (gapFoundIndex >= targetIndex) {
        //shift right
        this.logDebug(' ...shifting right' + targetIndex);
        for (let i = gapFoundIndex; i > targetIndex; i--) {
          localRack[i] = localRack[i-1];
        }
      }
      else {
        //shift left
        this.logDebug(' ...shifting left' + targetIndex);
        for (let i = gapFoundIndex; i < targetIndex; i++) {
          localRack[i] = localRack[i+1];
        }
      }
    }
    
    // place new tile
    localRack[targetIndex] = tileId;

    racks[this.state.localPlayer] = localRack;
    return racks;
  }

  removeTileFromSet(tileId, setId) {
    const sets = this.state.dbSets.slice();
    const setIndex = sets.findIndex(a => a.id === setId);
    const sourceSetTiles = sets[setIndex].tiles.slice();
    this.logDebug('Removing Tile ID ' + tileId + ' from Set ID ' + setId+ ' (index ' + setIndex + ')');
    
    const tileIndex = sourceSetTiles.indexOf(tileId);
    this.logDebug(' ...removing tile index ' + tileIndex);
    sourceSetTiles.splice(tileIndex, 1);
    
    if (sourceSetTiles.length > 0) {
      sets[setIndex] = {id: setId, tiles: sourceSetTiles};
    }
    else {
      this.logDebug(' ...removing Set ID ' + setId + ' (index ' + setIndex + ') because it is now empty');
      sets.splice(setIndex, 1);
    }
    return sets;
  }
    
  addTileToSet(tileId, setId, sets) {
    this.logDebug('Adding Tile ID ' + tileId + ' to Set ID ' + setId);
    
    if (!sets) {
      if (!this.state.dbSets) { 
        sets = []; 
      } 
      else {
        sets = this.state.dbSets.slice();
      }
    }
    
    if (setId < 0) {
      // brand new set - create it
      const targetSetTiles = [];
      targetSetTiles.push(tileId);
      const newSetId = Math.max(...sets.map(a => a.id), 0) + 1;
      this.logDebug(' ... creating new Set ID ' + newSetId);
      sets.push({id: newSetId, tiles: targetSetTiles});
      return sets;
    } 
    else {
      const setIndex = sets.findIndex(a => a.id === setId);
      this.logDebug(' ... adding to existing Set ID ' + setId + ' (index ' + setIndex + ')');
      const targetSetTiles = sets[setIndex].tiles.slice();
      targetSetTiles.push(tileId);
      sets[setIndex] = {id: setId, tiles: targetSetTiles};
      return sets;
    }
  }





  /********** ONCLICK HANDLERS **********/
  
  handleClickStartGame() {
    const gameId = this.state.gameId;
    
    this.newGame();
    
    this.props.firebase.doLogEvent('game_start', {gameId: gameId});
  }

  
  handleClickExitGame() {
    this.exitGame();
  }

  handleClickResetTurn() {
    this.resetTurn();
  }

  handleClickCompleteTurn() {
    this.CompleteTurn();

  }

  handleClickSkipTurn() {
    this.moveTileFromBagToRackAndSkipTurn();

  }

  handleSetValidityUpdate(invalidCount) {
    if (invalidCount !== this.state.invalidSetCount) {
      this.setState({
        invalidSetCount: invalidCount,
      });
    }
  }


  /********** METHODS EXECUTED DURING RENDER **********/

  getActionBarButtons() {
    //convert to class including tile id and state details
    const buttons = [];
    
    if (this.props.user.authUser && this.props.user.authUser.uid === this.state.dbHost) {
      // host can abandon game...
      buttons.push({
        id: 'exit', 
        label: 'Abandon Game', 
        onClick: () => this.handleClickExitGame(),
      });
    }
    
    if (this.state.dbCurrentPlayer === this.state.localPlayer){
      //if our turn...
      const tilesPlaced = (this.state.dbRacks && this.state.dbPrevRacks 
        && this.state.dbRacks[this.state.localPlayer].filter(t => t>=0).length 
          < this.state.dbPrevRacks[this.state.localPlayer].filter(t => t>=0).length);
        

      if (tilesPlaced) {
        //if tiles placed...
        buttons.push({
          id: 'reset', 
          label: 'Reset Turn', 
          onClick: () => this.handleClickResetTurn(),
        });

        if (this.state.invalidSetCount === 0) {
          //if tiles placed and board is valid...
          buttons.push({
            id: 'complete', 
            label: 'Complete Turn', 
            className: 'successbutton',
            onClick: () => this.handleClickCompleteTurn(),
          });
        }
      }

      if (!tilesPlaced || this.state.invalidSetCount > 0) {
        //if tiles not placed or board is not valid...
        buttons.push({
          id: 'skip', 
          label: 'Skip Turn', 
          onClick: () => this.handleClickSkipTurn(),
        });
      }
    }

    return buttons;
  }

  render() {
    const gameComponent = 
      <Game 
        dbHost = {this.state.dbHost}
        dbPlayers = {this.state.dbPlayers}
        dbPlayerSequence = {this.state.dbPlayerSequence}
        dbTileBag = {this.state.dbTileBag}
        dbRacks = {this.state.dbRacks}
        dbPrevRacks = {this.state.dbPrevRacks}
        dbSets = {this.state.dbSets}
        dbCurrentPlayer = {this.state.dbCurrentPlayer}
        dbLatestMovedTile = {this.state.dbLatestMovedTile}
        uid = {this.props.user.authUser && this.props.user.authUser.uid}
        localPlayer = {this.state.localPlayer}
        buttons={this.getActionBarButtons()}
        onMoveTileFromRackToSet={(tileId, setId) => this.moveTileFromRackToSet(tileId, setId)}
        onMoveTileFromSetToRack={(tileId, setId, targetTileId) => this.moveTileFromSetToRack(tileId, setId, targetTileId)}
        onMoveTileFromSetToSet={(tileId, setId, targetSetId) => this.moveTileFromSetToSet(tileId, setId, targetSetId)}
        onMoveTileWithinRack={(tileId, targetTileId) => this.moveTileWithinRack(tileId, targetTileId)}
        onSetValidityUpdate={(invalidCount) => this.handleSetValidityUpdate(invalidCount)}
      />;
    
    const lobbyComponent = 
      <Lobby 
        user = {this.props.user}
        gameId = {this.state.gameId}  
        gameUrl = {window.location.href} 
        dbHost = {this.state.dbHost}
        dbPlayers = {this.state.dbPlayers}
        onClickStartGame={() => this.handleClickStartGame()}
        onReloadRequired={() => this.dbLoadGame(this.state.gameId, this.loadComplete)}
      />;

      return (
      <div>
        {this.state.error && <p className='error notification'>{this.state.error.message}</p>}
        {this.state.status && <p className='notification'>{this.state.status}</p>}
        {(this.state.dbHost) ? 
          (this.state.dbGameInProgress ? gameComponent : lobbyComponent) :
          !this.state.loading && <NotFound />}
        {(this.state.loading) && <div style={{padding: '10px', paddingTop: '50px'}} ><Loading /></div>}
        {(this.state.saving) && <div style={{padding: '10px', paddingTop: '10px'}} ><Loading inLine={true} /></div>}
      </div>
    );
  }
}

const GameForm = withRouter(withFirebase(GameFormBase));

export default GamePage;