import React, { useState, useEffect } from 'react';
import style from './css/RoleCardHotSpot.module.css';

const RoleCardHotSpot = () => {
    return (
        <div className={style.hotspot}>
            <div className={style.buttonWrap}>
                <button className={style.pulseButton}></button>
            </div>
        </div>

    );
};

export default RoleCardHotSpot;