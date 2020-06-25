import React from 'react';
import './ActionBar.css';

class ActionBar extends React.Component {
  
  render() {
  const buttons = [];
    if (this.props.buttons) {
      for (const i of this.props.buttons) {
        buttons.push(
          <button
            key={i.id}
            onClick={this.props.onClick(i.id)}
            >
            {i.label}
          </button>
        )
      }
    }

    return (
      <div className='actionbar'>
        {buttons}
      </div>
    );
  }
}

export default ActionBar;
