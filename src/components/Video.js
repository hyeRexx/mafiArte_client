import React from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useState } from 'react';
import { useEffect } from 'react';
// import io from 'socket.io-client';

let videostyle = {
    width: "500px",
    height: "1000px"
}

const Video = () => {
    let img = "";
    let [imgURL , imgURLstate] = useState("");

    useEffect(()=> {
        try {
            axios.get('/api/ingame/video').then(res => {
                img = res.data[0][0].profile_img;       // 파일명.png 받아옴
                imgURLstate("/img/" + img);             // imgURL state 변경
            });
        } catch(e) {
            console.log(JSON.stringify(e));
        }
        
    })

    return (
        <>
         <Table bordered hover variant="dark" style={{width: "500px", height: "1000px"}}>
                <tbody>
                    <tr>
                        <th colSpan={3}>
                            {/* {videos[0].userid? videos[0].userid: "DRAWING"} */}
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}>
                            {/* {videos[0].stream? 
                                <Video stream={videos[0].stream} width={"100%"} height={"297px"}/>  
                                :<img style={{opacity:videos[0].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </th>
                    </tr>
                    <tr>
                    <th colSpan={3}>
                            {/* {videos[1].userid === myId? "ME": "OBSERVING"} */}
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}> 
                            {/* {videos[1].stream?   
                                <Video stream={videos[1].stream} width={"100%"} height={"297px"} />
                                :<img style={{opacity:videos[1].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>OTHERS</th>
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[2].stream? 
                                <Video stream={videos[2].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[2].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[3].stream? 
                                <Video stream={videos[3].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[3].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[4].stream? 
                                <Video stream={videos[4].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[4].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td> 
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[5].stream? 
                                <Video stream={videos[5].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[5].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[6].stream? 
                                <Video stream={videos[6].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[6].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}}>
                            {/* {videos[7].stream? 
                                <Video stream={videos[7].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[7].userid? "100%": "0%"}} height="100%" src={imgURL}/>} */}
                        </td> 
                    </tr>
                </tbody>
            </Table>


        </>
    );
}

export default Video;