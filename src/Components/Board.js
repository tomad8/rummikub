import React from 'react';
import './Board.css';
import Set from './Set';

class Board extends React.Component {
  
  render() {
    const sets = [];
    if (this.props.sets) {
      //for (const i of this.props.sets) {
      for (let i = 0; i < this.props.sets.length; i++) {
        if (this.props.sets[i]) {
          sets.push(
            <Set 
              key={i}
              tiles={this.props.sets[i]} 
              onClickTile={(TileId) => this.props.onClickTile(TileId, i)}
              onClick={() => this.props.onClickSet(i)}
            />
          )
        }
      }
    }
    
    return (
      <div className='board'>
        <div>Board</div>
        {sets}
        <Set 
            key={-1}
            tiles={[-1]}
            onClickTile={(TileId) => this.props.onClickTile(TileId, -1)}
            onClick={() => this.props.onClickSet(-1)}
          />
      </div>
    );
  }
}

export default Board;
