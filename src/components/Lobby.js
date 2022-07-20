import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useInRouterContext } from 'react-router-dom';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { setUserId } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import connectSocket, {socket} from '../script/socket';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import style from '../css/Lobby.module.css'

const Lobby = () => {

    const myId = useSelector(state => state.user.id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // START 버튼 - 랜덤 매칭 
    const btnStart = () => {
        console.log(socket);
        socket && socket.emit("checkEnterableRoom", (roomNumber)=>{
            console.log(`로비에서 ${roomNumber}`);
            navigate(`/ingame/${roomNumber}`);});
        socket.emit("hi");
    };

    // // 초대 보낸 사람의 id
    // let [sender, senderstate] = useState('');

    // MAKE A GAME 버튼 - HOST가 되어 게임방 생성
    const btnMake = () => {
        let listuserid = new Array();
        
        listuserid.push("haein");

        socket.emit("listuserinfo", listuserid);

        socket.on("listsocketid", (listsocketid) => {
            console.log(`초대하고 싶은 사람의 socketid 리스트 ${listsocketid}`);

            let roomId = + new Date();

            // 초대장 전송
            socket.emit("sendinvite", listsocketid, roomId, myId,(roomId)=> {
                console.log(`초대장 전송 시 ${roomId}`);

                // HOST가 방으로 이동
                navigate(`/ingame/${roomId}`);
            });

        });
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
    let [invite, invitestate] = useState(false);
    let [newRoomId, roomidstate] = useState(0);
    let [sender, senderstate] = useState("");

    useEffect(() => {

        !socket && connectSocket().then(()=>{
            socket.emit("userinfo", id);
            socket.on("getinvite", (roomId, myId)=> {
                console.log('초대장을 받았습니다!');
                
                roomidstate(roomId);
                senderstate(myId);

                // 모달창 띄워주기
                invitestate(true);

                // "초대 수락" 시 해당 roomId의 방으로 이동시키기
            });
        });
        
        // profile 이미지 정보
        axios.get('api/lobby/userimg')
        .then(res => { 
            // img = res.data.profile_img;
            img = res.data[0][0].profile_img;
            imgURLstate("/img/" + img)
        })
        .catch(()=>{
            console.log('실패함')
        })

    }, [])

    return (
        <>
         

        <div id="lobby" style={{padding:"2em"}}>
            {
                invite === true ? <InviteModal sender={sender} roomId={newRoomId} className={style.inviteModal} /> : null
            }
            <div className={style.MainLobby}>

                <div className={style.MainLobbyHeader}>

                    <img className={style.HeaderLogo} src='/img/mainLogo.png'>
                    </img>
                    <div className={style.HeaderImage}>
                    <img src={imgURL} className={style.test}>
                    </img>
                    </div>

                    <div className={style.Headername}>
                        {id}
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
                
                <button onClick={navigate}>LOGOUT</button>
            </div>
        </div>
        </>
    );
}


function InviteModal(props){
    const navigate = useNavigate();
    return(
    <>
        <Modal.Dialog className={style.modal} style={{ top: "650px" }}>
            <Modal.Header closeButton>
                <Modal.Title>INVITATION</Modal.Title>
            </Modal.Header>

            <Modal.Body className={style.modalBody}>
                <p>{props.sender}님이 당신을 초대했습니다!</p>
                <p>게임에 참가하시겠습니까?</p>
            </Modal.Body>

            <Modal.Footer className={style.modalFooter}>
                <Button variant="secondary">CANCEL</Button>
                <Button variant="primary" onClick={()=> (navigate(`/ingame/${props.roomId}`))}>ACCEPT</Button>
            </Modal.Footer>
        </Modal.Dialog>
    </>
    )
  }

export default Lobby;
