/**
 * Jack
 * 
 * Login이 필요하지 않은 페이지 (ex. Login페이지)의 경우
 * 페이지 접근시 바로 /lobby로 이동하도록 NotRequireAuth 생성
 * 
 * 반대로 Login이 필요한 페이지의 경우 로그인 상태 확인 후
 * / (Main) 페이지로 이동하도록 함
 * => 로그인시 접근했던 페이지로 자동 이동됨
 */

import React, { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserId } from "../store";
import Ingame from '../components/Ingame'

// 로그인 불필요한 페이지 (Login 되어있는 상태로 login 시도)
const NotRequireAuth = ({ children }) => {
    // redux 및 sessionStorage에서 userid 획득 및 인증 확인
    const dispatch = useDispatch();
    let user = useSelector((state) => state.user.id);
    if (!user) {
        user = sessionStorage.getItem('userid');
        dispatch(setUserId(user));
    }
    const authenticated = user? true: false;
    
    // 인증이 이미 된 경우 로비로 이동
    if(authenticated) {
        return <Navigate to='/lobby'/ >;
    } 
    
    return children;
};

// 로그인이 필요한 페이지
const RequireAuth = ({ Component }) => {
    // redux 및 sessionStorage에서 userid 획득 및 인증 확인
   
    const params = useParams();
    const dispatch = useDispatch();
    const location = useLocation();
    let user = useSelector((state) => state.user.id);
    if (!user) {
        user = sessionStorage.getItem('userid');
        dispatch(setUserId(user));
    }
    const authenticated = user? true: false;

    // 로그인이 안된 경우 메인으로 이동
    if (!authenticated){
        return <Navigate to="/" state={{ from: location }} replace />
    }
    
    // Ingame 컴포넌트인 경우 roomId를 넘겨줌
    return (
        Component == Ingame?
        <Component roomId={params.roomId}/>
        :<Component />);
};
export { RequireAuth, NotRequireAuth };