import * as THREE from 'three';
import 'bootstrap/dist/css/bootstrap.css';

export const initGameThreeD = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate();
};

// Main game
export const initGameTwoD = () => {
	let gameState = 'start';
	document.getElementById('app').innerHTML = '';
	// document.getElementById('app').className = 'container';

    let score_1 = createScore('player_1_score');
    let score_2 = createScore('player_2_score');
	document.getElementById('app').appendChild(score_1);
	document.getElementById('app').appendChild(score_2);

    let message = createMessage('message');
    document.getElementById('app').appendChild(message);

    let board = createBoard('board');
	document.getElementById('app').appendChild(board);

    let paddle_1 = createPaddle('paddle_1');
    let paddle_2 = createPaddle('paddle_2');
    board.appendChild(paddle_1);
    board.appendChild(paddle_2);

    let initial_ball = createBall('ball');
    let ball = initial_ball.cloneNode(true);
    board.appendChild(ball);

	let ball_coord = initial_ball.getBoundingClientRect();

    let paddle_1_coord = paddle_1.getBoundingClientRect();
    let paddle_2_coord = paddle_2.getBoundingClientRect();
    let initial_ball_coord = ball.getBoundingClientRect();
    ball_coord = initial_ball_coord; 
    let board_coord = board.getBoundingClientRect();
    let paddle_common = document.querySelector('.paddle').getBoundingClientRect();

    let dx = Math.floor(Math.random() * 4) + 3;
    let dy = Math.floor(Math.random() * 4) + 3;
    let dxd = Math.floor(Math.random() * 2);
    let dyd = Math.floor(Math.random() * 2);

    document.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
            gameState = gameState == 'start' ? 'play' : 'start';
            if (gameState == 'play') {
                message.innerHTML = 'Game started';
                message.style.left = 42 + 'vw';
                requestAnimationFrame(() => {
                    dx = Math.floor(Math.random() * 4) + 3;
                    dy = Math.floor(Math.random() * 4) + 3;
                    dxd = Math.floor(Math.random() * 2);
                    dyd = Math.floor(Math.random() * 2);
                    if (ball_coord.top <= board_coord.top) {
						dyd = 1;
					}
					if (ball_coord.bottom >= board_coord.bottom) {
						dyd = 0;
					}
				
					if (
						ball_coord.left <= paddle_1_coord.right &&
						ball_coord.top >= paddle_1_coord.top &&
						ball_coord.bottom <= paddle_1_coord.bottom
					) {
						dxd = 1;
						dx = Math.floor(Math.random() * 4) + 3;
						dy = Math.floor(Math.random() * 4) + 3;
					}
				
					if (
						ball_coord.right >= paddle_2_coord.left &&
						ball_coord.top >= paddle_2_coord.top &&
						ball_coord.bottom <= paddle_2_coord.bottom
					) {
						dxd = 0;
						dx = Math.floor(Math.random() * 4) + 3;
						dy = Math.floor(Math.random() * 4) + 3;
					}
				
					if (
						ball_coord.left <= board_coord.left ||
						ball_coord.right >= board_coord.right
					) {
						ball_coord = initial_ball_coord;
						ball.style.top = ball_coord.top + 'px';
						ball.style.left = ball_coord.left + 'px';
						return;
					}
				
					ball.style.top = ball_coord.top + dy * (dyd === 0 ? -1 : 1) + 'px';
					ball.style.left = ball_coord.left + dx * (dxd === 0 ? -1 : 1) + 'px';
					ball_coord = ball.getBoundingClientRect();
                });
            }
        }
        if (gameState == 'play') {
            if (e.key == 'w') {
                movePaddle(paddle_1, 'up');
            }
            if (e.key == 's') {
                movePaddle(paddle_1, 'down');
            }

            if (e.key == 'ArrowUp') {
                movePaddle(paddle_2, 'up');
            }
            if (e.key == 'ArrowDown') {
                movePaddle(paddle_2, 'down');
            }
        }
        if (ball_coord.top <= board_coord.top) {
			dyd = 1;
		}
		if (ball_coord.bottom >= board_coord.bottom) {
			dyd = 0;
		}
	
		if (
			ball_coord.left <= paddle_1_coord.right &&
			ball_coord.top >= paddle_1_coord.top &&
			ball_coord.bottom <= paddle_1_coord.bottom
		) {
			dxd = 1;
			dx = Math.floor(Math.random() * 4) + 3;
			dy = Math.floor(Math.random() * 4) + 3;
		}
	
		if (
			ball_coord.right >= paddle_2_coord.left &&
			ball_coord.top >= paddle_2_coord.top &&
			ball_coord.bottom <= paddle_2_coord.bottom
		) {
			dxd = 0;
			dx = Math.floor(Math.random() * 4) + 3;
			dy = Math.floor(Math.random() * 4) + 3;
		}
	
		if (
			ball_coord.left <= board_coord.left ||
			ball_coord.right >= board_coord.right
		) {
			ball_coord = initial_ball_coord;
			ball.style.top = ball_coord.top + 'px';
			ball.style.left = ball_coord.left + 'px';
			return;
		}
	
		ball.style.top = ball_coord.top + dy * (dyd === 0 ? -1 : 1) + 'px';
		ball.style.left = ball_coord.left + dx * (dxd === 0 ? -1 : 1) + 'px';
		ball_coord = ball.getBoundingClientRect();
    });
};

// Paddle
const createPaddle = ( className ) => {
    const paddle = document.createElement('div');
    paddle.className = className + ' paddle';
    return (paddle);
};

const movePaddle = ( paddle, direction ) => {
    const paddleCoord = paddle.getBoundingClientRect();
    const moveAmount = window.innerHeight * 0.06;

    if (direction === 'up') {
        paddle.style.top = Math.max(board_coord.top, paddleCoord.top - moveAmount) + 'px';
    } else if (direction === 'down') {
        paddle.style.top = Math.min(board_coord.bottom - paddle_common.height, paddleCoord.top + moveAmount) + 'px';
    }
}

// Ball
const createBall = ( className ) => {
	const ball = document.createElement('div');
    ball.className = className;
    
    const ballEffect = document.createElement('div');
    ballEffect.className = 'ball_effect';
    
    ball.appendChild(ballEffect);
    return (ball);
};

// Score
const createScore = ( className ) => {
	const score = document.createElement('h1');
	score.className = className;
    score.textContent = '0';
	return (score);
};

// Message
const createMessage = ( className, msg ) => {
    const message = document.createElement('h1');
    message.className = className;
    message.textContent = msg;
	return (message);
};

// Board
const createBoard = ( className ) => {
    const board = document.createElement('div');
    board.className = className;
    return (board);
};
