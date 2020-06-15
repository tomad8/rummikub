import React from 'react';
import './Set.css';
import Tile from './Tile';

class Set extends React.Component {
  
  render() {
    const tiles = [];
    if (this.props.tiles) {
      for (const i of this.props.tiles) {
          tiles.push(
          <Tile 
            key={i}
            id={i} 
            onClick={() => this.props.onClickTile(i)}
          />
        )
      }
    } else {
      tiles.push(
        <div key={-1}>Empty set</div>
      )
    }
    
    return (
      <div
        className='set'
        onClick={this.props.onClick}
      >
        {tiles}
      </div>
    );
  }
}

export default Set;
