import React, { useState, useEffect } from 'react';
import style from './css/ReadyOnVideo.module.css';

const ReadyOnVideoBig = () => {
    return (
        <div className={style.onVideoBoxBig}>
            <h1 className={style.readyTextBig}>READY</h1>
        </div>
    );
};

const ReadyOnVideoSmall = () => {
    return (
        <div className={style.onVideoBoxSmall}>
            <h1 className={style.readyTextSmall}>READY</h1>
        </div>
    );
};

export {ReadyOnVideoBig, ReadyOnVideoSmall};