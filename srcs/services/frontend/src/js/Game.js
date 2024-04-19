import { BaseClass } from './BaseClass.js'

export class PongGame extends BaseClass
{
	constructor() {
		super();
		this.gameState = 'start';
		this.board_coord;
		this.paddle_1_coord;
		this.paddle_2_coord;
		this.score_1;
		this.score_2;
		this.message;
		this.score;
		this.board;
		this.ball;
		this.initial_ball;
		this.initial_ball_coord;
		this.ball_coord;
		this.paddle_common;
		this.paddle_1;
		this.paddle_2;
		this.dx = Math.floor(Math.random() * 4) + 3;
		this.dy = Math.floor(Math.random() * 4) + 3;
		this.dxd = Math.floor(Math.random() * 2);
		this.dyd = Math.floor(Math.random() * 2);

		this.initGameTwoD();
	}

    getHtmlForMain() {
        return initGameTwoD();
    }

	initGameTwoD() {
	  this.gameState = 'start';
	  let box = document.createElement('div');
	  box.className = 'container';
  
	  this.score_1 = this.createScore('player_1_score');
	  this.message = this.createMessage('message', 'Press Enter');
	  this.score_2 = this.createScore('player_2_score');
	  this.score = document.createElement('div');
	  this.score.className = 'row';
	  this.score.appendChild(this.score_1);
	  this.score.appendChild(this.message);
	  this.score.appendChild(this.score_2);
	  box.appendChild(this.score);
	  document.getElementById('app').appendChild(box);
  
	  this.board = this.createBoard('board');
	  document.getElementById('app').appendChild(this.board);
  
	  this.paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
	  this.paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
	  this.paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
	  this.initial_ball = document.getElementById('app').querySelector('.ball');
	  this.initial_ball_coord = this.initial_ball.getBoundingClientRect();
	  this.ball_coord = this.initial_ball_coord;
	  this.board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();
  
	  window.addEventListener('resize', this.updatePositionsOnResize);
  
	  document.addEventListener('keydown', (e) => this.handleKeyDown(e));
	}
  
	createPaddle(className) {
	  const paddle = document.createElement('div');
	  paddle.className = `${className} paddle`;
	  return paddle;
	}
  
	createBall(className) {
	  const ball = document.createElement('div');
	  ball.className = className;
  
	  const ballEffect = document.createElement('div');
	  ballEffect.className = 'ball_effect';
  
	  ball.appendChild(ballEffect);
	  return ball;
	}
  
	moveBall() {
	// Bounce the ball when it hits the top or bottom of the board
	if (this.ball_coord.top <= this.board_coord.top) {
		this.dyd = 1; // Change direction to down
	  }
	  if (this.ball_coord.bottom >= this.board_coord.bottom) {
		this.dyd = 0; // Change direction to up
	  }
	  // Bounce the ball off paddle_1 (left paddle)
	  if (
		this.ball_coord.left <= this.paddle_1_coord.right &&
		this.ball_coord.top >= this.paddle_1_coord.top &&
		this.ball_coord.bottom <= this.paddle_1_coord.bottom
	  ) {
		this.dxd = 1; // Change direction to the right
		// Randomize the ball's speed and direction after bouncing off the paddle
		this.dx = Math.floor(Math.random() * 4) + 3;
		this.dy = Math.floor(Math.random() * 4) + 3;
	  }
	  // Bounce the ball off paddle_2 (right paddle)
	  if (
		this.ball_coord.right >= this.paddle_2_coord.left &&
		this.ball_coord.top >= this.paddle_2_coord.top &&
		this.ball_coord.bottom <= this.paddle_2_coord.bottom
	  ) {
		this.dxd = 0; // Change direction to the left
		// Randomize the ball's speed and direction after bouncing off the paddle
		this.dx = Math.floor(Math.random() * 4) + 3;
		this.dy = Math.floor(Math.random() * 4) + 3;
	  }
	  // Check if the ball has gone out of bounds on the left or right
	  if (
		this.ball_coord.left <= this.board_coord.left ||
		this.ball_coord.right >= this.board_coord.right
	  ) {
		// Update the scores and reset the game state
		if (this.ball_coord.left <= this.board_coord.left) {
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
			this.gameState = 'start';
			this.ball.style = this.initial_ball.style;
			document.querySelector('.message').textContent = 'Press Enter';
		  }, 1500);
		  return;
		}
	
		this.gameState = 'start';
	
