import React from 'react';
import './Board.css';
import Set from './Set';

class Board extends React.Component {
  
  render() {
    let boardScore = 0;
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
              score={s.score}
              debug={this.props.debug}
              onClickTile={(TileId) => this.props.onClickTile(TileId, s.id)}
              onClick={() => this.props.onClickSet(s.id)}
            />
          )
          boardScore += s.score;
        }
      }
    }
    
    return (
      <div className='board'>
        <div>{boardScore} points</div>
        {sets}
      </div>
    );
  }
}

export default Board;
