import React from 'react';
import './Board.css';
import Tile from '../Tile/Tile';

class Board extends React.Component {
  
  render() {
    const tiles = [];
    for (let i = 0; i < 108; i++) {
      tiles.push(
        <Tile 
          value={i} 
          className={'Tile'}
          onClick={() => this.props.onClick()}
        />
      )
    }
    
    return (
      <div className='board'>
        {tiles}
      </div>
    );
  }
}

export default Board;
