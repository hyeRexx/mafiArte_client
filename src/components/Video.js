import React, { useEffect, useRef, useState } from 'react';
import style from '../css/Video.module.css'


const Video = ({stream, width, height, muted, isTurn}) => {
  const ref = useRef();
  useEffect(()=>{
    ref.current.srcObject = stream;
    ref.current.muted = muted;
  }, [stream, muted]);
  return (
    <div>
      <video className={isTurn? style.gradientborder: null} ref={ref} autoPlay playsInline style={{objectFit: "cover", transform:"scaleX(-1)", borderRadius: 3}} width={width} height={height} />
    </div>
  );
};

export default Video;