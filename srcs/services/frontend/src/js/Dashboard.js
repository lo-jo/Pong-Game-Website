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
        if (event.target.id === 'launch-game-button') {
            console.log('Launching game...');
            this.launchGame();
        } else if (event.target.id === 'launch-tournament') {
            document.getElementById('app').innerHTML = this.getHtmlFormTournament();
        } else if (event.target.id === 'createTournament') {
            event.preventDefault();
            this.createTournament();
        }
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/pong/match`;
    
        const socket = new WebSocket(wsUrl);
    
        socket.onopen = function() {
            console.log('WebSocket connection established.');
        };
    
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido desde el servidor:', data);
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
        const tournamentName = document.getElementById("tournamentName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;
        const player3 = "lolo";
        const player4 = "poco";
        const players = [player1, player2, player3, player4];

        const url = 'http://localhost:8000/pong/create_tournament/';

        const jwtAccess = localStorage.getItem('token');

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tournamentName: tournamentName,
                players: players,
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
            })
            .catch(error => {
                console.error('Error making request:', error);
            });

    }

    getHtmlFormTournament() {
        return `<div id="form-tournament container-fluid">
                    <h1>Create tournament </h1>
                    <div class="form-group">
                        <form id="tournamentForm">
                            <label for="tournamentName">Tournament name:</label>
                            <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Enter the name of the tournament">
                            <br>
                            <label for="player1">Participant 1:</label>
                            <input class="form-control form-control-sm" type="text" id="player1" name="player1" required placeholder="Enter player 1">
                            <br>
                            <label for="player2">Participant 2:</label>
                            <input class="form-control form-control-sm" type="text" id="player2" name="player2" required placeholder="Enter player 2">
                            <br>
                            <button type="submit" id="createTournament" class="btn btn-dark btn-sm">Create tournament</button>
                        </form>
                    </div>
                </div>`;
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
                            <button id="launch-tournament" type="button">CREATE A TOURNAMENT</button>
                        </div>
                    </div>
                    <div id="game-stats">
                        <h3>LAST MATCHES</h3>
                    </div>
                </div>`;
    }
}
