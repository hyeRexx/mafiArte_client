import {React, useEffect, useState} from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import axios from 'axios';
import Login from './Login';
const socket = io.connect("http://localhost:3000");

const Main = () => {
    const [login, setLogin] = useState(false);
    const flipLogin = () => {
        setLogin(!login);
    }
    return (
        <div id="main">
            <h1>메인화면임</h1>
            <h1>메인 화면 및 소셜 로그인 들어가야함</h1>
            <h1>로그인 완료시 로비로 이동</h1>
            {login? <Login/> : <MainBtns flipLogin={flipLogin}/>}
        </div>
    );
}

const MainBtns = (props) => {
    useEffect(() => {
        socket.on("test", (test) => {
            console.log(test);
        });
    }, []);

    const btnLogin = () => {
        props.flipLogin();
    }
    const hi = () => {
        axios.get("/api/canvas/home")
            .then((res) => {
            console.log(res.data);
        });

        axios.get("/api/member/home").then((res) => {
            console.log(res.data);
        });

        socket.emit("test")
    }
    return (
        <>
            <Button id="join">JOIN</Button>
            <Button id="login" onClick={btnLogin}>LOGIN</Button>
            <Button onClick={hi}>test</Button>
        </>
    );
}

const Button = styled.button`
    padding: 2em;
`

export default Main;