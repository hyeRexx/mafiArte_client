import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';

import { setUserId } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import connectSocket, {socket} from '../script/socket';
import style from '../css/Lobby.module.css'


const Lobby = () => {
    const myId = useSelector(state => state.user.id);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const btnStart = () => {
        socket && socket.emit("checkEnterableRoom", (roomNumber)=>{navigate(`/ingame/${roomNumber}`);});
    };
    const btnMake = () => {
        console.log("make button");
    };
    const btnLogout = ()=>{
        axios.post(`${paddr}api/auth/logout`, reqHeaders).finally(()=>{
            dispatch(setUserId(""));
            sessionStorage.removeItem('userid');
            navigate('/');
        });
    };

    let [tap, tapChange] = useState(0);

    const userid = useSelector((user) => user.user)
    const id = userid.id;

    let img = "";
    let [imgURL, imgURLstate] = useState("");
    
    useEffect(() => {
        !socket && connectSocket().then(()=>{
            // userinfo 에 socket 저장을 위한 emit
            socket.emit("userinfo", id);
        });
        // profile 이미지 정보
        axios.get(`${paddr}api/lobby/profile_img`, reqHeaders)
        .then(res => { 
            img = res.data.profile_img;
            imgURLstate("/img/" + img)
        })
        .catch(()=>{
            console.log('실패함')
        })
    }, [])


    return (
        <div id="lobby" style={{padding:"2em"}}>
            여기는 로비
            
            <div className={style.MainLobby}>
 
                <div className={style.MainLobbyHeader}>

                    <img className={style.HeaderLogo} src='/img/mainLogo.png'>
                    </img>
                    <div className={style.HeaderImage}>
                    <img src={imgURL} className={style.test}>
                    </img>
                    </div>

                    <div className={style.Headername}>
                        해인이
                    </div>

                    <div className={style.HeaderIngameButton}>

                        <button className={style.IngameButton} onClick={btnStart}><span>Start</span></button>
                        <button className={style.IngameButton} onClick={btnMake}><span>Make a game</span></button>

                    </div>

                </div>

                <div className={style.MainLobbyContent}>
                    <div className={style.MainLobbyTap}>
                    
                        {/* <button id="rank" className={style.TapButton} onClick={() => {tapChange(0)}}>RANKING</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(1)}}>CITIZEN</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(2)}}>Setting</button> */}
                        <Link to="/lobby/">
                        <button id="rank">RANKING</button>
                        </Link>
                        <Link to="/lobby/citizen">
                        <button id="citizen">CITIZEN</button>
                        </Link>
                        <Link to="/lobby/setting">
                        <button id="setting">SETTING</button>
                        </Link>
                        <button id="logout" onClick={btnLogout}>LOGOUT</button>
                    
                    </div>

                    <div className={style.MainLobbyTapContents}>
                        <Routes>
                            <Route path="/" element={<Rank/>}/>
                            <Route path="citizen" element={<Citizen/>}/>
                            <Route path="setting" element={<Setting/>}/>
                        </Routes>
                    </div>

                </div>

            </div>

            {/* <div className={style.flexbox2}>
            
                <div className={style.item11}>aelfjhawbefljhawebflh</div>
                <div className={style.item22}>aelfjhawbefljhawebflh</div>
                
            </div> */}
            
            
        </div>
    );
}

export default Lobby;