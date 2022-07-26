import React, { useState, useEffect } from 'react';
import style from './css/CloseBtn.module.css';

const CloseBtn = () => {
    return (
        <div className={style.closeBtn}>
            <div className={style.leftright}></div>
            <div className={style.rightleft}></div>
        </div>
    )
}

export default CloseBtn
