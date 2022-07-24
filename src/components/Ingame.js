import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { turnStatusChange, surviveStatusChange } from '../store';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

let word;

const Ingame = ({roomId}) => {
    const [ roomEntered, setRoomEntered ] = useState(false);
    const [ newPlayer, setNewPlayer ] = useState(null);
    
    const [ readyToStart, setReadyToStart ] = useState(false);
    const [ isReady, setReady ] = useState(false);
    const [ isStarted, setStart ] = useState(null);
    const [ turnQue, setTurnQue ] = useState(null);
    const [ showWord, setShowWord ] = useState(false);
    let stream;
    let friendlist;
    let [ becomeNight, becomeNightState ] = useState(false); // 밤이 되었습니다
    let [ voteModal, voteModalState ] = useState(false); // 투표 작성 모달
    let [ answerModal, answerModalState ] = useState(false); // 마피아 정답 작성 모달
    let [ voteResultModal, voteResultState ] = useState(false); // 투표 결과 모달
    let [ resultModal, resultModalState ] = useState(false); // 최종 결과 모달
    let [ players, setPlayers ] = useState(null);
    let [ result, setResult ] = useState(null); // 한 턴 끝났을 때마다 결과 저장
    let [ needVideos, setNeedVideos ] = useState(null); // 투표 시 비디오 필요 신호
    let [ videos2, setVideos ] = useState(null); // 비디오 값을 받아오는 것

    const myId = useSelector(state => state.user.id);
    const myImg = useSelector(state => state.user.profile_img);
    const gameUserInfo = useSelector(state => state.gameInfo); // 현재 turn인 user id, 살았는지 여부
    const dispatch = useDispatch();

    // const videoList = useSelector((VideoInfo) => VideoInfo.VideoInfo);
    // const videoList = useSelector((state) => state.videoInfo.videoList);
    const videoList2 = useSelector((state) => state.videoInfo);

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
            setPlayers(data.turnInfo);
            // console.log("턴 큐 확인 1 : ", turnQue);
            // console.log("턴 큐 확인 2 : ", data.turnInfo);
            // console.log("게임 진행 중인 플레이어들 리스트 : ", players);
            setTimeout(()=>{
                setTurnQue(null);
                word = data.word;
                console.log("제시어 확인 :", word);
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
            dispatch(turnStatusChange(data.userId));

            console.log("debug : singleTurnInfo :", data);
        });

        const becomingNight = () => {
            console.log('night state true로 변경');
            becomeNightState(true); // 밤이 되었습니다 화면에 출력
        };

        // 비디오 받아오는 함수
        const getVideos = () => {
            setVideos();
        };

        /* 밤이 되었습니다 화면 띄우고 투표 / 정답 입력 띄우기 */
        // 한 사이클이 끝났음에 대한 알림
        // data 없음! : turn info도 전달하지 않음
        socket.on("cycleClosed", () => {
            console.log('밤이 되었습니다');
            // 3.5초동안 밤 상태 지속
            becomingNight();

            // const promise = new Promise(function(resolve) {
            //     setTimeout(() => resolve('완료'), 3500);
            // });

            // promise.then(()=> {
                becomeNightState(false);
                setNeedVideos(true); // 비디오 필요하다는 신호 전송
                // console.log("비디오 는 어디로 갔는가", videos2);
                // console.log("스트림", stream);
                // console.log("비디오 리스트", videoList);
                const videoPromise = new Promise(function(resolve) {
                    setTimeout(() => resolve('완료'), 8000);
                });
                
                // videoPromise.then(()=> {
                    // console.log("비디오 리스트", videoList2);
                    // console.log(`각자 받은 제시어 확인 ${word.word}`);
                    // if (word.word != "?") {
                    //     console.log(`시민 제시어 확인 ${word.word}`);
                    //     voteModalState(true); // 시민 : 투표
                    // } else {
                    //     console.log(`마피아 제시어 확인 ${word.word}`);
                    //     answerModalState(true); // 마피아 : 제시어 작성
                    // }
                    // console.log("스트림", stream);
                    // console.log(`비디오 확인`, videos2);
                    // console.log("비디오 리스트2", videoList2);
                    // console.log("debug : cycleClosed!");
                // });
            // });
        
        });

        /* nightResult 결과를 받음 */
        // nightEvent 요청에 대한 진행 보고
        socket.on("nightResult", (data) => {
            // data : win : mafia or citizen or null
            //        elected : killed of null : 죽은 시민의 id
            //        voteData : voteData object orray
            // data.voteData.userId : data.voteData.vote

            voteResultState(true); // 투표 결과 모달
            console.log(`비디오 확인`, videos2);
            console.log("비디오 리스트2", videoList2);
            if (data.win == "mafia") {
                console.log("마피아 승!");  
                setResult("mafia");
            } else if (data.win == "citizen") {
                console.log("시민 승!");
                setResult("citizen");
            } else if (data.elected) {
                console.log("무고하게 죽은 시민", data.elected);
                setResult(data.elected);
                if (data.elected === myId){
                    dispatch(surviveStatusChange(0));
                }

            } else {
                console.log("오늘 밤은 아무도 죽지 않았습니다");
                setResult("noOne");
            }

            resultModalState(true); // 최종 결과 모달

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

    function getVideos() {
        console.log('비디오 리스트는 어디에..', videoList2);
    };

    useEffect(()=> {
        needVideos && getVideos();
    }, [needVideos]);

    /* 투표 결과 모달 3.5초간 지속 */
    useEffect(()=> {
        if (voteResultModal) {
            const showingTimer = setTimeout(()=> {
                voteResultState(false); 
            }, 3500);
            return () => clearTimeout(showingTimer);
        }
    }, [voteResultModal]);
    
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

    /* 투표 완료 (nightWork)
       night work 마친 유저들이 클릭하는 버튼 이벤트
       투표 혹은 제시어 제출 완료 시 완료 버튼 클릭 후 emit */
    const nightBtn = () => {
        // submit myId는 임시값!
        socket.emit("nightEvent", {gameId: roomId, userId: myId, gamedata: {submit: myId}});
    }

    const newCycleBtn = () => {
        socket.emit("newCycleRequest", {gameId: roomId, userId: myId});
    }

    /* 제시어 제출 - Close 클릭 시 상태 변경 */
    const btnAnswerClose = () => {
        answerModalState(false); 
    };

    /* 투표 모달 - SUBMIT 클릭 시 상태 변경 */
    const voteModalClose = () => {
        voteModalState(false); 
    };

    // const videosState = () => {
    //     videosState
    // };

    const settingVideos = (vid) => {
        console.log('찍히나?', vid);
        setVideos([...vid]); 
        stream = [...vid];
        console.log('찍히나?2', videos2);
        console.log('찍히나?3', stream);
    };



    return (
        <>
        {
            roomEntered ? 
            function () { 
                return (
                    <div className={ (becomeNight ? style.dark : null)}>
                    {/* night event */}
                    { becomeNight ? <p className={style.topright}>밤이 되었습니다</p> : null }

                    {/* mafia answer */}
                    { answerModal ? <AnswerModal className={style.inviteModal} roomId={roomId} myId={myId}  
                        btnAnswerClose={btnAnswerClose} /> : null }

                    {/* citizen vote */}
                    { voteModal ? <VoteModal players={players} roomId={roomId} myId={myId} voteModalClose={voteModalClose}/> : null}

                    {/* vote result */}
                    { voteResultModal ? <VoteResultModal /> : null }

                    {/* total result */}
                    {/* { resultModal ? <ResultModal/> : null } */}

                    <div className={style.outbox}>
                        <div className={style.flexBox}>
                            <div className={style.item1}>
                                <VideoWindow newPlayer={newPlayer} isReady={isReady} needVideos={needVideos} settingVideos={settingVideos} />
                            </div>

                            <div className={style.item2}>
                                <div className={style.flextest}>
                                    <div className={style.canvas}>
                                        <Canvas roomId={roomId}/>
                                    </div>

                                    <div className={style.chat}>
                                        <Chat roomId={roomId}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.topSection}>
                        <div className={style.utility}>
                            <button className={`${style.utilityBtn} ${style.invite}`}>INVITE</button>
                            <button className={`${style.utilityBtn} ${style.exit}`}>EXIT</button>
                        </div>                    
                        <div className={style.wordTimer}>
                            <div className={style.wordBox}>
                                <span className={style.wordBoxLabel}>제시어</span>
                                <span className={style.wordBoxWord}>얼룩말얼룩말</span>
                            </div>
                            <div className={style.timer}>
                                <span className={style.timerIco}></span>
                                <span className={style.timerText}>30</span>
                            </div>
                        </div>
                    </div>

                    {/* <div className={style.chat}>
                        <Chat roomId={roomId} newPlayer={newPlayer} />
                    </div> */}


                {/* ready & start button */}
                <button className={isReady ? null : null} style={{ fontSize: 40, margin: 30 }} onClick={readyBtn}> READY </button>
                    <button className={readyToStart ? null : null} style={{ fontSize: 40, margin: 30 }} onClick={startBtn}> START </button>  
                    {/* <a href="#" class="btn">Hover to Shine</a>

                    {/* for start loading */}
                    {isStarted === null ? null : isStarted ? null : <div>로딩중입니다</div>}

                    {/* 게임 시작시 turn 보여주는 용도 : start turn info all */}
                    {/* <div>
                        {turnQue === null ? null : turnQue.map((userid) => {
                            return (
                                <h4>{userid}</h4>
                            );
                        })}
                    </div> */}

                    {/* 게임 시작시 word 또는 역할 보여주는 용도 */}
                    {/* {!showWord ? null : ((word.word === "?") ? <h3>당신은 마피아입니다</h3> : <h3>당신은 시민입니다 : 제시어 {word.word}</h3>)} */}
                </div>
                ); 
            }() : null
        }
        </>
    );
}

// 마피아 정답 제출
function AnswerModal(props){
    let [inputValue, setInputValue] = useState(""); // 마피아의 제시어 제출

    const submitAnswer = () => {
        props.btnAnswerClose();
        console.log(`마피아 정답 : ${inputValue}`);
        socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: inputValue}});
    }

    const onKeyPress = (e) => {
        if(e.key == 'Enter') {
            submitAnswer();
        }
    }

    return(
    <>
        <div className={style.position}>
        <input type="text" placeholder="제시어를 맞춰보세요" className={style.inputBox} 
        onChange={(event) => setInputValue(event.target.value)} onKeyPress={onKeyPress}/>
        <button className={style.sendBtn} onClick={submitAnswer}>SEND</button>
        </div>
    </>
    )
};