		// Reset the ball's position and style
		this.ball_coord = this.initial_ball_coord;
		this.ball.style = this.initial_ball.style;
		document.querySelector('.message').textContent = 'Press Enter';
		return;
	  }
	  // Move the ball based on the calculated positions and directions
	  this.ball.style.top = this.ball_coord.top + dy * (dyd == 0 ? -1 : 1) + 'px';
	  this.ball.style.left = this.ball_coord.left + dx * (dxd == 0 ? -1 : 1) + 'px';
	  // Update the ball's position after the move
	  this.ball_coord = this.ball.getBoundingClientRect();
	  // Use requestAnimationFrame for smoother animation and call the moveBall function recursively
	  requestAnimationFrame(() => {
		// //console.log(`ball_coord = ${JSON.stringify(this.ball_coord, null, 2)}`);
		this.moveBall();
	  });
	}
  
	createScore(className) {
	  const box = document.createElement('div');
	  box.className = 'col-3 text-center align-items-center d-flex flex-column';
	  const score = document.createElement('h1');
	  box.appendChild(score);
	  score.className = `${className} my-3`;
	  score.textContent = '0';
	  return box;
	}
  
	createMessage(className, msg) {
	  const box = document.createElement('div');
	  box.className = 'col-6 text-center align-items-center d-flex flex-column';
	  const message = document.createElement('h1');
	  box.appendChild(message);
	  message.className = `${className} my-3 display-7`;
	  message.textContent = msg;
	  return box;
	}
  
	createBoard(className) {
	  const boardContainer = document.createElement('div');
	  boardContainer.className = `${className}`;
  
	  const dottedLine = document.createElement('div');
	  dottedLine.className = 'dotted-line';
  
	  this.ball = this.createBall('ball');
	  this.paddle_1 = this.createPaddle('paddle_1');
	  this.paddle_2 = this.createPaddle('paddle_2');
  
	  boardContainer.appendChild(this.ball);
	  boardContainer.appendChild(this.paddle_1);
	  boardContainer.appendChild(this.paddle_2);
	  boardContainer.appendChild(dottedLine);
  
	  return boardContainer;
	}
  
	updatePositionsOnResize() {
		//console.log("window resize detected, updating ping pong elements");
		this.paddle_1_coord = document.getElementById('app').querySelector('.paddle_1').getBoundingClientRect();
		this.paddle_2_coord = document.getElementById('app').querySelector('.paddle_2').getBoundingClientRect();
		this.paddle_common = document.getElementById('app').querySelector('.paddle').getBoundingClientRect();
		this.board_coord = document.getElementById('app').querySelector('.board').getBoundingClientRect();
		this.initial_ball = document.getElementById('app').querySelector('.ball');
		this.initial_ball_coord = this.initial_ball.getBoundingClientRect();
		this.ball_coord = this.initial_ball_coord;
	}
  
	handleKeyDown(e) {
		if (e.key == 'Enter') {
			this.gameState = (this.gameState == 'start') ? 'play' : 'start';
			if (this.gameState == 'play') {
				//console.log("enter pressed");
				this.message.querySelector('h1').innerHTML = 'Game started';
				requestAnimationFrame(() => {
					window.addEventListener('resize', this.updatePositionsOnResize);
					this.dx = Math.floor(Math.random() * 4) + 3;
					this.dy = Math.floor(Math.random() * 4) + 3;
					this.dxd = Math.floor(Math.random() * 2);
					this.dyd = Math.floor(Math.random() * 2);
					this.moveBall();
				});
			}
		}

		if (this.gameState == 'play') {
			//console.log(`Board_height: ${this.board_coord.height}, board_width ${this.board_coord.width}`);

			if (e.key == 'w') { // go up
				//console.log("`w` pressed");
				//console.log(`paddle_1_coord.top  before = ${this.paddle_1_coord.top }`);
				this.paddle_1.style.top = Math.max(this.board_coord.top, this.paddle_1_coord.top - this.board_coord.height * 0.06) + 'px';
				//console.log(`paddle_1.style.top after = ${this.paddle_1.style.top}`);
				this.paddle_1_coord = this.paddle_1.getBoundingClientRect();
				//console.log(`paddle_1_coord = ${JSON.stringify(this.paddle_1_coord, null, 2)}`);
			}

			if (e.key == 's') { // go down
				//console.log("`s` pressed");
				this.paddle_1.style.top = Math.min(this.board_coord.bottom - this.paddle_common.height, this.paddle_1_coord.top + this.board_coord.height * 0.06) + 'px';
				this.paddle_1_coord = this.paddle_1.getBoundingClientRect();
				//console.log(`paddle_1_coord = ${JSON.stringify(this.paddle_1_coord, null, 2)}`);
			}

			if (e.key == 'ArrowUp') {
				//console.log("`ArrowUp` pressed");
				this.paddle_2.style.top = Math.max(this.board_coord.top, this.paddle_2_coord.top - this.board_coord.height * 0.1) + 'px';
				this.paddle_2_coord = this.paddle_2.getBoundingClientRect();
				//console.log(`paddle_2_coord = ${JSON.stringify(this.paddle_2_coord, null, 2)}`);
			}

			if (e.key == 'ArrowDown') {
				//console.log("`ArrowDown` pressed");
				this.paddle_2.style.top = Math.min(this.board_coord.bottom - this.paddle_common.height, this.paddle_2_coord.top + this.board_coord.height * 0.1) + 'px';
				this.paddle_2_coord = this.paddle_2.getBoundingClientRect();
				//console.log(`paddle_2_coord = ${JSON.stringify(this.paddle_2_coord, null, 2)}`);
			}
		}
	}
}
