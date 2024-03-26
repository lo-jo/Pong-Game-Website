export const initKeyEvents = () => {
    document.addEventListener('keydown', (e) => {
        switch(e.key){
            case 'w':
                console.log("`w` pressed");
                break;
            case 's':
                console.log("`w` pressed");
                break;       
        }
    });
}

export const initGameTwoD = (data) => {

    const { usuario_1 } = data;
    const { ball_game } = data;

    const ball = createBall('ball', ball_game);
    const paddle_1 = createPaddle('user', usuario_1);

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

	board_game.appendChild(ball);
	board_game.appendChild(paddle_1);
}

const createPaddle = ( className, user ) => {
    console.log('createPaddle call()');
    const paddle = document.createElement('div');
    /*Setting element class name*/
    paddle.className = `${className}-paddle`;
    /*Getting size for data user*/
    const { size_x , size_y} = user;
    const width = 100 * size_x;
    const height = 100 * size_y
    /*Setting size with calc()*/
    paddle.style.setProperty("width", `calc(${width}%)`);
    paddle.style.setProperty("height", `calc(${height}%)`);

    const { top, bottom, left, right } = user;

    paddle.style.setProperty("top", `calc(${top * 100}%)`);
    paddle.style.setProperty("left", `calc(${left * 100}%)`);
    return (paddle);
};

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

const createBall = ( id, ball_data ) => {
    console.log('createBall call()');
    /*Setting id for ball */
	const ball = document.createElement('div');
    ball.setAttribute('id', id);
    /*Setting width and height*/
    const { size_x , size_y} = ball_data;
    /*Setting size with calc()*/
    ball.style.setProperty("width", `calc(${size_x* 100}%)`);
    ball.style.setProperty("height", `calc(${size_y * 100}%)`);
    /*Setting position */
    const { top, bottom, left, right }  = ball_data;
    ball.style.setProperty("top", `calc(${top * 100}%)`);
    ball.style.setProperty("left", `calc(${left * 100}%)`);
    // ball.style.setProperty("bottom", `calc(${bottom * 100}%)`);
    // ball.style.setProperty("right", `calc(${right * 100}%)`);
    /*Adding ball effect*/
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
    // ball.style.setProperty('background-color', `blue`);
    // console.log(`Top ${top}`);
    // console.log(`Left ${left}`);
    ball.style.setProperty("top", `calc(${top}%)`);
    ball.style.setProperty("left", `calc(${left}%)`);
}

export const drawUser = (user_info) => {
    console.log(`Drawing user!`);

    const user = document.createElement('div');
    // ball.className = className;
    user.className = 'game_user';

    const top = 100 * user_info.top;
    const left = 100 * user_info.left
    // ball.style.setProperty('background-color', `blue`);
    console.log(`Top ${top}`);
    console.log(`Left ${left}`);
    user.style.setProperty("top", `calc(${top}%)`);
    user.style.setProperty("left", `calc(${left}%)`);
}