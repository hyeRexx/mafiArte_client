import React, { useState, useEffect } from 'react';
import style from './css/InvitationCard.module.css';

const InvitationCard = () => {
    return (
            <div className={style.invitationBox}>
                <div className={style.rollLine}>
                    <span className={style.line1}>CONFIDENTIAL</span>
                    <span className={style.line2}>MAFIARTE</span>
                    <span className={style.line3}>CONFIDENTIAL</span>
                </div>
            </div>
    );
};

export {InvitationCard};