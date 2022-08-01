import React from 'react';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import { useState } from 'react';
import { useEffect } from 'react';
import {socket} from '../script/socket';
import Video from './Video';
import { useSelector, useDispatch } from 'react-redux';
import style from '../css/VideoWindow.module.css'
import { VideoStreamChange, clearVideoWindowExiter, clearVideoWindowNewPlayer, pushOthersReady, renewOthersReady, clearOthersReady, loadComplete, clearVideoStore, setVideosStore, videoChangeStore, attributeChangeStore, attributeMultiChangeStore, setAllVideoStore } from '../store';
import {ReadyOnVideoBig, ReadyOnVideoSmall} from '../subitems/ReadyOnVideo';
import { ASSERT } from '../script/debug';

let myStream;
let peerConnections = {};

const VideoWindow = ({readyAlert, isStarted, endGame, deadMan}) => {
    // const [ othersReady, setOthersReady ] = useState(null);
    const dispatch = useDispatch();
    const myId = useSelector(state => state.user.id);
    const myImg = useSelector(state => state.user.profile_img);
    const gameUserInfo = useSelector(state => state.gameInfo); // 현재 turn인 user id, 살았는지
    const videosStore = useSelector(state => state.videosStore);
    const [nextTurn, setNextTurn] = useState(null);

    // const [videos , setVideos] = useState([                         // refactoring - redux로 전환 필요
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: myId, stream: null, image: myImg, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false},
    //     {userid: null, stream: null, image: null, isReady: false, isDead: false}
    // ]);

    // dispatch(setVideosStore([1, myId, "asis", myImg, "asis"]));

    // console.log("시작하자마자 뜨는거 test\n\n\n\n\n", videosStore);

    const ingameStates = useSelector(state => state.ingameStates);
    const newPlayerBuffer = useSelector(state => state.newPlayerBuffer);
    const othersReadyBuffer = useSelector(state => state.othersReadyBuffer);
    const exiterBuffer = useSelector(state => state.exiterBuffer);
    
    // const setVideo = (index , userid, stream, image, isReady) => {
    //     ASSERT(`(0 <= ${index}) && (${index} < 8)`);
    //     let copyVideos = [...videos];
    //     copyVideos[index].userid = userid==="asis"? copyVideos[index].userid: userid;
    //     copyVideos[index].stream = stream==="asis"? copyVideos[index].stream: stream;
    //     copyVideos[index].image = image==="asis"? copyVideos[index].image: image;
    //     copyVideos[index].isReady = isReady==="asis"? copyVideos[index].isReady: isReady;
    //     setVideos(copyVideos);
    // }

    const setDeadManGray = (userid) => {
        const deadManIdx = peerConnections[userid].vIdx;
        // const copyVideos = [...videos];
        // copyVideos[deadManIdx].isDead = true;
        // setVideos(copyVideos);
        dispatch(attributeChangeStore([deadManIdx, "isDead", true]));
    }

    const changeVideo = (vIdx1, vIdx2) => {
        ASSERT(`(0 <= ${vIdx1}) && (${vIdx1} < 8)`);
        ASSERT(`(0 <= ${vIdx2}) && (${vIdx2} < 8)`);
        if (vIdx1 === vIdx2) {
            return null;
        }
        // const copyVideos = [...videos];
        const userid1 = videosStore[vIdx1].userid;
        const userid2 = videosStore[vIdx2].userid;

        userid1 && (peerConnections[userid1].vIdx = vIdx2);
        userid2 && (peerConnections[userid2].vIdx = vIdx1);

        dispatch(videoChangeStore([vIdx1, vIdx2]));

        // const tempVideoIdx1 = copyVideos[vIdx1];
        // copyVideos[vIdx1] = copyVideos[vIdx2];
        // copyVideos[vIdx2] = tempVideoIdx1;

        // setVideos(copyVideos);
    }

    const clearReady = () => {
        // const copyVideos = [...videos];
        // const videosCleared = copyVideos.map((video)=>{
        //     video.isReady = false;
        //     return video;
        // });
        // setVideos(videosCleared);

        // for (let i = 0; i < 8; i++){
        //     dispatch(attributeChangeStore([i, "isReady", false]));
        // }

        dispatch(attributeMultiChangeStore(["isReady", false]))

        dispatch(clearOthersReady());
    }

    async function getMedia(){
        try {
            myStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    noiseSuppression: true,
                    echoCancellation: true
                }
            });
            // setVideo(1, "asis", myStream, "asis", ingameStates.isReady);
            dispatch(setVideosStore([1, "asis", myStream, "asis", ingameStates.isReady]));
            dispatch(loadComplete());
        } catch (e) {
            alert(e);
            console.log(e);
        }
    }

    async function initCall() {
        await getMedia();
    }

    function handleIce(data, myId, othersSocket) {
        // ice breack가 생기면? 이를 해당 사람들에게 전달한다.
        // console.log("got ice candidate");
        // console.log(`sendersId : ${myId}`);
        socket.emit("ice", data.candidate, myId, othersSocket);
        // console.log("send ice candidate");
    }

    function handleAddStream(data, othersId) {
        // console.log("got an stream from my peer");
        // stream을 받아오면, 비디오를 새로 생성하고 넣어준다.
        // console.log("got others video: ", data.stream);
        const vIdx = peerConnections[othersId].vIdx;
        // setVideo(vIdx, "asis", data.stream, "asis", "asis");
        dispatch(setVideosStore([vIdx, "asis", data.stream, "asis", "asis"]));
        // console.log(videos);
    }

    async function makeConnection(othersId, othersSocket, _offer) {
        // ASSERT(`${othersId} !== null`);
        // ASSERT(`${othersSocket} !== null`);
        const myPeerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                        "stun:stun01.sipphone.com",
                        "stun:stun.ekiga.net",
                        "stun:stun.fwdnet.net",
                        "stun:stun.ideasip.com",
                        "stun:stun.iptel.org",
                        "stun:stun.rixtelecom.se",
                        "stun:stun.schlund.de",
                        "stun:stunserver.org",
                        "stun:stun.softjoys.com",
                        "stun:stun.voiparound.com",
                        "stun:stun.voipbuster.com",
                        "stun:stun.voipstunt.com",
                        "stun:stun.voxgratia.org",
                        "stun:stun.xten.com"
                    ]
                }
            ]
        });

        peerConnections[othersId].connection = myPeerConnection;
    
        myPeerConnection.addEventListener("icecandidate", (data) => handleIce(data, myId, othersSocket));
        myPeerConnection.addEventListener("addstream", (data) => handleAddStream(data, othersId));
        myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
    
        let offer = _offer;
        let answer;
        if(!offer) {
            offer = await myPeerConnection.createOffer();
            myPeerConnection.setLocalDescription(offer);
        }
        else {
            myPeerConnection.setRemoteDescription(offer);
            answer = await myPeerConnection.createAnswer();
            myPeerConnection.setLocalDescription(answer);
        }

        return answer || offer;
    }
    
    useEffect( ()=> {
        const initialize = async () => {
            // console.log("시작하자마자 뜨는거 test\n\n\n\n\n", videosStore);
            dispatch(setVideosStore([1, myId, "asis", myImg, "asis"]));
            peerConnections[myId] = {vIdx: 1};
            await initCall();
            // console.log(`socket id is ${socket.id}`);

            // 개별 유저의 ready 알림
            socket.on("notifyReady", (data) => {
                // data : userId : 입장 유저의 userId
                //        isReady : userId의 Ready info (binary)
                console.log("debug : notifyReady :", data);
                dispatch(pushOthersReady({userId: data.userId, isReady: data.isReady}));

                // if (othersReadyStatus[data.userId]) {
                //     othersReadyStatus[data.userId].isReady = data.isReady;
                //     othersReadyStatus[data.userId].isSet = false;
                // } else {
                //     othersReadyStatus[data.userId] = {isReady: data.isReady, isSet: false}
                // }
                // setOthersReady({...othersReadyStatus});
            });

            socket.on("streamStart", async (userId, userSocket) => {
                // const timer = (timeDelay) => new Promise((resolve) => setTimeout(resolve, timeDelay)); // debugging - 지금은 
                // await timer(300);
                const offer = await makeConnection(userId, userSocket);
                socket.emit("offer", offer, socket.id, userSocket, myId); // 일단 바로 연결. 추후 게임 start시 (or ready버튼 클릭시) offer주고받도록 바꾸면 좋을듯
                // addMessage(`${user} arrived!`);
            });

            socket.on("offer", async (offer, offersSocket, offersId) => {
                // console.log("receive the offer");
                // console.log(offer);
                // 뉴비는 현재 방안에 있던 모든사람의 offer를 받아 새로운 커넥션을 만들고, 답장을 만든다.
                const answer = await makeConnection(offersId, offersSocket, offer);
                // 답장을 현재 있는 받은 커넥션들에게 각각 보내준다.
                socket.emit("answer", answer, offersSocket, myId);
                // console.log("send the answer");
            });

            socket.on("answer", async (answer, answersId) => {
                // console.log("receive the answer", newbieID);
                // 방에 있던 사람들은 뉴비를 위해 생성한 커섹션에 answer를 추가한다.
                peerConnections[answersId].connection.setRemoteDescription(answer);
            });

            socket.on("ice", (ice, othersId) => {
                // console.log("receive candidate");
                /** 다른 사람에게서 받은 ice candidate를 각 커넥션에 넣는다. */
                // console.log(myId, othersId, videos);
                peerConnections[othersId].connection.addIceCandidate(ice);
            });
        }
        
        try {
            initialize();
        } catch(e) {
            console.log(JSON.stringify(e));
        }

        return ()=> {
            Object.keys(peerConnections).forEach((userId) => {
                peerConnections[userId].connection?.close();
                delete peerConnections[userId];
            });
            peerConnections = {};
            myStream?.getTracks()?.forEach((track) => {
                track.stop();
            });
            dispatch(clearOthersReady());
            dispatch(clearVideoStore()); // unmount 시 redux의 video 초기화
            socket.off("notifyReady");
            socket.off("streamStart");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice");
        };
    }, []);

    useEffect(()=>{
        console.log("newPlayer -> peerConnection set : ", JSON.stringify(newPlayerBuffer));
        if (newPlayerBuffer.VideoWindow.length) {
            let copyVideos = [...videosStore];
            newPlayerBuffer.VideoWindow.forEach(newPlayer => {
                let i = 0;
                for ( ; i < 8 && copyVideos[i].userid; i++) {}
                peerConnections[newPlayer.userId] = {vIdx: i, connection: null};
                console.log(`peerConnections[${newPlayer.userId}] = `, peerConnections[newPlayer.userId]);
                // setVideo(i, newPlayer.userId, "asis", newPlayer.userImg, newPlayer.isReady);
                copyVideos[i] = {userid: newPlayer.userId, stream: null, image: newPlayer.userImg, isReady: newPlayer.isReady, isDead: false}
            });
            dispatch(setAllVideoStore(copyVideos));
            dispatch(clearVideoWindowNewPlayer());
        }
    }, [newPlayerBuffer.VideoWindow]);

    useEffect(()=>{
        if (othersReadyBuffer.length) {
            const notSetBuffer = [];
            othersReadyBuffer.forEach(others => {
                if (!peerConnections[others.userId]) {
                    notSetBuffer.push(others);
                } else {
                    console.log("vIdx error관련 peerConnections 확인 : ", peerConnections[others.userId]);
                    const usersIdx = peerConnections[others.userId].vIdx;
                    dispatch(setVideosStore([usersIdx, "asis", "asis", "asis", others.isReady]));
                }
            });
            dispatch(renewOthersReady(notSetBuffer));
        }
    }, [othersReadyBuffer]);

    useEffect(()=>{
        if (exiterBuffer.VideoWindow.length) {
            console.log("exiterBuffer", exiterBuffer);
            exiterBuffer.VideoWindow.forEach(exiterId => {
                const vIdx = peerConnections[exiterId].vIdx;;
                // setVideo(vIdx, null, null, null, false);
                dispatch(setVideosStore([vIdx, null, null, null, false]));
                peerConnections[exiterId].connection?.close();
                delete peerConnections[exiterId];
            });
            dispatch(clearVideoWindowExiter());
        }
    }, [exiterBuffer.VideoWindow]);

    useEffect(()=>{
        const myIdx = peerConnections[myId]?.vIdx? peerConnections[myId].vIdx: 1;
        // setVideo(myIdx, "asis", "asis", "asis", ingameStates.isReady);
        dispatch(setVideosStore([myIdx, "asis", "asis", "asis", ingameStates.isReady]));
    }, [ingameStates.isReady]);

    // console.log('VideoWindow Before useEffect[isStarted]');
    useEffect(()=>{
        // console.log("VideoWindow : useEffect - isStarted? ", isStarted);
        (isStarted === 1) && clearReady();
    }, [isStarted]);

    useEffect(()=>{
        if (deadMan) {
            setDeadManGray(deadMan);
        }
    }, [deadMan]);

    // console.log('VideoWindow Before useEffect[gameUserInfo[0]]');
    useEffect(() => {
        console.log('VideoWindow useEffect - gameUserInfo? ', gameUserInfo);
        let turnIdx = ((endGame === false) && (gameUserInfo[0] !== null))? peerConnections[gameUserInfo[0]].vIdx : -1;
        if (turnIdx !== -1){
            changeVideo(turnIdx, 0);
        }
    }, [gameUserInfo[0]]);

    // console.log('VideoWindow Before useEffect[gameUserInfo[1]]');
    useEffect(() => {
        // console.log('VideoWindow useEffect - gameUserInfo[2]? ', gameUserInfo[2]);
        if ((endGame === false) && (gameUserInfo[0] !== null)){
            myStream.getAudioTracks()?.forEach((track) => (track.enabled = !track.enabled));
        }
    }, [gameUserInfo[2]]);

    useEffect(() => {
        if (!readyAlert){
            setNextTurn(null);
        }
        if ((gameUserInfo[1] !== null)){
            // 기존 예외처리로 [gameUserInfo[1]]?.vIdx 처리 해놓았었으나, 정상적인 경우라면 vIdx가 있어야하므로 ? 제거함. 문제발생시 왜 vIdx가 없는지 디버깅하는 방향이 옳을듯.
            let turnIdx = peerConnections[gameUserInfo[1]]?.vIdx; 
            // console.log("turnIdx: ", turnIdx);
            (readyAlert && turnIdx) ? setNextTurn(turnIdx) : setNextTurn(null); // 갑자기 누군가 나갔을 떄 다음 턴 주자인 경우 문제생김. 임시방편으로 막아둠,,, 추후 문제시 수정필요
            // console.log("nextTurn: ", nextTurn);
        }
    }, [readyAlert, videosStore]);

    // 투표 시 비디오 전송
    // const videoList = useSelector((state) => state.videoInfo);
    // useEffect(()=> {
    //     // stream array
    //     if ( needVideos ) {
    //         let streamArray = new Array();
    //         for (let i = 0; i < 8; i++) {
    //             if (videosStore[i].userid != null) {
    //                 streamArray.push({userId: videosStore[i].userid, stream: videosStore[i].stream});
    //             }
    //         }
    //         console.log('streamArray', streamArray);
    //         dispatch(VideoStreamChange(streamArray));
    //     };
    // }, [needVideos]);

    // console.log('VideoWindow Before useEffect[endGame]');
    useEffect(()=>{
        // console.log("VideoWindow : useEffect - endGame? ", endGame);
        endGame && (()=>{
            // const copyVideos = [...videos];
            // console.log(JSON.stringify(videosStore));
            Object.keys(peerConnections).forEach((userId) => {
                if (userId != myId) {
                    peerConnections[userId].connection?.close();
                    const vIdx = peerConnections[userId].vIdx;
                    // copyVideos[vIdx].stream = null;
                    dispatch(attributeChangeStore([vIdx, "stream", null]));
                    // copyVideos[vIdx].isDead = false;
                    dispatch(attributeChangeStore([vIdx, "isDead", false]));
                } else {
                    const vIdx = peerConnections[userId].vIdx;
                    // copyVideos[vIdx].isDead = false;
                    dispatch(attributeChangeStore([vIdx, "isDead", false]));
                }
            });
            setNextTurn(null);
            // console.log(JSON.stringify(videosStore));
            // setVideos(copyVideos);
            // console.log(videosStore);
            setTimeout(()=>{
                changeVideo(peerConnections[myId].vIdx, 1);
                // console.log(videosStore);
                // console.log(JSON.stringify(videosStore));
            }, 100);
            // console.log(videos);
        })();
    }, [endGame]);

    // 디버깅용 임시. videos 변경 확인
    // useEffect(()=>{
    //     console.log("videos 변경시 mount 후");
    //     console.log(JSON.stringify(peerConnections));
    //     console.log(JSON.stringify(videos));
    //     return () => {
    //         console.log("videos 변경시 cleanup 시");
    //         console.log(JSON.stringify(peerConnections));
    //         console.log(JSON.stringify(videos));
    //     }
    // }, [videos]); 
    
    // {style.videoNow}
    // {nextTurn === 1 ? `${style.gradientborder} ${style.videoObserving}` : style.videoObserving}
    return (
        <>
        <div className={style.videoSection}>
            <div className={style.videoNow}>
                <div className={style.videoLabel}>
                    {(isStarted===2) && gameUserInfo[0] ? "NOW DRAWING - " + videosStore[0].userid : "USER - " + videosStore[0].userid}
                </div>
                <div className={style.videoBig}>
                    {/* READY 표시 확인 필요! */}
                    {videosStore[0].isReady? <ReadyOnVideoBig/>: null}  
                    {videosStore[0].stream? 
                    <Video stream={videosStore[0].stream} muted={videosStore[0].userid === myId? true: false} width={"540px"} height={"290px"}/>
                    :<img style={{opacity:videosStore[0].userid? "100%": "0%"}} height="100%" src={videosStore[0].image}/>}
                </div>
            </div>
            <div className= {style.videoObserving}>
                <div className={style.videoLabel}>
                    {videosStore[1].userid === myId? "ME": "OBSERVING - " + videosStore[1].userid}  
                </div>
                <div className={style.videoBig}>
                    {/* READY 표시 확인 필요! */}
                    {videosStore[1].isReady? <ReadyOnVideoBig/>: null} 
                    {videosStore[1].stream?   
                    <Video stream={videosStore[1].stream} muted={videosStore[1].userid === myId? true: false} width={"540px"} height={"290px"} isTurn={nextTurn === 1} isDead={videosStore[1].isDead}/>
                    :<img style={{opacity:videosStore[1].userid? "100%": "0%"}} height="100%" src={videosStore[1].image}/>}
                </div>
            </div>
            
            <div style={{paddingTop: 19, margin: '0 12px', borderBottom: '2px solid #676767'}}></div>
    
            <div className={style.videoOthers}>
                <div className={style.videoMiniRow}>
                    <div className={style.videoMini} onClick={() => (videosStore[2].stream? changeVideo(2, 1): null)}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[2].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[2].stream? 
                        <Video stream={videosStore[2].stream} muted={videosStore[2].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 2} isDead={videosStore[2].isDead}/>
                        :<img style={{opacity:videosStore[2].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[2].image}/>}
                    </div>
                    <div className={style.videoMini} onClick={() => (videosStore[3].stream? changeVideo(3, 1): null)}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[3].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[3].stream? 
                        <Video stream={videosStore[3].stream} muted={videosStore[3].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 3} isDead={videosStore[3].isDead}/> 
                        :<img style={{opacity:videosStore[3].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[3].image}/>}
                    </div>
                    <div className={style.videoMini} onClick={() => (videosStore[4].stream? changeVideo(4, 1): null)}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[4].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[4].stream? 
                        <Video stream={videosStore[4].stream} muted={videosStore[4].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 4} isDead={videosStore[4].isDead}/> 
                        :<img style={{opacity:videosStore[4].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[4].image}/>}
                    </div>
                </div>
                <div className={style.videoMiniRow} onClick={() => (videosStore[5].stream? changeVideo(5, 1): null)}>
                    <div className={style.videoMini}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[5].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[5].stream? 
                        <Video stream={videosStore[5].stream} muted={videosStore[5].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 5} isDead={videosStore[5].isDead}/>
                        :<img style={{opacity:videosStore[5].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[5].image}/>}
                    </div>
                    <div className={style.videoMini} onClick={() => (videosStore[6].stream? changeVideo(6, 1): null)}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[6].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[6].stream? 
                        <Video stream={videosStore[6].stream} muted={videosStore[6].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 6} isDead={videosStore[6].isDead}/> 
                        :<img style={{opacity:videosStore[6].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[6].image}/>}
                    </div>
                    <div className={style.videoMini} onClick={() => (videosStore[7].stream? changeVideo(7, 1): null)}>
                        {/* READY 표시 확인 필요! */}
                        {videosStore[7].isReady? <ReadyOnVideoSmall/>: null} 
                        {videosStore[7].stream? 
                        <Video stream={videosStore[7].stream} muted={videosStore[7].userid === myId? true: false} width={"100%"} height={"120px"} isTurn={nextTurn === 7} isDead={videosStore[7].isDead}/> 
                        :<img style={{opacity:videosStore[7].userid? "100%": "0%", position: 'absolute'}} height="100%" src={videosStore[7].image}/>}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default VideoWindow;
