import React from 'react';
/*import logo from './logo.svg';*/
import './App.css';
import Game from './Components/Game';


function App() {
  let debugMode = false;
  if (process.env.NODE_ENV !== 'production') {
    debugMode = true;
  }
  return (
    <div className="app">
      <Game 
        debugMode={debugMode}
        />
    </div>
  );
}

export default App;
