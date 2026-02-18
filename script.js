let coins = parseInt(localStorage.getItem('arcadeCoins') || '0');
let currentTheme = localStorage.getItem('arcadeTheme') || 'cyber';
let ownedThemes = JSON.parse(localStorage.getItem('arcadeOwnedThemes') || '["cyber"]');

const themes = [
    {
        id: 'cyber',
        name: 'CYBER',
        price: 0,
        colors: ['#00ffff', '#ff00ff', '#00ff88']
    },
    {
        id: 'classic',
        name: 'CLASSIC',
        price: 500,
        colors: ['#ffcc00', '#ff3366', '#33ff66']
    },
    {
        id: 'sunset',
        name: 'SUNSET',
        price: 750,
        colors: ['#ff6b6b', '#ffd93d', '#ff9a00']
    },
    {
        id: 'matrix',
        name: 'MATRIX',
        price: 1000,
        colors: ['#00ff00', '#00aa00', '#88ff88']
    },
    {
        id: 'vaporwave',
        name: 'VAPORWAVE',
        price: 1500,
        colors: ['#ff71ce', '#01cdfe', '#b967ff']
    },
    {
        id: 'arctic',
        name: 'ARCTIC',
        price: 2000,
        colors: ['#74c0fc', '#a5d8ff', '#00bbff']
    }
];

function updateCoinDisplay() {
    document.getElementById('coinCount').textContent = coins;
    localStorage.setItem('arcadeCoins', coins);
}

function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    currentTheme = themeId;
    localStorage.setItem('arcadeTheme', themeId);
}

function buyTheme(themeId, price) {
    if (coins >= price && !ownedThemes.includes(themeId)) {
        coins -= price;
        ownedThemes.push(themeId);
        localStorage.setItem('arcadeOwnedThemes', JSON.stringify(ownedThemes));
        updateCoinDisplay();
        renderShop();

        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 0, 0.2);
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }
}

function renderShop() {
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = '';

    themes.forEach(theme => {
        const isOwned = ownedThemes.includes(theme.id);
        const isActive = currentTheme === theme.id;

        const themeItem = document.createElement('div');
        themeItem.className = `theme-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`;

        themeItem.innerHTML = `
            <div class="theme-info">
                <div class="theme-name">${theme.name}</div>
                <div class="theme-preview">
                    ${theme.colors.map(color => `<div class="color-dot" style="background: ${color}"></div>`).join('')}
                </div>
                <div class="theme-price">${theme.price === 0 ? 'FREE' : `🪙 ${theme.price}`}</div>
            </div>
            ${!isOwned ? `<button class="buy-button" onclick="buyTheme('${theme.id}', ${theme.price})" ${coins < theme.price ? 'disabled' : ''}>BUY</button>` :
                (isActive ? '<button class="buy-button" disabled>ACTIVE</button>' :
                    `<button class="buy-button" onclick="applyTheme('${theme.id}')">USE</button>`)}
        `;

        grid.appendChild(themeItem);
    });
}

function openShop() {
    document.getElementById('shopModal').classList.add('active');
    renderShop();
}

function closeShop() {
    document.getElementById('shopModal').classList.remove('active');
}

updateCoinDisplay();
applyTheme(currentTheme);
document.getElementById('globalHighScore').textContent = String(localStorage.getItem('arcadeSnakeHighScore') || 0).padStart(6, '0');

let playTime = 0;
setInterval(() => {
    if (document.getElementById('gameContainer').style.display === 'flex') {
        playTime++;
        if (playTime % 30 === 0) {
            coins += 5;
            updateCoinDisplay();
        }
    }
}, 1000);

const bgCanvas = document.getElementById('backgroundCanvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class RetroStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.5 + 0.1;
        this.brightness = Math.random();
    }

    update() {
        this.y += this.speed;
        if (this.y > bgCanvas.height) {
            this.y = -10;
            this.x = Math.random() * bgCanvas.width;
        }
        this.brightness = 0.5 + Math.sin(Date.now() * 0.001 + this.x) * 0.5;
    }

    draw() {
        const colors = ['#00ffff', '#ff00ff', '#00ff88', '#8888ff', '#ff88ff'];
        bgCtx.fillStyle = colors[Math.floor(this.x) % colors.length];
        bgCtx.globalAlpha = this.brightness;
        bgCtx.fillRect(
            Math.floor(this.x),
            Math.floor(this.y),
            Math.ceil(this.size),
            Math.ceil(this.size)
        );
    }
}

const stars = [];
for (let i = 0; i < 80; i++) {
    stars.push(new RetroStar());
}

let gridOffset = 0;

function drawRetroGrid() {
    bgCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
    bgCtx.lineWidth = 1;
    bgCtx.globalAlpha = 0.08;

    const spacing = 50;
    gridOffset = (gridOffset + 0.5) % spacing;

    for (let x = gridOffset; x < bgCanvas.width; x += spacing) {
        bgCtx.beginPath();
        bgCtx.moveTo(x, bgCanvas.height * 0.5);
        bgCtx.lineTo(x, bgCanvas.height);
        bgCtx.stroke();
    }

    for (let y = bgCanvas.height * 0.5; y < bgCanvas.height; y += spacing) {
        bgCtx.beginPath();
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(bgCanvas.width, y);
        bgCtx.stroke();
    }
}

function animateBackground() {
    bgCtx.fillStyle = 'rgba(5, 5, 16, 0.1)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    drawRetroGrid();

    if (Math.random() < 0.02) {
        bgCtx.fillStyle = 'rgba(0, 255, 255, 0.03)';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    }

    requestAnimationFrame(animateBackground);
}
animateBackground();

const gameItems = document.querySelectorAll('.game-item');
let currentIndex = 0;

function updateSelection() {
    gameItems.forEach((item, index) => {
        item.classList.toggle('selected', index === currentIndex);
    });
}

function playSelectSound() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 255, 255, 0.05);
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 50);
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('gameContainer').style.display === 'flex') return;
    if (document.getElementById('shopModal').classList.contains('active')) {
        if (e.key === 'Escape') {
            closeShop();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            currentIndex = (currentIndex - 1 + gameItems.length) % gameItems.length;
            updateSelection();
            playSelectSound();
            break;
        case 'ArrowDown':
            e.preventDefault();
            currentIndex = (currentIndex + 1) % gameItems.length;
            updateSelection();
            playSelectSound();
            break;
        case 'Enter':
            e.preventDefault();
            const selectedGame = gameItems[currentIndex].dataset.game;
            startGame(selectedGame);
            break;
    }
});

gameItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentIndex = index;
        updateSelection();
        startGame(item.dataset.game);
    });

    item.addEventListener('mouseenter', () => {
        currentIndex = index;
        updateSelection();
        playSelectSound();
    });
});

let currentGame = null;
let gameRunning = false;
let sessionCoins = 0;

// startGame() przeniesiona do końca pliku (z obsługą Pac-Mana)

function backToMenu() {
    gameRunning = false;
    currentGame = null;
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
}

let snake, food, dx, dy, score, highScore;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = 20;

canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

function startSnakeGame() {
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;
    currentGame = 'snake';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    highScore = localStorage.getItem('arcadeSnakeHighScore') || 0;
    document.getElementById('highScore').textContent = String(highScore).padStart(5, '0');

    sessionCoins = 0;
    document.getElementById('coinsEarned').textContent = '0';

    initSnakeGame();
    gameRunning = true;
    playTime = 0;
    snakeGameLoop();
}

function initSnakeGame() {
    snake = [{ x: 10, y: 10 }];
    generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    document.getElementById('score').textContent = '00000';
}

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function snakeGameLoop() {
    if (!gameRunning || currentGame !== 'snake') return;

    updateSnake();
    drawSnake();

    setTimeout(() => snakeGameLoop(), 120);
}

function updateSnake() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame('snake');
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame('snake');
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 100;
        document.getElementById('score').textContent = String(score).padStart(5, '0');

        const coinsAwarded = Math.floor(10 + Math.random() * 5);
        sessionCoins += coinsAwarded;
        coins += coinsAwarded;
        updateCoinDisplay();
        document.getElementById('coinsEarned').textContent = sessionCoins;

        generateFood();

        canvas.style.boxShadow = '0 0 0 2px var(--secondary-color), 0 0 0 4px var(--accent-color), 0 0 80px var(--primary-color)';
        setTimeout(() => {
            canvas.style.boxShadow = '0 0 0 2px var(--secondary-color), 0 0 0 4px var(--accent-color), 0 0 40px var(--border-glow)';
        }, 100);
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary');
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color');

    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(
                segment.x * gridSize + 2,
                segment.y * gridSize + 2,
                gridSize - 4,
                gridSize - 4
            );
            ctx.fillStyle = secondaryColor;
            ctx.fillRect(
                segment.x * gridSize + 4,
                segment.y * gridSize + 4,
                4,
                4
            );
            ctx.fillRect(
                segment.x * gridSize + 12,
                segment.y * gridSize + 4,
                4,
                4
            );
        } else {
            ctx.fillStyle = index % 2 === 0 ? primaryColor : getComputedStyle(document.body).getPropertyValue('--accent-color');
            ctx.globalAlpha = 0.8;
            ctx.fillRect(
                segment.x * gridSize + 2,
                segment.y * gridSize + 2,
                gridSize - 4,
                gridSize - 4
            );
            ctx.globalAlpha = 1;
        }
    });

    const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    ctx.fillStyle = pulse > 0.5 ? secondaryColor : getComputedStyle(document.body).getPropertyValue('--accent-color');

    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
        food.x * gridSize + 6,
        food.y * gridSize + 6,
        4,
        4
    );
}

let tetrisBoard, tetrisPiece, tetrisScore, tetrisHighScore, tetrisDropCounter;
const tetrisWidth = 10;
const tetrisHeight = 20;
const tetrisBlockSize = 20;

const tetrisPieces = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];

function startTetrisGame() {
    currentGame = 'tetris';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    tetrisHighScore = localStorage.getItem('arcadeTetrisHighScore') || 0;
    document.getElementById('highScore').textContent = String(tetrisHighScore).padStart(5, '0');

    sessionCoins = 0;
    document.getElementById('coinsEarned').textContent = '0';

    canvas.width = tetrisWidth * tetrisBlockSize;
    canvas.height = tetrisHeight * tetrisBlockSize;

    initTetris();
    gameRunning = true;
    tetrisGameLoop();
}

function initTetris() {
    tetrisBoard = Array(tetrisHeight).fill(null).map(() => Array(tetrisWidth).fill(0));
    tetrisScore = 0;
    tetrisDropCounter = 0;
    document.getElementById('score').textContent = '00000';
    spawnTetrisPiece();
}

function spawnTetrisPiece() {
    const randomPiece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    const piece = JSON.parse(JSON.stringify(randomPiece));
    tetrisPiece = {
        shape: piece,
        x: Math.floor((tetrisWidth - piece[0].length) / 2),
        y: 0
    };

    if (!canMoveTetris(tetrisPiece.x, tetrisPiece.y, tetrisPiece.shape)) {
        endGame('tetris');
    }
}

function canMoveTetris(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= tetrisWidth || newY >= tetrisHeight) return false;
                if (newY >= 0 && tetrisBoard[newY][newX]) return false;
            }
        }
    }
    return true;
}

function rotateTetrisPiece() {
    const rotated = [];
    const shape = tetrisPiece.shape;

    for (let col = 0; col < shape[0].length; col++) {
        const newRow = [];
        for (let row = shape.length - 1; row >= 0; row--) {
            newRow.push(shape[row][col]);
        }
        rotated.push(newRow);
    }

    if (canMoveTetris(tetrisPiece.x, tetrisPiece.y, rotated)) {
        tetrisPiece.shape = rotated;
    }
}

function lockTetrisPiece() {
    for (let row = 0; row < tetrisPiece.shape.length; row++) {
        for (let col = 0; col < tetrisPiece.shape[row].length; col++) {
            if (tetrisPiece.shape[row][col]) {
                const y = tetrisPiece.y + row;
                const x = tetrisPiece.x + col;
                if (y >= 0) tetrisBoard[y][x] = 1;
            }
        }
    }

    clearTetrisLines();
    spawnTetrisPiece();
}

