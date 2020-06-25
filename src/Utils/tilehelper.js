import * as Constants from '../constants';


  export function getStandardTileCount() {
    return Constants.NUMBER_OF_TILE_SUITS * Constants.NUMBER_OF_TILE_RANKS * Constants.NUMBER_OF_TILE_DECKS;
  }


  export function getTotalTileCount() {
    return getStandardTileCount() + Constants.NUMBER_OF_TILE_JOKERS;
  }


  export function getTileSuitFromId(id) {
    const numberOfStandardTiles = getStandardTileCount();
    const numberOfTotalTiles = getTotalTileCount();
    
    let suit = null;
    if (id >= 0 && id < numberOfStandardTiles) {
      suit = Math.floor(id / Constants.NUMBER_OF_TILE_DECKS) % Constants.NUMBER_OF_TILE_SUITS;
    } 
    else if (id >= numberOfStandardTiles && id < numberOfTotalTiles) {
      // alternate joker colours
      suit = id % Constants.NUMBER_OF_TILE_SUITS;
    }
  
    return suit;
  }
  

  export function getTileRankFromId(id) {
    const numberOfStandardTiles = getStandardTileCount();
    const numberOfTotalTiles = getTotalTileCount();

        let rank = null;
    if (id >= 0 && id < numberOfStandardTiles) {
        rank = (Math.floor((id / Constants.NUMBER_OF_TILE_DECKS / Constants.NUMBER_OF_TILE_SUITS)) % Constants.NUMBER_OF_TILE_RANKS) + 1;
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

    
  export function isJoker(id) {
    return (id >= getStandardTileCount() && id < getTotalTileCount());
  }

