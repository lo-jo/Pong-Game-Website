import { BaseClass } from './BaseClass'
import { router } from './Router'
import { initGameTwoD } from './game';

export class Match extends BaseClass {
    constructor(id) {
        super();
        this.id = id;
        this.css = './css/game.css';
        this.socket = null;
        this.addDocumentClickListener();
        // document.addEventListener('click', this.handleButtonClick.bind(this));
        // this.insertCssLink();
        this.initWebSocket();
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match/${this.id}`;
    
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket(match gameeee) connection established.');
            this.socket.send(JSON.stringify({ 'match_id' : this.id}));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type_message } = data 
            if (type_message === 'ws_handshake')
            {
                const { ws_handshake } = data;
                this.ws_handshake(ws_handshake);
            }
            else if (type_message === 'game_state')
            {
                const { game_state } = data;
                this.updateGameState(game_state, data);
            }
        };

        this.socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        this.socket.onclose = function() {
            console.log('WebSocket (match game) connection closed.');
        };
    }

    async handleDocumentClick(event) {
        if (event.target.id === 'confirm-match') {
            socket.send(JSON.stringify({ 'message' : 'confirm'}));
        }
    }

    insertCssLink()
    {
        console.log("Here");
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = this.css;
        document.head.appendChild(styleCss);
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<button id="confirm-match">Ready</button>`;
    }

    /*Methods for match handshake*/
    ws_handshake(ws_handshake_message)
    {
        console.log('In ws_handshake()');
        console.log(ws_handshake_message)
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
        }
    }

    
    updateGameState(game_state, data)
    {
        console.log(game_state);
        switch (game_state)
        {
            case 'welcome':
                console.log("Welcome to this match");
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

// if (game_state === 'init_pong_game')
// {
//     console.log('Draw board in frontend!')
//     initGameTwoD();
// }
// else if (game_state === 'someone_left')
// {
//     console.log('Someone left');
// }
// else if (game_state === 'timer')
// {
//     let { timer } = data;
//     console.log(timer)
//     this.updateTimer(timer);
// }
// else if (game_state === 'welcome')
// {
//     console.log("Welcome to this match")
// }
    }
    
    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        
        document.getElementById('timer').innerText = `${formattedMinutes}:${formattedSeconds}`;
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
    
}