// 시민 투표 모달
function VoteModal(props){
    const [show, setShow] = useState(true);
    const handleClose = () => {setShow(false); props.voteModalClose();};

    const submitAnswer = () => {
        // props.btnAnswerClose();

        var voteLength = document.getElementsByName("citizens").length;
        console.log(`투표 결과`, voteLength, document.getElementsByName("citizens")[0].checked);

        let voteRst;

        for (var i = 0; i<voteLength; i++) {
            if(document.getElementsByName("citizens")[i].checked === true) {
                voteRst = document.getElementsByName("citizens")[i].value;
            }
        }

        console.log(`투표 : ${voteRst}`);
        socket.emit("nightEvent", {gameId: props.roomId, userId: props.myId, gamedata: {submit: voteRst}});

        handleClose();

    }

    const onKeyPress = (e) => {
        if(e.key == 'Enter') {
            submitAnswer();
        }
    }

    return(
    <>
        <Modal className={style.modal} style={{ top: "650px" }} show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>VOTE</Modal.Title>
            </Modal.Header>
            <Modal.Body className={style.modalBody}>
                {
                    props.players&&props.players.map((citizenId) => (
                        <>
                        <ul style={{paddingLeft:'0px'}}>
                            <input type='checkbox' name="citizens" value={citizenId} key={citizenId} onKeyPress={onKeyPress}/> {citizenId}
                        </ul>
                        </>))
                }
            </Modal.Body>

            <Modal.Footer className={style.modalFooter}>
                <Button variant="primary" onClick={submitAnswer}>VOTE</Button>
            </Modal.Footer>
        </Modal>
    </>
    )
};

// 투표 결과 모달
function VoteResultModal(props) {

    return (
        <div className={style.voteResultModal}>
            <h1>투표 결과</h1>
        </div>
    )

}


export default Ingame;