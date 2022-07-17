import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Video from './Video';

const Ingame = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Video />} />
            </Routes>
        </div>
    );
}

export default Ingame;