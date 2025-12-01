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
                
                // Flash effect
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
                if (playTime % 30 === 0) { // Every 30 seconds
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
        
        // Retro Stars
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
        
        // Retro Grid Lines
        let gridOffset = 0;
        
        function drawRetroGrid() {
            bgCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
            bgCtx.lineWidth = 1;
            bgCtx.globalAlpha = 0.08;
            
            const spacing = 50;
            gridOffset = (gridOffset + 0.5) % spacing;
            
            // Vertical lines
            for (let x = gridOffset; x < bgCanvas.width; x += spacing) {
                bgCtx.beginPath();
                bgCtx.moveTo(x, bgCanvas.height * 0.5);
                bgCtx.lineTo(x, bgCanvas.height);
                bgCtx.stroke();
            }
            
            // Horizontal lines
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
            
            // Random flicker effect
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
        
        // Sound effect simulation (visual feedback)
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
                    if (selectedGame === 'snake') {
                        startSnakeGame();
                    } else {
                        alert(`${selectedGame.toUpperCase()} - COMING SOON!`);
                    }
                    break;
            }
        });
        
        gameItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                updateSelection();
                if (item.dataset.game === 'snake') {
                    startSnakeGame();
                } else {
                    alert(`COMING SOON!`);
                }
            });
            
            item.addEventListener('mouseenter', () => {
                currentIndex = index;
                updateSelection();
                playSelectSound();
            });
        });
        
        // Snake Game
        let snake, food, dx, dy, score, highScore, gameRunning, sessionCoins;
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        const tileCount = 20;
        
        canvas.width = gridSize * tileCount;
        canvas.height = gridSize * tileCount;
        
        function startSnakeGame() {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';
            
            highScore = localStorage.getItem('arcadeSnakeHighScore') || 0;
            document.getElementById('highScore').textContent = String(highScore).padStart(5, '0');
            
            sessionCoins = 0;
            document.getElementById('coinsEarned').textContent = '0';
            
            initGame();
            gameRunning = true;
            playTime = 0;
            gameLoop();
        }
        
        function initGame() {
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
        
        function gameLoop() {
            if (!gameRunning) return;
            
            update();
            draw();
            
            setTimeout(() => gameLoop(), 120);
        }
        
        function update() {
            if (dx === 0 && dy === 0) return;
            
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            // Check walls
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food
            if (head.x === food.x && head.y === food.y) {
                score += 100;
                document.getElementById('score').textContent = String(score).padStart(5, '0');
                
                // Award coins
                const coinsAwarded = Math.floor(10 + Math.random() * 5);
                sessionCoins += coinsAwarded;
                coins += coinsAwarded;
                updateCoinDisplay();
                document.getElementById('coinsEarned').textContent = sessionCoins;
                
                generateFood();
                
                // Flash effect
                canvas.style.boxShadow = '0 0 0 2px var(--secondary-color), 0 0 0 4px var(--accent-color), 0 0 80px var(--primary-color)';
                setTimeout(() => {
                    canvas.style.boxShadow = '0 0 0 2px var(--secondary-color), 0 0 0 4px var(--accent-color), 0 0 40px var(--border-glow)';
                }, 100);
            } else {
                snake.pop();
            }
        }
        
        function draw() {
            // Clear with theme background
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw pixel grid
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
            
            // Draw snake - theme colors
            const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
            const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color');
            
            snake.forEach((segment, index) => {
                if (index === 0) {
                    // Head
                    ctx.fillStyle = primaryColor;
                    ctx.fillRect(
                        segment.x * gridSize + 2,
                        segment.y * gridSize + 2,
                        gridSize - 4,
                        gridSize - 4
                    );
                    // Eyes
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
                    // Body
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
            
            // Draw food - flashing
            const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            ctx.fillStyle = pulse > 0.5 ? secondaryColor : getComputedStyle(document.body).getPropertyValue('--accent-color');
            
            // Food shape
            ctx.beginPath();
            ctx.arc(
                food.x * gridSize + gridSize/2,
                food.y * gridSize + gridSize/2,
                gridSize/3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Food shine
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                food.x * gridSize + 6,
                food.y * gridSize + 6,
                4,
                4
            );
        }
        
        function gameOver() {
            gameRunning = false;
            
            // Bonus coins for high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('arcadeSnakeHighScore', highScore);
                document.getElementById('highScore').textContent = String(highScore).padStart(5, '0');
                document.getElementById('globalHighScore').textContent = String(highScore).padStart(6, '0');
                
                // High score bonus
                const bonus = 50;
                coins += bonus;
                sessionCoins += bonus;
                updateCoinDisplay();
                document.getElementById('coinsEarned').textContent = sessionCoins;
            }
            
            // Retro game over screen
            ctx.fillStyle = 'rgba(5, 5, 16, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
            ctx.font = 'bold 24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME', canvas.width/2, canvas.height/2 - 20);
            ctx.fillText('OVER', canvas.width/2, canvas.height/2 + 20);
            
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(`SCORE: ${score}`, canvas.width/2, canvas.height/2 + 60);
            ctx.fillText(`+${sessionCoins} COINS`, canvas.width/2, canvas.height/2 + 90);
            
            setTimeout(() => {
                if (confirm(`GAME OVER!\n\nSCORE: ${score}\nCOINS EARNED: ${sessionCoins}\n\nPLAY AGAIN?`)) {
                    sessionCoins = 0;
                    document.getElementById('coinsEarned').textContent = '0';
                    initGame();
                    gameRunning = true;
                    gameLoop();
                } else {
                    backToMenu();
                }
            }, 1000);
        }
        
        function backToMenu() {
            gameRunning = false;
            document.getElementById('gameContainer').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        }
        
        // Snake Controls
        document.addEventListener('keydown', (e) => {
            if (!gameRunning || document.getElementById('gameContainer').style.display !== 'flex') return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (dy === 0) {
                        dx = 0;
                        dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (dy === 0) {
                        dx = 0;
                        dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (dx === 0) {
                        dx = -1;
                        dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (dx === 0) {
                        dx = 1;
                        dy = 0;
                    }
                    break;
                case 'Escape':
                    backToMenu();
                    break;
            }
        });
        
        // Daily bonus
        const lastBonus = localStorage.getItem('arcadeLastBonus');
        const today = new Date().toDateString();
        if (lastBonus !== today) {
            coins += 100;
            updateCoinDisplay();
            localStorage.setItem('arcadeLastBonus', today);
            alert('DAILY BONUS!\n+100 COINS!');
        }