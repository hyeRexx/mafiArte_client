import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import { FriendInfoSet, FriendInfoChange, FriendInfoReset } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import connectSocket, {socket} from '../script/socket';
import style from '../css/Lobby.module.css';
import { InvitationCard } from '../subitems/InvitationCard';
import { InviteCard } from '../subitems/InviteCard';
import MyFriend, {FriendAddModal} from '../subitems/MyFriend';
import GameRoom from '../subitems/GameRoom';

const Lobby = () => {
    const myId = useSelector(state => state.user.id);
    const profile_img = useSelector(state => state.user.profile_img);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let [choose, choosestate] = useState(false);   // 초대할 사람 고르는 모달 생성
    let [invite, invitestate] = useState(false);   // 초대 알람 모달 생성
    let [newRoomId,roomidstate] = useState(0);
    const [ socketConnected, setSocketConnected ] = useState(false);
    let [sender, senderstate] = useState("");
    const [ friendAddModal, showFriendAddModal ] = useState(false);

    // START 버튼 - 랜덤 매칭 
    const btnStart = () => {
        /*** gamemode hyeRexx ***/
        socket && socket.emit("joinGame", {gameId : 0, userId : myId}, (thisGameId) => {
            // console.log("__debug : get this game id? :", thisGameId);
            if (!thisGameId) {
                window.location.reload();
            }
            navigate(`/ingame/${thisGameId}`, {state: {fromLobby: true}});
        });
    };

    // MAKE A GAME 버튼 - HOST가 되어 게임방 생성
    const btnMake = () => {
        // 초대할 사람 고르기
        choosestate(true);
        showFriendAddModal(false);
        // 초대자 state 변경
        senderstate(myId);
    };

    // MAKE A GAME 버튼 - Close 클릭 시 상태 변경
    const btnClose = () => {
        choosestate(false); 
    };

    // INVITATION 버튼 - Close 클릭 시 상태 변경
    const btnInviteClose = () => {
        invitestate(false); 
    };

    const btnLogout = ()=>{
        axios.post(`${paddr}api/auth/logout`, null, reqHeaders).finally(()=>{
            socket.emit('loginoutAlert', myId, 0);
            dispatch(FriendInfoReset());
            socket.close();
            navigate('/');
        });
    };

    useEffect(() => {
        // 뒤로가기 방지
        const preventBack = () => history.pushState(null, "", location.href);
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", preventBack);

        // 소켓 연결 및 초기화
        if (!socket || !socket['connected']) {
            connectSocket().then(() => {
                setSocketConnected(true);

                socket.on("friendList", (userid, status) => {
                    if (userid === myId) {
                        (status === 0) && (()=>{
                            socket.close();
                            navigate('/');
                        })();
                    } else {
                        dispatch(FriendInfoChange([userid, status]));
                    }
                });

                socket.emit("userinfo", myId);
                socket.emit('loginoutAlert', myId, 1);

                socket.on("getinvite", (roomId, myId)=> {
                        // console.log('초대장을 받았습니다!');
                        
                        roomidstate(roomId);
                        senderstate(myId);
    
                        // 모달창 띄워주기
                        invitestate(true);
                });
            });
        } else {
            setSocketConnected(true);
            socket.on("friendList", (userid, status) => {
                if (userid === myId) {
                    (status === 0) && (()=>{
                        socket.close();
                        navigate('/');
                    })();
                } else {
                    dispatch(FriendInfoChange([userid, status]));
                }
            });

            socket.on("getinvite", (roomId, myId)=> {
                roomidstate(roomId);
                senderstate(myId);

                // 모달창 띄워주기
                invitestate(true);
            });
        }


        axios.post(`${paddr}api/lobby/friendinfo`, {userid: myId}, reqHeaders)
        .then((res) => {
            let friendList = res.data;
            // console.log("서버에서 받은 친구 목록:   ", friendList);
            dispatch(FriendInfoSet(friendList));
        })
        .catch((e) => {
            console.log(e);
        });

        return () => {
            window.removeEventListener("popstate", preventBack);
            socket.off("friendList");
            socket.off("getinvite");
        }
    }, []);

    return (
        <>
        <div id="lobby" style={{position: 'relative'}}>
            <div className={style.mainLobby}>
                <div className={style.lobbyleft}>
                    <div className={style.profileSection}>
                        <img className={style.lobbyLogo} src='/img/smallLogo.png'></img>
                        <div className={style.prifileImg}>
                            <img src={profile_img} className={style.realProfileImg}/>
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

                <div className={style.lobbyMiddle}> 
                    <MyFriend showFriendAddModal={showFriendAddModal} choosestate={choosestate}/>
                </div>

                <div className={style.lobbyRight}>
                    <div className={style.MainLobbyTap}>
                        <span className={style.roomTitle}>room list</span>
                        <button className={style.utilityBtn} id="logout" onClick={btnLogout}>LOGOUT</button>
                    </div>
                    <GameRoom socketConnected={socketConnected}/>
                </div>

            </div>
            {/* <div className={style.MainLobbyTap}>
                <button className={style.utilityBtn} id="logout" onClick={btnLogout}>LOGOUT</button>
            </div> */}

            {/* 친구 초대 모달 */}
            { choose === true ? <InviteCard sender={sender} choose={choose} 
            className={style.inviteModal} btnClose={btnClose} /> : null }
            {/* 초대 받은 모달 */}
            { invite === true ? <InvitationCard myId={myId} sender={sender} roomId={newRoomId} className={style.inviteModal} 
                btnInviteClose={btnInviteClose} /> : null }
            {/* 친구 추가 모달 */}
            { friendAddModal? <FriendAddModal showFriendAddModal={showFriendAddModal}/> : null }
        </div>
        </>
    );
 
}

export default Lobby;
