import React, { useEffect, useRef, useState } from 'react';
import style from '../css/Canvas.module.css'
import {socket} from '../script/socket';
import {Whiteboard} from '../script/whiteboard'

let whiteboard;
const Canvas = ({roomName}) => {

    const canvasElement = useRef();

    useEffect(() => {
        whiteboard = new Whiteboard(canvasElement.current, socket, roomName);
        console.log("test");
        socket.on("canvasTest1", (test) => {
            console.log(socket);
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
          <div className={style.item2}>
            <div className={style.canvas}>
              <canvas ref={canvasElement} className={`${style.myCanvas}`} style={{"background":"#fff"}}>
              </canvas>
            </div>
            <div className={style.draw}>
              <div className={style.buttons}>
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