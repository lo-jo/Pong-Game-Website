import { BaseClass } from './BaseClass'
import { Navbar } from './Navbar';

export class Match extends BaseClass {
    constructor() {
        super();
        this.navbar = new Navbar();
        this.postMatch();
        this.initWebSocket();
    }

    postMatch()
    {
        const httpProtocol = window.location.protocol;
        const url = `${httpProtocol}//localhost:8000/pong/join_match/`;
        alert(url);

        const jwtAccess = localStorage.getItem('token');

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        };

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('The request was not successful');
                }
                return response.json();
            })
            .then(data => {
                console.log('Backend response:', data);
            })
            .catch(error => {
                console.error('Error making request:', error);
            });
    }

    initWebSocket() {
        console.log('initWebSocket in Match class call()');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match`;
    
        console.log(wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = function() {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido desde el servidor:', data);
            if (data.message == 'create_join') {
                console.log("Waiting for someone");
                document.getElementById('app').innerHTML = this.getWaitingForGameHtml();
            } else if (data.message == 'join_play') {
                console.log("The match must be start");
            }
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = function() {
            console.log('WebSocket connection closed.');
        };
    }

    getWaitingForGameHtml()
    {
        return `<div class="h-25 spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`
    }

    getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<p>Match</p>`;
    }
}