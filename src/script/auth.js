import React, { useEffect } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserId } from "../store";

const NotRequireAuth = ({ children }) => {
    const navigate = useNavigate();
    let user = useSelector((state) => state.user.id);
    if (!user) {
        user = sessionStorage.getItem('userid');
        setUserId(user);
    }
    const authenticated = user? true: false;
    
    if(authenticated) {
        return <Navigate to='/lobby'/ >;
    } 
    
    return children;
}

const RequireAuth = ({ children }) => {
    const location = useLocation();
    let user = useSelector((state) => state.user.id);
    if (!user) {
        user = sessionStorage.getItem('userid');
        setUserId(user);
    }
    const authenticated = user? true: false;

    if (!authenticated) {
        return <Navigate to="/" state={{ from: location }} replace />
    }
    return children;
}

export { RequireAuth, NotRequireAuth };