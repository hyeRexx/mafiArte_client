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
                <div className={style.invitationInfo}>
                    hyeRexx에게 초대받았습니다<br/>
                    게임에 참가하시겠습니까?
                </div>
                <div className={style.invitationBtnBox}>
                    <button className={`${style.invitationBtn} ${style.reject}`}>거절하기</button>
                    <button className={style.invitationBtn}>참가하기</button>
                </div>
            </div>
    );
};

export {InvitationCard};