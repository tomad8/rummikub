import React from 'react';
import './ActionBar.css';

class ActionBar extends React.Component {
  
  render() {
  const buttons = [];
    if (this.props.buttons) {
      for (const i of this.props.buttons) {
        buttons.push(
          <button
            className={i.className ?? 'actionbutton'}
            key={i.id}
            onClick={i.onClick}
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
