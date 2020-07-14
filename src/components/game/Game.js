import React from 'react';
import './Game.css';
import * as Constants from '../../constants';
import * as TileHelper from '../../utils/tilehelper';
import Board from './Board';
import Rack from './Rack';
import ActionBar from './ActionBar';
import GamePlayers from './GamePlayers';


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //tileBag: this.props.dbTileBag,
      //rack: this.props.dbRacks[this.props.localPlayer],
      //sets: this.props.dbSets,
      localSelectedTile: null,
      localSelectedSet: null,
      debugMode: (process.env.NODE_ENV !== 'production'),
      //debugMode: false,
    };
  }
  
  componentDidMount() {
    this.setState({
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  componentWillUnmount() {
    
  }


  logDebug(text) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(text);
    }
  }


  /********** ONCLICK HANDLERS **********/


  handleClickRackTile(tileId) {    
    if (this.state.localSelectedTile === null && tileId >=0) {
      // no tile selected - select this one if valid
      this.selectTile(tileId, null);
    } 
    else if (this.state.localSelectedTile === tileId) {
      // same tile clicked - clear selection
      this.selectTile(null, null);
    } 
    else if (this.state.localSelectedTile !== null && this.state.localSelectedSet === null) {
      // another tile on rack clicked - swap them
      this.props.onMoveTileWithinRack(this.state.localSelectedTile, tileId);
      this.clearSelection();
    } 
    else if (this.state.localSelectedTile !== null && this.state.localSelectedSet !== null && this.isFresh(this.state.localSelectedTile)) {
      this.props.onMoveTileFromSetToRack(this.state.localSelectedTile, this.state.localSelectedSet, tileId);
      this.clearSelection();
    }
  }

  handleClickRack() {
    //do nothing
    /*if (this.state.localSelectedTile === null) {
      // no tile selected - ignore click on rack
      return;
    }
    
    if (this.state.localSelectedSet === null) {
      // tile on rack selected - ignore click on rack
      return;
    }

    this.logDebug('Rack clicked');

    let sets = this.removeTileFromSet(this.state.localSelectedTile, this.state.localSelectedSet);
    let racks = this.addTileToRack(this.state.localSelectedTile);
    
    this.setState({
      sets: sets,
      racks: racks,
      localSelectedTile: null,
      localSelectedSet: null,
    });*/
  }

  handleClickSetTile(tileId, setId) {
    if (this.props.dbCurrentPlayer !== this.props.localPlayer) {
      // not our turn - can't click set
      return;
    }
    
    if (this.state.localSelectedTile === tileId) {
      // same tile clicked - clear selection
      this.selectTile(null, null);
    } 
    else if (this.state.localSelectedSet === setId) {
      // same set as selected - select that new tile instead
      this.selectTile(tileId, setId);
    } 
    else if (this.state.localSelectedTile !== null) {
      // different set than selected - treat as if parent Set element was clicked
      this.handleClickSet(setId);
    }
    else if (tileId >= 0 && setId >= 0) {
      // select tile 
      this.selectTile(tileId, setId);
    }
  }

  handleClickSet(setId) {
    if (this.props.dbCurrentPlayer !== this.props.localPlayer) {
      // not our turn - can't click set
      return;
    }
    
    if (this.state.localSelectedTile === null) {
      this.logDebug('Ignored click on Set ID ' + setId + ' - no tile selected');
      return;
    }
    
    if (this.state.localSelectedSet === setId) {
      this.logDebug('Ignored click on Set ID ' + setId + ' - same set as selected tile');
      return;
    }

    this.logDebug('Set ID ' + setId + ' clicked');

    if (this.state.localSelectedSet === null) {
      this.props.onMoveTileFromRackToSet(this.state.localSelectedTile, setId);
      this.clearSelection();
    } 
    else {
      this.props.onMoveTileFromSetToSet(this.state.localSelectedTile, this.state.localSelectedSet, setId);
      this.clearSelection();
    }
  }


  

 /*
    select scenarios:
    
      Rack.Tile (selectTile)
      Set.Tile (selectTile)

    move scenarios:

      Click self (deselect - selectTile)

      Rack.Tile > Rack.Tile (moveTileWithinRack)
      Rack.Tile > Rack (nothing)
      Rack.Tile > Set.Tile (invoke following)
      Rack.Tile > Set (moveTileFromRackToSet)
      
      Set.Tile > Rack.Tile (moveTileFromSetToRack)
      Set.Tile > Rack (nothing)

      Set.Tile > Set.Tile - same set (nothing)
      Set.Tile > Set - same set (nothing)
      Set.Tile > Set.Tile - different set (invoke following)
      Set.Tile > Set - different set (moveTileFromSetToSet)
    
  */

  /********** METHODS TO MOVE TILES FROM ONE LOCATION TO ANOTHER **********/

  selectTile(tileId, setId) {
    if (setId !== null) {
      this.logDebug('Selected Tile ID ' + tileId + ' in Set ID ' + setId);
    } 
    else {
      if (tileId !== null) {
        this.logDebug('Selected Tile ID ' + tileId +  ' in Rack');
      } 
      else {
        this.logDebug('Selection cleared');
      }
    }
    this.setState({
      /*latestMovedTile: null,*/
      localSelectedTile: tileId,
      localSelectedSet: setId,
    });
    
  }

  clearSelection() {
    this.setState({
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  /*
  moveTileWithinRack(tileId, targetTileId) {
    this.logDebug('Moving Tile ID ' + tileId + ' to location ' + targetTileId + ' in Rack');
    
    let rack = this.removeTileFromRack(tileId);
    rack = this.addTileToRack(tileId, targetTileId, rack);
    
    this.setState({
      rack: rack,
      latestMovedTile: tileId,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  } 
*/
  


  /********** METHODS EXECUTED DURING RENDER **********/

  isClickable(tileId, setId, rackId) {
    //return false; //disable hover effect
    
    if (rackId !== null && rackId !== this.props.localPlayer) {
      // can never click other players tiles (even in debug!)
      return false;
    }
    
    if (this.state.localSelectedTile === null) {
      // no tile selected - picking up

      if (tileId < 0) {
        //can't pick up an empty space
        return false;
      }
      else if (tileId === null && setId !== null) {
        //can't pick up a set (only tiles within it)
        return false;
      }
      else if (this.props.dbCurrentPlayer !== this.props.localPlayer && setId !== null) {
        //can't pick up from set if not our turn
        return false;
      }

      return true; //"select"

    } else {
      // tile selected - putting down

      if ((rackId !== null) 
        && (this.state.localSelectedSet === null
            || this.isFresh(this.state.localSelectedTile))) {
        //can put down on rack anywhere, as long as tile picked up from rack or
        //originated from rack at start of turn (i.e. is a fresh tile)
        return true;
      }
      else if (setId !== null && tileId === null && setId !== this.state.localSelectedSet
        && this.props.dbCurrentPlayer === this.props.localPlayer) {
        //set clickable, as long as not source, and it's our turn
        return true;
      }

      // anything else is not a valid move;
      return false;
    }
  }

  // tile is fresh if it was played by the current player in the current turn (i.e. existed on players rack at start of turn)
  isFresh(tileId) {
    return this.props.dbPrevRacks[this.props.dbCurrentPlayer].indexOf(tileId) >= 0;
  }

  sortSet(tiles) {
    let sortedTiles = tiles.slice();

    // Simple sort by ID
    sortedTiles.sort((a, b) => a - b);

    if (sortedTiles.length > Constants.NUMBER_OF_TILE_RANKS) {
      return sortedTiles;
    }

    // Handle Jokers...
    const jokerCount = sortedTiles.filter(a => TileHelper.isJoker(a)).length;
    let jokersAvailable = jokerCount;
    if (jokerCount > 0) {
      //jokers will be at end of array

      const t = sortedTiles.slice();

      // check for run in single colour
      const firstTileColour = TileHelper.getTileSuitFromId(t[0]);
      let previousTileRank = TileHelper.getTileRankFromId(t[0]);
      for (let i = 1; i < t.length; i++) {
        let tileRank;
        if (TileHelper.isJoker(t[i])) {
          //set assumed tileRank to one for than previous to continue run
          tileRank = previousTileRank + 1;
          if ((tileRank > Constants.NUMBER_OF_TILE_RANKS) && (i < Constants.NUMBER_OF_TILE_RANKS)) {
            //if tile rank greater than maximum rank (default 13) then push joker to start of array (unless run is already maximum length)
            const joker = t[i];
            t.splice(i, 1); //remove at current index
            t.splice(0, 0, joker); //insert at start
          }
        }
        else {
          //only carry out further analysis if tile is not a joker
          if (TileHelper.getTileSuitFromId(t[i]) !== firstTileColour) {
            jokersAvailable = -1;
            break; //not a run - different colour
          }
          tileRank = TileHelper.getTileRankFromId(t[i]);
          if (tileRank !== previousTileRank + 1 && tileRank !== previousTileRank) {
            //run broken - see how many jokers we would need to fill this gap
            let gap = tileRank - previousTileRank - 1;
            jokersAvailable -= gap;
            if (jokersAvailable < 0) {
              //not enough jokers to make the run
              break;
            }
            const jokers = t.splice(t.length - gap, gap); //remove jokers from end
            t.splice(i, 0, ...jokers); //insert them at current index
            i += gap; //skip over the jokers we just inserted
          }
        }
        previousTileRank = tileRank;
      }

      // if we successfully completed a run then retain the new joker positions, else discard
      if (true || jokersAvailable >= 0) {
        sortedTiles = t;
      }
      
    }

    return sortedTiles;
  }


  // Check for RUN in single colour (suit)
  getSetScoreRun(t) {
    let score = 0;
    let isValidRun = true;
      
    let firstTileColour = null;
    for (let i = 0; i < t.length; i++) {
      if (!TileHelper.isJoker(t[i])) {
        if (firstTileColour === null) {
          firstTileColour = TileHelper.getTileSuitFromId(t[i]);
        }
        else if (TileHelper.getTileSuitFromId(t[i]) !== firstTileColour) {
          isValidRun = false; //colour mismatch
          break;
        }
      }
    }
    
    if (isValidRun) {
      let previousTileRank = null;
      for (let i = 0; i < t.length; i++) {
        let tileRank;
        if (TileHelper.isJoker(t[i])) {
          if (previousTileRank === null) {
            tileRank = null; // unknown, will backfill when first numbered tile is reached
          }
          else {
            tileRank = previousTileRank + 1;
            score += tileRank;
            if (tileRank > Constants.NUMBER_OF_TILE_RANKS) {
              isValidRun = false;
              break; //run exceeded max rank
            }
          }
        }
        else {
          tileRank = TileHelper.getTileRankFromId(t[i]);
          if (previousTileRank === null) {
            //backfill score for any jokers at start of run
            let rank = tileRank;
            for (let j = 0; j < i; j++) {
              score += --rank;
              if (rank < 1) {
                isValidRun = false;
                break; //run exceeded min rank
              }
            }
          }
          else if (tileRank !== previousTileRank + 1) {
            isValidRun = false;
            break; //run broken
          }
          score += tileRank;
        }
        previousTileRank = tileRank;
      }
    }
    
    if (!isValidRun) {
      score = 0;
    }
    return score;
  }

  // Check for GROUP in single number (rank)
  getSetScoreGroup(t) {
    let isValidGroup = true;
    
    if (t.length > Constants.NUMBER_OF_TILE_SUITS && !Constants.ALLOW_DUPLICATE_SUITS_IN_GROUP) {
      return 0;
    }

    let firstTileRank = null;
    let suits = [];
    for (let i = 0; i < t.length; i++) {
      if (!TileHelper.isJoker(t[i])) {
        let tileRank = TileHelper.getTileRankFromId(t[i]);
        if (firstTileRank === null) {
          firstTileRank = tileRank;
        }
        else if (tileRank !== firstTileRank) {
          isValidGroup = false; //rank mismatch
          break;
        }
        if (!Constants.ALLOW_DUPLICATE_SUITS_IN_GROUP) {
          let tileColour = TileHelper.getTileSuitFromId(t[i]);
          if (suits[tileColour] === undefined) {
            suits[tileColour] = i;
          }
          else {
            isValidGroup = false; //more than one duplicate tile of same suit (colour)
            break;
          }
        }
      }
    }

    if (isValidGroup) {
      return firstTileRank * t.length;
    }
    return 0;
  }

  getSetScore(tiles) {
    // This method assumes set has been sorted by sortSet()
    // Don't need to call it again here as long as already sorted.
    //tiles = sortSet(tiles);
    
    
    let score = 0;
    const t = tiles;

    if (t.length < Constants.MIN_TILES_IN_SET) {
      return 0;
    }
    else if (t.length > Constants.NUMBER_OF_TILE_RANKS) {
      return 0;
    }
    
    // all-joker scenarios
    const jokerCount = t.filter(a => TileHelper.isJoker(a)).length;
    if (jokerCount === t.length) {
      if (t.length <= Constants.NUMBER_OF_TILE_SUITS) {
        // max score group
        return t.length * Constants.NUMBER_OF_TILE_RANKS;
      }
      else {
        // max score run
        let tileRank = Constants.NUMBER_OF_TILE_RANKS;
        for (let i = 0; i < t.length; i++) {
          score += tileRank - i;
        }
        return score;
      }
    }

    // Check for RUN in single colour (suit)
    const scoreRun = this.getSetScoreRun(t);
    
    // If valid RUN then just return that score.
    // UNLESS jokers + ONE normal tile, then must also calc for GROUP and take highest score
    // because it could be either.
    if ((scoreRun > 0) && (jokerCount !== t.length - 1)) {
      return scoreRun;
    }

    // Check for GROUP in single number (rank)
    const scoreGroup = this.getSetScoreGroup(t);
    
    return (scoreGroup > scoreRun) ? scoreGroup : scoreRun;
  }




  getSets() {
    const dbSets = this.props.dbSets ? this.props.dbSets : [];
    const sets = [];

    const selectedTile = this.state.localSelectedTile;
    for (const set of dbSets) {
      //convert to class including tile id and state details
      const sortedTiles = this.sortSet(set.tiles);
      
      //map simple tileId list to setTile structure
      const setTiles = [];
      for (const tileId of sortedTiles) {
        setTiles.push({
          id: tileId, 
          selected: (tileId === selectedTile), 
          clickable: this.isClickable(tileId, set.id, null), 
          fresh: this.isFresh(tileId),
          justMoved: (tileId === this.props.dbLatestMovedTile),
          debug: this.state.debugMode,
        });
      }
      let score = this.getSetScore(sortedTiles);
      sets.push({
        id: set.id, 
        tiles: setTiles, 
        clickable: this.isClickable(null, set.id, null),
        valid: (score > 0),
        score: score,
      });
    }

    //if (this.state.localSelectedTile !== null) {
      // tile selected - show a new group option

      const setTiles = [];
      setTiles.push({
        id: -1, 
        selected: false, 
        clickable: false, 
        justMoved: false,
        debug: this.state.debugMode,
      });

      sets.push({
        id: -1, 
        tiles: setTiles, 
        clickable: (this.props.dbCurrentPlayer === this.props.localPlayer && this.state.localSelectedTile !== null),
        valid: true,
        score: null,
      });
    //}

    return sets;
  }

  getTilesRack(playerIndex) {
    //Assumption: player index is same as rack index
    if (playerIndex === null) {
      playerIndex = this.props.localPlayer;
    }
     
    let rack = this.props.dbRacks[playerIndex];

    if (!rack) {
      return [];
    }

    //convert to class including tile id and state details
    const rackTiles = [];
    for (let tileId of rack) {
      const selected = (tileId === this.state.localSelectedTile);
      const clickable = this.isClickable(tileId, null, playerIndex);
      rackTiles.push({
        id: tileId, 
        selected: selected, 
        clickable: clickable, 
        justMoved: (tileId === this.props.dbLatestMovedTile || tileId === this.props.localLatestMovedTile),
        debug: this.state.debugMode,
      });
    }

    return rackTiles;
  }

  getTileCounts() {
    return this.props.dbRacks.map(r => r.filter(t => t>=0).length);
  }

  getTileBag(playerIndex) {
    if (!this.props.dbTileBag) {
      return [];
    }

    //convert to class including tile id and state details
    const tileBag = [];
    for (let tileId of this.props.dbTileBag) {
      const selected = (tileId === this.state.localSelectedTile);
      const clickable = false;
      tileBag.push({
        id: tileId, 
        selected: selected, 
        clickable: clickable, 
        justMoved: false,
        debug: this.state.debugMode,
      });
    }

    return tileBag;
  }

  

  render() {
    const debugRacks = [];
    if (this.state.debugMode) {
      for (let r = 0; this.props.dbRacks && r < this.props.dbRacks.length; r++) {
        const uid = this.props.dbPlayerSequence[r];
        debugRacks.push(
          <Rack 
            key={r}  
            player={this.props.dbPlayers[uid] && r + ': ' + this.props.dbPlayers[uid].name}
            tiles={this.getTilesRack(r)}
            debug={this.state.debugMode}
            onClick={null}
          />
        )
      }
      // Show the tile bag
      debugRacks.push(
        <Rack 
          key={-1}  
          player='Tile Bag'
          tiles={this.getTileBag()}
        />
      );
    }
    
    //const availableTiles = this.props.dbPlayerSequence && (TileHelper.getTotalTileCount() - (this.props.dbPlayerSequence.length - 1) * Constants.NUMBER_OF_INITIAL_RACK_TILES);
    const tilesInBag = this.props.dbTileBag && this.props.dbTileBag.length;
    
    const playerName = this.props.dbPlayers && this.props.dbPlayerSequence &&
      this.props.dbPlayers[this.props.dbPlayerSequence[this.props.dbCurrentPlayer]].name;
    
    let message = '';
    let gameClassName = 'game';
    if (this.props.dbCurrentPlayer === this.props.localPlayer) {
      message = <div className='gamemessage gamemessage-currentturn'>{playerName + ", it's your turn!"}</div>;
      gameClassName = 'game game-currentturn';
    }
    else {
      message = <div className='gamemessage'>{"Waiting for " + playerName + " to take their turn..."}</div>;
    }

    return (
      <div className={gameClassName}>
        <div className="gameheader">
          <GamePlayers
            playerSequence={this.props.dbPlayerSequence}
            players={this.props.dbPlayers} 
            host={this.props.dbHost}
            currentPlayer={this.props.dbCurrentPlayer}
            uid={this.props.uid}
            tileCounts={this.getTileCounts()} 
          />
          <div className="message-and-actionbar">
            {message}
            <ActionBar
              buttons={this.props.buttons} />
          </div>
        </div>
        <div className="gamebody">
          <Board 
            sets={this.getSets()}
            debug={this.state.debugMode}
            onClickTile={(tileId, setId) => this.handleClickSetTile(tileId, setId)}
            onClickSet={(setId) => this.handleClickSet(setId)}
            onSetValidityUpdate={(invalidCount) => this.props.onSetValidityUpdate(invalidCount)}
          />
          <Rack 
              player={!this.props.dbPlayerSequence.includes(this.props.uid) && 'Spectator Mode'}
              tiles={this.getTilesRack(null)}
              debug={this.state.debugMode}
              onClick={(tileId) => this.handleClickRackTile(tileId)}
              buttons={this.props.rackButtons}
            />
        </div>
        <div className='gamenote'>
          {Constants.NUMBER_OF_TILE_DECKS} decks
          • {Constants.NUMBER_OF_TILE_SUITS} colours (suits)
          • {Constants.NUMBER_OF_TILE_RANKS} numbers (ranks)
          • {Constants.NUMBER_OF_TILE_JOKERS} jokers
          • {TileHelper.getTotalTileCount()} total tiles
          • {TileHelper.getTotalTileCount() - tilesInBag} tiles in play
          • {tilesInBag} tiles in bag
        </div>
        {debugRacks}
      </div>
    );
  }
}

export default Game;