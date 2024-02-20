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
///////////////////////////////////////////////////////////////

// class PingPongGame {
//     constructor() {
//         this.gameState = 'start';
//         this.boardCoord = null;
//         this.paddle1Coord = null;
//         this.paddle2Coord = null;
//         this.score1 = null;
//         this.score2 = null;
//         this.message = null;
//         this.score = null;
//         this.board = null;
//         this.ball = null;
//         this.paddle1 = null;
//         this.paddle2 = null;

//         this.initGame();
//     }

//     createPaddle(className) {
//         const paddle = document.createElement('div');
//         paddle.className = `${className} paddle`;
//         return paddle;
//     }

//     createBall(className) {
//         const ball = document.createElement('div');
//         ball.className = className;

//         const ballEffect = document.createElement('div');
//         ballEffect.className = 'ball_effect';

//         ball.appendChild(ballEffect);
//         return ball;
//     }

//     createScore(className) {
//         const box = document.createElement('div');
//         box.className = 'col-3 text-center align-items-center d-flex flex-column';
//         const score = document.createElement('h1');
//         box.appendChild(score);
//         score.className = `${className} my-3`;
//         score.textContent = '0';
//         return box;
//     }

//     createMessage(className, msg) {
//         const box = document.createElement('div');
//         box.className = 'col-5 text-center align-items-center d-flex flex-column';
//         const message = document.createElement('h1');
//         box.appendChild(message);
//         message.className = `${className} my-3 display-7`;
//         message.textContent = msg;
//         return box;
//     }

//     createBoard(className) {
//         const boardContainer = document.createElement('div');
//         boardContainer.className = 'container-fluid';

//         const boardRow = document.createElement('div');
//         boardRow.className = 'row justify-content-center';

//         const board = document.createElement('div');
//         board.className = `col-12 ${className}`;

//         this.ball = this.createBall('ball');
//         this.paddle1 = this.createPaddle('paddle_1');
//         this.paddle2 = this.createPaddle('paddle_2');

//         board.appendChild(this.ball);
//         board.appendChild(this.paddle1);
//         board.appendChild(this.paddle2);

//         boardRow.appendChild(board);
//         boardContainer.appendChild(boardRow);

//         return boardContainer;
//     }

// 	moveBall = (dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball) => { 
// 		if (ball_coord.top <= board_coord.top) { 
// 			dyd = 1; 
// 		} 
// 		if (ball_coord.bottom >= board_coord.bottom) { 
// 			dyd = 0; 
// 		} 
// 		if ( 
// 			ball_coord.left <= paddle_1_coord.right && 
// 			ball_coord.top >= paddle_1_coord.top && 
// 			ball_coord.bottom <= paddle_1_coord.bottom 
// 		) { 
// 			dxd = 1; 
// 			dx = Math.floor(Math.random() * 4) + 3; 
// 			dy = Math.floor(Math.random() * 4) + 3; 
// 		} 
// 		if ( 
// 			ball_coord.right >= paddle_2_coord.left && 
// 			ball_coord.top >= paddle_2_coord.top && 
// 			ball_coord.bottom <= paddle_2_coord.bottom 
// 		) { 
// 			dxd = 0; 
// 			dx = Math.floor(Math.random() * 4) + 3; 
// 			dy = Math.floor(Math.random() * 4) + 3; 
// 		} 
// 		if ( 
// 			ball_coord.left <= board_coord.left || 
// 			ball_coord.right >= board_coord.right 
// 		) { 
// 			if (ball_coord.left <= board_coord.left) {
// 				document.querySelector('.player_2_score').textContent = +document.querySelector('.player_2_score').textContent + 1;
// 			} else { 
// 				document.querySelector('.player_1_score').textContent = +document.querySelector('.player_1_score').textContent + 1;
// 			} 
// 			gameState = 'start'; 
		  
