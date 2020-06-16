import React from 'react';
import './Board.css';
import Set from './Set';

class Board extends React.Component {
  
  render() {
    const sets = [];
    if (this.props.sets) {
      for (const s of this.props.sets) {
      //for (let i = 0; i < this.props.sets.length; i++) {
        if (s) {
          sets.push(
            <Set 
              key={s.id}
              id={s.id}
              tiles={s.tiles} 
              clickable={s.clickable}
              valid={s.valid}
              onClickTile={(TileId) => this.props.onClickTile(TileId, s.id)}
              onClick={() => this.props.onClickSet(s.id)}
            />
          )
        }
      }
    }
    
    return (
      <div className='board'>
        <div>Board</div>
        {sets}
      </div>
    );
  }
}

export default Board;
