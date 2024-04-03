import { navigateTo, router } from './Router'
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
        console.log(`button clicked:[${event.target.id || event.target.className }]`);
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
                }, 1500);
                return;
            }
            let obj = await this.tournament.createTournament(tournamentName);
            this.displayMessage(`${obj.message}`, obj.success);
            setTimeout(async () => {
                tournamentNameInput.disabled = false;
                tournamentNameInput.value = '';
                createTournamentButton.disabled = false;
                document.getElementById('app').innerHTML = await this.getHtmlForMain();
            }, 1500);
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
        }, 1500);
    }
    
    hideMessage(id) {
        const alertElement = document.querySelector(`#tournamentForm ${id}`);
        alertElement.textContent = '';
        alertElement.style.display = 'none';
    }

    async getHtmlFormTournament() {
        return `<div id="form-tournament container">
                    <div class="row justify-content-center">
                        <h1 class="text-center">Create tournament</h1>
                        <div class="col-lg-4 col-md-6 col-sm-12">
                            <div class="form-group">
                                <form id="tournamentForm">
                                    <label for="tournamentName">Tournament name:</label>
                                    <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Pong masters">
                                    <br>
                                    <div id="redWarning" class="alert alert-danger" role="alert"></div>
                                    <div id="greenNotif" class="alert alert-success" role="alert"></div>
                                    <button type="submit" id="createTournament" class="btn btn-dark btn-sm">Create</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>`;
    };

    async getUserData() {
        const jwtAccess = localStorage.getItem('token');
    
        return fetch('http://localhost:8000/users/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
    }

    async getFriendData(id) {
        const jwtAccess = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/users/${id}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async displayUpcomingMatches(user) {
        const jwtAccess = localStorage.getItem('token');
    
        try {
            const response = await fetch(`http://localhost:8000/pong/pending_matches/${user.id}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            const data = await response.json();
            console.log("MATCH DATA", data);
            const log_content = document.getElementById('upcoming');
            if (data.length == 0){
                log_content.innerText = "No upcoming matches";
                return;
            }
            for (const match of data) {
                try {
                    if (!match.user_1 || !match.user_2){
                        // CHECK THIS WITH DANIEL
                        continue;
                    }
                    const log_div = document.createElement('div');
                    log_div.setAttribute('class', 'p-1 log-content');
                    const user_1 = await this.getFriendData(match.user_1);
                    const user_2 = await this.getFriendData(match.user_2);
                    log_div.innerText = `${user_1.username} vs. ${user_2.username} `;
                    const playButt = document.createElement('button');
                    playButt.setAttribute('class', "btn btn-danger btn-sm");
                    playButt.setAttribute('id', `${match.id}`);
                    playButt.innerText = 'PLAY';
                    playButt.addEventListener('click', (event) => {
                        if (event.target.id == `${match.id}`){
                            event.preventDefault();
                            navigateTo(`http://localhost:5173/match/${match.id}`);
                        }
                    });
                    log_div.appendChild(playButt);
                    log_content.appendChild(log_div);
                } catch (error) {
                    console.error('Error fetching upcoming matches:', error);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async getHtmlForMain() {
        const userData = await this.getUserData();
        this.displayUpcomingMatches(userData);
        return `<div id="dashboard" class="container-fluid">
                    <div class="row">
                    <div class="col-8">
                    <div id="game-actions">
                        <div class="game-action">
                            <button id="launch-game-button" type="button">PLAY A MATCH</button>
                        </div>
                        <div class="game-action">
                            <button id="join-tournament" type="button">JOIN TOURNAMENT</button>
                        </div>
                        <div class="game-action">
                            <button id="launch-tournament" type="button">CREATE TOURNAMENT</button>
                        </div>
                    </div>
                    </div>
                    <div class="col-4" id="game-stats">
                        <h3>Upcoming Matches</h3>
                        <div class="row text-start"><div class="text-start" id="upcoming"></div></div>
                    </div>
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
