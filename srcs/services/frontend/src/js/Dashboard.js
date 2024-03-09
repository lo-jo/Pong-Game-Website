import { BaseClass } from './BaseClass'
import { router } from './Router'
import { Navbar } from './Navbar';

export class Dashboard extends BaseClass {
    constructor() {
        super();
        // this.initWebSocket();
        this.navbar = new Navbar();
        // Set up click event listener on the document
        document.addEventListener('click', this.handleButtonClick.bind(this));
    }

    async handleButtonClick(event) {
        // console.log(`button clicked:[${event.target.id}]`);
        if (event.target.id === 'launch-game-button') {
            event.preventDefault();
            const button = document.getElementById('launch-game-button');
            button.disabled = true;
            try {
                this.initWebSocketLobby();
                await this.postMatch();
                console.log('web socket');
            } catch (error) {
                console.error('Error:', error);
                button.disabled = false;
            }
            // history.pushState({}, '', '/match_lobby');
            // router();
        } else if (event.target.id === 'create-tournament') {
            this.createTournament();
        }
    }
   

    async postMatch() {
        const httpProtocol = window.location.protocol;
        const url = `${httpProtocol}//localhost:8000/pong/join_match/`;
        const jwtAccess = localStorage.getItem('token');
        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        };
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            // Add action ? 
            const data = await response.json();
            console.log('Backend response:', data);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }

        // fetch(url, options)
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('The request was not successful');
        //         }
        //         return response.json();
        //     })
        //     .then(data => {
        //         console.log('Backend response:', data);
        //     })
        //     .catch(error => {
        //         console.error('Error making request:', error);
        //     });
    }

    initWebSocketLobby() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/lobby`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = function() {
            console.log('WebSocket(match lobby) connection established.');
        };

        socket.onmessage = (event) => {
            console.log('hereeee');
            const data = JSON.parse(event.data);
            const { action, match_id } = data;
            console.log(action, match_id);
            if (action == 'create_join') {
                console.log('here');
                this.getHtmlForWaitingSpinner();
            } else if (action == 'join_play') {
                socket.close();
                history.pushState({ match_id }, '', `/match/${match_id}`);
                router();
            }
        };

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = function() {
            console.log('WebSocket (match lobby) connection closed.');
        };
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

    getHtmlForWaitingSpinner() {
        document.getElementById('app').innerHTML =  `<div class="spinner-border" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </div>`;
    }

}
