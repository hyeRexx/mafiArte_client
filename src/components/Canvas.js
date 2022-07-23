import React, { useEffect, useRef, useState } from 'react';
import style from '../css/Canvas.module.css'
import {socket} from '../script/socket';
import {Whiteboard} from '../script/whiteboard'

let whiteboard;
const Canvas = ({roomId}) => {
    const canvasElement = useRef();

    useEffect(() => {
        // props로 넘어온 roomId는 String 타입이므로 int 타입으로 변환해줘야
        whiteboard = new Whiteboard(canvasElement.current, socket, Number(roomId));
        console.log("test");
        socket.on("canvasTest1", (test) => {
            // console.log(socket);
            console.log("__debug", socket.id);
        });
        // component unmount 시 event remove 하는 것 고려해볼 것 성능 개선 문제
    }, []);

    // 색 변경 useStatte
    let [pickColor, colorChange] = useState('#4d4d4d');
    
    // 색 변경 함수
    useEffect(() => {
      console.log(pickColor);
      console.log(whiteboard);
      whiteboard.color = pickColor;
    }, [pickColor]);
    
    return (
      <>
      <div className={style.canvasBox}>
          <div className={style.canvas}>
            <canvas ref={canvasElement} className={`${style.myCanvas}`} style={{"background":"#fff"}}>
            </canvas>
          </div>
          <div className={style.canvasTool}>
              <div className={style.canvasToolBox}>
                  <button onClick={()=> (colorChange('#d93434'))} className={style.colorButtons1}></button>
                  <button onClick={()=> (colorChange('#56acee'))} className={style.colorButtons2}></button>
                  <button onClick={()=> (colorChange('#ffcc4d'))} className={style.colorButtons3}></button>
                  <button onClick={()=> (colorChange('#64d726'))} className={style.colorButtons4}></button>
                  <button onClick={()=> (colorChange('#ff9100'))} className={style.colorButtons5}></button>
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