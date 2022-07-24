import React, { useState, useEffect } from 'react';
import style from './css/EvilLoader.module.css';

const EvilLoader = () => {
    return (
        <div className={style.circ}>
            <div className={style.loadingText}>
                <span className={style.loadingTextWords}>잠</span>
                <span className={style.loadingTextWords}>입</span>
                <span className={style.loadingTextWords}>하</span>
                <span className={style.loadingTextWords}>는</span>
                <span className={style.loadingTextWords}>중</span>
                <span className={style.loadingTextWords}>.</span>
                <span className={style.loadingTextWords}>.</span>
            </div>
            <div className={style.hands}></div>
            <div className={style.body}></div>
            <div className={style.head}>
                <div className={style.eye}></div>
            </div>
        </div>
    );
};

export default EvilLoader;

