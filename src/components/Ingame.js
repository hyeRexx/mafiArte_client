import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Canvas from './Canvas';
import VideoWindow from './VideoWindow';
import {socket} from '../script/socket';
import Chat from './Chat';
import style from "../css/Ingame.module.css";
import { turnStatusChange, surviveStatusChange, FriendInfoChange } from '../store';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Video from './Video';
import { useNavigate, useLocation } from 'react-router-dom';
import { paddr, reqHeaders } from '../proxyAddr';
import { FriendInfoReset } from '../store';
import IngameLoader from '../subitems/IngameLoader';
import EvilLoader from "../subitems/EvilLoader"
import RoleCardHotSpot from '../subitems/RoleCardHotSpot';
import { RoleCardCitizen, RoleCardMafia } from '../subitems/RoleCard';

let word = null;

const Ingame = ({roomId}) => {
    const [ roomEntered, setRoomEntered ] = useState(false);
    const [ newPlayer, setNewPlayer ] = useState(null);
    const [ exiter, setExiter ] = useState(null);
    const [ isHost, setHost ] = useState(false);
    const [ readyToStart, setReadyToStart ] = useState(false);  // 레디가 다 눌렸나?
    const [ isReady, setReady ] = useState(false);              // 내가 레드 눌렀나?
    const [ isStarted, setStart ] = useState(0);             // 로딩 끝나고 게임 시작됐나?
    const [ turnQue, setTurnQue ] = useState(null);             // 턴 저장 state
    const [ showWord, setShowWord ] = useState(false);          // 단어 보여줄지 여부

    let friendlist;
    let [ becomeNight, becomeNightState ] = useState(false); // 밤이 되었습니다
    let [ voteModal, voteModalState ] = useState(false); // 투표 작성 모달
    let [ voteResultModal, voteResultState ] = useState(false); // 투표 결과 모달
    let [ resultModal, resultModalState ] = useState(false); // 최종 결과 모달
    let [ players, setPlayers ] = useState(null);
    let [ result, setResult ] = useState(null); // 최종 결과 
    let [ needVideos, setNeedVideos ] = useState(null); // 투표 시 비디오 필요 신호
    let [ videos2, setVideos ] = useState(null); // 비디오 값을 받아오는 것
    let [ videosList, setVideosList ] = useState(null);
    let [ voteNumber, voteNumberState ] = useState(null); // 투표 결과
    let [ endGame, setEndGame ] = useState(false); // 게임 종료 신호
    let [ deadMan, setDeadMan ] = useState(null);
    let ripList = new Array(); // 무고하게 죽은 사람 리스트

    const myId = useSelector(state => state.user.id);
    const myImg = useSelector(state => state.user.profile_img);
    const gameUserInfo = useSelector(state => state.gameInfo); // 현재 turn인 user id, 살았는지 여부
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const videoList2 = useSelector((state) => state.videoInfo);

    useEffect(()=>{
    //socket event name 변경 필요
        if (location.state?.fromLobby !== true) {
            alert("비정상적인 접근입니다. 메인페이지로 이동합니다.");
            window.location.replace("/");
        }
        console.log(roomId);
        console.log(`${myId}, ${socket.id}, ${roomId}, Number(${roomId})`);
        socket.emit("enterRoom", {userId: myId, userImg: myImg, socketId: socket.id, isReady: isReady}, Number(roomId), (host)=>{
            (myId === host) && setHost(true);
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
            }, 200);
        });

        socket.on("notifyOld", (data) => {
            setNewPlayer(data);
        });

        // start 가능 알림 : for host 
        socket.on("readyToStart", (data) => {
            // data : readyToStart : true
            console.log("debug : reayToStart :", data);
            setReadyToStart(data.readyToStart);
        });

        socket.on("waitStart", () => {
            // start버튼이 눌린 후부터 영상 연결, 턴 결정 등 게임시작에 필요한 준비가 완료되기 전까지 준비화면 띄울 수 있도록 신호받음
            console.log("waitStart event received");
            setEndGame(false);
            setStart(1);
            setReady(false);
            setReadyToStart(false);
        });

        // game 시작 알림, 첫 번째 턴을 제공받음
        socket.on("gameStarted", (data) => {
            // data : {turnInfo : turn info Array, word : {category, word} Object}
            console.log("debug : gameStarted :", data);
            word = data.word;
            setStart(2);
            setTurnQue(data.turnInfo);
            setTimeout(()=>{
                setTurnQue(null);
                setShowWord(true);
                setTimeout(()=>{
                    setShowWord(false);
                }, 7000);
            }, 5000);
        })

        // turn 교체 요청에 대한 응답
        // turn 교체 요청 "openTurn" 콜백으로 넣어도 될듯?
        socket.on("singleTurnInfo", (data) => {
            // data : userId : 진행할 플레이어 userId
            //        isMafia : 진행할 플레이여 mafia binary
            dispatch(turnStatusChange(data.userId));
            console.log("debug : singleTurnInfo :", data);
        });

        const becomingNight = () => {
            console.log('night state true로 변경');
            becomeNightState(true); // 밤이 되었습니다 화면에 출력
        };

        /* 밤이 되었습니다 화면 띄우고 투표 / 정답 입력 띄우기 */
        // 한 사이클이 끝났음에 대한 알림
        // data 없음! : turn info도 전달하지 않음
        socket.on("cycleClosed", () => {
            console.log('밤이 되었습니다');
            // 3.5초동안 밤 상태 지속
            becomingNight();
            const promise = new Promise(function(resolve) {
                setTimeout(() => resolve('완료'), 3500);
            });

            promise.then(()=> {
                becomeNightState(false);
                setNeedVideos(true); // 비디오 필요하다는 신호 전송
            });
        });

        /* nightResult 결과를 받음 */
        // nightEvent 요청에 대한 진행 보고
        socket.on("nightResult", (data) => {
            voteNumberState(data.voteData); // 투표 수치
            
            let end = false;
            if (data.win == "mafia") {
                console.log("마피아 승!");  
                setResult("mafia");
                end = true;
            } else if (data.win == "citizen") {
                console.log("시민 승!");
                setResult("citizen");
                end = true;
            } else if (data.elected) {
                console.log("무고하게 죽은 시민", data.elected);
                setDeadMan(data.elected);
                ripList.push(data.elected);
                setResult("dead");
                if (data.elected === myId){
                    dispatch(surviveStatusChange(0));
                }
            } else {
                console.log("오늘 밤은 아무도 죽지 않았습니다");
                setResult("noOne");
            }
            console.log('죽은 사람? ', ripList); 
            
            voteResultState(true); // 투표 결과 모달
            setTimeout(()=>{
                voteResultState(false);
                resultModalState(true);
                setTimeout(()=>{
                    resultModalState(false);
                    if (end) {
                        console.log("game end : 초기화 되는지 확인...");
                        setEndGame(true); // 게임 종료 신호
                    }
                }, 5000);
            }, 5000);

            console.log("debug : nightResult :", data);
        });

        // 누군가의 exit에 의해 host가 바뀌었는데 자신일 경우 setHost
        socket.on("hostChange", (newHost) => {
            if (newHost === myId) {
                setHost(true);
            }
        });

        // 누군가의 exit에 의해 비정상적으로 게임이 종료된 경우
        socket.on("abnormalClose", (data) => {
            setEndGame(true);
            setResult(data.win);
            resultModalState(true);
            setTimeout(()=>{
                resultModalState(false);
            }, 5000);
        });

        // 방을 나간 사람에 대한 알림
        // 본인 포함 모두에게 전송, 이벤트 로직 분기 필요
        // 게임중, 대기상태 모두 같은 이벤트
        socket.on("someoneExit", (exiterId) => {
            // data : exit user Id
            console.log(`debug : ${exiterId} exit :`);
            setExiter(exiterId);
        });

        /*** for game : hyeRexx : end ***/

        socket.on("friendList", (userid, status) => {
            console.log("friend수정확인",userid, status);
            if (userid === myId) {
                (status === 0) && (()=>{
                    // doUnMount(true);
                    // setTimeout(()=>{
                    dispatch(FriendInfoReset());
                    socket.close();
                    navigate('/');
                    // }, 0);
                })();
            } else {
                dispatch(FriendInfoChange([userid, status]));
            }
        });
    },[]);

    useEffect(()=>{
        return () => {
            // 기존에 등록된 event listner 삭제
            socket.off("notifyNew");
            socket.off("notifyOld");
            socket.off("readyToStart");
            socket.off("waitStart");
            socket.off("gameStarted");
            socket.off("singleTurnInfo");
            socket.off("cycleClosed");
            socket.off("nightResult");
            socket.off("hostChange");
            socket.off("abnormalClose");
            socket.off("someoneExit");
            socket.off("friendList");
        };
    },[]);

    // 투표 시 비디오 리스트 받는 함수
    function getVideos() {
        console.log(`각자 받은 제시어 확인 ${word?.word}`);
        setVideosList(videoList2);
        voteModalState(true); // 투표 모달 true 상태로 변경
        console.log('비디오 리스트',videosList);
        console.log("debug : cycleClosed!");
    };

    useEffect(() => {
        endGame && (() => {
            word = null;
            setStart(0);
            dispatch(turnStatusChange(null));
            // redux에 저장해둔 video stream array 초기화 필요
        })();
    }, [endGame]);

    // Jack - 뒤로가기 버튼 막음. 새로고침/창닫기 시에는 게임 EXIT되도록 / 로그아웃 되도록 처리
    useEffect(()=>{
        // 뒤로가기 방지
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", () => history.pushState(null, "", location.href));

        return () => {
            window.removeEventListener("popstate", () => history.pushState(null, "", location.href));
        }
    }, []);
    
    // 투표 시 비디오 리스트 함수 호출
    useEffect(()=> {
        needVideos && getVideos();
    }, [needVideos]);
    
    const readyBtn = () => {
        setReady(!isReady);
        socket.emit("singleReady", {gameId: roomId, userId: myId});
    };

    const startBtn = () => {
        socket.emit("startupRequest", {gameId: roomId, userId: myId}, () => {
            // start 신호 수신시의 작업
        });
    };

    /* 투표 모달 - SUBMIT 클릭 시 상태 변경 */
    const voteModalClose = () => {
        voteModalState(false); 
    };

    /* Exit Button */
    const btnExit = (e) => {
        e.preventDefault();
        socket.emit('exit', myId, Number(roomId), () => {
            navigate('/lobby');
        });
    };

    return (
        <>
        {
            roomEntered ? 
            function () { 
                return (
                    <div className={ (becomeNight ? style.dark : null)}>

                        <div className={style.outbox}>
                            <div className={style.flexBox}>
                                <div className={style.item1}>
                                    <VideoWindow newPlayer={newPlayer} isReady={isReady} isStarted={isStarted} exiter={exiter} endGame={endGame} needVideos={needVideos}/>
                                </div>

                                <div className={style.item2}>
                                    <div className={style.item2Flex}>
                                        <div className={style.canvas}>
                                            <Canvas roomId={roomId}/>
                                        </div>

                                        <div className={style.chat}>
                                            <Chat roomId={roomId} newPlayer={newPlayer} exiter={exiter} endGame={endGame} />
                                        </div>
                                    </div>       
                                    {
                                        isStarted === 0?
                                            isHost?
                                                /* design : start button */
                                            (
                                                readyToStart?
                                                <button className={style.startBtn} onClick={startBtn}> START! </button>
                                                :
                                                <button className={style.waitBtn}> WAIT </button>
                                            )
                                            :
                                                /* design : ready button */
                                                <button className=
                                                    {isReady ? `${style.holdBtn} ${style.readyBtn}`: style.readyBtn} onClick={readyBtn}> {isReady ? 'READY!' : 'READY?'}
                                                </button>
                                        :
                                        <></>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className={style.topSection}>
                            {/* design : utility buttons */}
                            <div className={style.utility}>
                                <button className={`${style.utilityBtn} ${style.invite}`}>INVITE</button>
                                <button className={`${style.utilityBtn} ${style.exit}`} onClick={btnExit}>EXIT</button>
                            </div>                    
                            {/* design : utility buttons : END */}

                            {/* design : word and Timer */}
                            <div className={style.wordTimer}>
                                <div className={style.wordBox}>
                                    <span className={style.wordBoxLabel}>제시어</span>
                                    <span className={style.wordBoxWord}>{word?.word}</span>
                                </div>
                                <div className={style.timer}>
                                    <span className={style.timerIco}></span>
                                    <span className={style.timerText}><Timer nowplayer = {gameUserInfo[0]} roomId = {roomId} myId = {myId} endGame={endGame}/></span>
                                </div>
                            </div>
                            {/* design : word and Timer : END */}
                        </div>

                        {/* design : Loader for start */}
                        {
                            [null,
                            <EvilLoader />,
                            null][isStarted]
                        }
                        {/* design : Loader for start : END */}
                            
                        {/* design : turn information */}
                        {turnQue?
                        <div className={style.turnBoard}>
                            <div className={style.turnBoardTitle}> TURN </div>
                            {turnQue.map((userId, idx) => {
                                return (
                                    <div className={style.singleTurnInfo}>
                                        <span className={style.turnNum}>{idx}</span>
                                        <span className={style.turnId}>{userId}</span>
                                    </div>
                                );
                            })}
                        </div>
                        :
                        null
                        }
                        {/* design : role card : Mafia */}
                        {!showWord ? null : ((word?.word === '?') ? <RoleCardMafia/> : <RoleCardCitizen word={word?.word}/>)}

                        {/* night event */}
                        { becomeNight ? <p className={style.topright}>밤이 되었습니다</p> : null }

                        {/* vote and write answer */}
                        { voteModal ? <VoteModal players={players} roomId={roomId} myId={myId} voteModalClose={voteModalClose} voteModal={voteModal} videosList={videosList} ripList={ripList}/> : null}

                        {/* vote result */}
                        { voteResultModal ? <VoteResultModal voteNumber={voteNumber} /> : null }

                        {/* total result */}
                        { resultModal ? <ResultModal result={result} deadMan={deadMan}/> : null }

                    </div>
                ); 
            }() 
            : null
        }
        </>
    );
}

