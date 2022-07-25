import React, { useState, useEffect } from 'react';
import style from './css/RoleCard.module.css';
import RoleCardHotSpot from '../subitems/RoleCardHotSpot';

const RoleCardMafia = () => {
    return (
        <div className={style.roleCard}>
            <div className={style.roleCardContent}>
                <div className={style.roleCardFront}><RoleCardHotSpot/></div>
                <div className={style.roleCardBackMafia}></div>
            </div>
        </div>
    );
};

const RoleCardCitizen = ({word}) => {
    return (
        <div className={style.roleCard}>
            <div className={style.roleCardContent}>
                <div className={style.roleCardFront}><RoleCardHotSpot/></div>
                <div className={style.roleCardBackCitizen}>
                    <div className={style.roleCardWord}>{word}</div> 
                </div>
            </div>
        </div>
    );
};

export {RoleCardMafia, RoleCardCitizen};