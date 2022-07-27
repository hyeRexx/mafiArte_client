import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import style from '../css/Canvas.module.css'
import {socket} from '../script/socket';
import {Whiteboard} from '../script/whiteboard'
import { ASSERT } from '../script/debug';

let whiteboard;
const Canvas = ({roomId, endGame}) => {
    const canvasElement = useRef();
    const gameUserInfo = useSelector(state => state.gameInfo);
    const myId = useSelector(state => state.user.id);

    useEffect(() => {
        // props로 넘어온 roomId는 String 타입이므로 int 타입으로 변환해줘야
        whiteboard = new Whiteboard(canvasElement.current, socket, Number(roomId));
        console.log("Ingame : Canvas Mounted");
        // component unmount 시 event remove 하는 것 고려해볼 것 성능 개선 문제
    }, []);

    

    // 색 변경 useStatte
    let [pickColor, colorChange] = useState('#4d4d4d');
    
    // 색 변경 함수
    useEffect(() => {
      whiteboard.color = pickColor;
      console.log("Ingame : Canvas Color Changed");
    }, [pickColor]);
    
    console.log("Canvas Before useEffect[endGame]");
    useEffect(() => {
        console.log("Canvas : useEffect - endGame? ", endGame)

        if (endGame === true){
            // console.log("endgame true 인가요?");
            // const ctx = canvasElement.current.getContext("2d");
            // ctx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height)
            whiteboard.clear();
        }
    }, [endGame])

    return (
        <>
        <div className={style.canvasBox}>
            <div className={style.canvas}>
              <canvas ref={canvasElement} className={`${style.myCanvas}`} style={{background:"#fff", pointerEvents: (gameUserInfo[0]===myId) ? "auto" : "none"}}>
              </canvas>
            </div>
            <div className={style.canvasTool}>
                <div className={style.canvasToolBox}>
                    <button onClick={()=> (colorChange('#d93434'))} className={style.colorButtons1}></button>
                    <button onClick={()=> (colorChange('#48abe0'))} className={style.colorButtons2}></button>
                    <button onClick={()=> (colorChange('#f0e73a'))} className={style.colorButtons3}></button>
                    <button onClick={()=> (colorChange('#9bf03a'))} className={style.colorButtons4}></button>
                    <button onClick={()=> (colorChange('#ff7f00'))} className={style.colorButtons5}></button>
                    <button onClick={()=> (colorChange('#a243ff'))} className={style.colorButtons6}></button>
                    <button onClick={()=> (colorChange('#000000'))} className={style.colorButtons7}></button>
                    <button onClick={()=> (colorChange('#ffffff'))} className={style.colorButtons8}></button>
                    {/* <button onClick={()=> {whiteboard.clear()}} className={style.colorButtons8}></button> */}
                </div>
            </div>
        </div>
        </>
    );
};

export default Canvas;