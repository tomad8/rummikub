import React from 'react';
import './Game.css';
import * as Constants from '../Utils/constants';
import Board from './Board';
import Rack from './Rack';

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
      localPlayer: 0,
      localSelectedTile: null,
      localSelectedSet: null,
      debugMode: true,
    };
  }
  
  componentDidMount() {
    this.resetGame();
  }

  componentWillUnmount() {
    //free up any resources?
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
      racks.push(rack);
    }
    
    //initialise state
    this.setState({
      tileBag: tiles,
      racks: racks,
      sets: [],
      commitedState: {
        tileBag: [],
        racks: [],
        sets: [],
      },
      localSelectedTile: null,
      localSelectedSet: null,
    });

  }


  handleClickRackTile(tileId) {
    if (this.state.localSelectedTile === null && tileId >=0) {
      console.log('Tile ID = ' + tileId + ' selected in Rack');
      // no tile already selected - select this one if valid
      this.setState({
        localSelectedTile: tileId,
        localSelectedSet: null,
      });
    } else if (this.state.localSelectedTile === tileId) {
      // same tile clicked - clear selection
      console.log('Selection cleared');
      this.setState({
        localSelectedTile: null,
        localSelectedSet: null,
      });
    } else if (this.state.localSelectedSet === null) {
      // another tile on rack clicked - swap them
      const racks = this.swapRackTiles(tileId, this.state.localSelectedTile);
      this.setState({
        racks: racks,
        localSelectedTile: null,
        localSelectedSet: null,
      });
    } else {
      // tile already selected - treat as if parent Rack element was clicked
      this.handleClickRack();
    }
  }

  handleClickRack() {
    if (this.state.localSelectedTile === null) {
      // no tile selected - ignore click on rack
      return;
    }
    
    if (this.state.localSelectedSet === null) {
      // tile on rack selected - ignore click on rack
      return;
    }

    console.log('Rack clicked');

    let sets = this.removeTileFromSet(this.state.localSelectedTile, this.state.localSelectedSet);
    let racks = this.addTileToRack(this.state.localSelectedTile);
    
    this.setState({
      sets: sets,
      racks: racks,
      localSelectedTile: null,
      localSelectedSet: null,
    });
  }

  handleClickBoardTile(tileId, setId) {
    if (this.state.localSelectedTile === tileId) {
      // same tile clicked - clear selection
      console.log('Selection cleared');
      this.setState({
        localSelectedTile: null,
        localSelectedSet: null,
      });
    } else if (this.state.localSelectedSet === setId) {
      // same set as selected - select that new tile instead
      console.log('Tile ID = ' + tileId + ' selected in Set ID = ' + setId);
      this.setState({
        localSelectedTile: tileId,
        localSelectedSet: setId,
      });
    } else if (this.state.localSelectedTile !== null) {
      // tile already selected - treat as if parent Set element was clicked
      this.handleClickSet(setId);
    } else  {
      // clicked tile 
      console.log('Tile ID = ' + tileId + ' selected in Set ID = ' + setId);

      this.setState({
        localSelectedTile: tileId,
        localSelectedSet: setId,
      });
    }  
  }

  handleClickSet(setId) {
    if (this.state.localSelectedTile === null) {
      // no tile selected - ignore click on set
      return;
    }
    
    if (this.state.localSelectedSet === setId) {
      // same set as selected tile - ignore click on set
      return;
    }

    console.log('Set ID = ' + setId + ' clicked');

    if (this.state.localSelectedSet === null)
    {
      const racks = this.removeTileFromRack(this.state.localSelectedTile);
      const sets = this.addTileToSet(this.state.localSelectedTile, setId);
      
      this.setState({
        sets: sets,
        racks: racks,
        localSelectedTile: null,
        localSelectedSet: null,
      });
    } else {
      console.log('TODO: NEED TO IMPLEMENT SET TO SET MOVES!');
      /*
      //TODO: const sets = this.removeTileFromSet(this.state.localSelectedTile, );
      //TODO: const sets = this.addTileToSet(this.state.localSelectedTile, setId);
      
      this.setState({
        sets: sets,
        localSelectedTile: null,
        localSelectedSet: null,
      });
      */
    }

    
  }

  swapRackTiles(tileId1, tileId2) {
    console.log('Swapping Tile IDs = ' + tileId1 + ' and ' + tileId2 + ' on Rack');
    const racks = this.state.racks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    
    const index1 = localRack.indexOf(tileId1);
    const index2 = localRack.indexOf(tileId2);
    localRack[index1] = tileId2;
    localRack[index2] = tileId1;
    
    racks[this.state.localPlayer] = localRack;
    return racks;
  }

  removeTileFromRack(tileId) {
    console.log('Removing Tile ID = ' + tileId + ' from Rack');
    const racks = this.state.racks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    // don't actually remove, convert to an empty (negative) tile so we can keep track of original position
    localRack[localRack.indexOf(this.state.localSelectedTile)] = -this.state.localSelectedTile;
    racks[this.state.localPlayer] = localRack;

    return racks;
  }

  addTileToRack(tileId) {
    console.log('Adding Tile ID = ' + tileId + ' to Rack');
    const racks = this.state.racks.slice();
    const localRack = racks[this.state.localPlayer].slice();
    
    // check if matching blank tile on rack, if so place tile in that position
    const index = localRack.indexOf(-tileId);
    if (index >= 0) {
      localRack[index] = tileId;
    } else {
      localRack.push(tileId);
    }
    racks[this.state.localPlayer] = localRack;

    return racks;
  }

  removeTileFromSet(tileId, setId) {
    console.log('TODO: NEED TO FIX REMOVE FROM SET METHOD!');
    console.log('Removing Tile ID = ' + tileId + ' from Set ID = ' + setId);
    const sets = this.state.sets.slice();
    const sourceSet = sets[setId].slice();
    
    const index = sourceSet.indexOf(tileId);
    console.log('  index = ' + index);
    const splicedSet = sourceSet.splice(index, 1);
    sets[setId] = splicedSet;

    return sets;
  }
    
  addTileToSet(tileId, setId) {
    console.log('Adding Tile ID = ' + tileId + ' to Set ID = ' + setId)
    let sets;
    if (!this.state.sets) { 
      sets = []; 
    } else {
      sets = this.state.sets.slice();
    }
    
    if (setId < 0) {
      // brand new set - create it
      const targetSet = [];
      targetSet.push(tileId);
      sets.push(targetSet);
      return sets;
    } else {
      const targetSet = sets[setId].slice();
      targetSet.push(tileId);
      sets[setId] = targetSet;
      return sets;
    }
  }



  render() {
    
    //let thisPlayer = 1;
    
    return (
      <div className='game'>
        <button onClick={() => this.resetGame()}>Reset</button>
        <Board 
          sets={this.state.sets}
          onClickTile={(tileId, setId) => this.handleClickBoardTile(tileId, setId)}
          onClickSet={(setId) => this.handleClickSet(setId)}
        />
        <Rack 
          player='Player 1'
          tiles={this.state.racks[0]}
          onClick={(tileId) => this.handleClickRackTile(tileId)}
        />
        <Rack 
          player='Player 2'
          tiles={this.state.racks[1]}
          onClick={(tileId) => this.handleClickRackTile(tileId)}
        />
        <Rack 
          player='Player 3'
          tiles={this.state.racks[2]}
          onClick={(tileId) => this.handleClickRackTile(tileId)}
        />
        <Rack 
          player='Player 4'
          tiles={this.state.racks[3]}
          onClick={(tileId) => this.handleClickRackTile(tileId)}
        />

        <Rack 
          player='Tile Bag'
          tiles={this.state.tileBag}
        />
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
