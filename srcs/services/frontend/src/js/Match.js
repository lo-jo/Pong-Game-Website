import { BaseClass } from './BaseClass'
import { Navbar } from './Navbar';
import { initGameTwoD } from './game';

export class Match extends BaseClass {
    constructor(id) {
        super();
        this.navbar = new Navbar();
        this.id = id;
        this.css = './css/game.css',
        // this.insertCssLink();
        this.initWebSocket();
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match/${this.id}`;
    
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket(match game) connection established.');
            // socket.send(JSON.stringify(this.getScreenParams()));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { game_state } = data;
            console.log(game_state);
            this.updateGameState(game_state);
        };

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = function() {
            console.log('WebSocket (match game) connection closed.');
        };
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
        return ``;
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

    updateGameState(game_state)
    {
        // console.log(game_state);
        if (game_state === 'init_pong_game')
        {
            console.log('Draw board in frontend!')
            initGameTwoD();
        }
    }
}


