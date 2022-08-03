import React, { useState, useEffect } from 'react';
import style from './css/MyFriend.module.css';

const MyFriend = () => {
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

            </div>
        </div>
    )
}

export default MyFriend;