import React from 'react';
import './GamePage.css';
import * as Utils from '../utils';
import * as TileHelper from '../utils/tilehelper';
import * as Constants from '../constants';
import * as ROUTES from '../constants/routes';
import * as Icons from '../icons';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { AuthUserContext } from '../components/Session';
import Lobby from '../components/Lobby/Lobby';
import Game from '../components/game/Game';
import Loading from '../components/Loading'
import NotFound from '../components/NotFound';


class GamePageBase extends React.Component {
  _isMounted = false;
    
  constructor(props) {
    super(props);
    this.state = {
      gameId: null,
      loading: true,
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
      dbLatestMovedTiles: [],
      dbLastUpdateTime: null,
      dbLastTurnTime: null,
      localLatestMovedTiles: [],
    };
  }
  
  componentDidMount() {
    this._isMounted = true;
    
    const pathname = this.props.location.pathname;
    
    // Only continue if user is authenticated. 
    // If user is not authenticated then login redirect will handle it and return to this page in a moment
    if (process.env.NODE_ENV !== 'production') console.log('authUser: ' + this.props.user.authUser)
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
              joinTime: this.props.firebase.timestampConstant(),
              activeTime: this.props.firebase.timestampConstant(),
              score: 0,
            },
          },
        },
          () => {
            return this.dbSaveGame(true);
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


  /********** DATABASE ACCESS METHODS **********/

  // Load initial game state, then set up an 'on' listener after load completes
  dbLoadGame(gameId, callback) {
    
    // only load if not already listening
    if (!this.state.listening) {     
      this.setState({ loading: true });
      if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Listening for updates ON');
        
      this.props.firebase.game(gameId)
      .on('value', snapshot => {
        let status = (snapshot.val() ? 'Game ' + gameId + ' loaded' : 'Game ' + gameId + ' not found')
        if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: load game: ' + status);
        if (this._isMounted) {
          if (snapshot.val()) {
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
              dbLatestMovedTiles: snapshot.val().latestMovedTiles,
              dbLastUpdateTime: snapshot.val().lastUpdateTime,
              dbLastTurnTime: snapshot.val().lastTurnTime,
              localPlayer: snapshot.val().playerSequence && snapshot.val().playerSequence.indexOf(this.props.user.authUser.uid),
              loading: false,
              listening: true,
              gameId: gameId, 
              error: null,
              status: status,
            }, callback);
          }
          else {
            this.setState({
              loading: false,
              listening: true,
              gameId: gameId, 
              error: null,
              status: status,
            });
          }
        }
      });
    }
  }

  dbStopListening() {
    if (this.state.listening) {
      if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Listening for updates OFF');
      this.props.firebase.game(this.state.gameId).off();
      this.setState({ listening: false });
    }
  }

  // Save full game state
  dbSaveGame(savePlayers) {
    const gameId = this.state.gameId;

    const data = {
      host: this.state.dbHost,
      gameInProgress: this.state.dbGameInProgress,
      /*players: this.state.dbPlayers,*/
      playerSequence: this.state.dbPlayerSequence,
      currentPlayer: this.state.dbCurrentPlayer,
      lastUpdateTime: this.props.firebase.timestampConstant(),
      lastTurnTime: this.props.firebase.timestampConstant(),
    };
    
    // only save full players list on first creation of game by host
    if (savePlayers) {
      data['players'] = this.state.dbPlayers;
    }
    else {
      const player = {
        name: this.state.dbPlayers[this.props.user.authUser.uid].name,
        joinTime: this.state.dbPlayers[this.props.user.authUser.uid].joinTime,
        activeTime: this.props.firebase.timestampConstant(), //active time is always refreshed
        score: this.state.dbPlayers[this.props.user.authUser.uid].score,
      };
      data['/players/' + this.props.user.authUser.uid] = player;
    }

    

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
    if (this.state.dbLatestMovedTiles) {
      data['latestMovedTiles'] = this.state.dbLatestMovedTiles;
    }
    
    
    this.setState({ saving: true });
    
    return this.props.firebase
      .game(gameId)
      .update(data)
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
              if ((!this.state.gameInProgress || this.state.localPlayer !== this.state.dbCurrentPlayer)) {
                this.dbLoadGame(gameId, this.loadComplete); //start listening
              }
            }
          }
        })
      .catch(
        error => {
          console.error('Firebase DB: Failed to save game ' + gameId + ': ' + error.code + ' - ' + error.message);
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
    if (this.state.dbLatestMovedTiles) {
      updates['/latestMovedTiles'] = this.state.dbLatestMovedTiles;
    }
    if (this.state.dbRacks[this.state.localPlayer]) {
      updates['/racks/' + this.state.localPlayer] = this.state.dbRacks[this.state.localPlayer];
    }
    if (this.state.dbSets) {
      updates['/sets'] = this.state.dbSets;
    }
    updates['/lastUpdateTime'] = this.props.firebase.timestampConstant();
    updates['/players/' + this.props.user.authUser.uid + '/activeTime'] = this.props.firebase.timestampConstant();
    
    return this.props.firebase
      .game(gameId)
      .update(updates)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully saved update for game ' + gameId);
          if (this._isMounted) {
            this.setState({ 
              saving: false,
              error: null,
            });
          }
        })
      .catch(
        error => {
          console.error('Firebase DB: Failed to save update for game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to save update for game', error: error });
          }
        });
  }

  dbSaveGameNextTurn() {
    this.setState({ saving: true });
    
    const gameId = this.state.gameId;
    
    const updates = {};
    updates['/currentPlayer'] = this.state.dbCurrentPlayer;
    if (this.state.dbLatestMovedTiles) {
      updates['/latestMovedTiles'] = this.state.dbLatestMovedTiles;
    }
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
    updates['/lastUpdateTime'] = this.props.firebase.timestampConstant();
    updates['/lastTurnTime'] = this.props.firebase.timestampConstant();
    updates['/players/' + this.props.user.authUser.uid + '/activeTime'] = this.props.firebase.timestampConstant();
    
    return this.props.firebase
      .game(gameId)
      .update(updates)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully saved next turn update for game ' + gameId);
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
          console.error('Firebase DB: Failed to save next turn update for game ' + gameId + ': ' + error.code + ' - ' + error.message);
          if (this._isMounted) {
            this.setState({ status: 'Failed to save next turn update for game', error: error });
          }
        });
  }

  // Add/update a player in the game
  dbUpdateGamePlayer(gameId, playerId, data) {
    return this.props.firebase
      .gamePlayer(gameId, playerId)
      .update(data)
      .then(
        () => {
          if (process.env.NODE_ENV !== 'production') console.log('Firebase DB: Sucessfully saved player ' + playerId + ' in game ' + gameId);
          //if (this._isMounted) {
          //  this.setState({ status: 'Joined game', error: null,});
          //}
        })
      .catch(
        error => {
          console.error('Firebase DB: Failed to save player ' + playerId + ' in game ' + gameId + ': ' + error.code + ' - ' + error.message);
          //if (this._isMounted) {
          //  this.setState({ status: 'Failed to join game', error: error });
          //}
        });
  }

  /********** BUSINESS LOGIC - state update methods **********/

  loadComplete() {
    if (process.env.NODE_ENV !== 'production') console.log('Load complete');
    if (this.state.dbPlayers) {
      //if (!Object.keys(this.state.dbPlayers).includes(this.props.user.authUser.uid)) {
      if (!this.state.dbPlayers[this.props.user.authUser.uid]) {
        this.addUserToGame();
      }
      else {
        if (process.env.NODE_ENV !== 'production') console.log('User ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName  + ' is already a player in this game');
        
        if (this.state.gameInProgress && this.state.localPlayer === this.state.dbCurrentPlayer) {
          this.dbStopListening(); //because its our turn - we're gonna be pushing all the updates!
        }

        if (this.state.dbPlayers[this.props.user.authUser.uid].name !== this.props.user.displayName) {
          this.updateGamePlayerName();
        }
      }
    }
  }

  addUserToGame() {
    if (process.env.NODE_ENV !== 'production') console.log('Adding new user ' + this.props.user.authUser.uid  + ':' + this.props.user.displayName + ' to game');
    
    let newPlayer = {
      name: this.props.user.displayName,
      joinTime: this.props.firebase.timestampConstant(),
      activeTime: this.props.firebase.timestampConstant(),
      score: 0,
    };

    this.setState({ 
      dbPlayers: {
        [this.props.user.authUser.uid]: newPlayer
      }
    },
      () => {
        return this.dbUpdateGamePlayer(this.state.gameId, this.props.user.authUser.uid, newPlayer);
      }
    );
  }

  updateGamePlayerName() {
    if (process.env.NODE_ENV !== 'production') console.log('Updating GamePlayerName to ' + this.props.user.displayName);
    
    let player = {
      name: this.props.user.displayName,
    };

    this.setState({ 
      dbPlayers: {
        [this.props.user.authUser.uid]: player
      }
    },
      () => {
        return this.dbUpdateGamePlayer(this.state.gameId, this.props.user.authUser.uid, player);
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
      dbPrevRacks: racks,
      dbSets: [],
      dbPrevSets: [],
      dbLatestMovedTiles: [],
      localPlayer: playerSequence.indexOf(this.props.user.authUser.uid),
      localLatestMovedTiles: [],
      }, 
      () => {
        return this.dbSaveGame(true);
      }
    );
  }
  
  exitGame() {
    //initialise state
    this.setState({
      dbGameInProgress: false,
    }, 
      () => {
        return this.dbSaveGame(false);
      }
    );
  }

  resetTurn() {
    let sets = [];
    if (this.state.dbPrevSets) {
      sets = this.state.dbPrevSets.slice();
    }
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

  completeTurn() {
    const nextPlayer = this.state.dbCurrentPlayer + 1 >= this.state.dbPlayerSequence.length 
      ? 0 
      : this.state.dbCurrentPlayer + 1;
    
    this.setState({
      dbCurrentPlayer: nextPlayer,
      dbLatestMovedTiles: [],
      localLatestMovedTiles: [],
    },
      this.dbSaveGameNextTurn
    );
  }

  moveTileFromBagToRackAndSkipTurn() {
    let racks = this.state.dbRacks.slice();
    let sets = this.state.dbSets;
    const setTilesMoved = JSON.stringify(this.state.dbSets) !== JSON.stringify(this.state.dbPrevSets);
    if (setTilesMoved) {
      if (process.env.NODE_ENV !== 'production') console.log('setTilesMoved is true');
      if (this.state.dbPrevSets && this.state.dbPrevSets.length > 0) {
        sets = this.state.dbPrevSets.slice();
        if (process.env.NODE_ENV !== 'production') console.log('sets = this.state.dbPrevSets.slice();');
      }
      else {
        sets = [];
      }
      racks[this.state.localPlayer] = this.state.dbPrevRacks[this.state.localPlayer].slice();
    
    }
    
    let bag = this.state.dbTileBag;
    let tileId = null;
    if (this.state.dbTileBag.length > 0) {
      if (this.state.dbRacks) {
        bag = this.state.dbTileBag.slice();
        const tileId = bag.splice(0, 1)[0];
        
        //const rackPosition = this.state.racks[this.state.localPlayer].length - 1;
        if (process.env.NODE_ENV !== 'production') console.log('Moving Tile ID ' + tileId + ' from Bag to Rack');
        
        //const targetTileId = this.state.racks[this.state.localPlayer][rackPosition];
        racks = this.addTilesToRack([tileId], null, racks);
      }
    }
    else {
      if (process.env.NODE_ENV !== 'production') console.log('Cannot take new tile - tile bag is empty!');
      //alert('Tile bag is empty!')
    }

    const nextPlayer = this.state.dbCurrentPlayer + 1 >= this.state.dbPlayerSequence.length 
      ? 0 
      : this.state.dbCurrentPlayer + 1;
    
    this.setState({
      dbTileBag: bag,
      dbSets: sets,
      dbRacks: racks,
      dbCurrentPlayer: nextPlayer,
      dbLatestMovedTiles: [],
      localLatestMovedTiles: [tileId],
    },
      this.dbSaveGameNextTurn
    );
  }

  moveTilesFromRackToSet(tiles, setId) {
    const racks = this.removeTilesFromRack(tiles);
    const sets = this.addTilesToSet(tiles, setId);
    this.setState({
      dbSets: sets,
      dbRacks: racks,
      dbLatestMovedTiles: tiles,
      localLatestMovedTiles: [],
    },
      this.dbSaveGameUpdate
    );
  }

  moveTilesFromSetToRack(tiles, setId, targetTileId) {
    
    // tile in set selected - can we move to rack?
    
    const sets = this.removeTilesFromSet(tiles, setId);
    const racks = this.addTilesToRack(tiles, targetTileId, null);
  
    this.setState({
      dbSets: sets,
      dbRacks: racks,
      dbLatestMovedTiles: [],
      localLatestMovedTiles: tiles,
    },
      this.dbSaveGameUpdate
    );
  }

  moveTilesFromSetToSet(tiles, setId, targetSetId) {
    if (process.env.NODE_ENV !== 'production') console.log('Moving ' + tiles.length + ' tile(s) from Set ID ' + setId + ' to Set ID ' + targetSetId);
    
    let sets = this.removeTilesFromSet(tiles, setId);
    sets = this.addTilesToSet(tiles, targetSetId, sets);
    
    this.setState({
      dbSets: sets,
      dbLatestMovedTiles: tiles,
      localLatestMovedTiles: [],
    },
      this.dbSaveGameUpdate
    );
  }

  moveTilesWithinRack(tiles, targetTileId) {
    if (process.env.NODE_ENV !== 'production') console.log('Moving ' + tiles.length + ' tile(s) to location ' + targetTileId + ' in Rack');
    
    let racks = this.removeTilesFromRack(tiles);
    racks = this.addTilesToRack(tiles, targetTileId, racks);
    
    this.setState({
      dbRacks: racks,
      localLatestMovedTiles: tiles,
    },
      this.dbSaveGameUpdate
    );
  } 

  sortRack(byRank) {
    if (process.env.NODE_ENV !== 'production') console.log('Sorting rack');
    
    const racks = this.state.dbRacks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    
    function compareRankThenSuit(a, b) {
      const rankDiff = TileHelper.getTileRankFromIdSort(a) - TileHelper.getTileRankFromIdSort(b);
      if (rankDiff === 0) {
        return TileHelper.getTileSuitFromIdSort(a) - TileHelper.getTileSuitFromIdSort(b);
      }
      return rankDiff;
    }

    function compareSuitThenRank(a, b) {
      const suitDiff = TileHelper.getTileSuitFromIdSort(a) - TileHelper.getTileSuitFromIdSort(b);
      if (suitDiff === 0) {
        return TileHelper.getTileRankFromIdSort(a) - TileHelper.getTileRankFromIdSort(b);
      }
      return suitDiff;
    }

    if (byRank) {
      localRack.sort(compareRankThenSuit);
    }
    else {
      localRack.sort(compareSuitThenRank);
    }

    racks[this.state.localPlayer] = localRack;

    this.setState({
      dbRacks: racks,
      localLatestMovedTiles: [],
    },
      this.dbSaveGameUpdate
    );
  } 
  

  /********** BUSINESS LOGIC - helper functions **********/

  removeTilesFromRack(tiles) {
    if (process.env.NODE_ENV !== 'production') console.log('Removing ' + tiles.length + ' tile(s) from Rack');
    const racks = this.state.dbRacks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    
    // don't actually remove, convert to an empty tile (id = unique negative number)
    //const nextId = Math.min(...localRack, 0) - 1;
    let nextId = -1;
    tiles.forEach(tileId => {
      while (localRack.indexOf(nextId) >= 0) {
        nextId--
      }
      if (process.env.NODE_ENV !== 'production') console.log(' ...replacing Tile ID ' + tileId + ' with ' + nextId);
      localRack[localRack.indexOf(tileId)] = nextId--;
    });
    
    racks[this.state.localPlayer] = localRack;

    return racks;
  }
  
  addTilesToRack(tiles, targetTileId, racks) {
    if (process.env.NODE_ENV !== 'production') console.log('Adding ' + tiles.length + ' tile(s) to Rack at position ' + targetTileId);
    
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
    
    tiles.forEach(tileId => {
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
          if (process.env.NODE_ENV !== 'production') console.log(' ...rack full, no gaps. Adding new tile at end of rack at index: ' + targetIndex);
        }
        else {
          gapFoundIndex = localRack.length;
          if (process.env.NODE_ENV !== 'production') console.log(' ...rack full, no gaps. Shifting tiles right and adding new tile at index: ' + targetIndex);
        }
      }

      // Shift tiles (unless rack is full and we've already decided to add to a new position at end of rack)
      if (gapFoundIndex !== null) {
        // Shift tiles into gap to make way for new tile
        if (process.env.NODE_ENV !== 'production') console.log(' ...targetIndex: ' + targetIndex + '  gapFoundIndex: ' + gapFoundIndex);
        if (gapFoundIndex >= targetIndex) {
          //shift right
          if (process.env.NODE_ENV !== 'production') console.log(' ...shifting right' + targetIndex);
          for (let i = gapFoundIndex; i > targetIndex; i--) {
            localRack[i] = localRack[i-1];
          }
        }
        else {
          //shift left
          if (process.env.NODE_ENV !== 'production') console.log(' ...shifting left' + targetIndex);
          for (let i = gapFoundIndex; i < targetIndex; i++) {
            localRack[i] = localRack[i+1];
          }
        }
      }
      
      // place new tile
      localRack[targetIndex] = tileId;
    });

    racks[this.state.localPlayer] = localRack;
    return racks;
  }

  removeTilesFromSet(tiles, setId) {
    const sets = this.state.dbSets.slice();
    const setIndex = sets.findIndex(a => a.id === setId);
    const sourceSetTiles = sets[setIndex].tiles.slice();
    if (process.env.NODE_ENV !== 'production') console.log('Removing ' + tiles.length + ' tile(s) from Set ID ' + setId + ' (index ' + setIndex + ')');
    
    tiles.forEach(tileId => {
      const tileIndex = sourceSetTiles.indexOf(tileId);
      if (process.env.NODE_ENV !== 'production') console.log(' ...removing Tile ID ' + tileId + ' at index ' + tileIndex);
      sourceSetTiles.splice(tileIndex, 1);
    });
    
    if (sourceSetTiles.length > 0) {
      sets[setIndex] = {id: setId, tiles: sourceSetTiles};
    }
    else {
      if (process.env.NODE_ENV !== 'production') console.log(' ...removing Set ID ' + setId + ' (index ' + setIndex + ') because it is now empty');
      sets.splice(setIndex, 1);
    }
    return sets;
  }
    
  addTilesToSet(tiles, setId, sets) {
    if (process.env.NODE_ENV !== 'production') console.log('Adding ' + tiles.length + ' tile(s) to Set ID ' + setId);
    
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
      targetSetTiles.push(...tiles);
      const newSetId = Math.max(...sets.map(a => a.id), 0) + 1;
      if (process.env.NODE_ENV !== 'production') console.log(' ... creating new Set ID ' + newSetId);
      sets.push({id: newSetId, tiles: targetSetTiles});
      return sets;
    } 
    else {
      const setIndex = sets.findIndex(a => a.id === setId);
      if (process.env.NODE_ENV !== 'production') console.log(' ... adding to existing Set ID ' + setId + ' (index ' + setIndex + ')');
      const targetSetTiles = sets[setIndex].tiles.slice();
      targetSetTiles.push(...tiles);
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
    this.completeTurn();
  }

  handleClickSkipTurn() {
    this.moveTileFromBagToRackAndSkipTurn();
  }

  handleClickSortByRank() {
    // e.g. 11 22 33
    this.sortRack(true);
  }

  handleClickSortBySuit() {
    // e.g. 123 123
    this.sortRack(false);
  }

  handleSetValidityUpdate(invalidCount) {
    // TODO: anti-pattern - need to refactor!!
    // This function is called from render method of Board component.
    // Must never set state from within render method.
    // "Render methods should be a pure function of props and state"
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
        icon: <Icons.CrossIcon className='svg-icon-button' />,
          label: 'Abandon Game', 
        onClick: () => this.handleClickExitGame(),
      });
    }
    
    if (this.state.dbCurrentPlayer === this.state.localPlayer){
      //if our turn...

      const rackTilesPlaced = (this.state.dbRacks && this.state.dbPrevRacks 
        && this.state.dbRacks[this.state.localPlayer].filter(t => t>=0).length 
          < this.state.dbPrevRacks[this.state.localPlayer].filter(t => t>=0).length);
      
      const setTilesMoved = JSON.stringify(this.state.dbSets) !== JSON.stringify(this.state.dbPrevSets);
      
      if (rackTilesPlaced || setTilesMoved) {
        //if tiles placed...
        buttons.push({
          id: 'reset', 
          icon: <Icons.CircleBackIcon className='svg-icon-button' />,
          label: 'Reset Turn', 
          onClick: () => this.handleClickResetTurn(),
        });
      }

      if (rackTilesPlaced && this.state.invalidSetCount === 0) {
        //if tiles placed and board is valid...
        buttons.push({
          id: 'complete', 
          icon: <Icons.TickIcon className='svg-icon-button' />,
          label: 'Complete Turn', 
          className: 'successbutton',
          onClick: () => this.handleClickCompleteTurn(),
        });
      }
      else {
        buttons.push({
          id: 'skip', 
          icon: <Icons.TickIcon className='svg-icon-button' />,
          label: 'Skip Turn', 
          onClick: () => this.handleClickSkipTurn(),
        });
      }
    }

    return buttons;
  }

  getRackButtons() {
    const buttons = [];
    
    if (this.state.dbRacks && this.state.dbRacks[this.state.localPlayer] 
        && this.state.dbRacks[this.state.localPlayer].length > 0) {
      buttons.push({
        id: 'sortByRank', 
        label: 'Sort 11 22 33', 
        onClick: () => this.handleClickSortByRank(),
      });

      buttons.push({
        id: 'sortBySuit', 
        label: 'Sort 123 123', 
        onClick: () => this.handleClickSortBySuit(),
      });

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
        dbLatestMovedTiles = {this.state.dbLatestMovedTiles}
        gameId = {this.state.gameId}  
        uid = {this.props.user.authUser && this.props.user.authUser.uid}
        localPlayer = {this.state.localPlayer}
        localLatestMovedTiles = {this.state.localLatestMovedTiles}
        buttons={this.getActionBarButtons()}
        rackButtons={this.getRackButtons()}
        onMoveTilesFromRackToSet={(tileId, setId) => this.moveTilesFromRackToSet(tileId, setId)}
        onMoveTilesFromSetToRack={(tileId, setId, targetTileId) => this.moveTilesFromSetToRack(tileId, setId, targetTileId)}
        onMoveTilesFromSetToSet={(tileId, setId, targetSetId) => this.moveTilesFromSetToSet(tileId, setId, targetSetId)}
        onMoveTilesWithinRack={(tileId, targetTileId) => this.moveTilesWithinRack(tileId, targetTileId)}
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
      <div className='gamepage'>
        {this.state.error && <p className='error notification'>{this.state.error.message}</p>}
        {this.state.status && <p className='notification'>{this.state.status}</p>}
        {(!this.state.loading && this.state.dbHost) ? 
          (this.state.dbGameInProgress ? gameComponent : lobbyComponent) :
          !this.state.loading && <NotFound />}
        {(this.state.loading) && <Loading />}
        {(this.state.saving) && <Loading className="title" />}
      </div>
    );
  }
}

const GamePage = props => (
  <AuthUserContext.Consumer>
    {user => (
      <GamePageBase {...props} user={user} />
    )}
  </AuthUserContext.Consumer>
);

export default withRouter(withFirebase(GamePage));

