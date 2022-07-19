import React, { useEffect, useRef, useState } from 'react';
import style from '../css/Canvas.module.css'
import io from 'socket.io-client';
// const socket = io.connect("http://localhost:3000");
import {socket} from '../script/socket';

let whiteboard;
const Canvas = (props) => {

    // props로 전달 받은 roomName
    let roomName = props.roomName;

    // 나중에 nickname 전송해주는 곳
    // function handleNicknameSubmit(event) {
    //     event.preventDefault();
    //     const input = welcome.querySelector("#name input");
    //     const value = input.value;
    //     socket.emit("nickname", value);
    //     input.value = ""; // aSync
    // }

    // 임의의 닉네임 전송
    socket.emit("nickname", '닉넴');

    async function handleRoomName(event) {
        // event.preventDefault();
        // js object를 보낼 수 있음 (msg 아님!), emit의 마지막 argument가 function일때 : back button어쩌구

        // 나중에 roomName 지정해줘야 할 곳
        // const input = welcome.querySelector("#roomname input");

        // await initCall();

        // 나중에 roomName 지정해줘야 할 곳
        // socket.emit("enter_room", input.value, socket.id, showRoom); 
        socket.emit("enter_room", roomName, socket.id, showRoom); 

    }

    function showRoom() {
      // welcome.hidden = true;
      // room.hidden = false;
      // header.hidden = true;
      // camerasSelect.hidden = true;
      // muteBtn.hidden = true;
  
      // container.hidden = false;
      // canvas add 
      // const socket = io();
      // const canvas = document.getElementById('myCanvas');
  
      const canvas = document.createElement("canvas");
      canvas.setAttribute("id", "myCanvas");
      canvas.setAttribute("style", 'background: #ddd;');
      // container.appendChild(canvas);
      // const whiteboard = new Whiteboard(canvas, socket, roomName);
      // socket.emit("newCanvas", whiteboard);
      // whiteboard.addEventListener("click", handleDrawing);
      // console.log("__debug", whiteboard);
  
      // const h3 = room.querySelector("h3");
      // h3.innerText = `Room ${roomName}`;
      
      // const msgform = room.querySelector("#msg");
      // msgform.addEventListener("submit", handleMessageSubmit);
  
  }

    class Whiteboard {
        /**
         * Constructor
         *
         * @param {HTMLElement} canvas          The canvas element
         * @param {socket} socket               The socket.io socket
         * @param {string} name                 The name(id)
         * @param {string} [color='#4d4d4d']    The default color
         * @param {number} [thickness=4]        The default thickness
         */
        constructor(canvas, socket, roomName, color = '#4d4d4d', thickness = 4) {
          // Define read-only properties
          Object.defineProperties(this, {
            thicknessMin: { value: 1 },
            thicknessMax: { value: 120 },
            socketEvents: {
              value: {
                DRAW: 'DRAW',
                DRAW_BEGIN_PATH: 'DRAW_BEGIN_PATH',
              },
            },
          });
      
          this.canvas = canvas;
          this.socket = socket;
          this.name = roomName;
          this.color = color;
          this.thickness = thickness;
      
          this.ctx = this.canvas.getContext('2d');
      
          canvas.addEventListener('mousedown', () => {
            this.socket.emit(this.socketEvents.DRAW_BEGIN_PATH);
          });
      
          canvas.addEventListener('mousemove', (e) => {
            // Check whether we're holding the left click down while moving the mouse
            if (e.buttons === 1) {
              this._emitDrawingData(e);
            }
          });
      
          canvas.addEventListener('click', (e) => {
            this._emitDrawingData(e);
          });
      
          this._resizeCanvas();
      
          const self = this;
          window.addEventListener('resize', () => self._resizeCanvas());
      
          this.socket.on(this.socketEvents.DRAW, (data) => self._socketDraw(data));
        }
      
        /**
         * Resize the canvas, so its width and height
         * attributes are the same as the offsetWidth
         * and offsetHeight
         *
         * The .width and .height defaults to 300px and
         * 150px and we have to change them to match the
         * .offsetWidth and .offsetHeight, which are the
         * layout width and heights of our scaled canvas
         * (the ones we have set in our CSS file)
         */
        _resizeCanvas() {
          const { canvas, ctx } = this;
      
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
      
          // Clear the canvas for the browser that don't fully clear it
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      
        /**
         * Get the mouse input and draw on our canvas
         *
         * @param {MouseEvent} e    The mousemove event
         * @private
         */
        _emitDrawingData(e) {
            const {
                canvas,
                name,
                color,
                thickness,
                socket,
                socketEvents,
            } = this;
        
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const data = {
                name,
                x,
                y,
                color,
                thickness,
            }

            // data.color = '#6b6cc2';
            data.thickness = 6;
    
            // Emit drawing data to other people
            socket.emit(socketEvents.DRAW, data);
    
            // const { ctx } = this;
            
            // ctx.beginPath();+
            // ctx.strokeStyle = color;
            // ctx.lineWidth = thickness;
            // ctx.moveTo(x, y);
            // ctx.lineTo(x + 0.1, y + 0.1);
            // ctx.lineJoin = 'round';
            // ctx.lineCap = 'round';
            // ctx.stroke();
        }
      
        /**
         * Get the drawing data from the socket and basically
         * draw on our canvas whatever the other person draws
         *
         * @param {Object} data     The drawing data
         * @private
         */
        _socketDraw(data) {
          const {
            prev,
            curr,
            color,
            thickness,
          } = data;
    
          const { ctx } = this;
          
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      
        /**
         * Save our canvas drawing as an image file.
         * Using this method allows us to have a custom
         * name for the file we will download
         *
         * Source: http://stackoverflow.com/a/18480879
         *
         * @param {string} filename     The name of the image file
         */
        download(filename) {
          const lnk = document.createElement('a');
          lnk.download = filename;
          lnk.href = this.canvas.toDataURL();
      
          if (document.createEvent) {
            const e = document.createEvent('MouseEvents');
            e.initMouseEvent('click', true, true, window,
              0, 0, 0, 0, 0, false,
              false, false, false, 0, null);
      
            lnk.dispatchEvent(e);
          } else if (lnk.fireEvent) {
            lnk.fireEvent('onclick');
          }
        }
      
        /**
         * Increase the thickness
         *
         * @param {number} step     The amount of the increase
         *                          (e.g. `.increaseThickness(1)`
         *                          will increase the thickness by 1 pixel)
         */
        increaseThickness(step) {
          this.thickness += step;
      
          if (this.thickness > this.thicknessMax) {
            this.thickness = this.thicknessMax;
          }
        }
      
        /**
         * Decrease the thickness
         *
         * @param {number} step     The amount of the decrease
         *                          (e.g. `.decreaseThickness(1)`
         *                          will decrease the thickness by 1 pixel)
         */
        decreaseThickness(step) {
          this.thickness -= step;
      
          if (this.thickness < this.thicknessMin) {
            this.thickness = this.thicknessMin;
          }
        }
      
        /**
         * Clear the entire canvas
         */
        clear() {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }

    const canvasElement = useRef();

    useEffect(() => {
        handleRoomName();
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