function clearTetrisLines() {
    let linesCleared = 0;
    for (let row = tetrisHeight - 1; row >= 0; row--) {
        if (tetrisBoard[row].every(cell => cell)) {
            tetrisBoard.splice(row, 1);
            tetrisBoard.unshift(Array(tetrisWidth).fill(0));
            linesCleared++;
            row++;
        }
    }

    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100;
        document.getElementById('score').textContent = String(tetrisScore).padStart(5, '0');

        const coinsAwarded = linesCleared * 25;
        sessionCoins += coinsAwarded;
        coins += coinsAwarded;
        updateCoinDisplay();
        document.getElementById('coinsEarned').textContent = sessionCoins;
    }
}

function updateTetris() {
    tetrisDropCounter++;
    if (tetrisDropCounter > 8) {
        if (canMoveTetris(tetrisPiece.x, tetrisPiece.y + 1, tetrisPiece.shape)) {
            tetrisPiece.y++;
        } else {
            lockTetrisPiece();
        }
        tetrisDropCounter = 0;
    }
}

function drawTetris() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-glow');
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    for (let i = 0; i <= tetrisWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tetrisBlockSize, 0);
        ctx.lineTo(i * tetrisBlockSize, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= tetrisHeight; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * tetrisBlockSize);
        ctx.lineTo(canvas.width, i * tetrisBlockSize);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color');

    for (let row = 0; row < tetrisHeight; row++) {
        for (let col = 0; col < tetrisWidth; col++) {
            if (tetrisBoard[row][col]) {
                ctx.fillStyle = primaryColor;
                ctx.fillRect(col * tetrisBlockSize + 1, row * tetrisBlockSize + 1, tetrisBlockSize - 2, tetrisBlockSize - 2);
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(col * tetrisBlockSize + 1, row * tetrisBlockSize + 1, tetrisBlockSize - 2, tetrisBlockSize - 2);
            }
        }
    }

    for (let row = 0; row < tetrisPiece.shape.length; row++) {
        for (let col = 0; col < tetrisPiece.shape[row].length; col++) {
            if (tetrisPiece.shape[row][col]) {
                ctx.fillStyle = accentColor;
                ctx.fillRect(
                    (tetrisPiece.x + col) * tetrisBlockSize + 1,
                    (tetrisPiece.y + row) * tetrisBlockSize + 1,
                    tetrisBlockSize - 2,
                    tetrisBlockSize - 2
                );
                ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    (tetrisPiece.x + col) * tetrisBlockSize + 1,
                    (tetrisPiece.y + row) * tetrisBlockSize + 1,
                    tetrisBlockSize - 2,
                    tetrisBlockSize - 2
                );
            }
        }
    }
}

function tetrisGameLoop() {
    if (!gameRunning || currentGame !== 'tetris') return;

    updateTetris();
    drawTetris();

    setTimeout(() => tetrisGameLoop(), 80);
}

let pongBall, pongPaddles, pongScore, botAI;

function startPongGame() {
    currentGame = 'pong';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    const pongHighScore = localStorage.getItem('arcadePongHighScore') || 0;
    document.getElementById('highScore').textContent = String(pongHighScore).padStart(5, '0');

    sessionCoins = 0;
    document.getElementById('coinsEarned').textContent = '0';

    canvas.width = 600;
    canvas.height = 400;

    initPong();
    gameRunning = true;
    pongGameLoop();
}

function initPong() {
    pongScore = [0, 0];
    document.getElementById('score').textContent = '00000';

    pongBall = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 8 * (Math.random() > 0.5 ? 1 : -1),
        vy: 8 * (Math.random() - 0.5),
        radius: 8,
        speed: 8
    };

    pongPaddles = [
        { x: 10, y: canvas.height / 2 - 50, width: 10, height: 100, vy: 0 },
        { x: canvas.width - 20, y: canvas.height / 2 - 50, width: 10, height: 100, vy: 0 }
    ];

    botAI = {
        difficulty: 0.85,
        reactionTime: 0
    };
}

function updatePong() {
    pongBall.x += pongBall.vx;
    pongBall.y += pongBall.vy;

    if (pongBall.y - pongBall.radius < 0 || pongBall.y + pongBall.radius > canvas.height) {
        pongBall.vy = -pongBall.vy;
        pongBall.y = Math.max(pongBall.radius, Math.min(canvas.height - pongBall.radius, pongBall.y));
    }

    pongPaddles[0].y += pongPaddles[0].vy;
    pongPaddles[0].y = Math.max(0, Math.min(canvas.height - pongPaddles[0].height, pongPaddles[0].y));

    botAI.reactionTime++;
    if (botAI.reactionTime > 3) {
        const paddleCenter = pongPaddles[1].y + pongPaddles[1].height / 2;
        const ballCenter = pongBall.y;
        const diff = ballCenter - paddleCenter;

        if (Math.random() < botAI.difficulty) {
            if (diff > 10) {
                pongPaddles[1].vy = 7;
            } else if (diff < -10) {
                pongPaddles[1].vy = -7;
            } else {
                pongPaddles[1].vy = 0;
            }
        }
        botAI.reactionTime = 0;
    }

    pongPaddles[1].y += pongPaddles[1].vy;
    pongPaddles[1].y = Math.max(0, Math.min(canvas.height - pongPaddles[1].height, pongPaddles[1].y));

    pongPaddles.forEach((paddle, idx) => {
        if (pongBall.x - pongBall.radius < paddle.x + paddle.width &&
            pongBall.x + pongBall.radius > paddle.x &&
            pongBall.y > paddle.y &&
            pongBall.y < paddle.y + paddle.height) {

            pongBall.vx = Math.abs(pongBall.vx) * (idx === 0 ? 1 : -1);
            pongBall.vx *= 1.05;
            const maxSpeed = 20;
            pongBall.vx = Math.max(-maxSpeed, Math.min(maxSpeed, pongBall.vx));

            const hitPos = (pongBall.y - paddle.y) / paddle.height;
            pongBall.vy = (hitPos - 0.5) * 15;

            pongScore[idx]++;
            document.getElementById('score').textContent = String(pongScore[0]).padStart(5, '0');

            const coinsAwarded = 10;
            sessionCoins += coinsAwarded;
            coins += coinsAwarded;
            updateCoinDisplay();
            document.getElementById('coinsEarned').textContent = sessionCoins;
        }
    });

    if (pongBall.x < 0 || pongBall.x > canvas.width) {
        endGame('pong');
    }
}

