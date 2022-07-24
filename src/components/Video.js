import React, { useEffect, useRef } from 'react';

const Video = ({stream, width, height, muted}) => {
  const ref = useRef();
  useEffect(()=>{
    ref.current.srcObject = stream;
    ref.current.muted = muted;
  }, []);
  return (
    <div>
      <video ref={ref} autoPlay playsInline style={{objectFit: "cover", transform:"scaleX(-1)", borderRadius: 3}} width={width} height={height} />
    </div>
  );
};

export default Video;