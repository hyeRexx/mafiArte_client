/* eslint-disable */

import React from 'react';
import {Routes, Route} from "react-router-dom";
import Ingame from './components/Ingame';
import Lobby from './components/Lobby';
import Main from './components/Main';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="lobby/*" element={<Lobby/>}/>
        <Route path="ingame" element={<Ingame/>}/>
        <Route path="*" element={
          <main style={{ padding: "1rem"}}>
            <p>There's nothing here!</p>
          </main>
        }/>
      </Routes>
      
    </div>
  );
}

export default App;