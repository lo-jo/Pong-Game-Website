import { BaseClass } from './BaseClass'
import { Navbar } from './Navbar';
import { router } from './Router';

export class Tournament extends BaseClass {
    constructor() {
        super();
        this.navbar = new Navbar();
        this.createTournament();
        // this.initWebSocket();
    }

    createTournament()
    {
        document.getElementById('app').innerHTML = this.getWaitingForGameHtml();
        // const tournamentName = document.getElementById("tournamentName").value;
        const tournamentName = history.state.tournamentName;

        const httpProtocol = window.location.protocol;
        const url = `${httpProtocol}//localhost:8000/pong/create_tournament/`;

        const jwtAccess = localStorage.getItem('token');

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tournamentName: tournamentName,
                // players: players,
            }),
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
                history.pushState({ data }, '', '/dashboard');
                router();
            })
            .catch(error => {
                console.error('Error making request:', error);
            });
    }

    // initWebSocket() {
    //     console.log('initWebSocket in Tournament class call()');
    //     const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    //     const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match`;
    
    //     console.log(wsUrl);
    //     const socket = new WebSocket(wsUrl);

    //     socket.onopen = function() {
    //         console.log('WebSocket connection established.');
    //     };

    //     socket.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         console.log('Mensaje recibido desde el servidor:', data);
    //         console.log("Waiting for other player to start tournament");
    //         document.getElementById('app').innerHTML = this.getWaitingForGameHtml();
    //         // if (data.message == 'create_join') {
    //         //     console.log("Waiting for someone");
    //         //     document.getElementById('app').innerHTML = this.getWaitingForGameHtml();
    //         // } else if (data.message == 'join_play') {
    //         //     console.log("The match must be start");
    //         // }
    //     };
        
    //     socket.onerror = function(error) {
    //         console.error('WebSocket error:', error);
    //     };
    
    //     socket.onclose = function() {
    //         console.log('WebSocket connection closed.');
    //     };
    // }

    getWaitingForGameHtml()
    {
        return `<div class="spinner-border" style="color: #fff; width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`
    }

    getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<p>Tournament</p>`;
    }
}