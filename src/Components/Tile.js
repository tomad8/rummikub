import React from 'react';
import * as Constants from '../Utils/constants';
import './Tile.css';

class Tile extends React.Component {
  
  getTileClassName(id) {
    let className = 'tile';
    
    if (id < 0) {
      // alternate joker colours
      //colourIndex = id % 4;
      className += ' tile-empty'
    }

    if (this.props.selected) {
      className += ' tile-selected'
    }

    if (this.props.clickable) {
      className += ' tile-clickable'
    }

    if (this.props.justMoved) {
      className += ' tile-moved'
    }

    return className;
  }

  getTextClassName(id) {
    let className = 'tile-text';
    let colourIndex = getTileSuitFromId(id);

    // we only handle max 6 suits.colours here (should be plenty, default is 4)
    switch (colourIndex) {
      case 0: className += ' tile-black'; break;
      case 1: className += ' tile-red'; break;
      case 2: className += ' tile-blue'; break;
      case 3: className += ' tile-orange'; break;
      case 4: className += ' tile-purple'; break;
      case 5: className += ' tile-pink'; break;
      default: className += ' tile-emptytext';
    }

    return className;
  }
  
  getText(id) {    
    return getTileRankFromId(id);
  }

  render() {
    return (
      <button
        className={this.getTileClassName(this.props.id)}
        onClick={this.props.onClick}
      >
        <div className={this.getTextClassName(this.props.id)}>
          {this.getText(this.props.id)}
        </div>
        <div className={this.props.debug ? 'tile-subscript-debug' : (this.props.id >= 0 ? 'tile-subscript' : 'tile-subscript-empty')}>
          {this.props.debug ? this.props.id : Constants.JOKER_DISPLAY_CHARACTER}
        </div>
      </button>
    );
  }
}

export default Tile;


function getTileSuitFromId(id) {
  const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
  const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
  const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
  const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
  const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
  const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
  const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
  
  let suit = null;
  if (id >= 0 && id < numberOfStandardTiles) {
    suit = Math.floor(id / numberOfDecks) % numberOfSuits;
  } 
  else if (id >= numberOfStandardTiles && id < numberOfTotalTiles) {
    // alternate joker colours
    suit = id % numberOfSuits;
  }

  return suit;
}

function getTileRankFromId(id) {
  const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
  const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
  const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
  const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
  const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
  const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
  const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
  
    let rank = null;
  if (id >= 0 && id < numberOfStandardTiles) {
    rank = (Math.floor((id / numberOfDecks / numberOfSuits)) % numberOfRanks) + 1;
  } 
  else if (id >= numberOfStandardTiles && id < numberOfTotalTiles) {
    rank = Constants.JOKER_DISPLAY_CHARACTER;
  } 
  else if (id < 0) {
    // empty tile
    rank = '+';
  }

  return rank;
}