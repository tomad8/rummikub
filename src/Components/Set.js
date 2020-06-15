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
            key={i.id}
            id={i.id} 
            selected={i.selected}
            clickable={i.clickable}
            debug={i.debug}
            onClick={() => this.props.onClickTile(i.id)}
          />
        )
      }
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
