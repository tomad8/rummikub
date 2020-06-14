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
            value={i} 
            onClick={() => this.props.onClick(i)}
          />
        )
      }
    } else {
      tiles.push(
        <div key={-1}>New set</div>
      )
    }
    
    return (
      <div className='set'>
        {tiles}
      </div>
    );
  }
}

export default Set;
