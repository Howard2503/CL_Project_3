const socket = io();

const audio = document.getElementById('bgMusic');
const musicFiles =['music/song_1.mp3','music/song_2.mp3','music/song_3.mp3']

const playButton=document.getElementById('playButton');

let playerInfo = null; // 存储当前玩家信息

// 获取棋盘和麻将牌区域
const board = document.getElementById("game-board");
const mahjongTiles = document.getElementById("mahjong-tiles");
const player = document.getElementById("player-role");

// 接收初始数据（棋盘状态和玩家信息）
socket.on("initBoard", ({ boardState, playerInfo: info }) => {
  playerInfo = info; // 保存当前玩家信息

  // 显示玩家角色
  displayPlayerRole(playerInfo.role);


  console.log("Player Info:", playerInfo); // 调试信息
  renderBoard(boardState);
});

// 监听棋盘更新事件
socket.on("updateBoard", ({ index, tile, playerRole }) => {
  updateTileByRole(index, tile, playerRole);
});

function playRandomMusic(){
  const randomIndex = Math.floor(Math.random()*musicFiles.length);
  audio.src = musicFiles[randomIndex];
}

playButton.addEventListener('click',()=>{
  playRandomMusic();
  audio.play();
})


//bgm load
function preload(){
  song1=loadSound("music/song_1.mp3");
  song2=loadSound("music/song_2.mp3");
  song3=loadSound("music/song_3.mp3");
  console.log("song loaded!");
}

function setup(){
  
}

// 显示玩家角色
function displayPlayerRole(role) {
  if (role == "Player_1") {
    player.style.borderColor = "blue";
  } else if (role == "Player_2") {
    player.style.borderColor = "red";
  } else {
    player.style.borderColor = "grey";
  }
  player.textContent = `You are: ${role}`;
}

function renderBoard(boardState) {
  board.innerHTML = ""; // 清空棋盘
  boardState.forEach((cell, index) => {
    const tileElement = document.createElement("div");
    tileElement.className = "tile";
    tileElement.dataset.index = index;
    if (index < 50) {
      tileElement.style.backgroundColor = "Pink";
    } else {
      tileElement.style.backgroundColor = "LightBlue";
    }

    if (cell) {
      const { tile, playerRole } = cell; // 棋子和玩家信息
      const img = document.createElement("img");
      img.src = `images/${tile}.png`;
      img.alt = tile;
      tileElement.appendChild(img);

      // 根据玩家信息设置样式
      tileElement.style.borderColor = getPlayerColorByRole(playerRole);
    }

    tileElement.addEventListener("dragover", handleDragOver);
    tileElement.addEventListener("drop", handleDrop);
    board.appendChild(tileElement);
  });
}

// 更新棋盘单个格子的内容（包含玩家区分）
function updateTile(index, tile, playerId) {
  const tileElement = document.querySelector(`[data-index="${index}"]`);
  if (tileElement) {
    tileElement.innerHTML = ""; // 清空格子内容
    const img = document.createElement("img");
    img.src = `images/${tile}.png`;
    img.alt = tile;
    tileElement.appendChild(img);

    // 使用颜色区分不同玩家
    tileElement.style.borderColor = getPlayerColor(playerId);
  }
}

function updateTileByRole(index, tile, playerRole) {
  const tileElement = document.querySelector(`[data-index="${index}"]`);
  if (tileElement) {
    tileElement.innerHTML = ""; // 清空格子内容
    const img = document.createElement("img");
    img.src = `images/${tile}.png`;
    img.alt = tile;
    tileElement.appendChild(img);

    // 使用颜色区分不同玩家
    tileElement.style.borderColor = getPlayerColorByRole(playerRole);
  }
}

// 处理拖拽开始
mahjongTiles.addEventListener("dragstart", (event) => {
  const tile = event.target.closest(".tile").dataset.tile; // 获取麻将牌类型
  event.dataTransfer.setData("tile", tile); // 存储麻将牌类型
});

// 允许拖拽经过棋盘格子
function handleDragOver(event) {
  event.preventDefault(); // 默认行为会禁止拖拽，需显式阻止
}

// 处理放置麻将牌
function handleDrop(event) {
  event.preventDefault();
  const tile = event.dataTransfer.getData("tile");
  const index = parseInt(event.target.dataset.index);

  if (tile && !event.target.textContent && playerInfo.role != "Spectator") {
    if (index < 50 && playerInfo.role == "Player_2") {

      // 本地更新
      updateTileByRole(index, tile, playerInfo.role);

      // 通知服务器
      socket.emit("moveTile", { index, tile, playerRole: playerInfo.role });
    }
    if (index >= 50 && playerInfo.role == "Player_1") {

      // 本地更新
      updateTileByRole(index, tile, playerInfo.role);

      // 通知服务器
      socket.emit("moveTile", { index, tile, playerRole: playerInfo.role });
    }
  }
}

// 获取玩家颜色（需要后端发送玩家 ID）
function getPlayerColor(playerId) {
  return playerId === playerInfo.id ? playerInfo.color : "red"; // 当前玩家为蓝色，其他玩家为红色
}

function getPlayerColorByRole(playerRole) {
  if (playerRole == "Player_1") {
    return "blue";
  } else if (playerRole == "Player_2") {
    return "red";
  } else {
    return "grey";
  }
}