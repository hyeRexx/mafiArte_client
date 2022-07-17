/* eslint-disable */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Routes, Route} from "react-router-dom";
import Ingame from './components/Ingame';
import Lobby from './components/Lobby';
import Main from './components/Main';
import {RequireAuth} from './script/auth';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Main />}/>
        <Route path="lobby/*" element={
          <RequireAuth>
            <Lobby />
          </RequireAuth>
        }/>
        <Route path="ingame" element={
        <RequireAuth>
          <Ingame />
        </RequireAuth>
        }/>
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