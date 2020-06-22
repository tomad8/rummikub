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
            onClick={() => this.props.onClickTile(i.id)}
          />
        )
      }
    }
    
    if (this.props.debug) {
      tiles.push(
        <div key={-2} className='set-subscript'>
          {(this.props.score > 0 ? this.props.score + ' points - ' : '') + 'Set ' + this.props.id}
        </div>
      )
    } else {
      tiles.push(
        <div key={-2} className='set-subscript'>
          {(this.props.score > 0 ? this.props.score + ' points' : '')}
        </div>
      )
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
