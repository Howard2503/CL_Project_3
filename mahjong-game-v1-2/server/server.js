const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// 存储客户端的玩家信息
const players = {};
let users = []; // 存储玩家信息

// 静态文件托管
app.use(express.static("public"));

// 棋盘状态（一个简单的示例棋盘，可以根据实际需求扩展）
let boardState = Array(100).fill(null); // 示例：9格棋盘

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 分配玩家角色
  // let playerRole = `Player ${players.length + 1}`;
  let playerRole = "Spectator";
  // if (players.length < 2) {
  //   players.push({ id: socket.id, role: playerRole });
  // } else {
  //   playerRole = "Spectator"; // 超过两名玩家为观战者
  // }

  // if (players[0]) {
  //   if (players[1]) {
  //     players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //   } else if (players[0].id == "Player 2") {
  //     playerRole = "Player 1";
  //     players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //     console.log(`Assigned player: ${players[1].id}, color: ${players[1].color}, role: ${players[1].role}`);
  //   } else {
  //     playerRole = "Player 2";
  //     players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //     console.log(`Assigned player: ${players[1].id}, color: ${players[1].color}, role: ${players[1].role}`);
  //   }
  // } else {
  //   playerRole = "Player 1";
  //   players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //   console.log(`Assigned player: ${players[0].id}, color: ${players[0].color}, role: ${players[0].role}`);
  //   // console.log(`Assigned player: ${players[1].id}, color: ${players[1].color}, role: ${players[1].role}`);
  // }

  // if (players[0]) {
  //   if (players[1]) {
  //     //分配观众
  //     playerRole = "Spectator";
  //     players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //     for (let i = 0; i < players.length; i++) {
  //       console.log(`Assigned player: ${players[i].id}, color: ${players[i].color}, role: ${players[i].role}`);
  //     }
  //   } else {
  //     //分配玩家2
  //     playerRole = "Player_2";
  //     players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //     for (let i = 0; i < players.length; i++) {
  //       console.log(`Assigned player: ${players[i].id}, color: ${players[i].color}, role: ${players[i].role}`);
  //     }

  //   }
  // } else {
  //   //分配玩家1
  //   playerRole = "Player_1";
  //   players.push({ id: socket.id, color: getRandomColor(), role: playerRole });
  //   for (let i = 0; i < players.length; i++) {
  //     console.log(`Assigned player: ${players[i].id}, color: ${players[i].color}, role: ${players[i].role}`);
  //   }
  // }




  // players.push({ id: socket.id, role: playerRole });

  // console.log(`Assigned role: ${playerRole}`);

  // 分配玩家 ID（可以用颜色区分）
  const playerId = socket.id; // 使用 socket ID 作为玩家 ID
  players[socket.id] = { id: playerId, color: getRandomColor(), role: playerRole }; // 随机颜色
  let i = 0;
  for (const key in players) {
    if (i == 0) {
      players[key].role = "Player_1";
    }
    if (i == 1) {
      players[key].role = "Player_2";
    }
    if (players.hasOwnProperty(key)) {
      console.log(`Key: ${key} PlayerID: ${players[key].id} PlayerRole: ${players[key].role} i: ${i}`);
    }
    i++;
  }
  // for (let i = 0; i < players.length; i++) {
  //   players[i].role = "Spectator";
  // }
  // if (players[0]) {
  //   players[0].role = "Player_1"
  // }
  // if (players[1]) {
  //   players[1].role = "Player_2"
  // }
  // for (let i = 0; i < players.length; i++) {
  //   console.log(`Assigned player: ${players[i].id}, color: ${players[i].color}, role: ${players[i].role}`);
  // }
  // players.push({ id: playerId, color: getRandomColor(), role: playerRole }); // 随机颜色
  // console.log(`Player 1:${players[0].role}`);
  // console.log(`Players: ${players}`);
  // console.log(`Assigned player: ${playerId}, color: ${players[socket.id].color}, role: ${players[socket.id].role}`);

  // 发送初始棋盘状态和玩家信息
  socket.emit("initBoard", { boardState, playerInfo: players[socket.id] });

  // 监听麻将牌移动操作
  socket.on("moveTile", (data) => {
    const { index, tile, playerId } = data;

    // 更新棋盘状态
    boardState[index] = { tile, playerId }; // 保存玩家信息

    // 广播更新给其他客户端
    socket.broadcast.emit("updateBoard", { index, tile, playerId });
  });

  // 玩家断开时清理
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (players[socket.id].role != "Spectator") {
      delete players[socket.id];
      let i = 0;
      for (const key in players) {
        if (i == 0) {
          players[key].role = "Player_1";
          io.to(players[key].id).emit("initBoard", { boardState, playerInfo: players[key] });
          // socket.broadcast.emit("initBoard", { boardState, playerInfo: players[key] });
        }
        if (i == 1) {
          players[key].role = "Player_2";
          io.to(players[key].id).emit("initBoard", { boardState, playerInfo: players[key] });
          // socket.broadcast.emit("initBoard", { boardState, playerInfo: players[key] });
        }
        if (players.hasOwnProperty(key)) {
          console.log(`Key: ${key} PlayerID: ${players[key].id} PlayerRole: ${players[key].role} i: ${i}`);
        }
        i++;
        // socket.broadcast.emit("initBoard", { boardState, playerInfo: players[key] });
      }
    } else {
      delete players[socket.id];
    }
    // players = players.filter((player) => player.id !== socket.id);
    // for (let i = 0; i < players.length; i++) {
    //   players[i].role = "Spectator";
    // }
    // if (players[0]) {
    //   players[0].role = "Player_1"
    // }
    // if (players[1]) {
    //   players[1].role = "Player_2"
    // }
    // for (let i = 0; i < players.length; i++) {
    //   console.log(`Assigned player: ${players[i].id}, color: ${players[i].color}, role: ${players[i].role}`);
    // }
  });
});

// 启动服务
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// 获取随机颜色
function getRandomColor() {
  const colors = ["red", "blue"];
  // return colors[Math.floor(Math.random() * colors.length)];
  return "blue";
}