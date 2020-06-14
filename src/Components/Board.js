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
              onClick={() => this.props.onClick()}
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
            tiles={null}
            onClick={() => this.props.onClick()}
          />
      </div>
    );
  }
}

export default Board;
