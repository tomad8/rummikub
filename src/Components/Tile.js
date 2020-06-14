import React from 'react';
import * as Constants from '../Utils/constants';
import './Tile.css';

class Tile extends React.Component {
  
  getTextClassName(value) {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
    const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
    const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
   
    let className = 'tiletext';
    let colourIndex;
    
    if (value >= 0 && value < numberOfStandardTiles) {
      // cycle colour every 13, repeating after 52
      //colourIndex = Math.floor((value % 52) / 13);
      colourIndex = Math.floor((value % numberOfTilesPerDeck) / numberOfRanks);
    } else if (value >= numberOfStandardTiles && value < numberOfTotalTiles) {
      // alternate joker colours
      //colourIndex = value % 4;
      colourIndex = value % numberOfSuits;
    } else {
      // invalid tile
      colourIndex = null;
    }

    // we only handle max 4 suits here!
    switch (colourIndex) {
      case 0: className += ' black'; break;
      case 1: className += ' red'; break;
      case 2: className += ' blue'; break;
      case 3: className += ' orange'; break;
      default: ;
    }

    return className;
  }
  
  getText(value) {
    const numberOfSuits = Constants.NUMBER_OF_TILE_SUITS;
    const numberOfRanks = Constants.NUMBER_OF_TILE_RANKS;
    const numberOfDecks = Constants.NUMBER_OF_TILE_DECKS;
    const numberOfJokers = Constants.NUMBER_OF_TILE_JOKERS;
    const numberOfTilesPerDeck = numberOfSuits * numberOfRanks;
    const numberOfStandardTiles = numberOfTilesPerDeck * numberOfDecks;
    const numberOfTotalTiles = numberOfStandardTiles * numberOfJokers;
   
    if (value >= 0 && value < numberOfStandardTiles) {
      //return (value % 13) + 1;
      return (value % Constants.NUMBER_OF_TILE_RANKS) + 1;
    } else if (value >= numberOfStandardTiles && value < numberOfTotalTiles) {
      return Constants.JOKER_DISPLAY_CHARACTER;
    } else {
      // invalid tile
      return null;
    }

  }

  render() {
    return (
      <button
        className='tile'
        onClick={this.props.onClick}
      >
        <div className={this.getTextClassName(this.props.value)}>
          {this.getText(this.props.value)}
        </div>
        <div className='tile-subscript'>
          {this.props.value}
        </div>
      </button>
    );
  }
}

export default Tile;
