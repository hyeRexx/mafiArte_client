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


const Ingame = ({roomId}) => {
    const [ roomEntered, setRoomEntered ] = useState(false);
    const myId = useSelector(state => state.user.id);
    
    useEffect(()=>{
    //socket event name 변경 필요
        console.log(`${myId}, ${socket.id}, ${roomId}, Number(${roomId})`);
        socket.emit("enterRoom", myId, socket.id, Number(roomId), ()=>{
            console.log(roomId);
            setRoomEntered(true);
        });
    },[]);

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
                                <VideoWindow />
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
                                <div className={style.chat}>
                                    <Chat roomId={roomId}/>
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