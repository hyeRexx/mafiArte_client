import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
// const socket = io.connect("http://localhost:3000"); // props로 socket받아옴
import {socket} from '../script/socket';

const Videotest = () => {

  let myStream;

  const myvideo = useRef();

  async function initCall() {
    await getMedia();
  }

  async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            // if(currentCamera.label === camera.label) cameras.value = camera.deviceId;
            // camerasSelect.append(option);
        })
    }
    catch(e) {
        console.log(e);
    }
  } 

  async function getMedia(deviceId){
      try {
          myStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: deviceId ? { deviceId } : true
          });
          myvideo.current.srcObject = myStream;
          if(!deviceId) {
              getCameras();
          }
          // setMute(true);
      }
      catch(e) {
          alert(e);
          console.log(e);
      }
  }
       
  useEffect(()=>{
     console.log("video test!!")
    //  console.log(myvideo)
     initCall();
    }, [])

  return <video ref={myvideo} autoPlay playsInline width="400px" height="250px" />
};

export default Videotest;