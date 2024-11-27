const socket = io();

let playerInfo = null; // 存储当前玩家信息

// 获取棋盘和麻将牌区域
const board = document.getElementById("game-board");
const mahjongTiles = document.getElementById("mahjong-tiles");

// 接收初始数据（棋盘状态和玩家信息）
socket.on("initBoard", ({ boardState, playerInfo: info }) => {
  playerInfo = info; // 保存当前玩家信息
  console.log("Player Info:", playerInfo); // 调试信息
  renderBoard(boardState);
});

// 监听棋盘更新事件
socket.on("updateBoard", ({ index, tile, playerId }) => {
  updateTile(index, tile, playerId);
});

function renderBoard(boardState) {
  board.innerHTML = ""; // 清空棋盘
  boardState.forEach((cell, index) => {
    const tileElement = document.createElement("div");
    tileElement.className = "tile";
    tileElement.dataset.index = index;

    if (cell) {
      const { tile, playerId } = cell; // 棋子和玩家信息
      const img = document.createElement("img");
      img.src = `images/${tile}.png`;
      img.alt = tile;
      tileElement.appendChild(img);

      // 根据玩家信息设置样式
      tileElement.style.borderColor = getPlayerColor(playerId);
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

  if (tile && !event.target.textContent) {
    // 本地更新
    updateTile(index, tile, playerInfo.id);

    // 通知服务器
    socket.emit("moveTile", { index, tile, playerId: playerInfo.id });
  }
}

// 获取玩家颜色（需要后端发送玩家 ID）
function getPlayerColor(playerId) {
  return playerId === playerInfo.id ? playerInfo.color : "red"; // 当前玩家为分配颜色，其他玩家为灰色
}