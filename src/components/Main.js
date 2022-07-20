import {React, useEffect, useState} from 'react';
import Login from './Login';
import Join from './Join';
// import 'bootstrap/dist/css/bootstrap.min.css';
import style from "../css/Main.module.css"

const Main = () => {
    const [login, setLogin] = useState(false);
    const [join, setJoin] = useState(false);

    const flipLogin = () => {
        setLogin(!login);
    }
    const flipJoin = () => {
        setJoin(!join);
    }

    return (
        <div className={style.Main}>
            <img className={style.mainLogo} src='/img/mainLogo.png'></img>
            <div className={style.mainBtns}> 
                {login ? <></> : <MainBtns flipLogin={flipLogin} flipJoin={flipJoin}/>}
                {login ? <Login/> : null}
                {join ? <Join/> : null}
            </div>
        </div>
    );
}

const MainBtns = (props) => {


    const btnLogin = () => {
        props.flipLogin();
    }

    const btnJoin = () => {
        props.flipJoin();
    }
    
    return (
        <>
            <button className={style.mainBtn} id="join" onClick={btnJoin}>JOIN</button>
            <button className={style.mainBtn} id="login" onClick={btnLogin}>LOGIN</button>
        </>
    );
}

export default Main;