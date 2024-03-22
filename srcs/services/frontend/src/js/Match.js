import { BaseClass } from './BaseClass'
import { router } from './Router'
import { initGameTwoD, drawBall } from './GameElement';


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
            const { type_message } = data
            console.log(`TYPE MESSAGE ${type_message}`);
            switch(type_message)
            {
                case 'ws_handshake':
                    const { ws_handshake } = data;
                    this.ws_handshake(ws_handshake, data);
                    break;
                case 'game_state':
                    const { game_state } = data;
                    this.updateGameState(game_state, data);
                    break;
                case 'other_user':
                    const { other_user } = data
                    console.log(other_user);
                    this.socket.send(JSON.stringify({'type_message' : 'other_user', 'other_user' : other_user }));
                    break;
                case 'timer':
                    const { timer } = data
                    this.updateTimer(timer);
                    break;
                case 'game_element':
                    console.log(data);
                    const { game_element } = data;
                    console.log(game_element);
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
        console.log('In ws_handshake()');
        console.log(ws_handshake_message);
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
                this.showMessageAndRedirect(`You don'have authorization to this match.`);
                break;
            case 'initial_data':
                console.log(`drawConfirmBoard!`);
                const { user_1_info, user_2_info } = data
                this.drawConfirmBoard(user_1_info, user_2_info)
        }
    }

    
    updateGameState(game_state, data)
    {
        console.log(game_state);
        switch (game_state)
        {
            case 'welcome':
                console.log("Welcome to this match");
                const jwtToken = localStorage.getItem('token');
                this.socket.send(JSON.stringify({'type_message' : 'init_user_data', 'token' : `${jwtToken}` , 'screen_info' : this.getScreenParams()}));
                break;
            case 'init_pong_game':
                console.log('Draw board in frontend!')
                initGameTwoD();
                break;
            case 'someone_left':
                console.log('Someone left');
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
            default:
                break;
        }
    }
    // confirmMatch()
    // {
    //     this.socket.send(JSON.stringify({'type_message' : 'ws_handshake', 'ws_handshake' : 'confirmation'}));
    // }

    /*Functions to send data*/
    getScreenParams()
    {
        const appDiv = document.getElementById('app');
        const screenParams = {
            offsetWidth: appDiv.offsetWidth,
            offsetHeight: appDiv.offsetHeight,
            clientWidth: appDiv.clientWidth,
            clientHeight: appDiv.clientHeight
        };
        return screenParams;
    }
    

    /*Functions to update html*/
    
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
    
    updateTimer(seconds_string) {
        const seconds = parseInt(seconds_string, 10);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        document.getElementById('timer').innerText = `${formattedMinutes}:${formattedSeconds}`;
    }
    
    drawConfirmBoard(user_1_info, user_2_info){

        const app = document.getElementById('app');

        const appContainer = document.createElement('div');

        /*Adding 'app-container' class to app div*/
        appContainer.classList.add('app-container');
        /*Creating game header container for show user names and timer*/
        const game_header = document.createElement('header');
        game_header.classList.add('game-header');
        
        /*Creating user names div*/
        const user1Div = document.createElement('div');
        user1Div.classList.add('user-info', 'top-left');
        user1Div.innerHTML = `
            <span>${user_1_info.username}</span>
        `;

        const user2Div = document.createElement('div');
        user2Div.classList.add('user-info', 'top-right');
        user2Div.innerHTML = `
            <span>${user_2_info.username}</span>
        `;

        /*Creating timer*/
        const timerElement = document.createElement('div');
        timerElement.id = 'timer';
        timerElement.classList.add('timer');
        timerElement.textContent = '2:00';

        // Adding childs of game header
        game_header.appendChild(user1Div);
        game_header.appendChild(timerElement);
        game_header.appendChild(user2Div);

        appContainer.appendChild(game_header);

        // Confirmation button 
        const confirmMatchButton = document.createElement('button');
        confirmMatchButton.setAttribute('id', 'confirm-match');
        confirmMatchButton.classList.add('btn', 'btn-light', 'center');
        confirmMatchButton.textContent = 'Ready';
        confirmMatchButton.addEventListener('click', () => {
            this.socket.send(JSON.stringify({'type_message' : 'ws_handshake', 'ws_handshake' : 'confirmation'}));
        });

        /*Creating board game, parent of ball and paddles*/
        const board_game = document.createElement('div');
        board_game.setAttribute('id', 'board-game');
        board_game.classList.add('board-game');

        /*Adding confirmation button*/
        board_game.appendChild(confirmMatchButton);

        /*Adding board game to app div */
        appContainer.appendChild(board_game);
        
        /*Adding all the app container*/
        app.appendChild(appContainer);
    }

    // getHtmlForWaitingSpinner() {
    //     document.getElementById('app').innerHTML =  `<div class="spinner-border" role="status">
    //                                                     <span class="visually-hidden">Loading...</span>
    //                                                 </div>`;
    // }
}


