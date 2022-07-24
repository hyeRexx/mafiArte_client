import React, { useState, useEffect } from 'react';
import style from './css/ReadyBtn.module.css';

const ReadyBtn = () => {
    const [ readyState, setreadyState ] = useState(true);

    const changeReadyState = () => {
        setreadyState(!readyState);
    }

    return (
        <button className={readyState ? style.readyBtn : `${style.holdBtn} ${style.readyBtn}`} onClick={changeReadyState}>{readyState ? 'READY?' : 'READY!'}</button>
    );
};

export default ReadyBtn;