function drawPong() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color');

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
    ctx.stroke();

    pongPaddles.forEach((paddle, idx) => {
        ctx.fillStyle = idx === 0 ? primaryColor : accentColor;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    });

    ctx.strokeStyle = primaryColor;
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(pongScore[0], canvas.width / 4, 40);
    ctx.fillStyle = accentColor;
    ctx.fillText(pongScore[1], (canvas.width * 3) / 4, 40);
}

function pongGameLoop() {
    if (!gameRunning || currentGame !== 'pong') return;

    updatePong();
    drawPong();

    setTimeout(() => pongGameLoop(), 30);
}

let invadersPlayer, invadersEnemies, invadersBullets, invadersScore, invadersHighScore, invadersWave;

function startInvadersGame() {
    currentGame = 'invaders';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    invadersHighScore = localStorage.getItem('arcadeInvadersHighScore') || 0;
    document.getElementById('highScore').textContent = String(invadersHighScore).padStart(5, '0');

    sessionCoins = 0;
    document.getElementById('coinsEarned').textContent = '0';

    canvas.width = 800;
    canvas.height = 600;

    initInvaders();
    gameRunning = true;
    invadersGameLoop();
}

function initInvaders() {
    invadersScore = 0;
    invadersWave = 1;
    invadersPlayer = {
        x: canvas.width / 2 - 20,
        y: canvas.height - 50,
        width: 40,
        height: 40,
        vx: 0,
        speed: 6
    };

    invadersBullets = [];
    spawnInvaders();
    document.getElementById('score').textContent = '00000';
}

function spawnInvaders() {
    invadersEnemies = [];
    const rows = 3;
    const cols = 8;
    const spacing = 80;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            invadersEnemies.push({
                x: col * spacing + 50,
                y: row * 60 + 30,
                width: 30,
                height: 30,
                vx: 2 + invadersWave * 0.5
            });
        }
    }
}

function updateInvaders() {
    invadersPlayer.x += invadersPlayer.vx;
    invadersPlayer.x = Math.max(0, Math.min(canvas.width - invadersPlayer.width, invadersPlayer.x));

    let moveDown = false;
    invadersEnemies.forEach(enemy => {
        enemy.x += enemy.vx;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            moveDown = true;
        }
    });

    if (moveDown) {
        invadersEnemies.forEach(enemy => {
            enemy.vx *= -1;
            enemy.y += 30;
        });
    }

    invadersBullets = invadersBullets.filter(bullet => bullet.y > 0);
    invadersBullets.forEach(bullet => {
        bullet.y -= 8;
    });

    invadersBullets = invadersBullets.filter(bullet => {
        let hit = false;
        invadersEnemies = invadersEnemies.filter(enemy => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 10 > enemy.y) {
                hit = true;
                invadersScore += 10;
                const coinsAwarded = 5;
                sessionCoins += coinsAwarded;
                coins += coinsAwarded;
                updateCoinDisplay();
                document.getElementById('coinsEarned').textContent = sessionCoins;
                document.getElementById('score').textContent = String(invadersScore).padStart(5, '0');
                return false;
            }
            return true;
        });
        return !hit;
    });

    if (invadersEnemies.some(enemy => enemy.y > canvas.height)) {
        endGame('invaders');
    }

    if (invadersEnemies.length === 0) {
        invadersWave++;
        spawnInvaders();
    }
}

function drawInvaders() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color');
    const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color');

    ctx.fillStyle = primaryColor;
    ctx.fillRect(invadersPlayer.x, invadersPlayer.y, invadersPlayer.width, invadersPlayer.height);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(invadersPlayer.x, invadersPlayer.y, invadersPlayer.width, invadersPlayer.height);

    ctx.fillStyle = accentColor;
    ctx.fillRect(invadersPlayer.x + invadersPlayer.width / 2 - 2, invadersPlayer.y - 10, 4, 10);

    invadersEnemies.forEach(enemy => {
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 4, 4);
        ctx.fillRect(enemy.x + 21, enemy.y + 5, 4, 4);
    });

    ctx.fillStyle = accentColor;
    invadersBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });

    ctx.fillStyle = primaryColor;
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`WAVE: ${invadersWave}`, 20, 30);
}

