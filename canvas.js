/**
 * GITHUB GRAVEYARD — CANVAS ANIMATION ENGINE
 * Handles performance-capped ambient particle canvas & radar sweep visuals.
 */

(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let particles = [];

    // Tokens and symbols rendered floating upward
    const CODE_TOKENS = ['0', '1', 'RIP', '404', 'null', '0x0', '{}', 'NaN', ';'];
    const MAX_PARTICLES = 45; // Performance cap for low-end displays

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.size = Math.random() * 12 + 10;
            this.speedY = Math.random() * 0.8 + 0.2;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.type = Math.random() > 0.4 ? 'token' : 'ember';
            this.token = CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)];
            this.color = Math.random() > 0.3 ? '#22c55e' : '#ef4444';
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;

            if (this.y < -50) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            if (this.type === 'token') {
                ctx.font = `${Math.floor(this.size)}px "Courier New", monospace`;
                ctx.fillText(this.token, this.x, this.y);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const p = new Particle();
            p.y = Math.random() * height; // Distribute initial particles vertically
            particles.push(p);
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(render);
    }

    // Initialize Canvas
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    render();

    // Radar Overlay Helper Controls
    window.GraveyardRadar = {
        show: function () {
            const radar = document.getElementById('radar-container');
            if (radar) radar.classList.remove('hidden');
        },
        hide: function () {
            const radar = document.getElementById('radar-container');
            if (radar) radar.classList.add('hidden');
        }
    };
})();