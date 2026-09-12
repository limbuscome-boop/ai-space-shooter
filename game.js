const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 185, y: 450, width: 30, height: 30, speed: 5, color: "#00ffff" };
let bullets = [];
let enemies = [];
let stars = [];
let score = 0;
let lives = 3;
let level = 1;
let isGameOver = false;
let enemySpawnRate = 750;
let gameTime = 0;

// 배경 별 생성
for(let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: 1 + Math.random() * 2
    });
}

// 마우스 이벤트
window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;
    clampPlayerPosition();
});

// 터치 이벤트
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    player.x = e.touches[0].clientX - rect.left - player.width / 2;
    clampPlayerPosition();
}, { passive: false });

function clampPlayerPosition() {
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

function shoot() {
    if (isGameOver) return;
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 12,
        speed: 7
    });
}

function spawnEnemy() {
    if (isGameOver) return;
    let size = 28;
    let x = Math.random() * (canvas.width - size);
    let speed = 2 + Math.random() * 2 + (level - 1) * 0.5;
    enemies.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: speed
    });
}

function updateLevel() {
    let newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
        level = newLevel;
        enemySpawnRate = Math.max(500, 750 - (level - 1) * 50);
        clearInterval(spawnEnemyInterval);
        spawnEnemyInterval = setInterval(spawnEnemy, enemySpawnRate);
        document.getElementById("level").innerText = level;
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    if (isGameOver) return;

    gameTime++;

    clampPlayerPosition();

    // 별 업데이트
    for (let s of stars) {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
    }

    // 총알 업데이트
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }

    // 적 업데이트
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        // 적과 플레이어 충돌
        if (isColliding(player, enemies[i])) {
            enemies.splice(i, 1);
            lives--;
            document.getElementById("lives").innerText = lives;
            if (lives <= 0) {
                gameOver();
            }
            continue;
        }

        // 적과 총알 충돌
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (isColliding(bullets[j], enemies[i])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 100;
                document.getElementById("score").innerText = score;
                updateLevel();
                break;
            }
        }

        // 적이 화면 벗어남
        if (enemies[i] && enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 별 그리기
    ctx.fillStyle = "#ffffff";
    for (let s of stars) {
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // 플레이어 그리기
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // 글로우 효과
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 총알 그리기
    ctx.fillStyle = "#ffff00";
    for (let b of bullets) {
        ctx.fillRect(b.x, b.y, b.width, b.height);
        // 총알 글로우
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowColor = "transparent";
    }

    // 적 그리기
    ctx.fillStyle = "#ff2244";
    for (let e of enemies) {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        // 적 글로우
        ctx.strokeStyle = "rgba(255, 34, 68, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(e.x, e.y, e.width, e.height);
    }
}

function gameOver() {
    isGameOver = true;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff2244";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("게임 오버!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ffff00";
    ctx.fillText("최종 점수: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("페이지를 새로고침하세요", canvas.width / 2, canvas.height / 2 + 60);
}

function loop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(loop);
}

// 게임 시작
let shootInterval = setInterval(shoot, 300);
let spawnEnemyInterval = setInterval(spawnEnemy, enemySpawnRate);

loop();