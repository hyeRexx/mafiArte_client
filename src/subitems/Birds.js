import React, { useState, useEffect } from 'react';
import style from './css/Birds.module.css';

const Birds = ({effectSD}) => {
    return (
        <div className={style.birdContainer}>
            <div className={`${style.birdBox} ${style.birdBox1}`}>
                <div className={`${style.bird} ${style.bird1}`}></div>
            </div>
            
            <div className={`${style.birdBox} ${style.birdBox2}`}>
                <div className={`${style.bird} ${style.bird2}`}></div>
            </div>
            
            <div className={`${style.birdBox} ${style.birdBox3}`}>
                <div className={`${style.bird} ${style.bird3}`}></div>
            </div>
            
            <div className={`${style.birdBox} ${style.birdBox4}`}>
                <div className={`${style.bird} ${style.bird4}`}></div>
            </div>
        </div>
    );
};

export default Birds