function invadersGameLoop() {
    if (!gameRunning || currentGame !== 'invaders') return;

    updateInvaders();
    drawInvaders();

    setTimeout(() => invadersGameLoop(), 50);
}
function showGameOverModal(gameName, finalScore, sessionCoins, isNewRecord) {
    return new Promise((resolve) => {
        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'gameOverOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(5, 5, 16, 0);
            z-index: 20000;
            transition: background 400ms ease;
        `;

        // Box
        const box = document.createElement('div');
        box.style.cssText = `
            width: 420px;
            max-width: 92%;
            padding: 0;
            border-radius: 16px;
            background: linear-gradient(180deg, rgba(20, 20, 40, 0.98), rgba(10, 10, 25, 0.99));
            border: 3px solid var(--primary-color);
            box-shadow: 
                0 0 60px rgba(0, 255, 255, 0.3),
                0 0 100px rgba(255, 0, 255, 0.2),
                inset 0 0 60px rgba(0, 0, 0, 0.5);
            color: var(--primary-color);
            text-align: center;
            font-family: "Press Start 2P", monospace;
            transform: scale(0.5) rotateX(40deg);
            opacity: 0;
            animation: gameOverPopIn 600ms cubic-bezier(.15, .85, .35, 1.2) forwards;
            overflow: hidden;
        `;

        // Header section
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 30px 20px 20px;
            background: ${isNewRecord ?
                'linear-gradient(180deg, rgba(0, 255, 136, 0.15), transparent)' :
                'linear-gradient(180deg, rgba(255, 0, 136, 0.15), transparent)'};
            position: relative;
        `;

        // Scanlines effect
        const scanlines = document.createElement('div');
        scanlines.style.cssText = `
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.1) 2px,
                rgba(0, 0, 0, 0.1) 4px
            );
            pointer-events: none;
        `;
        header.appendChild(scanlines);

        // Trophy/skull icon
        const icon = document.createElement('div');
        icon.style.cssText = `
            font-size: 60px;
            line-height: 1;
            margin-bottom: 15px;
            animation: iconPulse 1s ease-in-out infinite;
            filter: drop-shadow(0 0 20px ${isNewRecord ? 'var(--accent-color)' : 'var(--secondary-color)'});
        `;
        icon.textContent = isNewRecord ? '🏆' : '💀';

        // GAME OVER text
        const gameOverText = document.createElement('div');
        gameOverText.style.cssText = `
            font-size: 28px;
            font-weight: bold;
            color: ${isNewRecord ? 'var(--accent-color)' : 'var(--secondary-color)'};
            text-shadow: 
                0 0 10px currentColor,
                0 0 20px currentColor,
                0 0 40px currentColor;
            letter-spacing: 4px;
            animation: textGlitch 3s infinite;
        `;
        gameOverText.innerHTML = 'GAME<br>OVER';

        header.appendChild(icon);
        header.appendChild(gameOverText);

        // New record banner
        if (isNewRecord) {
            const recordBanner = document.createElement('div');
            recordBanner.style.cssText = `
                margin-top: 15px;
                padding: 8px 20px;
                background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
                color: var(--accent-color);
                font-size: 14px;
                letter-spacing: 2px;
                animation: recordPulse 1.5s ease-in-out infinite;
            `;
            recordBanner.textContent = '★ NEW RECORD! ★';
            header.appendChild(recordBanner);
        }

        // Stats section
        const stats = document.createElement('div');
        stats.style.cssText = `
            padding: 25px 20px;
            background: rgba(0, 0, 0, 0.3);
        `;

        // Score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.style.cssText = `
            margin-bottom: 20px;
        `;

        const scoreLabel = document.createElement('div');
        scoreLabel.style.cssText = `
            font-size: 12px;
            color: var(--primary-color);
            opacity: 0.7;
            margin-bottom: 8px;
        `;
        scoreLabel.textContent = 'FINAL SCORE';

        const scoreValue = document.createElement('div');
        scoreValue.style.cssText = `
            font-size: 32px;
            color: var(--primary-color);
            text-shadow: 0 0 20px var(--primary-color);
            animation: scoreCount 1s ease-out forwards;
        `;
        scoreValue.id = 'finalScoreValue';
        scoreValue.textContent = '0';

        scoreDisplay.appendChild(scoreLabel);
        scoreDisplay.appendChild(scoreValue);

        // Coins display
        const coinsDisplay = document.createElement('div');
        coinsDisplay.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 20px;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
            border-radius: 8px;
        `;

        const coinIcon = document.createElement('span');
        coinIcon.style.cssText = `
            font-size: 24px;
            animation: coinSpin 1s ease-in-out infinite;
        `;
        coinIcon.textContent = '🪙';

        const coinText = document.createElement('span');
        coinText.style.cssText = `
            font-size: 18px;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        `;
        coinText.textContent = `+${sessionCoins}`;

        coinsDisplay.appendChild(coinIcon);
        coinsDisplay.appendChild(coinText);

        stats.appendChild(scoreDisplay);
        stats.appendChild(coinsDisplay);

        // Buttons section
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            padding: 20px;
            display: flex;
            gap: 15px;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
        `;

        // Play Again button
        const playAgainBtn = document.createElement('button');
        playAgainBtn.style.cssText = `
            padding: 15px 25px;
            border: 2px solid var(--accent-color);
            border-radius: 10px;
            background: linear-gradient(180deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05));
            color: var(--accent-color);
            font-family: "Press Start 2P", monospace;
            font-size: 11px;
            cursor: pointer;
            transition: all 200ms ease;
            text-shadow: 0 0 10px var(--accent-color);
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
            animation: buttonReady 400ms ease-out 800ms both;
        `;
        playAgainBtn.textContent = '▶ PLAY AGAIN';
        playAgainBtn.onmouseenter = () => {
            playAgainBtn.style.transform = 'scale(1.05)';
            playAgainBtn.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.5)';
            playAgainBtn.style.background = 'linear-gradient(180deg, rgba(0, 255, 136, 0.4), rgba(0, 255, 136, 0.1))';
        };
        playAgainBtn.onmouseleave = () => {
            playAgainBtn.style.transform = 'scale(1)';
            playAgainBtn.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.2)';
            playAgainBtn.style.background = 'linear-gradient(180deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05))';
        };

        // Menu button
        const menuBtn = document.createElement('button');
        menuBtn.style.cssText = `
            padding: 15px 25px;
            border: 2px solid var(--secondary-color);
            border-radius: 10px;
            background: linear-gradient(180deg, rgba(255, 0, 136, 0.2), rgba(255, 0, 136, 0.05));
            color: var(--secondary-color);
            font-family: "Press Start 2P", monospace;
            font-size: 11px;
            cursor: pointer;
            transition: all 200ms ease;
            text-shadow: 0 0 10px var(--secondary-color);
            box-shadow: 0 0 20px rgba(255, 0, 136, 0.2);
            animation: buttonReady 400ms ease-out 900ms both;
        `;
        menuBtn.textContent = '◀ MENU';
        menuBtn.onmouseenter = () => {
            menuBtn.style.transform = 'scale(1.05)';
            menuBtn.style.boxShadow = '0 0 30px rgba(255, 0, 136, 0.5)';
            menuBtn.style.background = 'linear-gradient(180deg, rgba(255, 0, 136, 0.4), rgba(255, 0, 136, 0.1))';
        };
        menuBtn.onmouseleave = () => {
            menuBtn.style.transform = 'scale(1)';
            menuBtn.style.boxShadow = '0 0 20px rgba(255, 0, 136, 0.2)';
            menuBtn.style.background = 'linear-gradient(180deg, rgba(255, 0, 136, 0.2), rgba(255, 0, 136, 0.05))';
        };

        buttons.appendChild(playAgainBtn);
        buttons.appendChild(menuBtn);

        // Assemble box
        box.appendChild(header);
        box.appendChild(stats);
        box.appendChild(buttons);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Animate background
        requestAnimationFrame(() => {
            overlay.style.background = 'rgba(5, 5, 16, 0.92)';
        });

        // Animate score counting
        let currentScore = 0;
        const scoreStep = Math.ceil(finalScore / 30);
        const countInterval = setInterval(() => {
            currentScore += scoreStep;
            if (currentScore >= finalScore) {
                currentScore = finalScore;
                clearInterval(countInterval);
            }
            scoreValue.textContent = currentScore.toString().padStart(5, '0');
        }, 30);

        // Close function
        const closeModal = (playAgain) => {
            overlay.style.transition = 'background 300ms ease';
            overlay.style.background = 'rgba(5, 5, 16, 0)';
            box.style.transition = 'all 300ms ease';
            box.style.transform = 'scale(0.8) rotateX(-20deg)';
            box.style.opacity = '0';

            setTimeout(() => {
                overlay.remove();
                resolve(playAgain);
            }, 300);

            document.removeEventListener('keydown', handleKeydown);
        };

        // Button handlers
        playAgainBtn.onclick = () => closeModal(true);
        menuBtn.onclick = () => closeModal(false);

        // Keyboard support
        const handleKeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeModal(true);
            } else if (e.key === 'Escape') {
                closeModal(false);
            }
        };

        setTimeout(() => {
            document.addEventListener('keydown', handleKeydown);
        }, 1000);
    });
}

// ==================== GAME OVER STYLES ====================

if (!document.getElementById('gameOverStyles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'gameOverStyles';
    styleSheet.textContent = `
        @keyframes gameOverPopIn {
            0% {
                transform: scale(0.5) rotateX(40deg);
                opacity: 0;
            }
            60% {
                transform: scale(1.05) rotateX(-5deg);
            }
            100% {
                transform: scale(1) rotateX(0deg);
                opacity: 1;
            }
        }

        @keyframes iconPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }

        @keyframes textGlitch {
            0%, 90%, 100% {
                opacity: 1;
                transform: translateX(0);
            }
            92% {
                opacity: 0.8;
                transform: translateX(-2px);
            }
            94% {
                opacity: 0.9;
                transform: translateX(2px);
            }
            96% {
                opacity: 0.8;
                transform: translateX(-1px);
            }
        }

        @keyframes recordPulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.8;
                transform: scale(1.02);
            }
        }

        @keyframes coinSpin {
            0%, 100% {
                transform: rotateY(0deg);
            }
            50% {
                transform: rotateY(180deg);
            }
        }

        @keyframes buttonReady {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes scoreCount {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        #gameOverOverlay * {
            box-sizing: border-box;
        }
    `;
    document.head.appendChild(styleSheet);
}

function endGame(gameName) {
    gameRunning = true;

    let finalScore = gameName === 'snake' ? score :
        (gameName === 'tetris' ? tetrisScore :
            (gameName === 'pong' ? pongScore[0] :
                (gameName === 'invaders' ? invadersScore : pacmanScore)));

    const storageKey = gameName === 'snake' ? 'arcadeSnakeHighScore' :
        (gameName === 'tetris' ? 'arcadeTetrisHighScore' :
            (gameName === 'pong' ? 'arcadePongHighScore' :
                (gameName === 'invaders' ? 'arcadeInvadersHighScore' : 'arcadePacmanHighScore')));

    const currentHighScore = parseInt(localStorage.getItem(storageKey) || 0);
    const isNewRecord = finalScore > currentHighScore;

    if (isNewRecord) {
        localStorage.setItem(storageKey, finalScore);
        document.getElementById('highScore').textContent = String(finalScore).padStart(5, '0');
        document.getElementById('globalHighScore').textContent = String(finalScore).padStart(6, '0');

        const bonus = 100;
        coins += bonus;
        sessionCoins += bonus;
        updateCoinDisplay();
        document.getElementById('coinsEarned').textContent = sessionCoins;
    }

    // Draw game over on canvas
    ctx.fillStyle = 'rgba(5, 5, 16, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glitch effect lines
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = isNewRecord ?
            `rgba(0, 255, 136, ${Math.random() * 0.1})` :
            `rgba(255, 0, 136, ${Math.random() * 0.1})`;
        const y = Math.random() * canvas.height;
        ctx.fillRect(0, y, canvas.width, Math.random() * 20 + 5);
    }

    // Show the beautiful modal after short delay
    setTimeout(() => {
        showGameOverModal(gameName, finalScore, sessionCoins, isNewRecord)
            .then((playAgain) => {
                if (playAgain) {
                    if (gameName === 'snake') startSnakeGame();
                    else if (gameName === 'tetris') startTetrisGame();
                    else if (gameName === 'pong') startPongGame();
                    else if (gameName === 'invaders') startInvadersGame();
                    else if (gameName === 'pacman') startPacmanGame();
                } else {
                    backToMenu();
                }
            });
    }, 500);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (currentGame === 'snake') {
        switch (e.key) {
            case 'ArrowUp':
                if (dy === 0) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
                if (dy === 0) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
                if (dx === 0) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
                if (dx === 0) { dx = 1; dy = 0; }
                break;
            case 'Escape':
                backToMenu();
                break;
        }
    }

    if (currentGame === 'tetris') {
        switch (e.key) {
            case 'ArrowLeft':
                if (canMoveTetris(tetrisPiece.x - 1, tetrisPiece.y, tetrisPiece.shape)) {
                    tetrisPiece.x--;
                }
                break;
            case 'ArrowRight':
                if (canMoveTetris(tetrisPiece.x + 1, tetrisPiece.y, tetrisPiece.shape)) {
                    tetrisPiece.x++;
                }
                break;
            case 'ArrowDown':
                if (canMoveTetris(tetrisPiece.x, tetrisPiece.y + 1, tetrisPiece.shape)) {
                    tetrisPiece.y++;
                }
                break;
            case ' ':
                rotateTetrisPiece();
                break;
            case 'Escape':
                backToMenu();
                break;
        }
    }

    if (currentGame === 'pong') {
        if (e.key === 'ArrowUp') pongPaddles[0].vy = -10;
        if (e.key === 'ArrowDown') pongPaddles[0].vy = 10;
        if (e.key === 'Escape') backToMenu();
    }

    if (currentGame === 'invaders') {
        if (e.key === 'ArrowLeft') invadersPlayer.vx = -invadersPlayer.speed;
        if (e.key === 'ArrowRight') invadersPlayer.vx = invadersPlayer.speed;
        if (e.key === ' ') {
            e.preventDefault();
            invadersBullets.push({
                x: invadersPlayer.x + invadersPlayer.width / 2 - 2.5,
                y: invadersPlayer.y
            });
        }
        if (e.key === 'Escape') backToMenu();
    }

    if (currentGame === 'pacman') {
        switch (e.key) {
            case 'ArrowUp':
                pacmanPlayer.nextVy = -1;
                pacmanPlayer.nextVx = 0;
                break;
            case 'ArrowDown':
                pacmanPlayer.nextVy = 1;
                pacmanPlayer.nextVx = 0;
                break;
            case 'ArrowLeft':
                pacmanPlayer.nextVx = -1;
                pacmanPlayer.nextVy = 0;
                break;
            case 'ArrowRight':
                pacmanPlayer.nextVx = 1;
                pacmanPlayer.nextVy = 0;
                break;
            case 'Escape':
                backToMenu();
                break;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (currentGame === 'pong') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            pongPaddles[0].vy = 0;
        }
    }

    if (currentGame === 'invaders') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            invadersPlayer.vx = 0;
        }
    }
});

let pacmanPlayer, pacmanGhosts, pacmanPellets, pacmanScore, pacmanHighScore, pacmanLevel;
const pacmanGridSize = 20;
const pacmanGridWidth = 21;
const pacmanGridHeight = 21;

function startPacmanGame() {
    currentGame = 'pacman';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    pacmanHighScore = localStorage.getItem('arcadePacmanHighScore') || 0;
    document.getElementById('highScore').textContent = String(pacmanHighScore).padStart(5, '0');

    sessionCoins = 0;
    document.getElementById('coinsEarned').textContent = '0';

    canvas.width = pacmanGridWidth * pacmanGridSize;
    canvas.height = pacmanGridHeight * pacmanGridSize;

    initPacman();
    gameRunning = true;
    pacmanGameLoop();
}

function initPacman() {
    pacmanScore = 0;
    pacmanLevel = 1;
    document.getElementById('score').textContent = '00000';

    pacmanPlayer = {
        x: 10,
        y: 10,
        vx: 0,
        vy: 0,
        nextVx: 0,
        nextVy: 0,
        mouthOpen: true,
        direction: 0
    };

    pacmanGhosts = [
        { x: 9, y: 8, vx: 0, vy: 0, color: '#ff0000', mode: 'chase' },
        { x: 10, y: 9, vx: 0, vy: 0, color: '#ffb8ff', mode: 'chase' },
        { x: 9, y: 9, vx: 0, vy: 0, color: '#00ffff', mode: 'chase' },
        { x: 10, y: 8, vx: 0, vy: 0, color: '#ffb847', mode: 'chase' }
    ];

    generatePellets();
}

function generatePellets() {
    pacmanPellets = [];
    for (let y = 0; y < pacmanGridHeight; y++) {
        for (let x = 0; x < pacmanGridWidth; x++) {
            if (Math.random() > 0.15) {
                pacmanPellets.push({ x, y, eaten: false });
            }
        }
    }
}

function updatePacman() {
    if (pacmanPlayer.nextVx !== 0 || pacmanPlayer.nextVy !== 0) {
        const newX = pacmanPlayer.x + pacmanPlayer.nextVx;
        const newY = pacmanPlayer.y + pacmanPlayer.nextVy;

        if (newX >= 0 && newX < pacmanGridWidth && newY >= 0 && newY < pacmanGridHeight) {
            pacmanPlayer.vx = pacmanPlayer.nextVx;
            pacmanPlayer.vy = pacmanPlayer.nextVy;
            pacmanPlayer.nextVx = 0;
            pacmanPlayer.nextVy = 0;
        }
    }

    const newX = pacmanPlayer.x + pacmanPlayer.vx;
    const newY = pacmanPlayer.y + pacmanPlayer.vy;

    if (newX >= 0 && newX < pacmanGridWidth && newY >= 0 && newY < pacmanGridHeight) {
        pacmanPlayer.x = newX;
        pacmanPlayer.y = newY;
    } else if (pacmanPlayer.vx !== 0) {
        pacmanPlayer.x = pacmanPlayer.x + pacmanPlayer.vx < 0 ? pacmanGridWidth - 1 : 0;
    }

    if (pacmanPlayer.vx === 1) pacmanPlayer.direction = 0;
    else if (pacmanPlayer.vx === -1) pacmanPlayer.direction = 2;
    else if (pacmanPlayer.vy === -1) pacmanPlayer.direction = 3;
    else if (pacmanPlayer.vy === 1) pacmanPlayer.direction = 1;

    pacmanPellets.forEach(pellet => {
        if (pellet.x === pacmanPlayer.x && pellet.y === pacmanPlayer.y && !pellet.eaten) {
            pellet.eaten = true;
            pacmanScore += 10;

            const coinsAwarded = 2;
            sessionCoins += coinsAwarded;
            coins += coinsAwarded;
            updateCoinDisplay();
            document.getElementById('coinsEarned').textContent = sessionCoins;
            document.getElementById('score').textContent = String(pacmanScore).padStart(5, '0');
        }
    });

    pacmanGhosts.forEach((ghost, idx) => {
        let moveX = 0;
        let moveY = 0;

        if (Math.random() < 0.3) {
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            const dist = directions.map(d => {
                const dx = pacmanPlayer.x + d.x - ghost.x;
                const dy = pacmanPlayer.y + d.y - ghost.y;
                return dx * dx + dy * dy;
            });

            const minIdx = dist.indexOf(Math.min(...dist));
            moveX = directions[minIdx].x;
            moveY = directions[minIdx].y;
        } else {
            const r = Math.random();
            if (r < 0.25) moveX = 1;
            else if (r < 0.5) moveX = -1;
            else if (r < 0.75) moveY = 1;
            else moveY = -1;
        }

        const ghostNewX = ghost.x + moveX;
        const ghostNewY = ghost.y + moveY;

        if (ghostNewX >= 0 && ghostNewX < pacmanGridWidth && ghostNewY >= 0 && ghostNewY < pacmanGridHeight) {
            ghost.x = ghostNewX;
            ghost.y = ghostNewY;
        }
    });

    pacmanGhosts.forEach(ghost => {
        if (ghost.x === pacmanPlayer.x && ghost.y === pacmanPlayer.y) {
            endGame('pacman');
        }
    });

    if (pacmanPellets.every(p => p.eaten)) {
        pacmanLevel++;
        generatePellets();
        pacmanGhosts.forEach(ghost => {
            ghost.x = Math.floor(Math.random() * pacmanGridWidth);
            ghost.y = Math.floor(Math.random() * pacmanGridHeight);
        });
    }

    if (Math.random() < 0.1) {
        pacmanPlayer.mouthOpen = !pacmanPlayer.mouthOpen;
    }
}

function drawPacman() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color');
    const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color');

    ctx.fillStyle = accentColor;
    pacmanPellets.forEach(pellet => {
        if (!pellet.eaten) {
            ctx.fillRect(
                pellet.x * pacmanGridSize + pacmanGridSize / 2 - 2,
                pellet.y * pacmanGridSize + pacmanGridSize / 2 - 2,
                4,
                4
            );
        }
    });

    const pacX = pacmanPlayer.x * pacmanGridSize + pacmanGridSize / 2;
    const pacY = pacmanPlayer.y * pacmanGridSize + pacmanGridSize / 2;
    const mouthAngle = pacmanPlayer.mouthOpen ? 0.3 : 0.1;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(pacX, pacY, pacmanGridSize / 2 - 2, mouthAngle + pacmanPlayer.direction * Math.PI / 2,
        2 * Math.PI - mouthAngle + pacmanPlayer.direction * Math.PI / 2);
    ctx.lineTo(pacX, pacY);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        pacX + Math.cos(pacmanPlayer.direction * Math.PI / 2) * 3,
        pacY + Math.sin(pacmanPlayer.direction * Math.PI / 2) * 3,
        1.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    pacmanGhosts.forEach(ghost => {
        const ghostX = ghost.x * pacmanGridSize + pacmanGridSize / 2;
        const ghostY = ghost.y * pacmanGridSize + pacmanGridSize / 2;
        const ghostSize = pacmanGridSize / 2 - 2;

        ctx.fillStyle = ghost.color;

        ctx.beginPath();
        ctx.arc(ghostX, ghostY - 2, ghostSize, Math.PI, 0);
        ctx.lineTo(ghostX + ghostSize, ghostY + ghostSize - 2);
        ctx.lineTo(ghostX - ghostSize, ghostY + ghostSize - 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(ghostX - 3, ghostY - 2, 2, 2);
        ctx.fillRect(ghostX + 1, ghostY - 2, 2, 2);

        ctx.fillStyle = '#0000ff';
        ctx.fillRect(ghostX - 3, ghostY - 2, 1, 1);
        ctx.fillRect(ghostX + 1, ghostY - 2, 1, 1);
    });

    ctx.fillStyle = primaryColor;
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL: ${pacmanLevel}`, 20, 30);

    ctx.strokeStyle = secondaryColor;
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 1;
    for (let i = 0; i <= pacmanGridWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pacmanGridSize, 0);
        ctx.lineTo(i * pacmanGridSize, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= pacmanGridHeight; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * pacmanGridSize);
        ctx.lineTo(canvas.width, i * pacmanGridSize);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function pacmanGameLoop() {
    if (!gameRunning || currentGame !== 'pacman') return;

    updatePacman();
    drawPacman();

    setTimeout(() => pacmanGameLoop(), 100);
}


