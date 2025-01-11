const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const catapultFireSound = new Audio('audio/catapult.mp3');
const splatSound = new Audio('audio/splat.mp3');

canvas.width = 500;
canvas.height = 500;

const intro_img = new Image();
intro_img.src = 'http://localhost:8000/intro.png';

const bg_img = new Image();
bg_img.src = 'http://localhost:8000/bg.png';

const trees_img = new Image();
trees_img.src = 'http://localhost:8000/trees.png';

const brownGoblin_img = new Image();
brownGoblin_img.src = 'http://localhost:8000/goblin1a.png';

const blueGoblin_img = new Image();
blueGoblin_img.src = 'http://localhost:8000/goblin2a.png';

const redGoblin_img = new Image();
redGoblin_img.src = 'http://localhost:8000/goblin3a.png';

const yellowGoblin_img = new Image();
yellowGoblin_img.src = 'http://localhost:8000/goblin4a.png';

const tomato_img = new Image();
tomato_img.src = 'http://localhost:8000/tomato.png';

const catapult_img = new Image();
catapult_img.src = 'http://localhost:8000/catapult_anim.png';




class Tower {
    constructor() {
        this.x = canvas.width / 2;
        this.y = 450;
        this.width = 60;
        this.height = 60;
        this.radius = 25;
        this.angle = 4.75;
        this.rotationSpeed = 0.02;
        this.hp = 100;
        this.projectiles = [];
        this.fireRate = 500;
        this.lastFired = 0;
        this.image = catapult_img;
        this.frames = 4;
        this.currentFrame = 0;
        this.frameDelay = 5;
        this.frameTimer = 0;
        this.isAnimating = false
    }

    fireProjectile() {
        const now = Date.now();
        if (now - this.lastFired >= this.fireRate) {
          
            const newProjectile = new Projectile(this.x, this.y, this.angle, 5);
            this.projectiles.push(newProjectile);
            this.lastFired = now;
            this.isAnimating = true
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();
            projectile.draw(ctx);
            return !projectile.isOffScreen(canvas);
        });
    }
    updateAnimation() {
        if (this.isAnimating){
            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                this.currentFrame++
                this.frameTimer = 0;
                if (this.currentFrame >= this.frames) {
                    this.isAnimating = false;
                    this.currentFrame = 0;
                }
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        // Draw tower body
        ctx.drawImage(
            this.image,
            this.width * this.currentFrame,
            0,
            this.width,
            this.height,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );

        ctx.restore();
    }

    update() {
        if (keys.ArrowLeft) {
            this.angle -= this.rotationSpeed;
        } else if (keys.ArrowRight) {
            this.angle += this.rotationSpeed;
        }

        if (keys.Space) {
            this.fireProjectile();
        }
        this.updateProjectiles();
        this.updateAnimation();
        this.draw();
    }
}
class Projectile {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.drawImage(tomato_img, this.x-8, this.y, 16, 20)
    }

    isOffScreen(canvas) {
        return (
            this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height
        );
    }
}

class Enemy {
    constructor(x, y, type, image, speed, hp, resethp, score) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 32;
        this.hp = 100;
        this.type = type;
        this.image = image;
        this.speed = speed
        this.hp = hp
        this.resethp = resethp
        this.score = score
        this.frames = 8
        this.frameDelay = 5;
        this.frameTimer = 0;
        this.currentSprite = this.image
    }

    draw() {
        ctx.drawImage(
            this.currentSprite,
            this.width * this.frames,
            0,
            this.width,
            32,
            this.x,
            this.y,
            this.width,
            this.height)
        
        //Health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y - 5, 25, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y - 5, (this.hp / this.resethp) * 25, 5);
    }

    update() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frames++;
            this.frameTimer = 0;
        }

        if (this.frames >= 8 && 
            this.currentSprite === this.image){
                this.frames = 0 
            } 

        this.draw();

        this.x += this.speed
        if (this.x >= canvas.width) {
            this.x = 0 - this.width
        }
    }
}

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    KeyP: false,
    Enter: false
};

let score = 0
const timeNow = Date.now();
let gameOver = true

const tower = new Tower()
const enemy_red = new Enemy(-25, 300, 'Level1', brownGoblin_img, 1, 10, 10, 10);
const enemy_blue = new Enemy(-25, 225, 'Level2', blueGoblin_img, 1.5, 20, 20, 20);
const enemy_orange = new Enemy(-25, 150, 'Level2', redGoblin_img, 1.75, 30, 30, 50);
const enemy_purple = new Enemy(-25, 75, 'Level4', yellowGoblin_img, 2, 40, 40, 100);

function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.radius * 2 > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.radius * 2 > obj2.y
    );
}

function text() {
    ctx.font = '40px Impact';
    ctx.fillStyle = 'red';
    ctx.fillText(`ROTTEN TOMATOS`, 110, 50);
}

function scoreText() {
    ctx.font = '20px Orbitron';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 90, 430);
}
//Timer
const countdownDuration = 60 * 1000;
const endTime = Date.now() + countdownDuration;

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  return `Time: ${seconds}`;
}

function timerText() {
    const currentTime = Date.now();
    const remainingTime = Math.max(0, endTime - currentTime);
    ctx.font = '20px Orbitron';
    ctx.fillStyle = 'white';
    ctx.fillText(formatTime(remainingTime), 310, 430);
    if (remainingTime <= 0) {
        gameOverMessage();
    }
   

}

function gameStart() {
    ctx.drawImage(intro_img,0,0,canvas.width,canvas.height);
}

document.fonts.ready.then(() => {
    gameStart();
});

function gameOverMessage () {
    ctx.fillStyle = 'white';
    ctx.fillRect(50, 200, 400, 75);
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(50, 200, 400, 75);
    ctx.font = '50px Orbitron';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 70, 245);
    ctx.font = '25px Orbitron';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 180, 270);
    ctx.fillStyle = 'black'
    ctx.fillText('Hit P to play again', 130, 320);
    gameOver = true
}


function gameLoop() {
    if (!gameOver)
        requestAnimationFrame(gameLoop);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg_img,0,0,canvas.width,canvas.height)
        
        tower.update();

        const enemies = [enemy_red, enemy_blue, enemy_orange, enemy_purple];
        enemies.forEach(enemy => enemy.update());

        ctx.drawImage(trees_img,0,0,canvas.width,canvas.height)

        tower.projectiles = tower.projectiles.filter(projectile => {
            let hit = false;
            enemies.forEach(enemy => {
                if (isColliding(projectile, enemy)) {
                    hit = true;
                    enemy.hp -= 10;
                    splatSound.play();
                    if (enemy.hp <= 0) {
                        enemy.x = -enemy.width;
                        enemy.hp = enemy.resethp;
                        score += enemy.score
                    }
                }
            });
            return !hit && !projectile.isOffScreen(canvas);
        });
        text();
        scoreText();
        timerText(); 
    }

gameStart();


document.addEventListener('keydown', (e) => {
    console.log(e.code)
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    if (e.code === 'Enter' && gameOver) {
        gameOver = false;
        gameLoop();
    }
    if (e.code === 'KeyP' && gameOver) {
        location.reload();
    }
    if (e.code === 'Space' && !gameOver) {
        //catapultFireSound.currentTime = 0;
        catapultFireSound.play();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
