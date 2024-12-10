const socket = io();

const audio = document.getElementById('bgMusic');
const musicFiles = ['music/song_1.mp3', 'music/song_2.mp3', 'music/song_3.mp3']
const soundFiles = ['SFX/SFX_Drag1.wav', 'SFX/SFX_Drag2.mp3']
const sounds = [];
const volumeSlider = document.getElementById('volumeSlider');

const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const refButton = document.getElementById('ReferenceButton')
let isMusicPlaying = false; //add var去记录音乐是否正在播放.
let ReferenceisHidden = false;
let Reference = document.getElementById('overlay');

//给滑动条增加事件, 适时调整音量
volumeSlider.addEventListener('input', () => {
  const volume = volumeSlider.value; // 获取滑动条当前的值，即音量大小
  audio.volume = volume; // 设置背景音乐的音量
});

refButton.addEventListener('click', () => {
  if (ReferenceisHidden) {

    ReferenceisHidden = false; //标记已经打开reference
    refButton.textContent = "Close Reference";//替换按钮文本
    Reference.style.display = 'flex';
  } else {
    ReferenceisHidden = true;
    refButton.textContent = "Open Reference";//替换按钮文本
    Reference.style.display = 'none';
  }

})

let playerOnePieces = [];
let playerTwoPieces = [];
let playerInfo = null; // 当前玩家信息
let boardState = Array(64).fill(null); // 初始化棋盘状态
let canvasSize = 480; // 画布大小
let tileSize = 60; // 单个格子的大小
let cols = 8; // 棋盘列数
let rows = 8; // 棋盘行数
let currentTile = null; // 当前可以拖拽的麻将牌
let gameReady = false;
let mahjongDeck = ["1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan"]; // 牌库
let mahjongDeckBackup = ["1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan", "1_tiao", "1_tong", "1_wan",
  "2_tiao", "2_tong", "2_wan",
  "3_tiao", "3_tong", "3_wan",
  "4_tiao", "4_tong", "4_wan",
  "5_tiao", "5_tong", "5_wan",
  "6_tiao", "6_tong", "6_wan",
  "7_tiao", "7_tong", "7_wan",
  "8_tiao", "8_tong", "8_wan",
  "9_tiao", "9_tong", "9_wan"]; // 牌库

let images = {}; // 存储已加载的图片

function preload() {
  // 预加载所有麻将牌图片
  mahjongDeck.forEach((tile) => {
    images[tile] = loadImage(`images/${tile}.png`);
  });
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  loadSounds();
}

function draw() {
  background(255);
  drawBoard();

  if (playerOnePieces.length == 14 && playerTwoPieces.length == 14) {
    gameReady = true;
  }
  if (gameReady) {
    for (let piece of playerOnePieces) {
      piece.findTarget(playerTwoPieces); // 寻找目标
      piece.moveToTarget();          // 移动到目标
      piece.attackTarget();          // 攻击目标
      piece.display();               // 绘制棋子
    }
    for (let piece of playerTwoPieces) {
      piece.findTarget(playerOnePieces); // 寻找目标
      piece.moveToTarget();          // 移动到目标
      piece.attackTarget();          // 攻击目标
      piece.display();               // 绘制棋子
    }
    if (playerOnePieces.length == 0 && playerTwoPieces.length != 0) {
      console.log(`Player_2 wins!`);
    }
    if (playerTwoPieces.length == 0 && playerOnePieces.length != 0) {
      console.log(`Player_1 wins!`);
    }
    if (playerTwoPieces.length == 0 && playerOnePieces.length == 0) {
      console.log(`Draw!`);
    }
  } else {
    for (let piece of playerOnePieces) {
      if (playerInfo.role == "Player_1" || playerInfo.role == "Spectator") {
        piece.display();               // 绘制棋子
      }
    }
    for (let piece of playerTwoPieces) {
      if (playerInfo.role == "Player_2" || playerInfo.role == "Spectator") {
        piece.display();               // 绘制棋子
      }
    }
  }

  playerOnePieces = playerOnePieces.filter(piece => piece.health > 0);
  playerTwoPieces = playerTwoPieces.filter(piece => piece.health > 0);
}

function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let index = row * cols + col;
      let x = col * tileSize;
      let y = row * tileSize;

      // 绘制格子
      stroke(0);
      fill(index % cols < cols / 2 ? 'pink' : 'lightblue'); // 根据玩家区域设置颜色
      rect(x, y, tileSize, tileSize);
    }
  }
}

