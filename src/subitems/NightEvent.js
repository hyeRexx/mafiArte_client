import React, { useState, useEffect } from 'react';
import style from './css/NightEvent.module.css';

const NightEventForCitizen = () => {
    return(
        <div className={style.nightEvent}>
            <div className={style.backgroundObj}>
                <div className={style.stars}></div>
                <div className={style.twinkling}></div>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightEventTitle}></div>
            </div>
            <div className={style.nightEventObj}>
                <VoteVideoFor8/>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightEventInfo}>
                    밤이 되었습니다.<span id={style.empty}/>마피아를 추측해 투표하세요.
                </div>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightTimer}> 30 </div>
            </div>

        </div>
    )
};

const NightEventForMafia = () => {
    return(
        <div className={style.nightEvent}>
            <div className={style.backgroundObj}>
                <div className={style.stars}></div>
                <div className={style.twinkling}></div>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightEventTitle} style={{marginTop: 260, height: 240}}></div>
            </div>
            <div className={style.nightEventObj}>
                <dic className={style.nightMafiaForm}>
                    <input className={style.nightInputForm} autoFocus placeholder=" "/>
                    <span className={style.formFocusBorder}></span>
                </dic>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightEventInfo} style={{marginBottom: 10}}>
                    밤이 되었습니다.<span id={style.empty}/>추측한 제시어를 입력하세요.
                </div>
            </div>
            <div className={style.nightEventObj}>
                <div className={style.nightTimer}> 30 </div>
            </div>

        </div>
    )
}

// VoteVideo는 div class singleVideo에 각 stream이 들어가면 됨
// 아랫줄 윗줄 기준 맞춰 넣어야 함

// player : 4  ~한 줄로 들어감. 정렬 자동으로 맞춰져 있음
const VoteVideoFor4 = () => {
    return (
        <div className={style.nightVideo4}>
            <div className={style.voteVideoRow}>
                <div className={style.singleVideo}>
                    {/* 여기에 비디오 심기 */}
                    {/* <Video stream={streamId.stream} style={{width: 330, height: 210}}/> */}
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
            </div>
        </div>
    )
}

// player : 5 ~ 8  ~두 줄로 들어감(2:3, 3:3, 3:4, 4:4 비율). 정렬 자동으로 맞춰져 있음 
const VoteVideoFor8 = () => {
    return (
        <div className={style.nightVideo8}>
            <div className={style.voteVideoRow}>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
            </div>
            <div className={style.voteVideoRow}>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
                <div className={style.singleVideo}>
                    
                </div>
            </div>
        </div>
    )
}


export {NightEventForCitizen, NightEventForMafia}