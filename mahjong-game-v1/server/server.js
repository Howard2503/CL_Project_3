const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// 静态文件托管
app.use(express.static("public"));

// 棋盘状态（一个简单的示例棋盘，可以根据实际需求扩展）
let boardState = Array(100).fill(null); // 示例：9格棋盘

// 监听客户端连接
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 发送初始棋盘状态给新连接的客户端
  socket.emit("initBoard", boardState);

  // 监听客户端发送的麻将牌移动操作
  socket.on("moveTile", (data) => {
    const { index, tile } = data;

    // 更新服务器端的棋盘状态
    boardState[index] = tile;

    // 广播操作给其他客户端（不包括当前客户端）
    socket.broadcast.emit("updateBoard", { index, tile });
  });

  // 监听客户端断开连接
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 启动服务
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

//这是个新line
