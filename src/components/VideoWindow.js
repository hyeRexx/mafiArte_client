import React from 'react';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import Table from 'react-bootstrap/Table';
import { useState } from 'react';
import { useEffect } from 'react';
import {socket} from '../script/socket';
import Video from './Video';
import { useSelector } from 'react-redux';

let myStream;
const peerConnections = {};

const VideoWindow = ({newPlayer, isReady}) => {
    const myId = useSelector(state => state.user.id);
    const myImg = useSelector(state => state.user.profile_img);

    const [videos , setVideos] = useState([
        {userid: null, stream: null, image: null, isReady: false},
        {userid: myId, stream: null, image: myImg, isReady: false},
        {userid: null, stream: null, image: null, isReady: false},
        {userid: null, stream: null, image: null, isReady: false},
        {userid: null, stream: null, image: null, isReady: false},
        {userid: null, stream: null, image: null, isReady: false},
        {userid: null, stream: null, image: null, isReady: false},
        {userid: null, stream: null, image: null, isReady: false}
    ]);

    const setVideo = (index, userid, stream, image, isReady) => {
        let copyVideos = [...videos];
        copyVideos[index].userid = userid===false? copyVideos[index].userid: userid;
        copyVideos[index].stream = stream===false? copyVideos[index].stream: stream;
        copyVideos[index].image = image===false? copyVideos[index].image: image;
        copyVideos[index].isReady = isReady===null? copyVideos[index].isReady: isReady;
        setVideos(copyVideos);
    }
    const changeVideo = (vIdx1, vIdx2) => {
        let copyVideos = [...videos];
        let userid1 = copyVideos[vIdx1].userid;
        let userid2 = copyVideos[vIdx2].userid;
        let tempVideoIdx1 = copyVideos[vIdx1];
        copyVideos[vIdx1] = copyVideos[vIdx2];
        peerConnections[userid2].vIdx = vIdx1;
        copyVideos[vIdx2] = tempVideoIdx1;
        peerConnections[userid1].vIdx = vIdx2;
        setVideos(copyVideos);
    }

    async function getCameras() {
        const cameras = []
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const currentCamera = myStream.getVideoTracks()[0];
            cameras.push(currentCamera.deviceId) // 현재 카메라를 맨 첫번째에 배치
            videoDevices.forEach(camera => {
                if(currentCamera.deviceId !== camera.deviceId) cameras.push(camera.deviceId); // 현재 카메라 빼고 나머지 뒤로 추가
            });
        }
        catch(e) {
            console.log(e);
        }
        return cameras;
    }

    async function getMedia(deviceId){
        try {
            myStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: deviceId ? { deviceId } : true
            });
            setVideo(1, false, myStream, false, isReady);
            // if(!deviceId) { // 여기서 하는게 아니라, 세팅 버튼 클릭했을 때 띄워줘야 할 듯. 
            //     getCameras();
            // }
            // setMute(true);
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
        setVideo(vIdx, false, data.stream, false, null);
        // console.log(videos);
    }

    async function makeConnection(othersId, othersSocket, _offer) {
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

    useEffect(()=>{
        if (newPlayer != null) {
            let i = 0;
            for (;i<8 && videos[i].userid;i++) {}
            peerConnections[newPlayer.userId] = {vIdx: i, connection: null};
            setVideo(i, newPlayer.userId, null, newPlayer.userImg, newPlayer.isReady);
        }
    }, [newPlayer]);

    useEffect(()=>{
        const myIdx = peerConnections[myId]?.vIdx? peerConnections[myId].vIdx: 1;
        setVideo(myIdx, false, false, false, isReady);
    }, [isReady]);

    useEffect( ()=> {
        const initialize = async () => {
            peerConnections[myId] = {vIdx: 1};
            await initCall();
            // console.log(`socket id is ${socket.id}`);

            // 개별 유저의 ready 알림
            socket.on("notifyReady", (data) => {
                // data : userId : 입장 유저의 userId
                //        isReady : userId의 Ready info (binary)
                console.log("debug : notifyReady :", data);
                const usersIdx = peerConnections[data.userId].vIdx;
                setVideo(usersIdx, false, false, false, data.isReady);
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

            socket.on("roomExit", (exiterId) => {
                // const h3 = room.querySelector("h3");
                // h3.innerText = `Room ${roomName} (${newCount})`;
                // addMessage(`${left} just left T.T`);
                console.log(`${exiterId} is disconnected`);
                const vIdx = peerConnections[exiterId].vIdx;
                setVideo(vIdx, null, null, null, false);
                peerConnections[exiterId].connection.close();
                delete peerConnections[exiterId];
                console.log(peerConnections);
            });
        }
        
        try {
            initialize();
        } catch(e) {
            console.log(JSON.stringify(e));
        }
    }, []);

    useEffect(()=>{
        return ()=> {
            Object.keys(peerConnections).forEach((userId) => {
                if (userId != myId) {
                    peerConnections[userId].connection?.close();
                    delete peerConnections[userId];
                }
            })
            myStream.getTracks().forEach((track) => {
                track.stop();
            });
            socket.emit('exit');
            socket.off("welcome");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice");
            socket.off("roomExit");
        };
    }, []);

    return (
        <>
            <Table bordered hover variant="dark" style={{width: "500px", height: "1000px"}}>
                <tbody>
                    <tr>
                        <th colSpan={3}>
                            {videos[0].userid? videos[0].userid: "DRAWING"}
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}>
                            {/* Jack - Ready 된 상태에 따라 화면 위에 READY 띄워줌 */}
                            {videos[0].isReady? <h3>READY!</h3>: null} 
                            {videos[0].stream? 
                                <Video stream={videos[0].stream} width={"100%"} height={"297px"}/>  
                                :<img style={{opacity:videos[0].userid? "100%": "0%"}} height="100%" src={videos[0].image}/>}
                        </th>
                    </tr>
                    <tr>
                    <th colSpan={3}>
                            {videos[1].userid === myId? "ME": "OBSERVING"}
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}> 
                            {videos[1].isReady? <h3>READY!</h3>: null}
                            {videos[1].stream?   
                                <Video stream={videos[1].stream} width={"100%"} height={"297px"} />
                                :<img style={{opacity:videos[1].userid? "100%": "0%"}} height="100%" src={videos[1].image}/>}
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>OTHERS</th>
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[2].stream? changeVideo(2, 1): null)}>
                            {videos[2].isReady? <h3>READY!</h3>: null}
                            {videos[2].stream? 
                                <Video stream={videos[2].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[2].userid? "100%": "0%"}} height="100%" src={videos[2].image}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[3].stream? changeVideo(3, 1): null)}>
                            {videos[3].isReady? <h3>READY!</h3>: null}
                            {videos[3].stream? 
                                <Video stream={videos[3].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[3].userid? "100%": "0%"}} height="100%" src={videos[3].image}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[4].stream? changeVideo(4, 1): null)}>
                            {videos[4].isReady? <h3>READY!</h3>: null}
                            {videos[4].stream? 
                                <Video stream={videos[4].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[4].userid? "100%": "0%"}} height="100%" src={videos[4].image}/>}
                        </td> 
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[5].stream? changeVideo(5, 1): null)}>
                            {videos[5].isReady? <h3>READY!</h3>: null}
                            {videos[5].stream? 
                                <Video stream={videos[5].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[5].userid? "100%": "0%"}} height="100%" src={videos[5].image}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[6].stream? changeVideo(6, 1): null)}>
                            {videos[6].isReady? <h3>READY!</h3>: null}
                            {videos[6].stream? 
                                <Video stream={videos[6].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[6].userid? "100%": "0%"}} height="100%" src={videos[6].image}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[7].stream? changeVideo(7, 1): null)}>
                            {videos[7].isReady? <h3>READY!</h3>: null}
                            {videos[7].stream? 
                                <Video stream={videos[7].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[7].userid? "100%": "0%"}} height="100%" src={videos[7].image}/>}
                        </td> 
                    </tr>
                </tbody>
            </Table>
        </>
    );
}

export default VideoWindow;