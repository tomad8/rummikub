import React from 'react';
import './Game.css';
import * as Constants from '../Utils/constants';
import * as TileHelper from '../Utils/tilehelper';
import Board from './Board';
import Rack from './Rack';
import ActionBar from './ActionBar';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tileBag: [],
      racks: [],
      sets: [],
      players: [
        {
          name: 'Player 1',
          score: 0,
        },
        {
          name: 'Player 2',
          score: 0,
        },
        {
          name: 'Player 3',
          score: 0,
        },
        {
          name: 'Player 4',
          score: 0,
        },
      ],
      currentPlayer: 0,
      commitedState: {
        tileBag: [],
        racks: [],
        sets: [],
      },
      latestMovedTile: null,
      localPlayer: 0,
      localSelectedTile: null,
      localSelectedSet: null,
      debugMode: this.props.debugMode,
    };
  }
  
  componentDidMount() {
    this.resetGame();
  }

  componentWillUnmount() {
    //free up any resources?
  }

  logDebug(text) {
    if (this.state.debugMode) {
      console.log(text);
    }
  }

  resetGame() {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTiles = (numberOfSuits * numberOfRanks * numberOfDecks) + numberOfJokers;
    
    const tiles = [];

    // Make some tiles and shuffle them
    for (let i = 0; i < numberOfTiles; i++) {
      tiles.push(i);
    }

    shuffle(tiles);

    // Deal tiles to players
    const racks = [];
    for (let i = 0; i < Constants.NUMBER_OF_PLAYERS; i++) {
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
      tileBag: tiles,
      racks: racks,
      sets: [],
      currentPlayer: 0,
      commitedState: {
        tileBag: tiles,
        racks: racks,
        sets: [],
      },
      latestMovedTile: null,
      localSelectedTile: null,
      localSelectedSet: null,
    });

  }


  /********** ONCLICK HANDLERS **********/

  handleClickActionButton(buttonId) {
    this.logDebug('Clicked on button ID: ' + buttonId);
    switch(buttonId) {
      case 'reset':
        this.resetGame();
        break;
      case 'taketile':
        this.moveTileFromBagToRack();
        break;
      default:
    }

  }

  handleClickRackTile(tileId) {
    /*if (!this.isClickable(tileId, null, this.state.localPlayer)) {
      // no clicking if not clickable!
      // This is kludge to prevent clicking other player racks in debugMode
      return;
    }*/
    
    
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
      //this.swapRackTiles(this.state.localSelectedTile, tileId)
      this.moveTileWithinRack(this.state.localSelectedTile, tileId);
    } 
    else if (this.state.localSelectedTile !== null && this.state.localSelectedSet !== null) {
      this.moveTileFromSetToRack(this.state.localSelectedTile, this.state.localSelectedSet, tileId);
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
      this.moveTileFromRackToSet(this.state.localSelectedTile, setId);
    } 
    else {
      this.moveTileFromSetToSet(this.state.localSelectedTile, this.state.localSelectedSet, setId);
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
      latestMovedTile: null,
      localSelectedTile: tileId,
      localSelectedSet: setId,
    });
    
  }

  moveTileWithinRack(tileId, targetTileId) {
    this.logDebug('Moving Tile ID ' + tileId + ' to location ' + targetTileId + ' in Rack');
    
    let racks = this.removeTileFromRack(tileId);
    racks = this.addTileToRack(tileId, targetTileId, racks);
    
    this.setState({
      racks: racks,
      latestMovedTile: tileId,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  } 

  swapRackTiles(tileId1, tileId2) {
    this.logDebug('Swapping Tile ID ' + tileId1 + ' and Tile ID ' + tileId2 + ' in Rack');
    const racks = this.state.racks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    
    const index1 = localRack.indexOf(tileId1);
    const index2 = localRack.indexOf(tileId2);
    localRack[index1] = tileId2;
    localRack[index2] = tileId1;
    
    racks[this.state.localPlayer] = localRack;
    
    this.setState({
      racks: racks,
      latestMovedTile: tileId1,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  moveTileFromRackToSet(tileId, setId) {
    const racks = this.removeTileFromRack(tileId);
    const sets = this.addTileToSet(tileId, setId);
    this.setState({
      sets: sets,
      racks: racks,
      latestMovedTile: tileId,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  moveTileFromSetToRack(tileId, setId, targetTileId) {
    
    // tile in set selected - can we move to rack?
    
    const sets = this.removeTileFromSet(tileId, setId);
    const racks = this.addTileToRack(tileId, targetTileId, null);
  
    this.setState({
      sets: sets,
      racks: racks,
      latestMovedTile: tileId,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  moveTileFromSetToSet(tileId, setId, targetSetId) {
    this.logDebug('Moving Tile ID ' + tileId + ' from Set ID ' + setId + ' to Set ID ' + targetSetId);
    
    let sets = this.removeTileFromSet(this.state.localSelectedTile, setId);
    sets = this.addTileToSet(this.state.localSelectedTile, targetSetId, sets);
    
    this.setState({
      sets: sets,
      latestMovedTile: tileId,
      localSelectedTile: null,
      localSelectedSet: null,
    });
    
  }

  moveTileFromBagToRack() {
    if (this.state.tileBag.length > 0) {
      if (this.state.racks) {
        const bag = this.state.tileBag.slice();
        const tileId = bag.splice(0, 1)[0];
        
        //const rackPosition = this.state.racks[this.state.localPlayer].length - 1;
        this.logDebug('Moving Tile ID ' + tileId + ' from Bag to Rack');
        
        //const targetTileId = this.state.racks[this.state.localPlayer][rackPosition];
        const racks = this.addTileToRack(tileId, null, null);
      
        this.setState({
          tileBag: bag,
          racks: racks,
          latestMovedTile: tileId,
          localSelectedTile: null,
          localSelectedSet: null,
        });
      }
    }
    else {
      this.logDebug('Cannot take new tile - tile bag is empty!');
      alert('Tile bag is empty!')
    }
  }

  removeTileFromRack(tileId) {
    this.logDebug('Removing Tile ID ' + tileId + ' from Rack');
    const racks = this.state.racks.slice();
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
      racks = this.state.racks.slice();
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
    const sets = this.state.sets.slice();
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
      if (!this.state.sets) { 
        sets = []; 
      } 
      else {
        sets = this.state.sets.slice();
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



  /********** METHODS EXECUTED DURING RENDER **********/

  isClickable(tileId, setId, rackId) {
    //return false; //disable hover effect
    
    if (rackId !== null && rackId !== this.state.localPlayer) {
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

      return true; //"select"

    } else {
      // tile selected - putting down

      if ((rackId !== null ) 
        && (this.state.localSelectedSet === null)) {
        //&& (this.state.commitedState.racks[this.state.localPlayer].indexOf(this.state.localSelectedTile)) >= 0) {
        //can put down on rack anywhere, as long as tile picked up from rack or
        //originated from rack at start of turn
        return true;
      }
      else if (setId !== null && tileId === null && setId !== this.state.localSelectedSet) {
        //set clickable, as long as not source 
        return true;
      }

      // anything else is not a valid move;
      return false;
    }
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
          if (tileRank !== previousTileRank + 1) {
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


  getSetScore(tiles) {
    // This method assumes set has been sorted by sortSet()
    // Don't need to call it again here as long as already sorted.
    //tiles = sortSet(tiles);
    
    
    let score = 0;
    const t = tiles;

    if (t.length < 3) {
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
      }
    }

    // check for run in single colour
    let isValidRun = true;
    
    let firstTileColour = null;
    for (let i = 0; i < t.length; i++) {
      if (!TileHelper.isJoker(t[i])) {
        if (firstTileColour === null) {
          firstTileColour = TileHelper.getTileSuitFromId(t[i]);
        }
        else if (TileHelper.getTileSuitFromId(t[i]) !== firstTileColour) {
          isValidRun = false;
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
    
    if (isValidRun) {
      return score;
    }

    // TODO: check for run in single colour
    

    return 0;
  }

  getSets() {
    if (!this.state.sets) {
      return [];
    }

    const sets = [];

    const selectedTile = this.state.localSelectedTile;
    for (const set of this.state.sets) {
      //convert to class including tile id and state details
      const sortedTiles = this.sortSet(set.tiles);
      
      //map simple tileId list to setTile structure
      const setTiles = [];
      for (const tileId of sortedTiles) {
        setTiles.push({
          id: tileId, 
          selected: (tileId === selectedTile), 
          clickable: this.isClickable(tileId, set.id, null), 
          justMoved: (tileId === this.state.latestMovedTile),
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
        clickable: (this.state.localSelectedTile !== null),
        valid: true,
        score: null,
      });
    //}

    return sets;
  }

  getTilesRack(playerIndex) {
    //Assumption: player index is same as rack index
    if (playerIndex === null) {
      playerIndex = this.state.localPlayer;
    }

    if (!this.state.racks[playerIndex]) {
      return [];
    }

    //convert to class including tile id and state details
    const rackTiles = [];
    for (let tileId of this.state.racks[playerIndex]) {
      const selected = (tileId === this.state.localSelectedTile);
      const clickable = this.isClickable(tileId, null, playerIndex);
      rackTiles.push({
        id: tileId, 
        selected: selected, 
        clickable: clickable, 
        justMoved: (tileId === this.state.latestMovedTile),
        debug: this.state.debugMode,
      });
    }

    return rackTiles;
  }

  getTileBag(playerIndex) {
    if (!this.state.tileBag) {
      return [];
    }

    //convert to class including tile id and state details
    const tileBag = [];
    for (let tileId of this.state.tileBag) {
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

  getActionBarButtons() {
    //convert to class including tile id and state details
    const buttons = [];
    
    /*buttons.push({
      id: 'reset', 
      label: 'Reset Game', 
    });*/

    buttons.push({
      id: 'taketile', 
      label: 'Take Tile From Bag', 
    });

    return buttons;
  }

  render() {
    const racks = [];
    for (let r = 0; this.state.racks && r < this.state.racks.length; r++) {
      if (r === this.state.localPlayer || this.state.debugMode) {
        racks.push(
          <Rack 
            key={r}  
            player={this.state.players[r].name}
            tiles={this.getTilesRack(r)}
            debug={this.state.debugMode}
            onClick={(r === this.state.localPlayer) ? (tileId) => this.handleClickRackTile(tileId) : null}
          />
        )
      }
    }
    if (this.state.debugMode) {
      // Show the tile bag
      racks.push(
        <Rack 
          key={-1}  
          player='Tile Bag'
          tiles={this.getTileBag()}
        />
      )
    }
    
    return (
      <div className='game'>
        <ActionBar />
        <div className='actionbar'>
          <button className='actionbutton' onClick={() => this.resetGame()}>Reset Game</button>
          <button className='actionbutton' onClick={() => this.moveTileFromBagToRack()}>Take Tile From Bag</button>
        </div>
        <Board 
          sets={this.getSets()}
          debug={this.state.debugMode}
          onClickTile={(tileId, setId) => this.handleClickSetTile(tileId, setId)}
          onClickSet={(setId) => this.handleClickSet(setId)}
        />
        {racks}
      </div>
    );
  }
}


// Implementation of Fisher–Yates shuffle to randomise an array
function shuffle(a) {
  var i, j, x;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}





export default Game;