// 			ball_coord = initial_ball_coord; 
// 			ball.style = initial_ball.style;
// 			document.querySelector('.message').textContent = 'Press Enter'; 
// 			return;
// 		} 
// 		ball.style.top = ball_coord.top + dy * (dyd == 0 ? -1 : 1) + 'px'; 
// 		ball.style.left = ball_coord.left + dx * (dxd == 0 ? -1 : 1) + 'px'; 
// 		ball_coord = ball.getBoundingClientRect(); 
// 		requestAnimationFrame(() => { 
// 			moveBall(dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball); 
// 		}); 
// 	}
	
//     initGame() {
//         document.getElementById('app').innerHTML = '';
//         document.getElementById('app').className = 'container';

//         this.score1 = this.createScore('player_1_score');
//         this.message = this.createMessage('message', 'Press Enter');
//         this.score2 = this.createScore('player_2_score');
//         this.score = document.createElement('div');
//         this.score.className = 'row';
//         this.score.appendChild(this.score1);
//         this.score.appendChild(this.message);
//         this.score.appendChild(this.score2);
//         document.getElementById('app').appendChild(this.score);

//         this.board = this.createBoard('board');
//         document.getElementById('app').appendChild(this.board);

// 		// Ball movement
// 		paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
// 		paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
// 		let paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
		
// 		let initial_ball = document.getElementById('app').querySelector('.ball'); 
// 		let initial_ball_coord = initial_ball.getBoundingClientRect();
// 		let ball_coord = initial_ball_coord;
// 		board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();

// 		let dx = Math.floor(Math.random() * 4) + 3;
// 		let dy = Math.floor(Math.random() * 4) + 3;
// 		let dxd = Math.floor(Math.random() * 2);
// 		let dyd = Math.floor(Math.random() * 2);

// 		document.addEventListener('keydown', (e) => {
// 			if (e.key == 'Enter') {
// 				gameState = (gameState == 'start') ? 'play' : 'start';
// 				if (gameState == 'play') {
// 					console.log("enter pressed");
// 					message.querySelector('h1').innerHTML = 'Game started';
// 					requestAnimationFrame(() => {
// 						dx = Math.floor(Math.random() * 4) + 3;
// 						dy = Math.floor(Math.random() * 4) + 3;
// 						dxd = Math.floor(Math.random() * 2);
// 						dyd = Math.floor(Math.random() * 2);
// 						moveBall(dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball);
// 					});
// 				}
// 			}
// 			if (gameState == 'play') {
// 				if (e.key == 'w') {
// 					console.log("`w` pressed");
// 					paddle_1.style.top = Math.max(board_coord.top, paddle_1_coord.top - window.innerHeight * 0.06) + 'px';
// 					paddle_1_coord = paddle_1.getBoundingClientRect(); 
// 				}
// 				if (e.key == 's') {
// 					console.log("`s` pressed");
// 					paddle_1.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_1_coord.top + window.innerHeight * 0.06) + 'px';
// 					paddle_1_coord = paddle_1.getBoundingClientRect();
// 				}
// 				if (e.key == 'ArrowUp') {
// 					console.log("`arrowUp` pressed");
// 					paddle_2.style.top = Math.max(board_coord.top, paddle_2_coord.top - window.innerHeight * 0.1) + 'px';
// 					paddle_2_coord = paddle_2.getBoundingClientRect();
// 				}
// 				if (e.key == 'ArrowDown') {
// 					console.log("`arrowDown` pressed");
// 					paddle_2.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_2_coord.top + window.innerHeight * 0.1) + 'px';
// 					paddle_2_coord = paddle_2.getBoundingClientRect();
// 				}
// 			}
// 		});
//     }
// }

// export const initGameTwoD = () => {
// 	const pingPongGame = new PingPongGame();
// }

///////////////////////////////////////////////////////////////

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
let paddle_1;
let paddle_2;

