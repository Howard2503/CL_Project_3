const socket = io();

let playerInfo = null; // 当前玩家信息
let boardState = Array(100).fill(null); // 初始化棋盘状态
let canvasSize = 600; // 画布大小
let tileSize = 60; // 单个格子的大小
let cols = 10; // 棋盘列数
let rows = 10; // 棋盘行数
let currentTile = null; // 当前可以拖拽的麻将牌
const mahjongDeck = ["1_tiao", "1_tong", "1_wan", "2_tiao", "2_tong", "2_wan", "3_tiao", "3_tong", "3_wan", "4_tiao", "4_tong", "4_wan", "5_tiao", "5_tong", "5_wan", "6_tiao", "6_tong", "6_wan", "7_tiao", "7_tong", "7_wan", "8_tiao", "8_tong", "8_wan", "9_tiao", "9_tong", "9_wan"]; // 牌库

function setup() {
  createCanvas(canvasSize, canvasSize);
  noLoop(); // 禁用自动重绘
}

function draw() {
  background(255);
  drawBoard();
}

function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let index = row * cols + col;
      let x = col * tileSize;
      let y = row * tileSize;

      // 绘制格子
      stroke(0);
      fill(index < 50 ? 'pink' : 'lightblue'); // 根据玩家区域设置颜色
      rect(x, y, tileSize, tileSize);

      // 如果格子有麻将牌，绘制
      if (boardState[index]) {
        drawTile(boardState[index], x, y);
      }
    }
  }
}

function drawTile(tile, x, y) {
  // 绘制麻将牌背景
  fill(255);
  rect(x + 10, y + 10, tileSize - 20, tileSize - 20);

  // 加载并绘制麻将牌图片
  const img = loadImage(`images/${tile.tile}.png`);
  image(img, x + 10, y + 10, tileSize - 20, tileSize - 20);
}

// 显示玩家角色
function displayPlayerRole(role) {
  const playerRoleElement = document.getElementById("player-role");
  playerRoleElement.textContent = `Your role: ${role}`;
}

// 随机生成麻将牌
function generateTile() {
  const tile = mahjongDeck[Math.floor(Math.random() * mahjongDeck.length)];
  currentTile = tile;
  const tileElement = document.getElementById("current-tile");

  // 用图片代替文字表示麻将牌
  tileElement.innerHTML = `<img src="images/${tile}.png" alt="${tile}" style="width: 100%; height: 100%;">`;
}

// 接收初始数据（棋盘状态和玩家信息）
socket.on("initBoard", ({ boardState: newBoardState, playerInfo: info }) => {
  playerInfo = info;
  displayPlayerRole(playerInfo.role); // 显示玩家角色
  boardState = newBoardState;
  generateTile(); // 生成初始麻将牌
  redraw(); // 重绘棋盘
});

// 接收棋盘更新事件
socket.on("updateBoard", ({ index, tile, playerRole }) => {
  boardState[index] = { tile, playerRole };
  redraw(); // 更新棋盘后重绘
});

// 处理拖拽逻辑
const tileElement = document.getElementById("current-tile");

// 当玩家开始拖拽麻将牌时
tileElement.addEventListener("dragstart", (event) => {
  if (currentTile && playerInfo.role !== "Spectator") {
    event.dataTransfer.setData("tile", currentTile);
  }
});

// 允许拖拽经过棋盘
function handleDragOver(event) {
  event.preventDefault(); // 阻止默认行为以允许拖拽
}

// 当玩家在棋盘上释放麻将牌时
function handleDrop(event) {
  event.preventDefault();

  // 计算鼠标释放时的棋盘索引
  const col = Math.floor(event.clientX / tileSize);
  const row = Math.floor(event.clientY / tileSize);
  const index = row * cols + col;

  // 获取拖拽的麻将牌
  const tile = event.dataTransfer.getData("tile");

  // 确保玩家放置在自己的区域，并且该位置为空
  if (index >= 0 && index < boardState.length && playerInfo.role !== "Spectator") {
    const isValidMove = 
      (index < 50 && playerInfo.role === "Player_2") || 
      (index >= 50 && playerInfo.role === "Player_1");

    if (isValidMove && !boardState[index]) {
      // 更新本地棋盘状态
      boardState[index] = { tile, playerRole: playerInfo.role };

      // 通知服务器更新棋盘
      socket.emit("moveTile", { index, tile, playerRole: playerInfo.role });

      // 生成新的麻将牌
      generateTile();
      redraw();
    }
  }
}

// 为棋盘添加事件监听器
document.addEventListener("dragover", handleDragOver);
document.addEventListener("drop", handleDrop);