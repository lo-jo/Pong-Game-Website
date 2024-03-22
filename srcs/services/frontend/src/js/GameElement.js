export const initGameTwoD = () => {
	// gameState = 'start';
	// // document.getElementById('app').innerHTML = '';
	// // document.getElementById('app').className = 'container';
	// let timer = document.createElement('div');
	// timer.setAttribute('id', 'timer');

	// let box = document.createElement('div');
	// box.className = 'container';

    // score_1 = createScore('player_1_score');
    // message = createMessage('message', 'Press Enter');
    // score_2 = createScore('player_2_score');
	// score = document.createElement('div');
	// score.className = 'row';
	// score.appendChild(score_1);
	// score.appendChild(message);
	// score.appendChild(score_2);
	// box.appendChild(score);
	// // document.getElementById('app').appendChild(box);



    const board_game = document.getElementById('board-game');

    const confirm_match_button = document.getElementById('confirm-match');
    if (confirm_match_button) {
        board_game.removeChild(confirm_match_button);
    } else {
        console.error("Element with ID 'confirm-match' not found.");
    }

    // board_game.removeChild(confirm_match_button);

    const board = createBoard('board-game');
	board_game.appendChild(board);
	// board.appendChild(timer);

}

const createBoard = (className) => {
    const boardContainer = document.createElement('div');
    boardContainer.className = `${className}`;
    

    const dottedLine = document.createElement('div');
    dottedLine.className = 'dotted-line';

    const ball = createBall('ball');
    // paddle_1 = createPaddle('paddle_1');
    // paddle_2 = createPaddle('paddle_2');
	
    boardContainer.appendChild(ball);
    // boardContainer.appendChild(paddle_1);
    // boardContainer.appendChild(paddle_2);
	// boardContainer.appendChild(dottedLine);

    return (boardContainer);
};

const createBall = ( className ) => {
	const ball = document.createElement('div');
    // ball.className = className;
    ball.setAttribute('id', className);

    const ballEffect = document.createElement('div');
    ballEffect.className = 'ball_effect';

    ball.appendChild(ballEffect);
    return (ball);
};


export const drawBall = (ball_info) => {
    console.log(`Drawing ball!`);
    const ball = document.getElementById('ball');
    const top = 100 * ball_info.top;
    const left = 100 * ball_info.left
    ball.style.setProperty('background-color', `blue`);
    console.log(`Top ${top}`);
    console.log(`Left ${left}`);
    ball.style.setProperty("top", `calc(${top}%)`);
    ball.style.setProperty("left", `calc(${left}%)`);
}