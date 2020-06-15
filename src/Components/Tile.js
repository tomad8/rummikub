import React from 'react';
import * as Constants from '../Utils/constants';
import './Tile.css';

class Tile extends React.Component {
  
  getTileClassName(id) {
    let className = 'tile';
    
    if (id < 0) {
      // alternate joker colours
      //colourIndex = id % 4;
      className += ' empty'
    }

    return className;
  }

  getTextClassName(id) {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
    const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
    const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
   
    let className = 'tiletext';
    let colourIndex;
    
    if (id >= 0 && id < numberOfStandardTiles) {
      // cycle colour every 13, repeating after 52
      //colourIndex = Math.floor((id % 52) / 13);
      colourIndex = Math.floor((id % numberOfTilesPerDeck) / numberOfRanks);
    } else if (id >= numberOfStandardTiles && id < numberOfTotalTiles) {
      // alternate joker colours
      //colourIndex = id % 4;
      colourIndex = id % numberOfSuits;
    } else {
      // empty tile
      colourIndex = null;
    }

    // we only handle max 4 suits here!
    switch (colourIndex) {
      case 0: className += ' black'; break;
      case 1: className += ' red'; break;
      case 2: className += ' blue'; break;
      case 3: className += ' orange'; break;
      default: className += ' emptytext';
    }

    return className;
  }
  
  getText(id) {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
    const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
    const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
   
    if (id >= 0 && id < numberOfStandardTiles) {
      //return (id % 13) + 1;
      return (id % Constants.NUMBER_OF_TILE_RANKS) + 1;
    } else if (id >= numberOfStandardTiles && id < numberOfTotalTiles) {
      return Constants.JOKER_DISPLAY_CHARACTER;
    } else if (id < 0) {
      // empty tile
      return '+';
    } else {
      // invalid tile
      return null;
    }

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
        <div className='tile-subscript'>
          {this.props.id}
        </div>
      </button>
    );
  }
}

export default Tile;
