const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// 存储客户端的玩家信息
const players = {};
let boardState = Array(100).fill(null); // 棋盘状态
const mahjongDeck = ["1_tiao", "1_tong", "1_wan", "2_tiao", "2_tong", "2_wan", "3_tiao", "3_tong", "3_wan", "4_tiao", "4_tong", "4_wan", "5_tiao", "5_tong", "5_wan", "6_tiao", "6_tong", "6_wan", "7_tiao", "7_tong", "7_wan", "8_tiao", "8_tong", "8_wan", "9_tiao", "9_tong", "9_wan"]; // 牌库

// 静态文件托管
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 设置默认玩家角色为旁观者
  let playerRole = "Spectator";
  const playerId = socket.id;
  players[playerId] = { id: playerId, color: "green", role: playerRole };

  // 分配玩家角色
  let i = 0;
  for (const key in players) {
    if (i === 0) players[key].role = "Player_1";
    if (i === 1) players[key].role = "Player_2";
    i++;
  }

  // 发送初始棋盘状态和玩家信息
  socket.emit("initBoard", { boardState, playerInfo: players[playerId] });

  // 监听玩家放置麻将牌的事件
  socket.on("moveTile", (data) => {
    const { index, tile, playerRole } = data;

    // 更新棋盘状态
    boardState[index] = { tile, playerRole };

    // 广播更新给所有客户端
    io.emit("updateBoard", { index, tile, playerRole });
  });

  // 玩家断开连接时的处理
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (players[socket.id].role !== "Spectator") {
      // 重置棋盘状态
      boardState = Array(100).fill(null);
    }
    delete players[socket.id];

    // 重新分配玩家角色
    let i = 0;
    for (const key in players) {
      if (i === 0) players[key].role = "Player_1";
      if (i === 1) players[key].role = "Player_2";
      io.to(players[key].id).emit("initBoard", { boardState, playerInfo: players[key] });
      i++;
    }
  });
});

// 启动服务
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});