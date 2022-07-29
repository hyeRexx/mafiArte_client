import React, { useState, useEffect } from 'react';
import style from './css/GameLoader.module.css';

const GameLoader = () => {
    return (
        <div className={style.GameLoader}>
            <div className={style.backgroundObj}>
                <div className={style.loaderInfoBox}>
                    <div className={style.GameLoaderInfo}>
                        게임을 시작합니다. 잠시만 기다려 주세요.
                    </div>
                </div>
                <div className={style.gooey}>
                    <span className={style.dot}></span>
                        <div className={style.dots}>
                            <span></span>
                            <span></span>
                            <span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GameLoader
