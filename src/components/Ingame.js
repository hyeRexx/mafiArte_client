import React from 'react';
import Canvas from './Canvas';
import Video from './Video';
import Videotest from './videotest';
import Chat from './Chat';
import style from "../css/Ingame.module.css";
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const Ingame = () => {
    return (
        <div className={style.flexBox}>
            <div className={style.item1}>
                <Video/>
            </div>
            <div className={style.item2}>
                <div>
                    <Navbar bg="light" expand="lg">
                        <Container fluid>
                            <Navbar.Toggle aria-controls="navbarScroll" />
                            <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100px' }}
                                navbarScroll
                            >
                                <Nav.Link href="#action1">INVITATION</Nav.Link>
                                <Nav.Link href="#action2">REPORT</Nav.Link>
                                <Nav.Link href="#action3">SETTING</Nav.Link>
                            </Nav>
                            <div className="d-flex">
                                <Nav.Link>WORD(제시어)</Nav.Link>     
                                <Nav.Link>TIMER(타이머)</Nav.Link> 
                            </div>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>           
                </div>
                <div className={style.canvaschat}>
                    <div className={style.canvas}>
                        <Canvas roomName={2}/>
                    </div>
                    {/* <div className={style.draw}>
                        드로잉툴 들어갈 곳
                    </div> */}
                </div>
                <div className={style.chat}>
                    <Chat roomName={2}/>
                </div> 
            </div>
            {/* <Videotest/> */}
            {/* <Chat className={style.chat} roomName={2}/> */}
        </div>
    );
}

export default Ingame;