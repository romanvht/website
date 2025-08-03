class MatrixAnimation {
    constructor(elementId, nickname) {
        this.c = document.createElement('canvas');
        this.ctx = this.c.getContext('2d');
        this.nickname = nickname;
        this.init(elementId);
    }

    init(elementId) {
        this.c.width = window.innerWidth;
        this.c.height = window.innerHeight;
        this.c.style.opacity = 1;
        document.getElementById(elementId).appendChild(this.c);

        this.characters = this.nickname.split('');
        this.fontSize = 14;
        this.columns = this.c.width / this.fontSize;
        this.drops = [];

        for (let x = 0; x < this.columns; x++) {
            this.drops[x] = 1;
        }

        this.draw();
    }

    draw() {
        this.interval = setInterval(() => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.c.width, this.c.height);

            this.ctx.fillStyle = '#0F0';
            this.ctx.font = this.fontSize + 'px monospace';

            for (let i = 0; i < this.drops.length; i++) {
                const text = this.characters[Math.floor(Math.random() * this.characters.length)];
                this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

                if (this.drops[i] * this.fontSize > this.c.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
                this.drops[i]++;
            }
        }, 33);
    }

    stop() {
        const fadeOutInterval = setInterval(() => {
            this.c.style.opacity -= 0.05;
            if (this.c.style.opacity <= 0) {
                clearInterval(fadeOutInterval);
                clearInterval(this.interval);
                this.c.parentNode.remove();
            }
        }, 50);
    }
}
