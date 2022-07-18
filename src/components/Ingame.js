import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Canvas from './Canvas';
import VideoWindow from './VideoWindow';
import Videotest from './videotest';
import connectSocket, {socket} from '../script/socket';

const Ingame = () => {
    const { roomNumber } = useParams();
    const [ roomEntered, setRoomEntered ] = useState(false);
    const myId = useSelector(state => state.user.id);
    useEffect(()=>{
        socket.emit("enterRoom", myId, socket.id, roomNumber, ()=>{
            setRoomEntered(true);
        });
    },[]);

    return (
        <div>
            {
            roomEntered?
             <VideoWindow/> 
             : null
             }
            {/* <Canvas/> */}
        </div>
    );
}

export default Ingame;