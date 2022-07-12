import React from 'react';
import styled from 'styled-components';
import {Link, Route, Routes} from 'react-router-dom'

const Main = () => {
    return (
        <div id="main">
            <h1>메인화면임</h1>
            <h1>메인 화면 및 소셜 로그인 들어가야함</h1>
            <h1>로그인 완료시 로비로 이동</h1>
            <Button id="join">JOIN</Button>
            <Link to="/login">
                <Button id="login">LOGIN</Button>
            </Link>

        </div>
    );
}

const Button = styled.button`
    padding: 2em;
`

export default Main;