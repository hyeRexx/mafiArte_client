import React from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';

let videostyle = {
    width: "30%",
    marginTop: "3rem",
    marginLeft: "3rem"
}

const Video = () => {
    let img = "";
    let [imgURL , imgURLstate] = useState("");

    useEffect(()=> {
        try {
            axios.get('/api/ingame/video').then(res => {
                console.log(res);
                console.log(res.data[0][0].profile_img);
                img = res.data[0][0].profile_img;       // 파일명.png 받아옴
                imgURLstate("/img/" + img);             // imgURL state 변경
            });
        } catch(err) {
            console.log(JSON.stringify(error));
        }
    })

    return (
        <>
        <Table striped bordered hover variant="dark" style={videostyle}>
            <thead>
                <tr>
                    <th colSpan={3}>Host</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th colSpan={3}><img src={imgURL}/></th>
                </tr>
                <tr>
                    <th colSpan={3}>ME</th>
                </tr>
                <tr>
                    <th colSpan={3}><img src={imgURL}/></th>
                </tr>
                <tr>
                    <th colSpan={3}>OTHERS</th>
                </tr>
                <tr>
                    <td>1번</td>
                    <td>2번</td>
                    <td>3번</td>
                </tr>
                <tr>
                    <td>4번</td>
                    <td>5번</td>
                    <td>6번</td>
                </tr>
            </tbody>
        </Table>

        </>
    );
}

export default Video;