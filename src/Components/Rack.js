import React from 'react';
import './Rack.css';
import Tile from './Tile';

class Rack extends React.Component {
  
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
            onClick={() => this.props.onClick(i.id)}
          />
        )
      }
    }

    return (
      <div className='rack'>
        <div>{this.props.player}</div>
        {tiles}
      </div>
    );
  }
}

export default Rack;
