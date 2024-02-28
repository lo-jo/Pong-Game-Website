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

// Ping pong elements
let gameState;
let board_coord;
let paddle_1_coord;
let paddle_2_coord;
let score_1;
let score_2;
let message;
let score;
let board;
let ball;
let initial_ball;
let initial_ball_coord;
let ball_coord;
let paddle_common;
let paddle_1;
let paddle_2;

// Main game
export const initGameTwoD = () => {
	gameState = 'start';
	// document.getElementById('app').innerHTML = '';
	// document.getElementById('app').className = 'container';
	let box = document.createElement('div');
	box.className = 'container';

    score_1 = createScore('player_1_score');
    message = createMessage('message', 'Press Enter');
    score_2 = createScore('player_2_score');
	score = document.createElement('div');
	score.className = 'row';
	score.appendChild(score_1);
	score.appendChild(message);
	score.appendChild(score_2);
	box.appendChild(score);
	document.getElementById('app').appendChild(box);

    board = createBoard('board');
	document.getElementById('app').appendChild(board);

	// Ball movement
	paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
	paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
    paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
	
	initial_ball = document.getElementById('app').querySelector('.ball'); 
    initial_ball_coord = initial_ball.getBoundingClientRect();
    ball_coord = initial_ball_coord;
    board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();

	// `dx` and `dy` determine the speed of the ball at the beginning
    let dx = Math.floor(Math.random() * 4) + 3;
    let dy = Math.floor(Math.random() * 4) + 3;
	// `dxd` and `dyd` determine the initial direction of the ball along the x and y axes
    let dxd = Math.floor(Math.random() * 2);
    let dyd = Math.floor(Math.random() * 2);

    // Event listener for window resize
    window.addEventListener('resize', updatePositionsOnResize);

	// Key events and movements
    document.addEventListener('keydown', (e) => {
		if (e.key == 'Enter') {
			gameState = (gameState == 'start') ? 'play' : 'start';
			if (gameState == 'play') {
				console.log("enter pressed");
				message.querySelector('h1').innerHTML = 'Game started';
				requestAnimationFrame(() => {
					window.addEventListener('resize', updatePositionsOnResize);
					dx = Math.floor(Math.random() * 4) + 3;
					dy = Math.floor(Math.random() * 4) + 3;
					dxd = Math.floor(Math.random() * 2);
					dyd = Math.floor(Math.random() * 2);
					moveBall(dx, dy, dxd, dyd);
				});
			}
		}

		if (gameState == 'play') {
			console.log(`Board_height: ${board_coord.height}, board_width ${board_coord.width}`);

			if (e.key == 'w') { // go up
				console.log("`w` pressed");
				console.log(`paddle_1_coord.top  before = ${paddle_1_coord.top }`);
				paddle_1.style.top = Math.max(board_coord.top, paddle_1_coord.top - board_coord.height * 0.06) + 'px';
				console.log(`paddle_1.style.top after = ${paddle_1.style.top}`);
				paddle_1_coord = paddle_1.getBoundingClientRect();
				console.log(`paddle_1_coord = ${JSON.stringify(paddle_1_coord, null, 2)}`);
			}

			if (e.key == 's') { // go down
				console.log("`s` pressed");
				paddle_1.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_1_coord.top + board_coord.height * 0.06) + 'px';
				paddle_1_coord = paddle_1.getBoundingClientRect();
				console.log(`paddle_1_coord = ${JSON.stringify(paddle_1_coord, null, 2)}`);
			}

			if (e.key == 'ArrowUp') {
				console.log("`ArrowUp` pressed");
				paddle_2.style.top = Math.max(board_coord.top, paddle_2_coord.top - board_coord.height * 0.1) + 'px';
				paddle_2_coord = paddle_2.getBoundingClientRect();
				console.log(`paddle_2_coord = ${JSON.stringify(paddle_2_coord, null, 2)}`);
			}

			if (e.key == 'ArrowDown') {
				console.log("`ArrowDown` pressed");
				paddle_2.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_2_coord.top + board_coord.height * 0.1) + 'px';
				paddle_2_coord = paddle_2.getBoundingClientRect();
				console.log(`paddle_2_coord = ${JSON.stringify(paddle_2_coord, null, 2)}`);
			}
		}
    });
};

// Paddle
const createPaddle = ( className ) => {
    const paddle = document.createElement('div');
    paddle.className = `${className} paddle`;
    return (paddle);
};

// Ball
const createBall = ( className ) => {
	const ball = document.createElement('div');
    ball.className = className;

    const ballEffect = document.createElement('div');
    ballEffect.className = 'ball_effect';

    ball.appendChild(ballEffect);
    return (ball);
};

