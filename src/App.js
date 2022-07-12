import React from 'react';
import {Routes, Route} from "react-router-dom";
import Ingame from './components/Ingame';
import Lobby from './components/Lobby';
import Main from './components/Main';
import Rank from './components/Rank';
import Citizen from './components/Citizen';
import Setting from './components/Setting';

function App() {
  return (
    <div>
      {/* <Link to="/lobby">
        <p>go to lobby</p>
      </Link> */}
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="lobby/*" element={<Lobby/>}/>
        <Route path="ingame" element={<Ingame/>}/>
      </Routes>
    </div>
  );
}

export default App;