import { BaseClass } from './BaseClass'
import { router } from './Router'
import { initGameTwoD, drawGameElements } from './GameElement';


export class Match extends BaseClass {
    constructor(id) {
        super();
        this.id = id;
        this.css = './css/game.css';
        this.socket = null;
        this.addDocumentClickListener();
        this.insertCssLink();
        this.initWebSocket();
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match/${this.id}`;
    
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket(match gameeee) connection established.');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type_message } = data;
            switch(type_message)
            {
                case 'ws_handshake':
                    const { ws_handshake } = data;
                    this.ws_handshake(ws_handshake, data);
                    break;
                case 'game_state':
                    const { game_state } = data;
                    // Must refactorize the send_to_connection in pong consumers
                    if (game_state === 'match_is_already_finished')
                    {
                        this.showMessageAndRedirect('You have tried to join a match already finished.');
                        break;
                    }
                    this.updateGameState(game_state);
                    break;
                case 'other_user':
                    const { other_user } = data;
                    this.socket.send(JSON.stringify({'type_message' : 'other_user', 'other_user' : other_user }));
                    break;
                case 'timer':
                    const { timer } = data
                    this.updateTimer(timer);
                    break;
                case 'game_element':
                    const { game_element } = data;
                    this.updateGameElement(game_element);
                    break;
            }
        };

        this.socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        this.socket.onclose = function() {
            console.log('WebSocket (match game) connection closed.');
        };
    }


    insertCssLink()
    {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = `http://localhost:5173/${this.css}`;
        document.head.appendChild(styleCss);
    }

    /*Methods for match handshake*/
    ws_handshake(ws_handshake_message, data)
    {
        switch(ws_handshake_message)
        {
            case 'match_do_not_exist':
                this.showMessageAndRedirect('You have tried to join a non-existent match, try with a valid ID');
                break;
            case 'tell_me_who_you_are':
                const jwtToken = localStorage.getItem('token');
                this.socket.send(JSON.stringify({'type_message' : 'ws_handshake', 'ws_handshake' : 'authorization' , 'authorization' : `${jwtToken}`}));
                break;
            case 'failed_authorization':
                this.showMessageAndRedirect(`You don't have authorization to this match.`);
                break;
            case 'initial_data':
                const { user_1_info, user_2_info } = data
                this.initGame(user_1_info, user_2_info);
        }
    }

    
    updateGameState(game_state_data)
    {
        const game_state = JSON.parse(game_state_data);
        switch (game_state.event)
        {
            case 'init_pong_game':
                initGameTwoD(game_state);
                this.initKeyEvents();
                break;
            case 'someone_left':
                console.log('Someone left');
                break;
            case 'broadcasted_game_event':
                const { broadcasted_game_event } = game_state;
                this.socket.send(JSON.stringify({'type_message' : 'broadcasted_game_event', 'broadcasted_game_event' : `${broadcasted_game_event}`}));
                break;
            case 'game_elements':
                drawGameElements(game_state);
                break;
            default:
                console.log(`Sorry, we are out of ${game_state}.`);
        }
    }

    updateGameElement(game_element_data)
    {
        const game_element = JSON.parse(game_element_data);
        switch (game_element.elem) {
            case 'ball':
                drawBall(game_element);
                break;
            case 'user':
                drawUser(game_element);
                break;
            default:
                break;
        }
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return ``;
    }

    showMessageAndRedirect(redirect_reason) {
        document.getElementById('app').innerHTML = `<p>${redirect_reason}<br>You will be redirected in to dashboard page <time><strong id="seconds">5</strong> seconds</time>.</p>`
        let seconds = document.getElementById('seconds'),
        total = seconds.innerHTML,
        timeinterval = setInterval(() => {
            total = --total;
            seconds.textContent = total;
            if (total <= 0) {
                clearInterval(timeinterval);
                this.socket.close();
                history.pushState('', '', `/dashboard`);
                router();
            }
        }, 1000);
    }

    
    updateTimer(timer_data) {
        const timer = JSON.parse(timer_data);
        const { time_remaininig, type } = timer;

        const timerDiv = document.getElementById('timer');
        if (type == 'normal')
        {
            timerDiv.classList.remove('.color-changing');
        }
        else
        {
            timerDiv.classList.add('.color-changing');
        }

        const seconds = parseInt(time_remaininig, 10);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        timerDiv.innerText = `${formattedMinutes}:${formattedSeconds}`;
    }
    
    initGame(user_1_info, user_2_info)
    {
        // console.log(`initGame call()`);
        this.initBoard(user_1_info, user_2_info);
        this.showTimerBeforeMatch();
    }

    initBoard(user_1_info, user_2_info)
    {
        const app = document.getElementById('app');

        const appContainer = document.createElement('div');

        /*Adding 'app-container' class to app div*/
        appContainer.classList.add('app-container');
        /*Creating game header container for show user names and timer*/
        const game_header = document.createElement('header');
        game_header.classList.add('game-header');
        
        /*Creating user names div*/
        const user1Div = document.createElement('div');
        user1Div.classList.add('user-info');
        user1Div.innerHTML = `
            <span>${user_1_info.username}</span>`;

        const user2Div = document.createElement('div');
        user2Div.classList.add('user-info');
        user2Div.innerHTML = `<span>${user_2_info.username}</span>`;

        /*Creating timer*/
        const timerElement = document.createElement('div');
        timerElement.id = 'timer';
        timerElement.classList.add('timer');
        timerElement.textContent = '00:00';

        const score_1 = document.createElement('div');
        score_1.setAttribute('id', 'score-1');
        score_1.className = `score`;
        score_1.innerHTML = `0`;

        const score_2 = document.createElement('div');
        score_2.setAttribute('id', 'score-2');
        score_2.className = `score`;
        score_2.innerHTML = `0`;


        // Adding childs of game header
        game_header.appendChild(user1Div);
        game_header.appendChild(score_1);
        game_header.appendChild(timerElement);
        game_header.appendChild(score_2);
        game_header.appendChild(user2Div);
        /*Addind header to appContainer */
        appContainer.appendChild(game_header);

        /*Creating board game, parent of ball and paddles*/
        const board_game = document.createElement('div');
        board_game.setAttribute('id', 'board-game');

        /*Adding board game to app div */
        appContainer.appendChild(board_game);
        
        /*Adding all the app container*/
        app.appendChild(appContainer);
    }

    showTimerBeforeMatch(){
        // console.log(`showTimerBeforeMatch call()`);
        const board_game = document.getElementById('board-game');
        let seconds_div = document.createElement('div');
        seconds_div.setAttribute('id', 'seconds');
        board_game.appendChild(seconds_div);
        let seconds = 3;
        let total = seconds
        let timeinterval = setInterval(() => {
            total = --total;
            seconds_div.textContent = total;
            if (total <= 0) {
                clearInterval(timeinterval);
                this.socket.send(JSON.stringify({'type_message' : 'ws_handshake', 'ws_handshake' : 'confirmation'}));
            }
        }, 1000);
    }

    initKeyEvents = () => {
        const jwtToken = localStorage.getItem('token');
        document.addEventListener('keydown', (e) => {
            switch(e.key){
                case 'w':
                    console.log("`w` pressed");
                    this.socket.send(JSON.stringify({'type_message' : 'game_event', 'game_event' : 'move_up' , 'token' : `${jwtToken}`}));
                    break;
                case 's':
                    console.log("`s` pressed");
                    this.socket.send(JSON.stringify({'type_message' : 'game_event', 'game_event' : 'move_down' , 'token' : `${jwtToken}`}));
                    break;       
            }
        });
    }
}


