let playerPieces = [];
let enemyPieces = [];
let gridSize = 8; // 棋盘大小

function setup() {
  createCanvas(windowWidth/2, windowHeight/2);

  // 创建玩家棋子
  for (let i = 0; i < 5; i++) {
    playerPieces.push(new Piece(random(width), random(height), 'player'));
  }

  // 创建敌方棋子
  for (let i = 0; i < 5; i++) {
    enemyPieces.push(new Piece(random(width), random(height), 'enemy'));
  }
}

function draw() {
  background(220);

  // 更新并绘制玩家棋子
  for (let piece of playerPieces) {
    piece.findTarget(enemyPieces); // 寻找目标
    piece.moveToTarget();          // 移动到目标
    piece.attackTarget();          // 攻击目标
    piece.display();               // 绘制棋子
  }

  // 绘制敌方棋子
  for (let enemy of enemyPieces) {
    enemy.display();
  }

  // 移除生命值小于等于0的敌人
  enemyPieces = enemyPieces.filter(enemy => enemy.health > 0);
}

// 棋子类
class Piece {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.health = 100;
    this.attack = 1;
    this.range = 1000;
    this.speed = 2;
    this.target = null;
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

      if (distToTarget > 10) {
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
      if (distToTarget <= 10) { // 攻击距离
        this.target.health -= this.attack;
        console.log(`Target hit! Remaining health: ${this.target.health}`);
      }
    }
  }

  // 绘制棋子
  display() {
    fill(this.type === 'player' ? 'green' : 'red');
    ellipse(this.x, this.y, 40, 40);

    // 显示生命值
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.health, this.x, this.y);
  }
}