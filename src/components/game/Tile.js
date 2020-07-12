import React from 'react';
import * as Constants from '../../constants';
import * as TileHelper from '../../utils/tilehelper';
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

    if (this.props.fresh) {
      className += ' tile-fresh'
    }

    return className;
  }

  getTextClassName(id) {
    let className = 'tile-text';
    let colourIndex = TileHelper.getTileSuitFromId(id);

    if (this.props.overrideColour) {
      colourIndex = this.props.overrideColour - 1;
    }

    // we only handle max 6 suits/colours here (should be plenty, default is 4)
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
    return this.props.overrideText ? this.props.overrideText : TileHelper.getTileRankFromId(id);
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


