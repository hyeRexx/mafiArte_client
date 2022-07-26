import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Canvas from './Canvas';
import VideoWindow from './VideoWindow';
import {socket} from '../script/socket';
import Chat from './Chat';
import style from "../css/Ingame.module.css";
import { turnStatusChange, surviveStatusChange, FriendInfoChange } from '../store';
import Video from './Video';
import { useNavigate, useLocation } from 'react-router-dom';
import { paddr, reqHeaders } from '../proxyAddr';
import { FriendInfoReset } from '../store';
import IngameLoader from '../subitems/IngameLoader';
import EvilLoader from "../subitems/EvilLoader"
import RoleCardHotSpot from '../subitems/RoleCardHotSpot';
import { RoleCardCitizen, RoleCardMafia } from '../subitems/RoleCard';
import { InviteCard } from '../subitems/InviteCard';
import { NightEventForCitizen, NightEventForMafia } from '../subitems/NightEvent';

let word;

const Ingame = ({roomId}) => {
    const [ isUnMounted , doUnMount ] = useState(false); // Exit 누르거나 새로고침/창닫기 시에도 동일하게 unmount 작동하도록 하기 위한 state 설정

    const [ roomEntered, setRoomEntered ] = useState(false);
    const [ newPlayer, setNewPlayer ] = useState(null);
    const [ exiter, setExiter ] = useState(null);
    const [ isHost, setHost ] = useState(false);
    const [ readyToStart, setReadyToStart ] = useState(false);  // 레디가 다 눌렸나?
    const [ isReady, setReady ] = useState(false);              // 내가 레드 눌렀나?
    const [ isStarted, setStart ] = useState(0);             // 로딩 끝나고 게임 시작됐나?
    const [ turnQue, setTurnQue ] = useState(null);             // 턴 저장 state
    const [ showWord, setShowWord ] = useState(false);          // 단어 보여줄지 여부

    let [ becomeNight, becomeNightState ] = useState(false); // 밤 Event (투표, 제시어 제출)
    let [ voteResultModal, voteResultState ] = useState(false); // 투표 결과 모달
    let [ resultModal, resultModalState ] = useState(false); // 최종 결과 모달
    let [ result, setResult ] = useState(null); // 최종 결과 
    let [ needVideos, setNeedVideos ] = useState(null); // 투표 시 비디오 필요 신호
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

        /* 밤이 되었습니다 화면 띄우고 투표 / 정답 입력 띄우기 */
        // 한 사이클이 끝났음에 대한 알림
        // data 없음! : turn info도 전달하지 않음
        socket.on("cycleClosed", () => {
            console.log('밤이 되었습니다');
            becomeNightState(true);
            setNeedVideos(true); // 비디오 필요하다는 신호 전송
        });

        /* nightResult 결과를 받음 */
        // nightEvent 요청에 대한 진행 보고
        socket.on("nightResult", (data) => {
            setTimeout(() => {
                setNeedVideos(true); // 비디오 필요하다는 신호 초기화
                voteNumberState(data.voteData); // 투표 수치
                voteResultState(true); // 투표 결과 모달
                console.log('결과', data.win);
    
                let end = 0;
                if (data.win == "mafia") {
                    console.log("마피아 승!");  
                    setResult(1);
                    end = 1;
                } else if (data.win == "citizen") {
                    console.log("시민 승!");
                    setResult(2);
                    end = 1;
                } else if (data.elected) {
                    console.log("무고하게 죽은 시민", data.elected);
                    setDeadMan(data.elected);
                    ripList.push(data.elected);
                    setResult(3);
                    if (data.elected === myId){
                        dispatch(surviveStatusChange(0));
                    }
                } else {
                    console.log("오늘 밤은 아무도 죽지 않았습니다");
                    setResult(4);
                }
                setTimeout(()=> {
                    voteResultState(false); // 투표 결과 모달 닫기
                    resultModalState(true); // 최종 결과 모달
                    setTimeout(()=>{ 
                        resultModalState(false); // 최종 결과 모달 닫기
                        if (end === 1) {
                        setEndGame(true);} 
                    }, 7000);
                }, 4000)
            }, 1000);

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

        socket.on("roomExit", (exiterId) => {
            console.log(`${exiterId} is disconnected`);
            setExiter(exiterId);
        });

        socket.on("friendList", (userid, status) => {
            console.log("friend수정확인",userid, status);
            if (userid === myId) {
                (status === 0) && (()=>{
                    doUnMount(true);
                    setTimeout(()=>{
                        dispatch(FriendInfoReset());
                        socket.close();
                        navigate('/');
                    }, 0);
                })();
            } else {
                dispatch(FriendInfoChange([userid, status]));
            }
        });
    },[]);

    useEffect(()=>{
        return () => {
            // 방을 나가는 event를 보내줘야함
            isUnMounted && (()=>{
                socket.emit('exit', myId, Number(roomId));
                // 기존에 등록된 event listner 삭제
                socket.off("notifyNew");
                socket.off("notifyReady");
                socket.off("readyToStart");
                socket.off("gameStarted");
                socket.off("singleTurnInfo");
                socket.off("cycleClosed");
                socket.off("nightResult");
                socket.off("someoneExit");
                socket.off("friendList");
            })();
        };
    },[isUnMounted]);

    useEffect(() => {
        endGame && (() => {
            setStart(0);
            // redux에 저장해둔 video stream array 초기화 필요
        })();
    }, [endGame]);

    // Jack - 뒤로가기 버튼 막음. 새로고침/창닫기 시에는 게임 EXIT되도록 / 로그아웃 되도록 처리
    useEffect(()=>{
        // 뒤로가기 방지
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", () => history.pushState(null, "", location.href));

        const doExit = (e) => {
            // isUnMounted를 true로 바꿔서 여러가지 정리하고 room에도 exit을 주는데, 
            // 이 시점에서 socket이 disconnecting 되는건지 나중에 되는건지 정확히 몰라서 제대로 작동하는지는 미지수. 
            // 만약 disconnecting이 먼저 간다면, disconnecting에서 socket사용해서 게임에 들어가있는지 판단하고,
            // 게임에 들어가있다면 exitGame하고 roomExit 이벤트 주도록 변경 필요할듯
            // 디버깅시 참고
            doUnMount(true); 
            dispatch(FriendInfoReset());
            // axios.post(`${paddr}api/auth/logout`, null, reqHeaders).finally(()=>{
                // dispatch(setUserId(""));
                // socket.emit('loginoutAlert', myId, 0);
                // socket.close();
            // });
        }
        (()=>{
            // 창닫기/새로고침 시 exit 처리 및 logout 처리 
            window.addEventListener("beforeunload", doExit);
            // 정답 맞추기 등 폼 제출시에는 위 처리하지 않음
            document.onsubmit = (e) => {
                window.onbeforeunload = null;
            }
        })();
        document.onsubmit()
        return () => {
            window.removeEventListener("popstate", () => history.pushState(null, "", location.href));
            window.removeEventListener("beforeunload", doExit);
            window.removeEventListener("submit", (e) => {window.onbeforeunload = null});
        }
    }, []);
    
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

    const newCycleBtn = () => {
        socket.emit("newCycleRequest", {gameId: roomId, userId: myId});
    }
    
    /* Exit Button */
    const btnExit = (e) => {
        e.preventDefault();
        doUnMount(true);
        setTimeout(()=>{
            navigate('/lobby');
        }, 0);
    };

    return (
        <>
        {
              roomEntered ? 
              function () { 
                  return (
                      <div>
  
                      {/* vote result */}
                      { voteResultModal ? <VoteResultModal voteNumber={voteNumber} /> : null }
  
                      {/* total result */}
                      { resultModal ? <ResultModal result={result} deadMan={deadMan}/> : null }
  
                      <div className={style.outbox}>
                          <div className={style.flexBox}>
                              <div className={style.item1}>
                                  <VideoWindow newPlayer={newPlayer} isReady={isReady} isStarted={isStarted} isUnMounted={isUnMounted} exiter={exiter} endGame={endGame} needVideos={needVideos}/>
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
                                  <span className={style.timerText}><Timer nowplayer = {gameUserInfo[0]} roomId = {roomId} myId = {myId}/></span>
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
                      {!showWord ? null : ((word.word === '?') ? <RoleCardMafia/> : <RoleCardCitizen word={word.word}/>)}
                      {/* night event */}
                      { becomeNight ? ((word.word === '?') ? <NightEventForMafia roomId={roomId} myId={myId} becomeNightState={becomeNightState} becomeNight={becomeNight}  ripList={ripList} word={word.word}/> : 
                      <NightEventForCitizen roomId={roomId} myId={myId} becomeNightState={becomeNightState} becomeNight={becomeNight} ripList={ripList} word={word.word}/>) : null }
                  </div>
                  ); 
              }() : null
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
  
      useEffect (() => {
          if (props.nowplayer !== null){
              console.log(props.myId, props.nowplayer);
              console.log("timer 값 얼마니? ", timer);
              if (timer !== 0) {
                  const tick = setInterval(() => {
                      setTimer(value => value -1)
                  }, 1000);
                  return () => clearInterval(tick)
              } else if (props.myId === props.nowplayer) {
                  console.log('host만 여기 통과해야함^^');
                  socket.emit("openTurn", {gameId: props.roomId, userId: props.myId});
              }
          }
          }, [timer])
  
      return (
          <>
          {timer}
          </>
      )
  }
  

  
  // 투표 결과 모달
  function VoteResultModal(props) {
      const voteNumber = Object.entries(props.voteNumber);
      return (
            <div className={style.turnBoard}>
                <div className={style.turnBoardTitle}> VOTE RESULT </div>
                {voteNumber.map((voteNumber)=> {
                    return (
                        <div className={style.singleTurnInfo}>
                            <span className={style.turnNum}>{voteNumber[0]}</span>
                            <span className={style.turnId}>{voteNumber[1]}</span>
                        </div>
                    );
                })}
            </div>

      )
  

  };
  
  // 최종 결과 모달
  function ResultModal(props) {
      const finalResult = props.result;
      const deadMan = props.deadMan;
      console.log('최종 결과', finalResult);
      return (
      <>
          <div  className={style.turnBoard} style={{width: "500px"}}>
          <div className={style.turnBoardTitle}> TOTAL RESULT </div>
          { finalResult === 1? <span className={style.turnId}>마피아가 승리했습니다!</span>: null }
          { finalResult === 2? <span className={style.turnId}>시민이 승리했습니다!</span>: null }
          { finalResult === 3? <span className={style.turnId}>무고한 시민 {deadMan}이 죽었습니다...</span>: null }
          { finalResult === 4? <span className={style.turnId}>오늘 밤은 아무도 죽지 않았습니다...</span>: null }
          </div> 
      </>
      )
  };
  
  export default Ingame;