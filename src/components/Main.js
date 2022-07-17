import {React, useState} from 'react';
import styled from 'styled-components';
import {Link, Route, Routes} from 'react-router-dom';
import Login from './Login';

const Main = () => {
    const [login, setLogin] = useState(false);
    const flipLogin = () => {
        setLogin(!login);
    }
    return (
        <div id="main">
            <h1>메인화면</h1>
            <h1>메인 화면 및 소셜 로그인 들어가야함</h1>
            <h1>로그인 완료시 로비로 이동</h1>
            {login? <Login/> : <MainBtns flipLogin={flipLogin}/>}
        </div>
    );
}

const MainBtns = (props) => {
    const btnLogin = () => {
        props.flipLogin();
    }
    
    return (
        <>
            <Button id="join">JOIN</Button>
            <Button id="login" onClick={btnLogin}>LOGIN</Button>
        </>
    );
}

const Button = styled.button`
    padding: 2em;
`

export default Main;