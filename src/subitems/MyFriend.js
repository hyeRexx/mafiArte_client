import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './css/MyFriend.module.css';
import { FriendInfoDelete } from '../store';

const MyFriend = () => {
    const dispatch = useDispatch();
    const myId = useSelector(state => state.user.id);
    const FriendInfo = useSelector((FriendInfo) => FriendInfo.FriendInfo);
    const Friends = Object.keys(FriendInfo);

    const FriendDelete = (id) => {
        axios.post(`${paddr}api/lobby/friendDel`, {delid: id, userid: myId}, reqHeaders)
        .then((res) => {
            if (res.data == "SUCCESS"){
                dispatch(FriendInfoDelete(id));
            }
            console.log("서버에서 받은 userId:   ", res.data);
        })
        .catch((e) => {
            console.log(e);
        });
    }

    return (
        <div className={style.friendBox}>
            <div className={style.friendTitle}> my friend </div>

            <div className={style.searchBox}>
                <input className={style.searchInput} placeholder="아이디를 입력하세요"/>
                <input className={style.submitInput} type="submit"/>
            </div>

            <div className={style.friendList}>
                <div className={style.singleFriendBox}>
                    {Friends.length ? <> {Friends.map((id)=> {
                        return (
                            <div className={style.singleFriend}>
                                <div className={`${FriendInfo[id][0] ? style.friendOn: style.friendOff}`}></div>
                                {/* for jinho : img src에 profile img 넣어 주세요 */}
                                <img src={`/img/${FriendInfo[id][1]}`} className={style.friendProfile}></img>
                                <div className={style.friendId}>{id}</div>
                                <div className={style.deleteFriend} style={{color : "white"}} onClick={() => {FriendDelete(id)}}>딜리트</div>
                            </div>
                        );
                    })} </> : <h2 style={{color : "white"}}> 친구를 추가해주세요. </h2>}

                    {/* for jinho : sigleFriend 블럭이 하나의 리스트가 됨 */}

                </div>
            </div>

            <div className={style.addNewFriend}>

            </div>
        </div>
    )
}

export default MyFriend;