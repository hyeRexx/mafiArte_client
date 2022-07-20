import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import { setUserId, FriendInfoSet, FriendInfoChange, FriendInfoReset } from '../store';
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
        // socket && socket.emit("checkEnterableRoom", (roomNumber)=>{navigate(`/ingame/${roomNumber}`);});
        /*** gamemode hyeRexx ***/
        socket && socket.emit("joinGame", {gameId : 0, userId : myId}, (thisGameId) => {
            console.log("__debug : get this game id? :", thisGameId);
            navigate(`/ingame/${thisGameId}`);
        });
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
            
            //const gameId = Date.now();
            //socket.emit("makeGame", {gameId : gameId, userId : myId}, (thisGameId) => {
            // navigate(`/ingame/${thisGameId}`);
        });
    };

    const btnLogout = ()=>{
    
        axios.post(`${paddr}api/auth/logout`, reqHeaders).finally(()=>{
            socket.emit('loginoutAlert', myId, 0);
            dispatch(setUserId(""));
            // dispatch(FriendInfoReset(""));
            // socket.close();
            sessionStorage.removeItem('userid');
            navigate('/');
        });
    };

    let img = "";
    let [imgURL, imgURLstate] = useState("");   
    let [invite, invitestate] = useState(false);
    let [newRoomId, roomidstate] = useState(0);
    let [sender, senderstate] = useState("");

    // const test = useSelector((FriendInfo) => FriendInfo.FriendInfo);

    // console.log('리덕스 친구리스트', test);
    
    useEffect(() => {
        !socket && connectSocket().then(() => {
            socket.on("friendList", (userid, status) => {
                console.log("friend수정확인",userid, status)
                dispatch(FriendInfoChange([userid, status]));
            })
            socket.emit("userinfo", myId);
            socket.emit('loginoutAlert', myId, 1);
            console.log('login 변경사항 확인');

            socket.on("getinvite", (roomId, myId)=> {
                console.log('초대장을 받았습니다!');
                
                roomidstate(roomId);
                senderstate(myId);

                // 모달창 띄워주기
                invitestate(true);

                // "초대 수락" 시 해당 roomId의 방으로 이동시키기
            });

        })
        
        // profile 이미지 정보
        axios.get(`${paddr}api/lobby/profile_img`, reqHeaders)
        .then(res => { 
            img = res.data.profile_img;
            imgURLstate("/img/" + img)
        })
        .catch(()=>{
            console.log('실패함')
        })

        axios.post('/api/lobby/friendinfo', {userid: myId})
            .then((res) => {
                let FriList = res.data[0]; // user의 전체 친구 목록
                let onlineList = res.data[1]; // 현재 접속중인 user 목록
                console.log('onlinelist', onlineList);
                onlineList = { testid : 1,  jack: 1}; // 임시 접속 user 목록
                for (var i = 0; i < Object.keys(FriList).length; i++){
                    let key = FriList[i].userid;
                    if (!onlineList[key]){
                        dispatch(FriendInfoSet([key, 0]))
                    } else {
                        dispatch(FriendInfoSet([key, 1]))
                    }
                }
            })
            .catch((e) => {
                console.log(e);
            })
    }, [])

    return (
        <>
        <div id="lobby" style={{padding:"0em"}}>
             {
                invite === true ? <InviteModal sender={sender} roomId={newRoomId} className={style.inviteModal} /> : null
            }
            
            <div className={style.mainLobby}>
 
                <div className={style.lobbyleft}>
                    <div className={style.profileSection}>
                        <img className={style.lobbyLogo} src='/img/smallLogo.png'>
                        </img>
                        <div className={style.prifileImg}>
                            {/* imgURL 갈아야 함 */}
                            {/* <img src='/img/AudreyHepburnToyFace.jpg' className={style.test}> */}
                        {/* </img> */}
                        </div>

                        <div className={style.nickname}>
                            {myId}
                        </div>
                    </div>

                    <div className={style.lobbyGameBtns}>

                        <button className={`${style.GameBtn} ${style.startBtn}`} onClick={btnStart}><span>GAME START</span></button>
                        <button className={`${style.GameBtn} ${style.makeBtn}`} onClick={btnMake}><span>MAKE A GAME</span></button>

                    </div>

                </div>

                <div className={style.MainLobbyContent}>
                    
                    <div className={style.MainLobbyTap}>
                    
                        {/* <button id="rank" className={style.TapButton} onClick={() => {tapChange(0)}}>RANKING</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(1)}}>CITIZEN</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(2)}}>Setting</button> */}
                        <Link to="/lobby/">
                        <button className={style.utilityBtn} id="rank">RANKING</button>
                        </Link>
                        <Link to="/lobby/citizen">
                        <button className={style.utilityBtn} id="citizen">CITIZEN</button>
                        </Link>
                        <Link to="/lobby/setting">
                        <button className={style.utilityBtn} id="setting">SETTING</button>
                        </Link>
                        <button className={style.utilityBtn} id="logout" onClick={btnLogout}>LOGOUT</button>
                    
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
};

export default Lobby;
