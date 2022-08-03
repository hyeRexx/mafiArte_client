import React, { useState, useEffect } from 'react';
import style from './css/MyFriend.module.css';
import inviteCardStyle from './css/InviteCard.module.css';
import CloseBtn from './CloseBtn';
import axios from 'axios';
import { paddr, reqHeaders } from '../proxyAddr';

const MyFriend = ({showFriendAddModal, choosestate}) => {
    const handleAddButton = (e) => {
        e.preventDefault();
        showFriendAddModal(true);
        choosestate(false);
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

                    {/* for jinho : sigleFriend 블럭이 하나의 리스트가 됨 */}
                    <div className={style.singleFriend}>
                        <div className={style.friendOn}></div>
                        {/* for jinho : img src에 profile img 넣어 주세요 */}
                        <img src="/profile/profile_006.png" className={style.friendProfile}></img>
                        <div className={style.friendId}>{/* for jinho : userId */}wooyoungwoo</div>
                        <div className={style.deleteFriend}></div>
                    </div>

                    <div className={style.singleFriend}>
                        <div className={style.friendOn}></div>
                        <img src="/profile/profile_002.png" className={style.friendProfile}></img>
                        <div className={style.friendId}>wooyoungwoo</div>
                        <div className={style.deleteFriend}></div>
                    </div>

                </div>
            </div>

            <div className={style.addNewFriend}>
                <button className={style.friendAddBtn} onClick={handleAddButton}>
                    <span className={style.addText}>ADD</span>    
                    <span className={style.addIco}></span>
                </button>
            </div>
        </div>
    )
}

const FriendAddModal = ({showFriendAddModal}) => {
    const [ show, setShow ] = useState(true);
    const [ inputText, setInputText ] = useState("");
    const handleClose = (e) => {
        e?.preventDefault();
        setShow(false);
        showFriendAddModal(false);
    };

    // MAKE A GAME 버튼 - 초대 보내는 버튼
    const handleAddBtn = (e) => {
        e.preventDefault();
        if (inputText !== "" && inputText.length >= 4) {
            axios.post(`${paddr}api/lobby/addfriend`, {userid: inputText}, reqHeaders).then(res => {
                if (res.data === "SUCCESS") {
                    alert(`${inputText} 님이 친구로 추가되었습니다`);
                } else if (res.data === "INVALID_USER") {
                    alert(`존재하지 않는 유저입니다.`);
                } else if (res.data === "ALREADY_EXIST") {
                    alert(`${inputText} 님은 이미 친구로 등록되어있습니다`);
                }
            }).catch(err => console.log(err));
        }
    };

    return (
            <div className={style.FriendAddModal} show={show} onHide={handleClose}>
                <div className={style.FriendAddModalClose} onClick={handleClose}><CloseBtn/></div>
                <div className={style.FriendAddModalTitle}>ADD FRIEND</div>

                <div className={style.inputBox}>
                    <input className={style.input} onChange={(e)=>{setInputText(e.target.value)}} placeholder="친구 아이디를 입력하세요"/>
                </div>
                <div className={style.addNewFriend} style={{position: "absolute", right: "20px", top: "100px"}}>
                    <button className={style.friendAddBtn} onClick={handleAddBtn}>
                    <span className={style.addText}>ADD</span>    
                    <span className={style.addIco}></span>
                </button>
            </div>
            </div>
    );
};

export default MyFriend
export {FriendAddModal};