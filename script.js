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

// Initialize
updateCoinDisplay();
applyTheme(currentTheme);
document.getElementById('globalHighScore').textContent = String(localStorage.getItem('arcadeSnakeHighScore') || 0).padStart(6, '0');

// Add coins periodically for playing
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

// Retro Background Animation
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

// Menu Navigation
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

    switch(e.key) {
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

// Game System
let currentGame = null;
let gameRunning = false;
let sessionCoins = 0;

function startGame(gameName) {
    if (gameName === 'snake') {
        startSnakeGame();
    } else if (gameName === 'tetris') {
        startTetrisGame();
    } else if (gameName === 'pong') {
        startPongGame();
    } else {
        alert(`${gameName.toUpperCase()} - COMING SOON!`);
    }
}

function backToMenu() {
    gameRunning = false;
    currentGame = null;
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
}

// ===== SNAKE GAME =====
let snake, food, dx, dy, score, highScore;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = 20;

canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

function startSnakeGame() {
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
    snake = [{x: 10, y: 10}];
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

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

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
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/3,
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

// ===== TETRIS GAME (SZYBSZY) =====
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

// ===== PONG GAME (SZYBSZY, STRZALKI) =====
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

    // Gracz (lewy paddle)
    pongPaddles[0].y += pongPaddles[0].vy;
    pongPaddles[0].y = Math.max(0, Math.min(canvas.height - pongPaddles[0].height, pongPaddles[0].y));

    // Bot AI (prawy paddle)
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

    // Kolizje z paddlami
    pongPaddles.forEach((paddle, idx) => {
        if (pongBall.x - pongBall.radius < paddle.x + paddle.width &&
            pongBall.x + pongBall.radius > paddle.x &&
            pongBall.y > paddle.y &&
            pongBall.y < paddle.y + paddle.height) {
            
            pongBall.vx = Math.abs(pongBall.vx) * (idx === 0 ? 1 : -1);
            pongBall.vx *= 1.08;
            
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

    // Piłka
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Paletki
    pongPaddles.forEach((paddle, idx) => {
        ctx.fillStyle = idx === 0 ? primaryColor : accentColor;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    });

    // Linia środkowa
    ctx.strokeStyle = primaryColor;
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score
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

function endGame(gameName) {
    gameRunning = false;

    let finalScore = gameName === 'snake' ? score : (gameName === 'tetris' ? tetrisScore : pongScore[0]);
    const storageKey = gameName === 'snake' ? 'arcadeSnakeHighScore' : (gameName === 'tetris' ? 'arcadeTetrisHighScore' : 'arcadePongHighScore');

    const currentHighScore = parseInt(localStorage.getItem(storageKey) || 0);

    if (finalScore > currentHighScore) {
        localStorage.setItem(storageKey, finalScore);
        document.getElementById('highScore').textContent = String(finalScore).padStart(5, '0');
        document.getElementById('globalHighScore').textContent = String(finalScore).padStart(6, '0');

        const bonus = 50;
        coins += bonus;
        sessionCoins += bonus;
        updateCoinDisplay();
        document.getElementById('coinsEarned').textContent = sessionCoins;
    }

    ctx.fillStyle = 'rgba(5, 5, 16, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
    ctx.font = 'bold 24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME', canvas.width/2, canvas.height/2 - 20);
    ctx.fillText('OVER', canvas.width/2, canvas.height/2 + 20);

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`SCORE: ${finalScore}`, canvas.width/2, canvas.height/2 + 60);
    ctx.fillText(`+${sessionCoins} COINS`, canvas.width/2, canvas.height/2 + 90);

    setTimeout(() => {
        if (confirm(`GAME OVER!\n\nSCORE: ${finalScore}\nCOINS EARNED: ${sessionCoins}\n\nPLAY AGAIN?`)) {
            if (gameName === 'snake') startSnakeGame();
            else if (gameName === 'tetris') startTetrisGame();
            else if (gameName === 'pong') startPongGame();
        } else {
            backToMenu();
        }
    }, 1000);
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (currentGame === 'snake') {
        switch(e.key) {
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
        switch(e.key) {
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
});

document.addEventListener('keyup', (e) => {
    if (currentGame === 'pong') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            pongPaddles[0].vy = 0;
        }
    }
});

// Daily bonusss
const lastBonus = localStorage.getItem('arcadeLastBonus');
const today = new Date().toDateString();
if (lastBonus !== today) {
    coins += 100;
    updateCoinDisplay();
    localStorage.setItem('arcadeLastBonus', today);
    alert('DAILY BONUS!\n+100 COINS!');
}