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
    
    this.setState({
      tileBag: tiles,
      racks: racks,
      sets: [],
    });

  }

  handleClick(i) {

    let sets;
    
    if (this.props.sets) {
      sets = this.props.sets.slice();
    } else {
      sets = [];
    }

    if (sets[0]) {
      const set = sets[0].slice();
      set.push(i);
      sets[0] = set;
    } else {
      const set = [i];
      sets.push(set);
    }

    
    this.setState({
      sets: sets,
    });
  }

  render() {
    
    //let currentPlayer = 1;
    
    return (
      <div className='game'>
        <button onClick={() => this.resetGame()}>Reset</button>
        <Board 
          sets={this.state.sets}
          onClick={(i) => this.handleClick(i)}
        />
        <Rack 
          player='Player 1'
          tiles={this.state.racks[0]}
          onClick={(i) => this.handleClick(i)}
        />
        <Rack 
          player='Player 2'
          tiles={this.state.racks[1]}
          onClick={(i) => this.handleClick(i)}
        />
        <Rack 
          player='Player 3'
          tiles={this.state.racks[2]}
          onClick={(i) => this.handleClick(i)}
        />
        <Rack 
          player='Player 4'
          tiles={this.state.racks[3]}
          onClick={(i) => this.handleClick(i)}
        />

        <Rack 
          player='Tile Bag'
          tiles={this.state.tileBag}
          onClick={(i) => this.handleClick(i)}
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
