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
    const [id, setId] = useState("");
    const [phId, setPhId] = useState("ID");
    const [pw, setPw] = useState("");
    const [phPw, setPhPw] = useState("PASSWORD");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || "/lobby";

    const onSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/auth/login', {userid: id, password: pw})
            .then(async (res)=>{
                if (res.data === 'success') {
                    await dispatch(setUserId(id));
                    sessionStorage.setItem('userid', id);
                    navigate(from, { replace: true });
                } else if (res.data === 'INVALID_ID') {
                    setPhId('ID : 유효하지 않은 ID 입니다');
                } else if (res.data === 'INVALID_PW') {
                    setPhId('ID');
                    setPhPw('PASSWORD : 유효하지 않은 PASSWORD 입니다');
                }
            });
    };

    return (
        <NotRequireAuth>
            <Form onSubmit={onSubmit}>
                <FloatingLabel
                    controlId="floatingInput"
                    label={phId}
                    className="mb-3"
                >
                    <Form.Control type="userid" placeholder="ID" onChange={(e) => setId(e.target.value)} required autoFocus/>
                </FloatingLabel>

                <FloatingLabel
                    controlId="floatingPassword"
                    label={phPw}
                    className="mb-3"
                >
                    <Form.Control type="password" placeholder="PW" onChange={(e) => setPw(e.target.value)} required/>
                </FloatingLabel>
                <Button variant="light" type="submit" style={{display:'none'}} />
            </Form>
        </NotRequireAuth>
    );
}

export default Login;