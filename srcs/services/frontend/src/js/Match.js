import { BaseClass } from './BaseClass'
import { router } from './Router'
import { Navbar } from './Navbar';
import { initGameTwoD } from './game';

export class Match extends BaseClass {
    constructor(id) {
        super();
        this.navbar = new Navbar();
        this.id = id;
        this.css = './css/game.css',
        document.addEventListener('click', this.handleButtonClick.bind(this));
        // this.insertCssLink();
        this.initWebSocket();
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match/${this.id}`;
    
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket(match gameeee) connection established.');
            socket.send(JSON.stringify({ 'match_id' : this.id}));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { game_state } = data;
            this.updateGameState(game_state, data);
        };

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = function() {
            console.log('WebSocket (match game) connection closed.');
        };
    }

    async handleButtonClick(event) {
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

    getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<button id="confirm-match">Ready</button>`;
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

    updateGameState(game_state, data)
    {
        console.log(game_state);
        switch (game_state)
        {
            case 'match_do_not_exist':
                this.showMessageAndRedirect();
                break;
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

    showMessageAndRedirect() {
        document.getElementById('app').innerHTML = `<p>You have tried to join a non-existent match, try with a valid ID<br>You will be redirected in to dashboard page <time><strong id="seconds">5</strong> seconds</time>.</p>`
        let seconds = document.getElementById('seconds'),
        total = seconds.innerHTML,
        timeinterval = setInterval(function () {
            total = --total;
            seconds.textContent = total;
            if (total <= 0) {
                clearInterval(timeinterval);
                history.pushState('', '', `/dashboard`);
                router();
            }
        }, 1000);
    }
    
}


