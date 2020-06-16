import React from 'react';
import './Set.css';
import Tile from './Tile';

class Set extends React.Component {
  
  getSetClassName(id) {
    let className = 'set';
    
    if (id < 0) {
      className += ' set-empty'
    }

    if (!this.props.valid) {
      className += ' set-invalid'
    }
    
    if (this.props.clickable) {
      className += ' set-clickable'
    }

    return className;
  }

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
        className={this.getSetClassName(this.props.id)}
        onClick={this.props.onClick}
      >
        {tiles}
      </div>
    );
  }
}

export default Set;
