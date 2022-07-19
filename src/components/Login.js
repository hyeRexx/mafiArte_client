import React from 'react';
import { useState } from 'react';
import { Button, Form, FloatingLabel } from 'react-bootstrap';
// import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { setUserId } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { NotRequireAuth } from '../script/auth';

// Login 컴포넌트 - Jack
const Login = () => {
    const [id, setId] = useState("");               // id 입력 저장
    const [lableId, setLableId] = useState("ID");   // id 입력칸 lable 저장
    const [pw, setPw] = useState("");               // pw 입력 저장
    const [lablePw, setLablePw] = useState("PASSWORD"); // pw 입력칸 lable 저장
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    // 로그인 필요한 페이지로 접근해서 넘어온 경우
    const from = location.state?.from?.pathname || "/lobby";

    const onSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/auth/login', {userid: id, password: pw})
            .then(async (res)=>{
                if (res.data === 'success') {
                    await dispatch(setUserId(id));          // login 정보 redux에 저장
                    sessionStorage.setItem('userid', id);   // login 정보 sessionStorage에 저장
                    navigate(from, { replace: true });      // 접근했던 페이지 또는 로비로 이동
                } else if (res.data === 'INVALID_ID') {
                    setLableId('ID : 유효하지 않은 ID 입니다');
                } else if (res.data === 'INVALID_PW') {
                    setLableId('ID');
                    setLablePw('PASSWORD : 유효하지 않은 PASSWORD 입니다');
                }
            });
    };

    return (
        <NotRequireAuth>
            <Form onSubmit={onSubmit}>
                <FloatingLabel
                    controlId="floatingInput"
                    label={lableId}
                    className="mb-3"
                    style={{width: "500px", margin: "auto"}}
                >
                    <Form.Control type="userid" placeholder="ID" onChange={(e) => setId(e.target.value)} required autoFocus/>
                </FloatingLabel>

                <FloatingLabel
                    controlId="floatingPassword"
                    label={lablePw}
                    className="mb-3"
                    style={{width: "500px", margin: "auto"}}
                >
                    <Form.Control type="password" placeholder="PW" onChange={(e) => setPw(e.target.value)} required/>
                </FloatingLabel>
                <Button variant="light" type="submit" style={{display:'none'}} />
            </Form>
        </NotRequireAuth>
    );
}

export default Login;