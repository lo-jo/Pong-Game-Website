import { router } from './Router'
import { BaseClass } from './BaseClass'
import { Tournament } from './Tournament';

export class Dashboard extends BaseClass {
    constructor() {
        super();
        this.tournament = new Tournament(this);
        this.addDocumentClickListener();
        // this.handleDocumentClickBound = this.handleDocumentClick.bind(this);
        // document.getElementById('app').addEventListener('click', this.handleDocumentClickBound);
    }

    async handleDocumentClick(event) {
        console.log(`button clicked:[${event.target.id}]`);
        if (event.target.id === 'launch-game-button') {
            event.preventDefault();
            const button = document.getElementById('launch-game-button');
            // button.disabled = true;
            try {
                this.initWebSocketLobby();
                await this.postMatch();
                console.log('web socket');
            } catch (error) {
                console.error('Error:', error);
                // button.disabled = false;
            }
            // history.pushState({}, '', '/match_lobby');
            // router();
        } else if (event.target.id === 'launch-tournament') {
            history.pushState({}, '', '/dashboard');
            document.getElementById('app').innerHTML = await this.getHtmlFormTournament();
        } else if (event.target.id === 'createTournament') {
            event.preventDefault();
            let tournamentNameInput = document.getElementById("tournamentName");
            let createTournamentButton = document.getElementById("createTournament");
            tournamentNameInput.disabled = true;
            createTournamentButton.disabled = true;
            let tournamentName = tournamentNameInput.value.trim();
            if (!tournamentName) {
                this.displayMessage("Tournament name cannot be empty.", false);
                setTimeout(async () => {
                    tournamentNameInput.disabled = false;
                    createTournamentButton.disabled = false;
                }, 2000);
                return;
            }
            let obj = await this.tournament.createTournament(tournamentName);
            this.displayMessage(`${obj.message}`, obj.success);
            setTimeout(async () => {
                tournamentNameInput.disabled = false;
                tournamentNameInput.value = '';
                createTournamentButton.disabled = false;
                document.getElementById('app').innerHTML = await this.getHtmlForMain();
            }, 2000);
        } else if (event.target.id === 'join-tournament') {
            event.preventDefault();
            await this.tournament.displayOpenTournaments();
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

    displayMessage(message, flag) {
        const id = (flag) ? ".alert-success" : ".alert-danger";
        const alertElement = document.querySelector(`#tournamentForm ${id}`);
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        setTimeout(() => {
            this.hideMessage(id);
        }, 2000);
    }
    
    hideMessage(id) {
        const alertElement = document.querySelector(`#tournamentForm ${id}`);
        alertElement.textContent = '';
        alertElement.style.display = 'none';
    }

    async getHtmlFormTournament() {
        return `<div id="form-tournament container-fluid">
                    <h1>Create tournament </h1>
                    <div class="form-group">
                        <form id="tournamentForm">
                            <label for="tournamentName">Tournament name:</label>
                            <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Enter the name of the tournament">
                            <br>
                            <div id="redWarning" class="alert alert-danger" role="alert"></div>
                            <div id="greenNotif" class="alert alert-success" role="alert"></div>
                            <button type="submit" id="createTournament" class="btn btn-dark btn-sm">Create tournament</button>
                        </form>
                    </div>
                </div>`;
    };

    async getHtmlForMain() {
        return `<div id="dashboard">
                    <div id="game-actions">
                        <div class="game-action">
                            <button id="launch-game-button" type="button">PLAY A MATCH</button>
                        </div>
                        <div class="game-action">
                            <button id="join-tournament" type="button">JOIN A TOURNAMENT</button>
                        </div>
                        <div class="game-action">
                            <button id="launch-tournament" type="button">CREATE A TOURNAMENT</button>
                        </div>
                    </div>
                    <div id="game-stats">
                        <h3>LAST MATCHES</h3>
                    </div>
                </div>`;
    };

    // cleanup() {
    //     super.cleanup();
    //     // document.getElementById('app').removeEventListener('click', this.handleDocumentClickBound);
    // }

    getHtmlForWaitingSpinner() {
        document.getElementById('app').innerHTML =  `<div class="spinner-border" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </div>`;
    }

}
