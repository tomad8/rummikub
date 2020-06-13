import React from 'react';
import './Tile.css';

class Tile extends React.Component {
  
  getTextClassName(value) {
    let className = 'tiletext';
    let colourIndex;
    
    if (value < 104) {
      //cycle colour every 13, repeating after 52
      colourIndex = Math.floor((value % 52) / 13);
    } else {
      // alternate joker colours
      colourIndex = value % 4;
    }

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
    if (value < 104) {
      return (value % 13) + 1;
    } else {
      return '㋡';
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
      </button>
    );
  }
}

export default Tile;