function Timer(props){

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (props.nowplayer != null){
            setTimer(15);
        }
    }, [props.nowplayer])

    useEffect(() => {
        if (props.endGame) {
            setTimer(0);
        }
    }, [props.endGame]);

    useEffect (() => {
        if (props.endGame) {
            return null;
        }
        if (props.nowplayer !== null){
            // console.log(props.myId, props.nowplayer);
            // console.log("timer 값 얼마니? ", timer);
            if (timer !== 0) {
                const tick = setInterval(() => {
                    setTimer(value => value -1)
                }, 1000);
                return () => clearInterval(tick)
            } else if (props.myId === props.nowplayer) {
                // console.log('host만 여기 통과해야함^^');
                socket.emit("openTurn", {gameId: props.roomId, userId: props.myId});
            }
        }
        }, [timer]);

    return (
        <>
        {timer}
        </>
    )
}

// 투표 및 제시어 제출 모달
function VoteModal(props){
    let [inputValue, setInputValue] = useState(""); // 마피아의 제시어 제출
    let [submit, setSubmit] = useState(false);
    let [clicked, setClicked] = useState(false);
    const videoList2 = useSelector((state) => state.videoInfo);
    console.log(`들어온 제시어 ${word?.word}`);
    
    const [show, setShow] = useState(true);
    const handleClose = () => {setShow(false); };

    const submitAnswer = (answer) => {
        console.log(`투표 결과 ${answer}`);
        setSubmit(true);
        setClicked(true);
        socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: answer}});

        handleClose();

    }

    const submitWord = () => {
        props.voteModalClose();
        console.log(`마피아 정답 : ${inputValue}`);
        socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: inputValue}});
    }

    const onKeyPress = (e) => {
        if(e.key == 'Enter') {
            submitWord(inputValue);
        }
    }

    return(
        <>
            { word?.word === "?" ? 
                // <p>하이하이</p>
                // 마피아일 경우
                <div className={style.modal}>
                    <VoteTimer voteModal={props.voteModal} voteModalClose={props.voteModalClose} inputValue={inputValue} clicked={clicked} roomId = {props.roomId} myId = {props.myId}/>
                    <input type="text" placeholder="제시어를 맞춰보세요"
                    onChange={(event) => setInputValue(event.target.value)} onKeyPress={onKeyPress}/>
                    <button className={style.sendBtn} onClick={submitWord}>SEND</button>
                </div>
            :   
                ( !submit ? 
                    <>
                    // 시민일 경우
                    <Modal className={style.modal} style={{ top: "650px" }} show={show} onHide={handleClose}>
                        <VoteTimer voteModal={props.voteModal} voteModalClose={props.voteModalClose} inputValue={inputValue} clicked={clicked} roomId = {props.roomId} myId = {props.myId}/>
                        <Modal.Header>
                            <Modal.Title>VOTE</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={style.modalBody}>

                            {
                                videoList2&&videoList2.stream.filter(streamId => !props.ripList.includes(streamId.userId)).map((streamId) => (
                                    <div id={streamId.userId} onClick={() => { submitAnswer(streamId.userId) }}>
                                        <Video stream={streamId.stream} width={"240px"} height={"120px"}/>
                                    </div>))
                            }
                            
                        </Modal.Body>
                        {/* <Modal.Footer className={style.modalFooter}>
                            <Button variant="primary" onClick={submitAnswer}>VOTE</Button>
                        </Modal.Footer> */}
                    </Modal>
                    </>
                    : 
                    <>
                        <h2>다른 사람이 투표하길 기다리고 있습니다..</h2>
                    </>
                )
            };

        </>
    )
};

