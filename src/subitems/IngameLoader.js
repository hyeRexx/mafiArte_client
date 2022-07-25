import React, { useState, useEffect } from 'react';
import style from './css/IngameLoader.module.css';

const IngameLoader = () => {
    return (
        // <div className="loadingwindow">
        //     <div className="car">
        //         <div className="strike"></div>
        //         <div className="strike strike2"></div>
        //         <div className="strike strike3"></div>
        //         <div className="strike strike4"></div>
        //         <div className="strike strike5"></div>
        //         <div className="cardetail spoiler"></div>
        //         <div className="cardetail back"></div>
        //         <div className="cardetail center"></div>
        //         <div className="cardetail center1"></div>
        //         <div className="cardetail front"></div>
        //         <div className="cardetail wheel"></div>
        //         <div className="cardetail wheel wheel2"></div>
        //     </div>

        //     <div className="text">
        //         <span>Loading</span><span className = "dots">...</span>
        //     </div>
        // </div>

        <div className={style.loadingWindow}>
            <div className={style.car}>
                <div className={style.strike}></div>
                <div className={style.strikeStrike2}></div>
                <div className={style.strikeStrike3}></div>
                <div className={style.strikeStrike4}></div>
                <div className={style.strikeStrike5}></div>
                <div className={style.carDetailSpoiler}></div>
                <div className={style.carDetailBack}></div>
                <div className={style.carDetailCenter}></div>
                <div className={style.carDetailCenter1}></div>
                <div className={style.carDetailFront}></div>
                <div className={style.carDetailWheel}></div>
                <div className={style.carDetailWheel2}></div>
            </div>

            <div className={style.text}>
                <span>잠입하는 중</span><span className={style.dots}>...</span>
            </div>
        </div>
    );
};

export default IngameLoader;