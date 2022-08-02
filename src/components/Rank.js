import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import style from '../css/Lobby.module.css';

const Rank = () => {
    return (
        <div id="rank" className={style.rank}>
            랭킹 컴포넌트
        </div>
    );
}

export default Rank;