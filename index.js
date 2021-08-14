// Getting the canvas and context
canvas=document.getElementById('game-canvas');
ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

window.addEventListener('resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
})

let startGameBtn= document.querySelector('#start-game-button');
let playAgainBtn= document.querySelector('#play-again-button');
let gameStartModal= document.querySelector('#game-start-modal');
let gameOverModal= document.querySelector('#game-over-modal');
let upperScore= document.querySelector('#upper-score');
gameOverModal.style.display='none';

let projectilesArray=[];
let enemiesArray=[];
let particlesArray=[];
let score=0;
let loopMusic = new Audio('beats.mp3');
let explosion = new Audio('short-explosion.wav')

function initGame(){
    projectilesArray=[];
    enemiesArray=[];
    particlesArray=[];
    score=0;
}

// Defining classes and game objects
class Player{
    constructor(){
        this.x=canvas.width/2;
        this.y=canvas.height/2;
        this.color='white';
        this.radius=28;
    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}

class Projectile{
    constructor(angle){
        this.x=canvas.width/2;
        this.y=canvas.height/2;
        this.color='white';
        this.radius=10;
        this.velocityX=Math.cos(angle)* 3;
        this.velocityY=Math.sin(angle)* 3;
    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }

    update(){
        this.x+=this.velocityX;
        this.y+=this.velocityY;
    }
}

class Enemy{
    constructor(){
        this.x;
        this.y;
        this.color=`hsl(${Math.random()*360},50%,50%)`;
        this.radius=Math.random() * 25 + 5;
        this.velocityX;
        this.velocityY;

        if(Math.random()<0.5){
                Math.random()<0.5? this.x=0-this.radius : this.x=canvas.width+this.radius;
                this.y = Math.random() * canvas.height;
        }else{
            Math.random()<0.5? this.y=0-this.radius : this.y=canvas.height+this.radius;
            this.x= Math.random() * canvas.width;
        }

        let angle = Math.atan2((canvas.height/2)-this.y,(canvas.width/2)-this.x);
        this.velocityX= Math.cos(angle);
        this.velocityY= Math.sin(angle);
    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }

    update(){
        this.x+=this.velocityX;
        this.y+=this.velocityY;
    }
}

class Particle{
    constructor(x,y,color){
        this.x=x;
        this.y=y;
        this.color=color;
        this.radius= Math.random()*3;
        this.velocityX= (Math.random()-0.5)*5;
        this.velocityY= (Math.random()-0.5)*5;
    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }

    update(){
        this.x+=this.velocityX;
        this.y+=this.velocityY;

        if(this.radius>0.2){
            this.radius-=0.02;
        }
    }
}

let player= new Player;
player.draw();

canvas.addEventListener('click',(event)=>{
    if(projectilesArray.length<11){
    angle=Math.atan2(event.y-(canvas.height/2),event.x-(canvas.width/2));
    projectilesArray.push(new Projectile(angle));
    }
})

function initEnemies(){
    setInterval(()=>{
        if(enemiesArray.length<=10){
        enemiesArray.push(new Enemy());
        }
    },2000)
}

// Handling frames
let animationId;
function handleFrames(){
    animationId=requestAnimationFrame(handleFrames);
    ctx.fillStyle='rgba(0,0,0,0.2)'
    ctx.fillRect(0,0,canvas.width,canvas.height);

    projectilesArray.length>10? player.color='red' : player.color='white';
    player.draw();

    for(let i=0; i<projectilesArray.length; i++){
        projectilesArray[i].update();
        projectilesArray[i].draw();

        if(projectilesArray[i].x>canvas.width || projectilesArray[i].x<0 || projectilesArray[i].y<0 || projectilesArray[i].y>canvas.height){
            projectilesArray.splice(i,1);
        }
    }

    for(let j=0; j<enemiesArray.length; j++){
        enemiesArray[j].update();
        enemiesArray[j].draw();
        let dist=Math.hypot(enemiesArray[j].x-player.x,enemiesArray[j].y-player.y)
            if(dist-enemiesArray[j].radius-player.radius<1){
                gameOver();
            }
        for(let k=0; k<projectilesArray.length; k++){
            let projectileDist=Math.hypot(enemiesArray[j].x-projectilesArray[k].x,enemiesArray[j].y-projectilesArray[k].y)
            if(projectileDist-enemiesArray[j].radius-projectilesArray[k].radius<1){
                if(enemiesArray[j].radius-10>5){
                    for(let l=0; l<enemiesArray[j].radius; l++){
                        particlesArray.push(new Particle(projectilesArray[k].x,projectilesArray[k].y,enemiesArray[j].color));
                    }
                    enemiesArray[j].radius-=10;
                    projectilesArray.splice(k,1);
                    score+=10;
                    explosion.currentTime=0;
                    explosion.play();
                }else{
                    setTimeout(()=>{
                        enemiesArray.splice(j,1);
                        projectilesArray.splice(k,1);
                        score+=25;
                        explosion.currentTime=0;
                        explosion.play();
                    },0)
                }
            }
        }
    }

    for(let m=0; m<particlesArray.length; m++){
        particlesArray[m].update();
        particlesArray[m].draw();

        if(particlesArray[m].radius<0.3){
            setTimeout(()=>{
                particlesArray.splice(m,1);
            },0)
        }
    }

    upperScore.textContent=score;
    loopMusic.addEventListener('ended',()=>{
        loopMusic.currentTime=0;
        loopMusic.play();
    })
}

// Firing up the game & displaying end screen on game over
startGameBtn.addEventListener('click',()=>{
    gameStartModal.style.display='none';
    initGame();
    initEnemies();
    handleFrames();
    loopMusic.play()
});

function gameOver(){
    cancelAnimationFrame(animationId);
    loopMusic.pause();
    gameOverModal.style.display='block';
    document.querySelector('#end-score').textContent=score;
}

playAgainBtn.addEventListener('click',()=>{
    gameOverModal.style.display='none';
    initGame();
    initEnemies();
    handleFrames();
    loopMusic.currentTime=0;
    loopMusic.play()
});
