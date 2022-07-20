function App () {
	let [글제목, 글제목변경] = useState(['트렌치 코트 추천', '아동 신발 추천', '주방 용품 추천'])
    let [숫자, 숫자변경] = useState(0)
  	let [modal, setModal] = useState(false);
	return(
    <div className='App'>
      <div className='list'>
        <h4>{글제목[0]}</h4>
      </div>
      <div className='list'>
        <h4>{글제목[1]}</h4>
      </div>
      <div className='list'>
        <h4 onClick={()=>{setModal(true)}}>
          {글제목[2]}</h4>
      </div>

      {
      	modal == true ? <Modal /> : null  //기계역할
      }

    </div>
  )
}

function Modal(){
  return(
    <div className='modal'>
      <h4>제목</h4>
      <p>날짜</p>
      <p>상세내용</p>
    </div>
  )
}