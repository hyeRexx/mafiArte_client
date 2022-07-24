import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import { setUserId, setProfileImg, FriendInfoSet, FriendInfoChange, FriendInfoReset } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import connectSocket, {socket} from '../script/socket';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import style from '../css/Lobby.module.css';
import { InvitationCard } from '../subitems/InvitationCard';

const Lobby = () => {

    const myId = useSelector(state => state.user.id);
    const profile_img = useSelector(state => state.user.profile_img);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let [choose, choosestate] = useState(false);   // 초대할 사람 고르는 모달 생성
    let [invite, invitestate] = useState(false);   // 초대 알람 모달 생성
    let [newRoomId,roomidstate] = useState(0);
    let [sender, senderstate] = useState("");
    let [friendlist, friendliststate] = useState(""); // 초대 가능한 친구 리스트

    const firstFriends = Object.entries(useSelector((FriendInfo) => FriendInfo.FriendInfo));
    const friends = [];

    // 현재 접속 중인 친구만 friends 리스트에 넣어주기
    for (var i = 0; i < firstFriends.length; i++){
        if (firstFriends[i][1] === 1 && firstFriends[i][0] != myId) {
            friends.push(firstFriends[i][0]);
        }
    }

    console.log('리덕스 친구리스트', friends);

    // START 버튼 - 랜덤 매칭 
    const btnStart = () => {
        // socket && socket.emit("checkEnterableRoom", (roomNumber)=>{navigate(`/ingame/${roomNumber}`);});
        /*** gamemode hyeRexx ***/
        socket && socket.emit("joinGame", {gameId : 0, userId : myId}, (thisGameId) => {
            socket.emit("checkEnterableRoom", roomId);
            navigate(`/ingame/${thisGameId}`);
        });
    }
    
    // // 초대 보낸 사람의 id
    // let [sender, senderstate] = useState('');

    // MAKE A GAME 버튼 - HOST가 되어 게임방 생성
    const btnMake = () => {
        // let listuserid = new Array();
        // listuserid.push("haein");

        // socket.emit("listuserinfo", listuserid);

        // socket.on("listsocketid", (listsocketid) => {
        //     console.log(`초대하고 싶은 사람의 socketid 리스트 ${listsocketid}`);

            let roomId = + new Date();

        //     // 초대장 전송
        //     socket.emit("sendinvite", listsocketid, roomId, myId, (roomId) => {
        //         console.log(`초대장 전송 시 ${roomId}`);

        //         socket.emit("makeGame", {gameId : roomId, userId : myId}, (thisGameId) => {
        //             navigate(`/ingame/${thisGameId}`);
        //         });
        //     });
        // });

        socket.emit("makeGame", {gameId : roomId, userId : myId}, (thisGameId) => {
            navigate(`/ingame/${thisGameId}`);
        });
            
    }

    const btnLogout = ()=>{
    
        axios.post(`${paddr}api/auth/logout`, reqHeaders).finally(()=>{
            socket.emit('loginoutAlert', myId, 0);
            // dispatch(setUserId(""));
            dispatch(FriendInfoReset());
            socket.close();
            sessionStorage.removeItem('userid');
            navigate('/');
        });
    };

    useEffect(() => {
        (!socket || !socket['connected']) && connectSocket().then(() => {
            socket.on("friendList", (userid, status) => {
                console.log("friend수정확인",userid, status)
                dispatch(FriendInfoChange([userid, status]));
            })
        socket.emit("userinfo", myId);
        socket.emit('loginoutAlert', myId, 1);
        console.log('login 변경사항 확인');
        console.log(socket);
        console.log('connectsocket test: ', socket['connected']);

        socket.on("getinvite", (roomId, myId)=> {
                console.log('초대장을 받았습니다!');
                
                roomidstate(roomId);
                senderstate(myId);

                // 모달창 띄워주기
                invitestate(true);

            });

        })

        
        // profile 이미지 정보
        axios.post(`${paddr}api/lobby/profile_img`, {userId: myId}, reqHeaders)
        .then(res => { 
            img = res.data.profile_img;
            dispatch(setProfileImg("/img/" + img));
        })
        .catch(()=>{
            console.log('실패함')
        });

        axios.post('/api/lobby/friendinfo', {userid: myId})
            .then((res) => {
                let FriList = res.data[0]; // user의 전체 친구 목록
                let onlineList = res.data[1]; // 현재 접속중인 user 목록
                console.log('onlinelist', onlineList);
                onlineList = { testid : 1,  jack: 1, haein: 1}; // 임시 접속 user 목록
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
        <div id="lobby" style={{position: 'relative'}}>
            { choose === true ? <ChooseModal sender={sender} friends={friends} choose={choose} 
                className={style.inviteModal} btnClose={btnClose} /> : null }

            { invite === true ? <InviteModal myId={myId} roomId={newRoomId} className={style.inviteModal} 
                btnInviteClose={btnInviteClose} /> : null }
    
            <div className={style.mainLobby}>
                <div className={style.lobbyleft}>
                    <div className={style.profileSection}>
                        <img className={style.lobbyLogo} src='/img/smallLogo.png'></img>
                        <div className={style.prifileImg}>
                            {/* imgURL 갈아야 함 */}
                            <img src={profile_img} className={style.test}/>
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
            </div>

            <InvitationCard/>
        </div>
        </>
    );
 
}

// 친구 초대 모달
function ChooseModal(props){
    const navigate = useNavigate();
    const [show, setShow] = useState(true);
    const handleClose = () => {setShow(false); props.btnClose();};

    // MAKE A GAME 버튼 - 초대 보내는 버튼
    const btnSend = () => {
        var friendLength = document.getElementsByName("friends").length;

        // 초대 userid 리스트
        let listuserid = new Array();

        for (var i=0; i<friendLength; i++){
            if (document.getElementsByName("friends")[i].checked == true){
                listuserid.push(document.getElementsByName("friends")[i].value);
            }
        }
        
        console.log(`체크박스로 선택된 친구 리스트 ${listuserid}`);

        // 초대 인원 제한 (추후 주석 제거 하기)
        if (listuserid.length == 0) {
            alert("최소 1명 이상의 친구를 초대해주세요!");
        }
        // if (listuserid.length <= 2) {
        //     alert("최소 3명 이상의 친구를 초대해주세요!");
        //     return;
        // } else if (listuserid.length > 7) {
        //     alert("최대 7명 이하의 친구를 초대해주세요!");
        //     return;
        // } 

        socket.emit("listuserinfo", listuserid);

        socket.on("listsocketid", (listsocketid) => {
            console.log(`초대하고 싶은 사람의 socketid 리스트 ${listsocketid}`);

            let roomId = + new Date();

            // 게임 생성
            socket.emit("makeGame", {gameId : roomId, userId : props.sender}, ()=> {
                console.log("게임 생성 완료");
            });

            // 초대장 전송
            socket.emit("sendinvite", listsocketid, roomId, props.sender,(roomId)=> {
                console.log(`초대장 전송 시 ${roomId}`);

                // HOST가 방으로 이동
                navigate(`/ingame/${roomId}`);
            });
            
        });
    }

    useEffect(()=> {
        return ()=> {
            socket.off("listsocketid");
        };
    }, []);

    return(
    <>
        <Modal className={style.modal} style={{ top: "650px" }} show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>SEND INVITATION</Modal.Title>
            </Modal.Header>
            <Modal.Body className={style.modalBody}>
                {
                    props.friends.length > 0 ? 
                    
                    props.friends.map((friendId) => (
                        <>
                        <ul style={{paddingLeft:'0px'}}>
                            <input type='checkbox' name="friends" value={friendId} key={friendId}/> {friendId}
                        </ul>
                        </>))
                    : <p>현재 접속 중인 친구가 없습니다</p>
                }
            </Modal.Body>

            <Modal.Footer className={style.modalFooter}>
                <Button variant="secondary" onClick={handleClose}>CANCEL</Button>
                {
                    props.friends.length > 0 ? <Button variant="primary" onClick={btnSend}>INVITE</Button> : null
                }
            </Modal.Footer>
        </Modal>
    </>
    )
};

// 초대 왔다는 alert 모달
function InviteModal(props){
    const navigate = useNavigate();
    const [show, setShow] = useState(true);
    const handleClose = () => {setShow(false); props.btnInviteClose();};

    const inviteMove = () => {

        // 게임 조인
        socket.emit("joinGame", {gameId : props.roomId, userId : props.myId}, (thisGameId) => {
            console.log("__debug : get this game id? :", thisGameId);
        });

        navigate(`/ingame/${props.roomId}`)
    }

    return(
    <>
        <Modal className={style.modal} style={{ top: "650px" }}  show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>INVITATION</Modal.Title>
            </Modal.Header>

            <Modal.Body className={style.modalBody}>
                <p>{props.sender}님이 당신을 초대했습니다!</p>
                <p>게임에 참가하시겠습니까?</p>
            </Modal.Body>

            <Modal.Footer className={style.modalFooter}>
                <Button variant="secondary" onClick={handleClose}>CANCEL</Button>
                <Button variant="primary" onClick={inviteMove}>ACCEPT</Button>
            </Modal.Footer>
        </Modal>
    </>
    )
};

export default Lobby;
