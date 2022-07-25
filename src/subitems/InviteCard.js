import React, { useState, useEffect } from 'react';
import CloseBtn from './CloseBtn';
import style from './css/InviteCard.module.css';

const InviteCard = () => {
    return (
            <div className={style.InviteCard}>
                <div className={style.InviteClose}><CloseBtn/></div>
                <div className={style.inviteTitle}>INVITE</div>

                <div className={style.searchBox}>
                    <input className={style.searchInput} placeholder="친구 아이디를 입력하세요"/>
                    <input className={style.submitInput} type="submit"/>
                </div>

                {/* design : input-label set, set의 요소별 id는 개별 아이디로 일치해야 함 */}
                <div className={style.myCitizen}>
                    <li className={style.checkList}>
                        <input className={style.checkInput} type="checkbox" id="1" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="1">Rainbow Dash</label>
                        <input className={style.checkInput} type="checkbox" id="2" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="2">Rainbow Dash</label>
                    </li>
                    <li className={style.checkList}>
                        <input className={style.checkInput} type="checkbox" id="3" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="3">Rainbow Dash</label>
                        <input className={style.checkInput} type="checkbox" id="4" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="4">Rainbow Dash</label>
                    </li>
                    <li className={style.checkList}>
                        <input className={style.checkInput} type="checkbox" id="5" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="5">Rainbow Dash</label>
                        <input className={style.checkInput} type="checkbox" id="6" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="6">Rainbow Dash</label>
                    </li>
                    <li className={style.checkList}>
                        <input className={style.checkInput} type="checkbox" id="7" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="7">Rainbow Dash</label>
                        <input className={style.checkInput} type="checkbox" id="8" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="8">Rainbow Dash</label>
                    </li>
                    <li className={style.checkList}>
                        <input className={style.checkInput} type="checkbox" id="9" value="Rainbow Dash"/>
                        <label className={style.checkLabel} for="9">Rainbow Dash</label>
                    </li>
                </div>
                <div className={style.makeGameWith}>
                    <button className={`${style.GameBtn} ${style.makeBtn}`}><span>MAKE A GAME</span></button>
                </div>
            </div>
    );
};

export {InviteCard};