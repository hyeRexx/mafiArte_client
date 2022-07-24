import React, { useEffect, useRef } from 'react';
import style from "../css/Chat.module.css"
import {socket} from '../script/socket';

const Chat = ({roomId}) => {

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

        // props로 넘어온 roomId는 String 타입이므로 int 타입으로 변환해줘야
        socket.emit("new_message", value, Number(roomId), () => {
            console.log(`RoomName1 : ${roomId}`);
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
        console.log(socket);
        const msgform = room.querySelector("#msg");
        msgform.addEventListener("submit", handleMessageSubmit);
        socket.on("new_message", addMessage);
    },[]);

    return (
        <>
        <div id="room">
            <div className={style.chat}>
                <h3 style={{ color: "black" }}></h3>
                <ul style={{ color: "black" }}> </ul>
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