function VoteTimer(props){

    const [voteTimer, setVoteTimer] = useState(1);

    useEffect(() => {
        if (props.voteModal) {
            setVoteTimer(20);
        }
    }, [props.voteModal])

    useEffect (() => {
            console.log("timer 값 얼마니? ", voteTimer);
            if (voteTimer !== 0) {
                const tick = setInterval(() => {
                    setVoteTimer(value => value -1)
                }, 1000);
                return () => {
                    clearInterval(tick);
                }
            } 

            else if (voteTimer === 0) {
                props.voteModalClose();
                if (props.inputValue === ''){
                    socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: ''}});
                }
                if (!props.clicked){
                    console.log('여기로 안 오나?');
                    socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: ''}});
                }
            }
        }, [voteTimer])

    return (
        <>
            <h2>{voteTimer}</h2>
        </>
    )
}

// 투표 결과 모달
function VoteResultModal(props) {
    const voteNumber = Object.entries(props.voteNumber);
    console.log('투표 결과 모달 뜨나');
    console.log('투표 수', voteNumber);
    return (
        <div>
            <h1>투표 결과</h1>
            {
                voteNumber.map((voteNum) => (
                    <h3>{voteNum[0]} : {voteNum[1]}</h3>
                ))
            }        
        </div>
    )

};

// 최종 결과 모달
function ResultModal(props) {
    const finalResult = props.result;
    const deadMan = props.deadMan;
    const result = {
        mafia: <h2>마피아가 승리했습니다!</h2>,
        citizen: <h2>시민이 승리했습니다!</h2>,
        dead: <h2>무고한 시민 {deadMan}이 죽었습니다...</h2>,
        noOne: <h2>오늘 밤은 아무도 죽지 않았습니다...</h2>
        };
    console.log('최종 결과 모달 뜨나');
    console.log('최종 결과', result[finalResult]);
    return (
        <>
            <div className={style.modal}>
                <h1>최종 결과</h1>
                { result[finalResult] }
            {/* { finalResult === "mafia" ? <h2>마피아가 승리했습니다!</h2>: null }
            { finalResult === "citizen" ? <h2>시민이 승리했습니다!</h2>: null }
            { finalResult === "dead" ? <h2>무고한 시민 {deadMan}이 죽었습니다...</h2>: null }
            { finalResult === "noOne" ? <h2>오늘 밤은 아무도 죽지 않았습니다...</h2>: null } */}
            </div> 
        </>
    )
};

export default Ingame;
