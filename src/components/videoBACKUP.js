<Table bordered hover variant="dark" style={{width: "500px", height: "1000px"}}>
                <tbody>
                    <tr>
                        <th colSpan={3}>
                            {videos[0].userid? videos[0].userid: "DRAWING"} // 제거 가능
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}>
                            {videos[0].stream? 
                                <Video stream={videos[0].stream} width={"100%"} height={"297px"}/> // 사이즈 확인 필요  
                                :<img style={{opacity:videos[0].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </th>
                    </tr>
                    <tr>
                    <th colSpan={3}>
                            {videos[1].userid === myId? "ME": "OBSERVING"}
                        </th>
                    </tr>
                    <tr> 
                        <th style={{textAlign: "center", height: "321px"}} colSpan={3}> 
                            {videos[1].stream?   
                                <Video stream={videos[1].stream} width={"100%"} height={"297px"} />
                                :<img style={{opacity:videos[1].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>OTHERS</th>
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[2].stream? changeVideo(2, 1): null)}>
                            {videos[2].stream? 
                                <Video stream={videos[2].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[2].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[3].stream? changeVideo(3, 1): null)}>
                            {videos[3].stream? 
                                <Video stream={videos[3].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[3].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[4].stream? changeVideo(4, 1): null)}>
                            {videos[4].stream? 
                                <Video stream={videos[4].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[4].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td> 
                    </tr>
                    <tr> 
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[5].stream? changeVideo(5, 1): null)}>
                            {videos[5].stream? 
                                <Video stream={videos[5].stream} width={"100%"} height={"93.5px"}/>
                                :<img style={{opacity:videos[5].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[6].stream? changeVideo(6, 1): null)}>
                            {videos[6].stream? 
                                <Video stream={videos[6].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[6].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td>
                        <td style={{textAlign: "center", width: "166.33px", height: "117px"}} onClick={() => (videos[7].stream? changeVideo(7, 1): null)}>
                            {videos[7].stream? 
                                <Video stream={videos[7].stream} width={"100%"} height={"93.5px"}/> 
                                :<img style={{opacity:videos[7].userid? "100%": "0%"}} height="100%" src={imgURL}/>}
                        </td> 
                    </tr>
                </tbody>
            </Table>



// ingame nav
<Navbar bg="light" expand="lg">
                        <Container fluid>
                            <Navbar.Toggle aria-controls="navbarScroll" />
                            <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100px' }}
                                navbarScroll>
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