import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Canvas from './Canvas';
import VideoWindow from './VideoWindow';
import connectSocket, {socket} from '../script/socket';
import Chat from './Chat';
import style from "../css/Ingame.module.css";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';


const Ingame = ({roomId}) => {
    const [ roomEntered, setRoomEntered ] = useState(false);
    const [ newPlayer, setNewPlayer ] = useState(null);
    
    const [ readyToStart, setReadyToStart ] = useState(false);
    const [ isReady, setReady ] = useState(false);
    const [ isStarted, setStart ] = useState(null);
    const [ turnQue, setTurnQue ] = useState(null);
    const [ showWord, setShowWord ] = useState(false);
    let word;

    let friendlist;

    const myId = useSelector(state => state.user.id);
    const myImg = useSelector(state => state.user.profile_img);
    
    useEffect(()=>{
    //socket event name 변경 필요
        console.log(roomId);
        console.log(`${myId}, ${socket.id}, ${roomId}, Number(${roomId})`);
        socket.emit("enterRoom", {userId: myId, userImg: myImg, socketId: socket.id, isReady: isReady}, Number(roomId), ()=>{
            setRoomEntered(true);
        });

        /*** for game : hyeRexx ***/

        // 새로운 유저 입장 알림 => 기존에 welcome에서 방 입장 알려주는거랑 유사
        socket.on("notifyNew", (data) => {
            // data : userId : 입장 유저의 userId
            console.log("debug : notifyNew :", data);
            setNewPlayer({userId: data.userId, userImg: data.userImg, isReady: data.isReady});
            setTimeout(()=>{
                socket.emit("notifyOld", {userId: myId, userImg: myImg, isReady: isReady}, data.socketId);
            }, 500);
        });

        socket.on("notifyOld", (data) => {
            setNewPlayer(data);
        });

        // start 가능 알림 : for host 
        socket.on("readyToStart", (data) => {
            // data : readyToStart : true
            console.log("debug : reayToStart :", data);
            setReadyToStart(true);
        });

        socket.on("waitStart", () => {
            // start버튼이 눌린 후부터 영상 연결, 턴 결정 등 게임시작에 필요한 준비가 완료되기 전까지 준비화면 띄울 수 있도록 신호받음
            setStart(false);
        });

        // game 시작 알림, 첫 번째 턴을 제공받음
        socket.on("gameStarted", (data) => {
            // data : {turnInfo : turn info Array, word : {category, word} Object}
            console.log("debug : gameStarted :", data);
            setStart(true);
            setTurnQue(data.turnInfo);
            setTimeout(()=>{
                setTurnQue(null);
                word = data.word;
                setShowWord(true);
                setTimeout(()=>{
                    setShowWord(false);
                }, 2000);
            }, 3000);
        })

        // turn 교체 요청에 대한 응답
        // turn 교체 요청 "openTurn" 콜백으로 넣어도 될듯?
        socket.on("singleTurnInfo", (data) => {
            // data : userId : 진행할 플레이어 userId
            //        isMafia : 진행할 플레이여 mafia binary
            console.log("debug : singleTurnInfo :", data);
        });

        // 한 사이클이 끝났음에 대한 알림
        // data 없음! : turn info도 전달하지 않음
        socket.on("cycleClosed", () => {
            console.log("debug : cycleClosed!")
        });

        // nightEvent 요청에 대한 진행 보고
        socket.on("nightResult", (data) => {
            // data : win : mafia or citizen or null
            //        elected : killed of null
            //        voteData : voteData object orray
            console.log("debug : nightResult :", data);
        });

        // 방을 나간 사람에 대한 알림
        // 본인 포함 모두에게 전송, 이벤트 로직 분기 필요
        // 게임중, 대기상태 모두 같은 이벤트
        socket.on("someoneExit", (data) => {
            // data : userId : exit user Id
            console.log("debug : someoneExit :", data);
        });

        /*** for game : hyeRexx : end ***/
    },[]);

    useEffect(()=>{
        return () => {
            // 방을 나가는 event를 보내줘야함

            // 기존에 등록된 event listner 삭제
            socket.off("notifyNew");
            socket.off("notifyReady");
            socket.off("readyToStart");
            socket.off("gameStarted");
            socket.off("singleTurnInfo");
            socket.off("cycleClosed");
            socket.off("nightResult");
            socket.off("someoneExit");``
        };
    },[]);

    const readyBtn = () => {
        setReady(!isReady);
        socket.emit("singleReady", {gameId: roomId, userId: myId});
    }

    const startBtn = () => {
        socket.emit("startupRequest", {gameId: roomId, userId: myId}, () => {
            // start 신호 수신시의 작업
        });
    }

    const openTurnBtn = () => {
        socket.emit("openTurn", {gameId: roomId, userId: myId});
    }

    const nightBtn = () => {
        // submit myId는 임시값!
        socket.emit("nightEvent", {gameId: roomId, userId: myId, gamedata: {submit: myId}});
    }

    const newCycleBtn = () => {
        socket.emit("newCycleRequest", {gameId: roomId, userId: myId});
    }

    return (

    <>
    {
        // 서버쪽에서 접속확인하고 처리
        roomEntered ?
        function () {
            return (
                <div className={style.flexBox}>
                    <p>룸넘버 {roomId}</p>
                    <div className={style.item1}>
                        <VideoWindow newPlayer={newPlayer} isReady={isReady}/>
                    </div>
                    <div className={style.item2}>
                        <div>
                        <Navbar bg="light" expand="lg">
                            <Container fluid>
                                <Navbar.Toggle aria-controls="navbarScroll" />
                                <Navbar.Collapse id="navbarScroll">
                                <Nav
                                    className="me-auto my-2 my-lg-0"
                                    style={{ maxHeight: '100px' }}
                                    navbarScroll>
                                    <Nav.Link href="#action1">INVITATION</Nav.Link>
                                    <Nav.Link href="#action2">REPORT</Nav.Link>
                                    <Nav.Link href="#action3">SETTING</Nav.Link>
                                </Nav>
                                <div className="d-flex">
                                    <Nav.Link>WORD(제시어)</Nav.Link>
                                    <Nav.Link>TIMER(타이머)</Nav.Link>
                                </div>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                        </div>
                        <div className={style.canvaschat}>
                            <div className={style.canvas}>
                                <Canvas roomId={roomId}/>
                            </div>
                        </div>

                        {/* for gamelogic test */}
                        <div className="btnbox" style={{position: 'absolute', top: '34%', left: '32%'}}>
                            <button className={isReady? null: null} style={{fontSize: 40, margin: 30}} onClick={readyBtn}> READY </button>
                            <button className={readyToStart? null: null} style={{fontSize: 40, margin: 30}} onClick={startBtn}> START </button>
                            <button style={{fontSize: 40, margin: 30}} onClick={openTurnBtn}> OPEN TURN </button>
                            <button style={{fontSize: 40, margin: 30}} onClick={nightBtn}> NIGHT </button>
                            <button style={{fontSize: 40, margin: 30}} onClick={newCycleBtn}> NEW CYCLE </button>
                        </div>
                        {/* for gamelogic test */}

                        {/* 게임 start 후 실제 게임시작(턴시작)되기 전까지 로딩 화면 띄우기용 */}
                        {isStarted===null? null: isStarted? null: <div>로딩중입니다</div>}
                        
                        {/* 게임 시작시 turn 보여주는 용도 */}
                        <div>
                            {turnQue===null? null: turnQue.map((userid)=>{
                                return (
                                    <h4>{userid}</h4>
                                );
                            })}
                        </div>

                        {/* 게임 시작시 word 또는 역할 보여주는 용도 */}
                        {!showWord? null: ((word.word==="?")? <h3>당신은 마피아입니다</h3>: <h3>당신은 시민입니다 : 제시어 {word.word}</h3>)}

                        <div className={style.chat}>
                            <Chat roomId={roomId} newPlayer={newPlayer}/>
                        </div>
                    </div>
                </div>
            );
        }()
        : null
    }
    </>
    );
}

export default Ingame;