// Main game
export const initGameTwoD = () => {
	gameState = 'start';
	document.getElementById('app').innerHTML = '';
	document.getElementById('app').className = 'container';

    score_1 = createScore('player_1_score');
    message = createMessage('message', 'Press Enter');
    score_2 = createScore('player_2_score');
	score = document.createElement('div');
	score.className = 'row';
	score.appendChild(score_1);
	score.appendChild(message);
	score.appendChild(score_2);
	document.getElementById('app').appendChild(score);

    board = createBoard('board');
	document.getElementById('app').appendChild(board);

	// Ball movement
	paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
	paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
    let paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
	
	let initial_ball = document.getElementById('app').querySelector('.ball'); 
    let initial_ball_coord = initial_ball.getBoundingClientRect();
    let ball_coord = initial_ball_coord;
    board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();

    let dx = Math.floor(Math.random() * 4) + 3;
    let dy = Math.floor(Math.random() * 4) + 3;
    let dxd = Math.floor(Math.random() * 2);
    let dyd = Math.floor(Math.random() * 2);

    document.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
            gameState = (gameState == 'start') ? 'play' : 'start';
            if (gameState == 'play') {
				console.log("enter pressed");
				message.querySelector('h1').innerHTML = 'Game started';
                requestAnimationFrame(() => {
                    dx = Math.floor(Math.random() * 4) + 3;
                    dy = Math.floor(Math.random() * 4) + 3;
                    dxd = Math.floor(Math.random() * 2);
                    dyd = Math.floor(Math.random() * 2);
                    moveBall(dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball);
                });
            }
        }
        if (gameState == 'play') {
            if (e.key == 'w') {
				console.log("`w` pressed");
				paddle_1.style.top = Math.max(board_coord.top, paddle_1_coord.top - window.innerHeight * 0.06) + 'px';
				paddle_1_coord = paddle_1.getBoundingClientRect(); 
            }
            if (e.key == 's') {
				console.log("`s` pressed");
				paddle_1.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_1_coord.top + window.innerHeight * 0.06) + 'px';
				paddle_1_coord = paddle_1.getBoundingClientRect();
            }
			if (e.key == 'ArrowUp') {
				console.log("`arrowUp` pressed");
				paddle_2.style.top = Math.max(board_coord.top, paddle_2_coord.top - window.innerHeight * 0.1) + 'px';
				paddle_2_coord = paddle_2.getBoundingClientRect();
            }
            if (e.key == 'ArrowDown') {
				console.log("`arrowDown` pressed");
				paddle_2.style.top = Math.min(board_coord.bottom - paddle_common.height, paddle_2_coord.top + window.innerHeight * 0.1) + 'px';
				paddle_2_coord = paddle_2.getBoundingClientRect();
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

const moveBall = (dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball) => { 
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
		if (ball_coord.left <= board_coord.left) {
			document.querySelector('.player_2_score').textContent = +document.querySelector('.player_2_score').textContent + 1;
		} else { 
			document.querySelector('.player_1_score').textContent = +document.querySelector('.player_1_score').textContent + 1;
		} 
		gameState = 'start'; 
	  
		ball_coord = initial_ball_coord; 
		ball.style = initial_ball.style;
		document.querySelector('.message').textContent = 'Press Enter'; 
		return;
	} 
	ball.style.top = ball_coord.top + dy * (dyd == 0 ? -1 : 1) + 'px'; 
	ball.style.left = ball_coord.left + dx * (dxd == 0 ? -1 : 1) + 'px'; 
	ball_coord = ball.getBoundingClientRect(); 
	requestAnimationFrame(() => { 
		moveBall(dx, dy, dxd, dyd, ball_coord, initial_ball_coord, initial_ball); 
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
	box.className = 'col-5 text-center align-items-center d-flex flex-column';
    const message = document.createElement('h1');
	box.appendChild(message);
    message.className = `${className} my-3 display-7`;
    message.textContent = msg;
	return (box);
};

// Board
const createBoard = (className) => {
    const boardContainer = document.createElement('div');
    boardContainer.className = 'container-fluid';

    const boardRow = document.createElement('div');
    boardRow.className = 'row';

    const board = document.createElement('div');
    board.className = `col ${className}`;

    ball = createBall('ball');
    paddle_1 = createPaddle('paddle_1');
    paddle_2 = createPaddle('paddle_2');

    board.appendChild(ball);
    board.appendChild(paddle_1);
    board.appendChild(paddle_2);

    boardRow.appendChild(board);
    boardContainer.appendChild(boardRow);

    return (boardContainer);
};
