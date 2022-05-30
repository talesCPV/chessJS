const board = new Object
  board.width = 600
  board.height = 600
  board.edge = 20
  board.square = [(board.width - 2*board.edge)/8, (board.height - 2*board.edge)/8 ]  
  board.white = [240,238,241]
  board.black = [112,134,184]
  board.sprites = [[],[]]
  board.pieces = []
  board.options = []
  board.select = 'no'

function preload(){
  spritedata = loadJSON('assets/Pieces.json');
  spritesheet = loadImage('assets/Pieces.png');
}

function setup() {
    createCanvas(board.width, board.height);
    stroke(255);

    for(let i=0; i<6; i++){
      let pos = spritedata.pieces[i].position;
      board.sprites[0].push(spritesheet.get(pos.x,pos.y,pos.w,pos.h))
      board.sprites[1].push(spritesheet.get(pos.x,pos.y1,pos.w,pos.h))
    }

    for(let y=0; y<8; y++){
      board.pieces.push([])
      for(let x=0; x<8; x++){
        board.pieces[y].push([-1,-1])
      }
    }
    resetBoard()
}

function draw() {

  background(board.white);
  drawBoard()
  markPos()

}

function mousePressed() {

  if(mouseX >= board.edge && mouseX <= board.width - board.edge){
    if(mouseY >= board.edge && mouseY <= board.width - board.edge){
      x = Math.floor((mouseX - board.edge) / board.square[0])
      y = Math.floor((mouseY - board.edge) / board.square[1])
      newPos = convertNote([x,y],'toNote')

      if(board.select == 'no'){
        board.select = newPos
      }else{        
        if(board.options.includes(newPos)){
          board.pieces = change(board.select,newPos)
        }        
        board.select = 'no'          
      }        
    }
  }
  board.options = options(board.select)
}

function resetBoard(){
  for(let i=0; i<8; i++){
    board.pieces[0][i] = i<3 ? [4-i,1]  : [i-3,1]  
    board.pieces[1][i] = [5,1]  
    board.pieces[6][i] = [5,0]
    board.pieces[7][i] = i<3 ? [4-i,0]  : [i-3,0]  
  }
}

function drawBoard(){

  stroke(board.black)
  noFill()

  for(let x=0; x<8; x++){
    text(8-x,board.edge/2,(x+1) * board.square[0])
    text(String.fromCharCode(65+x),(x+1) * board.square[1] - board.square[0]/3 ,board.height)
    for(let y=0; y<8; y++){           
      if((x+y)%2){
        fill(board.black)
      }else{
        noFill()
      }      
      rect(board.edge+(x * board.square[0]), board.edge+(y * board.square[1]),board.square[0],board.square[1])
      if(board.pieces[y][x][0] >= 0){
        plot(board.pieces[y][x][1],board.pieces[y][x][0],x,y)
      }
    }
  }

}

function plot(color,piece,x,y){

    px = board.edge + x * board.square[0]
    py = board.edge + y * board.square[1]
    img = board.sprites[color][piece]

    push()
      translate(px+5, py+5);
      scale(board.square[0]/(img.width + 10),board.square[1]/(img.height + 10));
      image(img,0,0);
    pop()

}

function convertNote(N,DIR='toPos'){
  let resp
  if(DIR == 'toPos'){ // toPos / toNote
    resp = [0,0]
    resp[0] = N.charCodeAt(0) - 97
    resp[1] = 8 - N[1]
  }else{
    resp = String(String.fromCharCode(97+N[0])+(8-N[1]))
  }
  return resp
}

function markPos(){

  function drawSquare(x,y,color){
    px = board.edge + x * board.square[0]
    py = board.edge + y * board.square[1]
    stroke(color)
    noFill()
    push()
      translate(px, py);
      rect(0,0,board.square[0],board.square[1])
    pop()  
  }

  strokeWeight(3);

  for(let i=0; i<board.options.length; i++){
    let pos = convertNote(board.options[i])
    drawSquare(pos[0],pos[1],[0,255,0])
  }

  if(board.select != 'no'){
    let newPos = convertNote(board.select)
    drawSquare(newPos[0],newPos[1],[255,0,0])    
  }

  strokeWeight(1);
}

function change(A,B){
  console.log(A+','+B)

  out = board.pieces
  A = convertNote(A)
  B = convertNote(B)
  out[B[1]][B[0]] = board.pieces[A[1]][A[0]]
  out[A[1]][A[0]] = [-1,-1]
  return out
}

function options(pos){

  function check(x,y){ // return [can get / can continue] 
    if(x>=0 && x<8 && y>=0 && y<8){
      PIECE = board.pieces[y][x][0]
      COLOR = board.pieces[y][x][1]    
      return  PIECE < 0 ? [true,true] : COLOR != val[1] ? [true,false] : [false,false]  
    }
    return [false,false]
  }

  function run(S,Q=20){

    function look(run_x,run_y){
      x = pos[0]
      y = pos[1]
      q = Q
      while(x>=0 && x<8 && y>=0 &&y<8 && q>0){
        x += run_x
        y += run_y
        q--
        follow = check(x,y)
        follow[0] ? opt.push(convertNote([x,y],'toNote')) : 0
        x = follow[1] ? x : -1
      }
    }

    if(S[0] == 'D'){
      look(-1,-1)
      look(1,-1)
      look(1,1)
      look(-1,1)
    }

    if(S[0] == 'S'){          
      look(1,0)
      look(-1,0)
      look(0,1) 
      look(0,-1)
    }

    if(S[0] == 'K'){
      Q=1
      look(2,1)
      look(2,-1)
      look(-2,1)
      look(-2,-1)
      look(1,2)
      look(-1,2)
      look(1,-2)
      look(-1,-2)
    }

    if(S[0] == 'P'){
      
      if(!val[1]){ // white
        y_ = -1
      }else{       // black
        y_ = 1
      }

      Q = (pos[1] == 6 || pos[1] == 1) && check(pos[0],pos[1] + y_* 2)[1] ? 2 : 1 // start position  
      front = check(pos[0]  ,pos[1] +y_)
      right = check(pos[0]+1,pos[1] +y_)
      left  = check(pos[0]-1,pos[1] +y_)
      
      front[1] ? look(0,y_) : 0
      Q=1
      right[0] && !right[1] ? look(1,y_) : 0
      left[0]  && !left[1]  ? look(-1,y_) : 0
    }
  }

  opt = []

  if(pos != 'no'){
  
    pos = convertNote(pos)  
    val = board.pieces[pos[1]][pos[0]]
  
    switch(val[0]){
      case 0: // Queen
        run('D1')
        run('S1')
      break
      case 1: // King
        run('D1',1)
        run('S1',1)
      break
      case 2: // Bishop
        run('D1')
      break
      case 3: // Knight
      run('K1')
      break
      case 4: // Rock
        run('S1')
      break
      case 5: // Pawn
        run('P1')
    }

  }
  return opt
}

function checkMoves(BOARD,COLOR){ // all moves possible by color
  let out = []
  for(let y=0; y<8; y++){
    for(let x=0; x<8; x++){
      if(BOARD[y][x][1] == COLOR){
        move = new Object
        move.start = convertNote([x,y],'toNote')
        move.end = options(move.start)
        move.value = 10 - BOARD[y][x][0]
        out.push(move)
      }
    }
  }

  return out

}

function checkAtack(pos, moves){ // Who can get this pos?

  out = []

  for( let i=0; i<moves.length; i++){
    if(moves[i].end.includes(pos)){
      out.push([moves[i].start,moves[i].value])
    }

  }

  return out
}