function drawTile(tile, x, y) {
  // 绘制麻将牌背景
  fill(255);
  rect(x + 10, y + 10, tileSize - 20, tileSize - 20);

  // 绘制麻将牌图片（从预加载的图片中获取）
  if (images[tile.tile]) {
    image(images[tile.tile], x + 10, y + 10, tileSize - 20, tileSize - 20);
  } else {
    console.warn(`Image for ${tile.tile} not loaded.`);
  }
}

// 显示玩家角色
function displayPlayerRole(role) {
  const playerRoleElement = document.getElementById("player-role");
  playerRoleElement.textContent = `Your role: ${role}`;
  if (role == "Player_1") {
    playerRoleElement.style.backgroundColor = 'lightblue';
    playerRoleElement.style.borderColor = 'lightblue'
  } else if (role == "Player_2") {
    playerRoleElement.style.backgroundColor = 'pink';
    playerRoleElement.style.borderColor = 'pink'
  } else {
    playerRoleElement.style.backgroundColor = 'grey';
    playerRoleElement.style.borderColor = 'grey';
  }
}

// 随机生成麻将牌
function generateTile() {
  console.log(`mahjongDeck.length: ${mahjongDeck.length}`);
  let randomTileIndex = Math.floor(Math.random() * mahjongDeck.length);
  const tile = mahjongDeck[randomTileIndex];
  console.log(`tile: ${tile}`);
  mahjongDeck.splice(randomTileIndex, 1);
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
  for (let i = 0; i < mahjongDeckBackup.length; i++) {
    mahjongDeck[i] = mahjongDeckBackup[i];
  }
  if (mahjongDeck.length == 108) {
    generateTile(); // 生成初始麻将牌
  }
  playerOnePieces = playerOnePieces.filter(piece => piece.health <= 0);
  playerTwoPieces = playerTwoPieces.filter(piece => piece.health <= 0);

  gameReady = false;
});

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

//播放背景音乐
function playRandomMusic() {
  const randomIndex = Math.floor(Math.random() * musicFiles.length);
  audio.src = musicFiles[randomIndex];
}

playButton.addEventListener('click', () => {
  if (!isMusicPlaying) {
    playRandomMusic();
    audio.play();
    isMusicPlaying = true; //标记已经开始播放音乐
    playButton.textContent = "Next Song";//替换按钮文本
    pauseButton.textContent = "Pause";
  } else {
    playRandomMusic();
    audio.play();
    pauseButton.textContent = "Pause";
  }
})

pauseButton.addEventListener('click', () => {
  if (!isMusicPlaying) {
    audio.play();
    isMusicPlaying = true;
    pauseButton.textContent = "Pause";
  } else {
    audio.pause()
    isMusicPlaying = false;
    pauseButton.textContent = "Play";
  }
})

function loadSounds() {
  soundFiles.forEach((file) => {
    const audio = new Audio(file);
    sounds.push(audio);
  });
}

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
  const col = Math.floor(mouseX / tileSize);
  const row = Math.floor(mouseY / tileSize);
  const index = row * cols + col;

  // 获取拖拽的麻将牌
  const tile = event.dataTransfer.getData("tile");

  // 确保玩家放置在自己的区域，并且该位置为空
  if (index >= 0 && index < boardState.length && playerInfo.role !== "Spectator") {
    const isValidMove =
      (index % 8 < cols / 2 && playerInfo.role === "Player_2" && playerTwoPieces.length < 14) ||
      (index % 8 >= cols / 2 && playerInfo.role === "Player_1" && playerOnePieces.length < 14);

    if (isValidMove && !gameReady) {
      // 更新本地棋盘状态
      boardState[index] = { tile, playerRole: playerInfo.role };

      if (playerInfo.role == "Player_1") {
        playerOnePieces.push(new Piece(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, 'Player_1', boardState[index]));
      } else if (playerInfo.role == "Player_2") {
        playerTwoPieces.push(new Piece(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, 'Player_2', boardState[index]));
      }

      // 通知服务器更新棋盘
      socket.emit("moveTile", { index, tile, playerRole: playerInfo.role });

      socket.emit("moveTileNew", { col, row, tile: boardState[index], playerRole: playerInfo.role });

      //播放SFX
      const selectedSound = sounds[0];
      selectedSound.play();

      // 生成新的麻将牌
      generateTile();
    }
  }
}


