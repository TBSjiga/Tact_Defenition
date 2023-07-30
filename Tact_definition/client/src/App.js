// App.js

//--------------------ИМПОРТ-ЗАВИСИМОСТЕЙ----------------------------------------------------------------------------

import React from 'react';
import './App.css';

// запись звука
import AudioRecord from './audioRecord';

function App() {

  return (

    <div className="App">
      <header className="App-header">
        <div id='AudioRec'>
          <AudioRecord/>
        </div>
      </header>
    </div>

  );
}

export default App;
