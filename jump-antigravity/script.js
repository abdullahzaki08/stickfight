const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

class Sprite {
    constructor({ position, velocity, color, offset, isPlayer1 }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey = '';
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: offset,
            width: 100,
            height: 50
        };
        this.color = color;
        this.isAttacking = false;
        this.health = 100;
        this.isBlocking = false;
        this.isPlayer1 = isPlayer1;
        this.facing = isPlayer1 ? 1 : -1; // 1 for right, -1 for left
    }

    draw() {
        ctx.save();
        
        // Draw Stickman
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const x = this.position.x + this.width / 2;
        const y = this.position.y;

        // Head
        ctx.beginPath();
        ctx.arc(x, y + 20, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(x, y + 35);
        ctx.lineTo(x, y + 100);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        if (this.isAttacking) {
            // Punching arm
            ctx.moveTo(x, y + 50);
            ctx.lineTo(x + (this.facing * 60), y + 50);
        } else if (this.isBlocking) {
            // Blocking arms
            ctx.moveTo(x, y + 50);
            ctx.lineTo(x + (this.facing * 20), y + 30);
            ctx.moveTo(x, y + 60);
            ctx.lineTo(x + (this.facing * 20), y + 40);
        } else {
            // Idle arms
            ctx.moveTo(x, y + 50);
            ctx.lineTo(x - 20, y + 80);
            ctx.moveTo(x, y + 50);
            ctx.lineTo(x + 20, y + 80);
        }
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(x, y + 100);
        ctx.lineTo(x - 20, y + 150);
        ctx.moveTo(x, y + 100);
        ctx.lineTo(x + 20, y + 150);
        ctx.stroke();

        // Draw attack box (for debugging - remove later)
        /*
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height
            );
        }
        */

        ctx.restore();
    }

    update() {
        this.draw();
        
        // Update attack box position
        this.attackBox.position.x = this.position.x + (this.facing === 1 ? this.width : -this.attackBox.width);
        this.attackBox.position.y = this.position.y + 50;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Gravity logic
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 60) {
            this.velocity.y = 0;
            this.position.y = canvas.height - 60 - this.height;
        } else {
            this.velocity.y += gravity;
        }
    }

    attack() {
        if (this.isBlocking) return;
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}

const player = new Sprite({
    position: { x: 150, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#ff4d4d',
    offset: { x: 0, y: 0 },
    isPlayer1: true
});

const enemy = new Sprite({
    position: { x: 800, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#0984e3',
    offset: { x: -50, y: 0 },
    isPlayer1: false
});

const keys = {
    // Player 1
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    l: { pressed: false },
    // Player 2
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    s: { pressed: false },
    q: { pressed: false }
};

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

function determineWinner({ player, enemy, timerId }) {
    clearTimeout(timerId);
    document.querySelector('#game-over-screen').classList.remove('hidden');
    if (player.health === enemy.health) {
        document.querySelector('#winner-text').innerHTML = 'Tie';
    } else if (player.health > enemy.health) {
        document.querySelector('#winner-text').innerHTML = 'Player 1 Wins!';
    } else {
        document.querySelector('#winner-text').innerHTML = 'Player 2 Wins!';
    }
    
    // Redirect after 2 seconds to loser page
    setTimeout(() => {
        window.location.href = 'loser.html';
    }, 2000);
}

let timer = 99;
let timerId;
function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({ player, enemy, timerId });
    }
}

// Draw static background elements
function drawBackground() {
    // Draw Floor
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // Draw stylized mountains (based on image)
    ctx.fillStyle = '#636e72';
    // Mountain 1
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height - 60);
    ctx.lineTo(150, 200);
    ctx.lineTo(350, canvas.height - 60);
    ctx.fill();
    
    // Mountain 2
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.moveTo(100, canvas.height - 60);
    ctx.lineTo(300, 300);
    ctx.lineTo(500, canvas.height - 60);
    ctx.fill();

    // Mountain 3 (right side)
    ctx.fillStyle = '#636e72';
    ctx.beginPath();
    ctx.moveTo(700, canvas.height - 60);
    ctx.lineTo(900, 250);
    ctx.lineTo(1100, canvas.height - 60);
    ctx.fill();

    // Sun/Moon
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(550, 150, 30, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    // Cloud 1
    ctx.beginPath();
    ctx.arc(200, 100, 20, 0, Math.PI * 2);
    ctx.arc(220, 100, 25, 0, Math.PI * 2);
    ctx.arc(245, 100, 20, 0, Math.PI * 2);
    ctx.fill();
    // Cloud 2
    ctx.beginPath();
    ctx.arc(800, 120, 20, 0, Math.PI * 2);
    ctx.arc(825, 120, 25, 0, Math.PI * 2);
    ctx.arc(850, 120, 20, 0, Math.PI * 2);
    ctx.fill();
}

let gameRunning = false;

function animate() {
    if (!gameRunning) return;
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();

    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // Player 1 Movement
    if (keys.ArrowLeft.pressed && player.lastKey === 'ArrowLeft') {
        player.velocity.x = -5;
        player.facing = -1;
    } else if (keys.ArrowRight.pressed && player.lastKey === 'ArrowRight') {
        player.velocity.x = 5;
        player.facing = 1;
    }

    // Player 2 Movement
    if (keys.a.pressed && enemy.lastKey === 'a') {
        enemy.velocity.x = -5;
        enemy.facing = -1;
    } else if (keys.d.pressed && enemy.lastKey === 'd') {
        enemy.velocity.x = 5;
        enemy.facing = 1;
    }

    // Collision Detection: Player 1 attacks Enemy
    if (
        rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking
    ) {
        player.isAttacking = false;
        if (!enemy.isBlocking) {
            enemy.health -= 15;
            document.querySelector('#p2-health').style.width = enemy.health + '%';
        }
    }

    // Collision Detection: Enemy attacks Player
    if (
        rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking
    ) {
        enemy.isAttacking = false;
        if (!player.isBlocking) {
            player.health -= 15;
            document.querySelector('#p1-health').style.width = player.health + '%';
        }
    }

    // End game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });
        gameRunning = false;
    }
}

// Start Game Event
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    gameRunning = true;
    decreaseTimer();
    animate();
});

// Restart Event
document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload();
});

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Player 1
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            player.lastKey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            player.lastKey = 'ArrowLeft';
            break;
        case 'ArrowUp':
            if (player.velocity.y === 0) player.velocity.y = -20;
            break;
        case 'ArrowDown':
            player.attack();
            break;
        case 'l':
        case 'L':
            player.isBlocking = true;
            break;

        // Player 2
        case 'd':
            keys.d.pressed = true;
            enemy.lastKey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            enemy.lastKey = 'a';
            break;
        case 'w':
            if (enemy.velocity.y === 0) enemy.velocity.y = -20;
            break;
        case 's':
            enemy.attack();
            break;
        case 'q':
        case 'Q':
            enemy.isBlocking = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Player 1
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'l':
        case 'L':
            player.isBlocking = false;
            break;

        // Player 2
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'q':
        case 'Q':
            enemy.isBlocking = false;
            break;
    }
});