// 棋子类
class Piece {
  constructor(x, y, type, tile) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.health = 100;
    this.attack = 1;
    this.attackRange = 100;
    this.range = 1000;
    this.speed = 2;
    this.target = null;
    this.tile = tile;
    if (this.tile.tile == "1_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 200;
    }
    if (this.tile.tile == "2_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 210;
    }
    if (this.tile.tile == "3_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 220;
    }
    if (this.tile.tile == "4_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 230;
    }
    if (this.tile.tile == "5_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 240;
    }
    if (this.tile.tile == "6_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 250;
    }
    if (this.tile.tile == "7_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 260;
    }
    if (this.tile.tile == "8_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 270;
    }
    if (this.tile.tile == "9_tiao") {
      this.health = 100;
      this.attack = 10;
      this.attackRange = 280;
    }
    if (this.tile.tile == "1_tong") {
      this.health = 200;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "2_tong") {
      this.health = 210;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "3_tong") {
      this.health = 220;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "4_tong") {
      this.health = 230;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "5_tong") {
      this.health = 240;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "6_tong") {
      this.health = 250;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "7_tong") {
      this.health = 260;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "8_tong") {
      this.health = 270;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "9_tong") {
      this.health = 280;
      this.attack = 10;
      this.attackRange = 100;
    }
    if (this.tile.tile == "1_wan") {
      this.health = 100;
      this.attack = 20;
      this.attackRange = 100;
    }
    if (this.tile.tile == "2_wan") {
      this.health = 100;
      this.attack = 21;
      this.attackRange = 100;
    }
    if (this.tile.tile == "3_wan") {
      this.health = 100;
      this.attack = 22;
      this.attackRange = 100;
    }
    if (this.tile.tile == "4_wan") {
      this.health = 100;
      this.attack = 23;
      this.attackRange = 100;
    }
    if (this.tile.tile == "5_wan") {
      this.health = 100;
      this.attack = 24;
      this.attackRange = 100;
    }
    if (this.tile.tile == "6_wan") {
      this.health = 100;
      this.attack = 25;
      this.attackRange = 100;
    }
    if (this.tile.tile == "7_wan") {
      this.health = 100;
      this.attack = 26;
      this.attackRange = 100;
    }
    if (this.tile.tile == "8_wan") {
      this.health = 100;
      this.attack = 27;
      this.attackRange = 100;
    }
    if (this.tile.tile == "9_wan") {
      this.health = 100;
      this.attack = 28;
      this.attackRange = 100;
    }
  }

  // 寻找最近的目标
  findTarget(targets) {
    let closestDist = Infinity;
    this.target = null;
    for (let target of targets) {
      let d = dist(this.x, this.y, target.x, target.y);
      if (d < closestDist && d <= this.range) {
        closestDist = d;
        this.target = target;
      }
    }
  }

  // 移动到目标
  moveToTarget() {
    if (this.target) {
      let dx = this.target.x - this.x;
      let dy = this.target.y - this.y;
      let distToTarget = dist(this.x, this.y, this.target.x, this.target.y);

      if (distToTarget > this.attackRange) {
        this.vx = (dx / distToTarget) * this.speed;
        this.vy = (dy / distToTarget) * this.speed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }

      this.x += this.vx;
      this.y += this.vy;
    }
  }

  // 攻击目标
  attackTarget() {
    if (this.target) {
      let distToTarget = dist(this.x, this.y, this.target.x, this.target.y);
      if (distToTarget <= this.attackRange) { // 攻击距离
        this.target.health -= this.attack;
      }
      if (this.target.health <= 0) {
        const selectedSound = sounds[1];
        selectedSound.play();
      }
    }
  }

  // 绘制棋子
  display() {
    stroke(this.type === 'Player_1' ? 'blue' : 'red');
    fill(this.type === 'Player_1' ? 'rgba(173, 216, 230, 0.1)' : 'rgba(255, 192, 203, 0.1)');
    ellipse(this.x, this.y, 2 * this.attackRange, 2 * this.attackRange);
    if (images[this.tile.tile]) {
      image(images[this.tile.tile], this.x - tileSize / 2 + 10, this.y - tileSize / 2 + 10, tileSize - 20, tileSize - 10);
    } else {
      console.warn(`Image for ${this.tile.tile} not loaded.`);
    }

    // 显示生命值
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.health, this.x, this.y - 20);
  }
}

// 为棋盘添加事件监听器
document.addEventListener("dragover", handleDragOver);
document.addEventListener("drop", handleDrop);