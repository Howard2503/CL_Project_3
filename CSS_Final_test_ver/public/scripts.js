const socket = io();
const guide1 = document.getElementById('guide1');
const guide2 = document.getElementById('guide2');
const guide3 = document.getElementById('guide3');

const beginCard=document.querySelector('#beginCard')
const Card1=document.querySelector('#Card1');
const Card2=document.querySelector('#Card2');
const Card3=document.querySelector('#Card3');
const TUTORIALSEC=document.querySelectorAll('.TUTORIALSEC')

guide1.addEventListener('click',()=>{
  beginCard.style.display='none';
  Card1.style.display='flex';
})

guide2.addEventListener('click',()=>{
  Card1.style.display='none';
  Card2.style.display='flex';
})

guide3.addEventListener('click',()=>{
  Card2.style.display='none';
  Card3.style.display='flex';
  TUTORIALSEC.style.top='0px';
})




// 接收棋盘更新事件
socket.on("updateBoard", ({ index, tile, playerRole }) => {
  boardState[index] = { tile, playerRole };
});

socket.on("updateBoardNew", ({ col, row, tile, playerRole }) => {
  if (playerRole == "Player_1" && playerRole != playerInfo.role) {
    playerOnePieces.push(new Piece(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, 'Player_1', tile));
  } else if (playerRole == "Player_2" && playerRole != playerInfo.role) {
    playerTwoPieces.push(new Piece(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, 'Player_2', tile));
  }
});