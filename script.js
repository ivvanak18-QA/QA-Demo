const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

const game = {
  width: canvas.width,
  height: canvas.height,
  running: true,
  frame: 0,
};

const player = {
  x: 300,
  y: 220,
  size: 28,
  speed: 4,
  color: '#55dd88',
};

const input = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let score = 0;
let lives = 3;
const coins = [];
const enemies = [];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnCoin() {
  if (coins.length >= 4) return;
  coins.push({
    x: randomInt(20, game.width - 20),
    y: randomInt(20, game.height - 20),
    radius: 10,
    color: '#ffd95f',
  });
}

function spawnEnemy() {
  enemies.push({
    x: randomInt(40, game.width - 40),
    y: randomInt(40, game.height - 40),
    size: 26,
    vx: randomInt(2, 4) * (Math.random() < 0.5 ? -1 : 1),
    vy: randomInt(2, 4) * (Math.random() < 0.5 ? -1 : 1),
    color: '#eb5c5c',
  });
}

function resetGame() {
  score = 0;
  lives = 3;
  coins.length = 0;
  enemies.length = 0;
  player.x = 300;
  player.y = 220;
  game.running = true;
  game.frame = 0;
  spawnCoin();
  spawnEnemy();
}

function drawRect(entity) {
  ctx.fillStyle = entity.color;
  ctx.fillRect(entity.x, entity.y, entity.size, entity.size);
}

function drawCoin(coin) {
  ctx.beginPath();
  ctx.fillStyle = coin.color;
  ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
  ctx.fill();
}

function updatePlayer() {
  if (!game.running) return;
  if (input.ArrowUp) player.y -= player.speed;
  if (input.ArrowDown) player.y += player.speed;
  if (input.ArrowLeft) player.x -= player.speed;
  if (input.ArrowRight) player.x += player.speed;
  player.x = Math.max(0, Math.min(game.width - player.size, player.x));
  player.y = Math.max(0, Math.min(game.height - player.size, player.y));
}

function checkCollisionRectCircle(rect, circle) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function checkCollisionRectRect(a, b) {
  return a.x < b.x + b.size && a.x + a.size > b.x && a.y < b.y + b.size && a.y + a.size > b.y;
}

function updateCoins() {
  coins.forEach((coin, index) => {
    if (checkCollisionRectCircle(player, coin)) {
      coins.splice(index, 1);
      score += 10;
      spawnCoin();
    }
  });
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    if (enemy.x <= 0 || enemy.x + enemy.size >= game.width) enemy.vx *= -1;
    if (enemy.y <= 0 || enemy.y + enemy.size >= game.height) enemy.vy *= -1;
    if (checkCollisionRectRect(player, enemy)) {
      lives -= 1;
      player.x = 300;
      player.y = 220;
      enemy.vx *= -1;
      enemy.vy *= -1;
    }
  });
}

function drawBackground() {
  ctx.fillStyle = '#0c1a36';
  ctx.fillRect(0, 0, game.width, game.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < game.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, game.height);
    ctx.stroke();
  }
  for (let y = 0; y < game.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(game.width, y);
    ctx.stroke();
  }
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, game.width, game.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', game.width / 2, game.height / 2 - 10);
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Натиснете Enter за рестарт', game.width / 2, game.height / 2 + 30);
}

function updateStatus() {
  scoreElement.textContent = score;
  livesElement.textContent = lives;
}

function gameLoop() {
  game.frame += 1;
  if (game.running) {
    updatePlayer();
    updateCoins();
    updateEnemies();
    if (game.frame % 180 === 0) spawnEnemy();
    if (coins.length === 0) spawnCoin();
    if (lives <= 0) {
      game.running = false;
    }
  }

  drawBackground();
  drawRect(player);
  coins.forEach(drawCoin);
  enemies.forEach(drawRect);
  updateStatus();

  if (!game.running) {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !game.running) {
    resetGame();
    return;
  }
  if (event.key in input) {
    input[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in input) {
    input[event.key] = false;
  }
});

resetGame();
spawnCoin();
spawnEnemy();
requestAnimationFrame(gameLoop);
