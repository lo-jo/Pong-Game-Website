import { BaseClass } from './BaseClass'
import { router } from './Router'
import { Navbar } from './Navbar';

export class Dashboard extends BaseClass {
    constructor() {
        super();
        this.initWebSocket();
        this.navbar = new Navbar();
        // Set up click event listener on the document
        document.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleButtonClick(event) {
        console.log(`button clicked:[${event.target.id}]`);
        if (event.target.id === 'launch-game-button') {
            this.launchGame();
        } else if (event.target.id === 'create-tournament') {
            this.createTournament();
        }
    }

    getWaitingForGameHtml()
    {
        return `<div class="h-25 spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`
    }

    initWebSocket() {
        console.log('initWebSocket call()');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/match`;
    
        console.log(wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = function() {
            console.log('WebSocket connection established.');
        };
    
        // socket.onmessage = function(event) {
        //     const data = JSON.parse(event.data);
        //     console.log('Mensaje recibido desde el servidor:', data);
        //     if (data.message == 'create_join')
        //     {
        //         console.log("Waiting for someone");
        //         document.getElementById('app').innerHTML = this.getWaitingForGameHtml();
        //     }
        //     else if (data.message == 'join_play')
        //     {
        //         console.log("The match must be start");
        //     }
        // };

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

    // Method to join a match
    launchGame() {
        const url = 'http://localhost:8000/pong/join_match/';

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

    // Method to create tournament
    createTournament() {
        console.log()
        // const url = 'http://localhost:8000/pong/join_match/';

        // const jwtAccess = localStorage.getItem('token');

        // const options = {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${jwtAccess}`,
        //         'Content-Type': 'application/json',
        //     },
        // };

        // // Make the request using the Fetch API
        // fetch(url, options)
        //     .then(response => {
        //         // Handle response from the backend if necessary
        //         if (!response.ok) {
        //             throw new Error('The request was not successful');
        //         }
        //         return response.json(); // or response.text(), etc., depending on the response type
        //     })
        //     .then(data => {
        //         // Do something with the data received from the backend if necessary
        //         console.log('Backend response:', data);
        //     })
        //     .catch(error => {     
        //         // Handle request errors
        //         console.error('Error making request:', error);
        //     });
    }


    getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<div id="dashboard">
                    <div id="game-actions">
                        <div class="game-action">
                            <button id="launch-game-button" type="button">PLAY A MATCH</button>
                        </div>
                        <div class="game-action">
                            <button id="create-tournament" type="button">CREATE A TOURNAMENT</button>
                        </div>
                    </div>
                    <div id="game-stats">
                        <h3>LAST MATCHES</h3>
                    </div>
                </div>`;
    }
}
