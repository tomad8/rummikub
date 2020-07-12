import React from 'react';
import './Rack.css';
import Tile from './Tile';

class Rack extends React.Component {
  
  render() {
    const tiles = [];
    if (this.props.tiles) {
      let uniqueId = -1;
      for (const i of this.props.tiles) {
          tiles.push(
          <Tile 
            key={i.id !== null ? i.id : uniqueId}
            id={i.id !== null ? i.id : uniqueId--} 
            selected={i.selected}
            clickable={i.clickable}
            justMoved={i.justMoved}
            debug={i.debug}
            onClick={this.props.onClick ? () => this.props.onClick(i.id) : null}
          />
        )
      }
    }

    return (
      <div className='rack'>
        {this.props.player && <div className='racktitle'>{this.props.player}</div>}
        {tiles}
      </div>
    );
  }
}

export default Rack;