function startGame(gameName) {
    if (gameName === 'snake') {
        startSnakeGame();
    } else if (gameName === 'tetris') {
        startTetrisGame();
    } else if (gameName === 'pong') {
        startPongGame();
    } else if (gameName === 'invaders') {
        startInvadersGame();
    } else if (gameName === 'pacman') {
        startPacmanGame();
    } else {
        alert(`${gameName.toUpperCase()} - COMING SOON!`);
    }
}



// Pac-Man keydown listener scalony z głównym listenerem powyżej


// Daily bonus
const lastBonus = localStorage.getItem('arcadeLastBonus');
const today = new Date().toDateString();
if (lastBonus !== today) {
    const bonus = 5000;
    coins += bonus;
    updateCoinDisplay();
    localStorage.setItem('arcadeLastBonus', today);
    showDailyBonus(bonus);
}

function showDailyBonus(amount) {
    const overlay = document.createElement('div');
    overlay.id = 'dailyBonusOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        /* mniej przezroczyste tło */
        background: rgba(5,5,10,0.88);
        z-index: 20000;
        animation: dailyFadeIn 240ms ease-out;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        width: 340px;
        max-width: 92%;
        padding: 18px;
        border-radius: 12px;
        /* mniej przezroczyste tło pudełka */
        background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        color: var(--primary-color);
        text-align: center;
        font-family: "Press Start 2P", monospace;
        transform: scale(0.94);
        animation: popIn 360ms cubic-bezier(.2,.9,.3,1) forwards;
        backdrop-filter: blur(6px);
    `;
    box.innerHTML = `
        <div style="font-size:54px; line-height:1">🪙</div>
        <div style="margin-top:8px; font-size:13px; color:var(--accent-color)">DAILY BONUS</div>
        <div style="margin:12px 0; font-size:20px; color:var(--primary-color)">+${amount} COINS</div>
        <div style="font-size:11px; color:var(--secondary-color)">Dziękujemy za grę — wróć jutro po kolejny bonus!</div>
        <button id="dailyBonusClose" style="
            margin-top:14px;
            padding:8px 14px;
            border-radius:8px;
            border:none;
            background:var(--primary-color);
            color:#000;
            cursor:pointer;
            font-weight:700;
        ">OK</button>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const close = () => {
        overlay.style.transition = 'opacity 220ms ease, transform 220ms ease';
        overlay.style.opacity = '0';
        box.style.transform = 'scale(0.96)';
        setTimeout(() => overlay.remove(), 260);
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };

    document.getElementById('dailyBonusClose').onclick = close;
    document.addEventListener('keydown', onKey);

    // Auto-dismiss after 3.5s
    setTimeout(close, 3500);
}

// Wstrzyknięcie prostych keyframe'ów (jeśli jeszcze nie dodane)
if (!document.getElementById('dailyBonusStyles')) {
    const s = document.createElement('style');
    s.id = 'dailyBonusStyles';
    s.textContent = `
        @keyframes popIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes dailyFadeIn { from { opacity: 0 } to { opacity: 1 } }
    `;
    document.head.appendChild(s);
}