        const canvas = document.getElementById('backgroundCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const colors = ['#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#ff0080'];
        const particleTypes = ['✦', '★', '◆', '●', '▲', '♦', '⬢', '◊', '◈', '⚡'];
        const particles = [];
        const meteors = [];
        const sparks = [];
        const particleCount = 80;
        const meteorCount = 8;
        const sparkCount = 40;

        class Spark {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = (Math.random() - 0.5) * 4;
                this.life = 60 + Math.random() * 60;
                this.maxLife = this.life;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = 2 + Math.random() * 4;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
                this.vx *= 0.98;
                this.vy *= 0.98;
                if (this.life <= 0) { this.reset(); }
            }
            draw() {
                ctx.save();
                const alpha = this.life / this.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        class Particle {
            constructor() { this.reset(); this.y = Math.random() * canvas.height; }
            reset() {
                this.x = -50;
                this.y = Math.random() * canvas.height;
                this.vx = 0.5 + Math.random() * 2.5;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = 6 + Math.random() * 12;
                this.symbol = particleTypes[Math.floor(Math.random() * particleTypes.length)];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = 0.4 + Math.random() * 0.6;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.1;
                this.rotation = 0;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.pulsePhase += 0.03;
                this.rotation += this.rotationSpeed;
                if (this.x > canvas.width + 50) { this.reset(); }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                const pulseOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.3;
                ctx.globalAlpha = Math.max(0.1, pulseOpacity);
                ctx.fillStyle = this.color;
                ctx.font = `${this.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15;
                ctx.fillText(this.symbol, 0, 0);
                ctx.restore();
            }
        }
        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = canvas.width + 50;
                this.y = Math.random() * canvas.height;
                this.vx = -3 - Math.random() * 4;
                this.vy = (Math.random() - 0.5) * 2;
                this.size = 15 + Math.random() * 25;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.tail = [];
                this.opacity = 0.8;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.tail.push({x: this.x, y: this.y});
                if (this.tail.length > 15) { this.tail.shift(); }
                if (this.x < -100) { this.reset(); }
            }
            draw() {
                ctx.save();
                for (let i = 0; i < this.tail.length; i++) {
                    const point = this.tail[i];
                    const alpha = (i / this.tail.length) * this.opacity * 0.5;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, this.size * (i / this.tail.length), 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }
        for (let i = 0; i < meteorCount; i++) { meteors.push(new Meteor()); }
        for (let i = 0; i < sparkCount; i++) { sparks.push(new Spark()); }

        let wavePhase = 0;
        function drawEnergyWaves() {
            wavePhase += 0.02;
            ctx.save();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x += 10) {
                    const y = canvas.height * 0.5 + Math.sin((x * 0.01) + wavePhase + (i * 2)) * (50 + i * 20);
                    if (x === 0) { ctx.moveTo(x, y); }
                    else { ctx.lineTo(x, y); }
                }
                ctx.stroke();
            }
            ctx.restore();
        }
        function createLightningEffect() {
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height;
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            for (let i = 0; i < 5; i++) {
                const x = startX + (Math.random() - 0.5) * 200;
                const y = startY + (Math.random() - 0.5) * 200;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
            setTimeout(() => {}, 50);
        }
        function renderBackgroundElements() {
            particles.forEach(p => { p.update(); p.draw(); });
            meteors.forEach(m => { m.update(); m.draw(); });
            sparks.forEach(s => { s.update(); s.draw(); });
            drawEnergyWaves();
        }

        function renderSpecialEffects() {
            if (Math.random() < 0.005) { 
                createLightningEffect(); 
            }
        }

        function animationLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderBackgroundElements();
            renderSpecialEffects();
            requestAnimationFrame(animationLoop);
        }

        animationLoop(); 

        const gameItems = document.querySelectorAll('.game-item');
        let currentIndex = 0;
        function updateSelection() {
            gameItems.forEach((item, index) => {
                item.classList.toggle('selected', index === currentIndex);
            });
        }
        function launchGame(gameId) {
            const selectedGame = document.querySelector(`[data-game="${gameId}"]`);
            selectedGame.style.transform = 'scale(1.05) translateX(10px)';
            selectedGame.style.boxShadow = '0 0 40px rgba(0, 255, 0, 1)';
            const flash = document.createElement('div');
            flash.className = 'launch-flash'; // Proste, prawda?
            document.body.appendChild(flash);
            setTimeout(() => {
                alert(`wkrotce: ${gameId.toUpperCase()}!\n\n⚡ Wkrtoce!`);
                selectedGame.style.transform = '';
                selectedGame.style.boxShadow = '';
                flash.remove();
            }, 300);
        }
        function createNavigationEffect() {
            const effect = document.createElement('div');
            effect.innerHTML = '►';
            effect.style.cssText = `
                position: fixed;
                left: 20px;
                top: 50%;
                color: #00ff00;
                font-size: 2rem;
                animation: navEffect 0.4s ease-out forwards;
                pointer-events: none;
                z-index: 1000;
                text-shadow: 0 0 10px #00ff00;
            `;
            document.body.appendChild(effect);
            setTimeout(() => effect.remove(), 400);
        }
        function navigateUp() {
            currentIndex = (currentIndex - 1 + gameItems.length) % gameItems.length;
            updateSelection();
            createNavigationEffect();
        }

        function navigateDown() {
            currentIndex = (currentIndex + 1) % gameItems.length;
            updateSelection();
            createNavigationEffect();
        }

        function selectGame() {
            const selectedGameId = gameItems[currentIndex].dataset.game;
            launchGame(selectedGameId);
        }

        function requestExit() {
            if (confirm('Czy na pewno chcesz opuścić RETRO ARCADE?')) {
                window.close();
            }
        }

        const keyActions = {
            'ArrowUp': navigateUp,
            'ArrowDown': navigateDown,
            'Enter': selectGame,
            'Escape': requestExit,
        };

        document.addEventListener('keydown', (e) => {
            const action = keyActions[e.key];
            if (action) {
                e.preventDefault();
                action();
            }
        });
        gameItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                currentIndex = index;
                updateSelection();
            });
            item.addEventListener('click', () => {
                launchGame(item.dataset.game);
            });
        });
        function createTemporaryEffect(cssText, duration) {
            const effect = document.createElement('div');
            effect.style.cssText = cssText;
            document.body.appendChild(effect);
            setTimeout(() => effect.remove(), duration);
        }

        setInterval(() => {
            if (Math.random() < 0.3) {
                const corner = Math.floor(Math.random() * 4);
                let position = '';
                switch (corner) {
                    case 0: position = 'top: 0; left: 0;'; break;
                    case 1: position = 'top: 0; right: 0;'; break;
                    case 2: position = 'bottom: 0; left: 0;'; break;
                    case 3: position = 'bottom: 0; right: 0;'; break;
                }
                const css = `
                    position: fixed; ${position} width: 100px; height: 100px;
                    background: radial-gradient(circle, rgba(0,255,255,0.5) 0%, transparent 70%);
                    pointer-events: none; z-index: 1; animation: cornerFlash 0.8s ease-out forwards;
                `;
                createTemporaryEffect(css, 800);
            }
        }, 200);

        setInterval(() => {
            if (Math.random() < 0.4) {
                const isHorizontal = Math.random() < 0.5;
                const color = colors[Math.floor(Math.random() * colors.length)];
                let css = '';
                let duration = 1500;

                if (isHorizontal) {
                    css = `
                        position: fixed; top: ${Math.random() * 100}vh; left: -100%;
                        width: 200%; height: 2px; background: linear-gradient(90deg, transparent, ${color}, transparent);
                        box-shadow: 0 0 10px ${color}; pointer-events: none; z-index: 1;
                        animation: horizontalSweep 1.5s ease-out forwards;
                    `;
                } else {
                    duration = 1200;
                    css = `
                        position: fixed; left: ${Math.random() * 100}vw; top: -100%;
                        width: 2px; height: 200%; background: linear-gradient(180deg, transparent, ${color}, transparent);
                        box-shadow: 0 0 10px ${color}; pointer-events: none; z-index: 1;
                        animation: verticalSweep 1.2s ease-out forwards;
                    `;
                }
                createTemporaryEffect(css, duration);
            }
        }, 300);
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes flashEffect {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
            @keyframes navEffect {
                0% { transform: translateY(-50%) translateX(-20px); opacity: 0; }
                50% { transform: translateY(-50%) translateX(0px); opacity: 1; }
                100% { transform: translateY(-50%) translateX(20px); opacity: 0; }
            }
            @keyframes cornerFlash {
                0% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.5); }
            }
            @keyframes horizontalSweep {
                0% { transform: translateX(-50%); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(50%); opacity: 0; }
            }
            @keyframes verticalSweep {
                0% { transform: translateY(-50%); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(50%); opacity: 0; }
            }
            @keyframes matrixRain {
                0% { transform: translateY(-100vh); opacity: 1; }
                100% { transform: translateY(100vh); opacity: 0; }
            }
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, rgba(0,255,0,0.05) 0%, transparent 70%);
                pointer-events: none;
                z-index: 0;
                animation: bodyGlow 4s ease-in-out infinite alternate;
            }
            @keyframes bodyGlow {
                0% { opacity: 0.3; }
                100% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(styleSheet);