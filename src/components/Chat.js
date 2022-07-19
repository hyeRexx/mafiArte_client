import React, { useEffect, useRef } from 'react';
// import style from '../css/Chat.module.css'
import io from 'socket.io-client';
import Card from 'react-bootstrap/Card';
import style from "../css/Chat.module.css"
const socket = io.connect("http://localhost:3000");



const Chat = (props) => {

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
    
        // const canvas = document.createElement("canvas");
        // canvas.setAttribute("id", "myCanvas");
        // canvas.setAttribute("style", 'background: #ddd;');
        // container.appendChild(canvas);
        // const whiteboard = new Whiteboard(canvas, socket, roomName);
        // socket.emit("newCanvas", whiteboard);
        // whiteboard.addEventListener("click", handleDrawing);
        // console.log("__debug", whiteboard);
    
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomName}`;
        
        const msgform = room.querySelector("#msg");
        msgform.addEventListener("submit", handleMessageSubmit);
    
    }

    socket.on("new_message", addMessage);

    function handleMessageSubmit(event) {
        event.preventDefault();
        const input = room.querySelector("#msg input");
        const value = input.value;

        if (value == "" || value == null || value == undefined){
            alert("채팅을 입력해주세요!");
            return;
        }

        var YokList = new Array('개새끼','개색기','개색끼','개자식','씨발','씨팔','씨부랄','씨바랄','씹창','씹탱','씨방세',
                                '씨방새','씨펄','시펄','십탱','씨박','썅','싸가지','쓰벌','씁얼','상넘이','상놈의','상놈이','상놈을','좆','좃','존나게',
                                '존만한','호로','후레아들','호로새끼','후레자식','후래자식','병신');
        var Tmp;
        for(let i=0 ; i<YokList.length ; i++){
            Tmp = value.toLowerCase().indexOf(YokList[i]);
            if(Tmp >= 0){
                alert('바른말 고운말을 사용해주세요!');
                input.value = "";
                return;
            }
        }

        socket.emit("new_message", value, roomName, () => {
            addMessage(`You : ${value}`);
        });
        input.value = ""; // aSync
    }

    function addMessage(message) {
        const ul = room.querySelector("ul");
        const li = document.createElement("li");
        li.innerText = message;
        ul.append(li);
    }

    useEffect(()=> {
        handleRoomName();
    },[]);

    return (
        <>
        <div id="room">
            <div className={style.chat}>
                <h3 style={{ color: "black" }}></h3>
                <ul style={{ color: "black" }}> </ul>
                {/* <form id="msg">
                    <input placeholder="message" required type="text" />
                    <button onClick={handleMessageSubmit}>Send</button>
                </form> */}
            </div>
            <form id="msg">
                <input placeholder="message" required type="text" style={{"width":"1320px"}} />
                <button onClick={handleMessageSubmit}>Send</button>
            </form>
        </div>


        </>
    );
};

export default Chat;