const moveBall = (dx, dy, dxd, dyd) => {
	// Bounce the ball when it hits the top or bottom of the board
	if (ball_coord.top <= board_coord.top) {
		dyd = 1; // Change direction to down
	}
	if (ball_coord.bottom >= board_coord.bottom) {
		dyd = 0; // Change direction to up
	}
	// Bounce the ball off paddle_1 (left paddle)
	if (
		ball_coord.left <= paddle_1_coord.right &&
		ball_coord.top >= paddle_1_coord.top &&
		ball_coord.bottom <= paddle_1_coord.bottom
	) {
		dxd = 1; // Change direction to the right
		// Randomize the ball's speed and direction after bouncing off the paddle
		dx = Math.floor(Math.random() * 4) + 3;
		dy = Math.floor(Math.random() * 4) + 3;
	}
	// Bounce the ball off paddle_2 (right paddle)
	if (
		ball_coord.right >= paddle_2_coord.left &&
		ball_coord.top >= paddle_2_coord.top &&
		ball_coord.bottom <= paddle_2_coord.bottom
	) {
		dxd = 0; // Change direction to the left
		// Randomize the ball's speed and direction after bouncing off the paddle
		dx = Math.floor(Math.random() * 4) + 3;
		dy = Math.floor(Math.random() * 4) + 3;
	}
	// Check if the ball has gone out of bounds on the left or right
	if (
		ball_coord.left <= board_coord.left ||
		ball_coord.right >= board_coord.right
	) {
		// Update the scores and reset the game state
		if (ball_coord.left <= board_coord.left) {
			document.querySelector('.player_2_score').textContent = +document.querySelector('.player_2_score').textContent + 1;
		} else {
			document.querySelector('.player_1_score').textContent = +document.querySelector('.player_1_score').textContent + 1;
		}

		// Check if the game is over when someone scores 5
		if (
			+document.querySelector('.player_1_score').textContent == 5 ||
			+document.querySelector('.player_2_score').textContent == 5
		) {

			const winMessageDiv = document.createElement('div');
			winMessageDiv.classList.add('win-message');

			const heading = document.createElement('h1');
			heading.classList.add('display-3', 'text-center');
			const winningPlayer = (+document.querySelector('.player_1_score').textContent == 5) ? 'Player 1' : 'Player 2';
			heading.textContent = `${winningPlayer} Wins!`;
			winMessageDiv.appendChild(heading);

			document.querySelector('.player_1_score').textContent = 0;
			document.querySelector('.player_2_score').textContent = 0;
			document.querySelector('.board').appendChild(winMessageDiv);

			document.querySelector('.message').textContent = 'Game Over';
			winMessageDiv.style.display = 'block';
			setTimeout(() => {
				winMessageDiv.style.display = 'none';
				gameState = 'start';
				ball.style = initial_ball.style;
				document.querySelector('.message').textContent = 'Press Enter';
			}, 1500);
			return ;
		}

		gameState = 'start';

		// Reset the ball's position and style
		ball_coord = initial_ball_coord;
		ball.style = initial_ball.style;
		document.querySelector('.message').textContent = 'Press Enter';
		return;
	}
	// Move the ball based on the calculated positions and directions
	ball.style.top = ball_coord.top + dy * (dyd == 0 ? -1 : 1) + 'px';
	ball.style.left = ball_coord.left + dx * (dxd == 0 ? -1 : 1) + 'px';
	// Update the ball's position after the move
	ball_coord = ball.getBoundingClientRect();
	// Use requestAnimationFrame for smoother animation and call the moveBall function recursively
	requestAnimationFrame(() => {
		// console.log(`ball_coord = ${JSON.stringify(ball_coord, null, 2)}`);
		moveBall(dx, dy, dxd, dyd);
	});
}

// Score
const createScore = ( className ) => {
	const box = document.createElement('div');
	box.className = 'col-3 text-center align-items-center d-flex flex-column';
	const score = document.createElement('h1');
	box.appendChild(score);
	score.className = `${className} my-3`;
    score.textContent = '0';
	return (box);
};

// Message
const createMessage = ( className, msg ) => {
	const box = document.createElement('div');
	box.className = 'col-6 text-center align-items-center d-flex flex-column';
    const message = document.createElement('h1');
	box.appendChild(message);
    message.className = `${className} my-3 display-7`;
    message.textContent = msg;
	return (box);
};

// Board
const createBoard = (className) => {
    const boardContainer = document.createElement('div');
    boardContainer.className = `${className}`;

    const dottedLine = document.createElement('div');
    dottedLine.className = 'dotted-line';

    ball = createBall('ball');
    paddle_1 = createPaddle('paddle_1');
    paddle_2 = createPaddle('paddle_2');
	
    boardContainer.appendChild(ball);
    boardContainer.appendChild(paddle_1);
    boardContainer.appendChild(paddle_2);
	boardContainer.appendChild(dottedLine);

    return (boardContainer);
};

// Screen resizing function
const updatePositionsOnResize = () => {
	console.log("window resize detected, updating ping pong elements");
	paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
	paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
	paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
	board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();
	initial_ball = document.getElementById('app').querySelector('.ball'); 
    initial_ball_coord = initial_ball.getBoundingClientRect();
    ball_coord = initial_ball_coord;
}
