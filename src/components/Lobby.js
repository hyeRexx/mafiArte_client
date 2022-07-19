import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useInRouterContext } from 'react-router-dom';
import styled from 'styled-components';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { setUserId } from '../store';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import style from '../css/Lobby.module.css'
import { Container } from 'react-bootstrap';

const Lobby = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const btnStart = () => {
        navigate("/ingame");
        console.log("start button");
    };
    const btnMake = () => {
        console.log("make button");
    };
    const btnLogout = ()=>{
        axios.post('/api/auth/logout').finally(()=>{
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

        const socket = io.connect("http://localhost:3000");

        console.log(socket);
        axios.get('api/lobby/userinfo')
        .then((result)=>{ 
        console.log(result.data)
        })
        .catch((e)=>{
            console.log(e)
        })
        .then(()=> {
            socket.emit("userinfo", id);
        })

        axios.get('api/lobby/userimg')
        .then(res => { 
            img = res.data[0][0].profile_img;
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