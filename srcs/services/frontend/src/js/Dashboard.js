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
            history.pushState({}, '', '/match_lobby');
            router();
            // try {
            //     this.initWebSocketLobby();
            //     await this.postMatch();
            // } catch (error) {
            //     console.error('Error:', error);
            // }
        }
        else if (event.target.id == 'launch-local-game'){
            event.preventDefault();
            try{
                console.log('CLICKED');
                await this.postLocalMatch();
            } catch (error) {
                console.error('Error:', error);
            }
        } 
        else if (event.target.id === 'launch-tournament') {
            history.pushState({}, '', '/dashboard');
            document.getElementById('app').innerHTML = await this.getHtmlFormTournament();
        } else if (event.target.id === 'goBack' || event.target.id === 'goBackBtn') {
            event.preventDefault();
            document.getElementById('app').innerHTML = await this.getHtmlForMain();
        } else if (event.target.id === 'createTournament') {
            event.preventDefault();
            let tournamentNameInput = document.getElementById("tournamentName");
            let createTournamentButton = document.getElementById("createTournament");
            let goBackBtn = document.getElementById("goBackBtn");
            tournamentNameInput.disabled = true;
            createTournamentButton.disabled = true;
            goBackBtn.disabled = true;
            let tournamentName = tournamentNameInput.value.trim();
            if (!tournamentName) {
                this.displayMessage("Tournament name cannot be empty.", false);
                setTimeout(async () => {
                    if (document.getElementById("tournamentName"))
                    {
                        tournamentNameInput.disabled = false;
                        createTournamentButton.disabled = false;
                        goBackBtn.disabled = false;
                    }
                }, 1500);
                return;
            }
            let player2 = document.getElementById("player2");
            let player3 = document.getElementById("player3");
            let player4 = document.getElementById("player4");
            let p2, p3, p4 = null;
            if (player2 && player3 && player4)
            {
                player2.disabled = true;
                player3.disabled = true;
                player4.disabled = true;
                p2 = player2.value.trim();
                p3 = player3.value.trim();
                p4 = player4.value.trim();

                if (!p2 || !p3 || !p4) {
                    this.displayMessage("Player names cannot be empty.", false);
                    setTimeout(async () => {
                        if (document.getElementById("tournamentName"))
                        {
                            tournamentNameInput.disabled = false;
                            player2.disabled = false;
                            player3.disabled = false;
                            player4.disabled = false;
                            createTournamentButton.disabled = false;
                            goBackBtn.disabled = false;
                        }
                    }, 1500);
                    return;
                }
            }
            let obj = (p2 && p3 && p4) ? await this.tournament.createLocalTournament(tournamentName, p2, p3, p4) : await this.tournament.createTournament(tournamentName);
            this.displayMessage(`${obj.message}`, obj.success);
            setTimeout(async () => {
                if (document.getElementById("createTournament"))
                {
                    tournamentNameInput.disabled = false;
                    tournamentNameInput.value = '';
                    createTournamentButton.disabled = false;
                    document.getElementById('app').innerHTML = await this.getHtmlForMain();
                }
            }, 1500);
        } else if (event.target.id === 'join-tournament') {
            event.preventDefault();
            await this.tournament.displayOpenTournaments();
        } else if (event.target.id === 'launch-local-tournament') {
            history.pushState({}, '', '/dashboard');
            document.getElementById('app').innerHTML = await this.getHtmlFormLocalTournament();
        } 
    }

    async getUserData() {
        const jwtAccess = localStorage.getItem('token');
    
        return fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/users/profile/`, {
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
            const response = await fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/users/${id}/`, {
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

    async createMatch(targetId){
        const jwtAccess = localStorage.getItem('token');
        const selfData = await this.getUserData();
        const requestBody = {
            user_1: selfData.id,
            user_2: targetId,
        };
        try {
            const response = await fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/pong/matches/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const match = JSON.parse(await response.text());
            history.pushState({}, '', `/localmatch/${match.id}`);
            router();
        } catch (error) {
            // Handle error here
            console.error('Error creating match:', error);
        }
    }


    generateRandomName() {
        const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
        return `USER${randomNumber}`;
    }

    generateRandomPassword(length) {
        const passwordLength = length || 8; // Default length is 8 characters
        let password = '';
        for (let i = 0; i < passwordLength; i++) {
            const digit = Math.floor(Math.random() * 10); // Generate a random digit (0-9)
            password += digit;
        }
        return password;
    }
    


    async postLocalMatch() {
        console.log("Posting that local match");
        // const userData = await this.getUserData();
        const username = this.generateRandomName();
        console.log(username);
        const password = this.generateRandomPassword();
        const email = `${username}@amigo.org`;
        
        try {
            const response = await fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
    
            if (!response.ok) {
                let responseData = await response.text(); // Get response text
                const errorData = JSON.parse(responseData);
                let formattedErrorMsg = '';
                for (const [key, value] of Object.entries(errorData)) {
                    if (Array.isArray(value)) {
                        formattedErrorMsg += `${key}: ${value.join(', ')}\n`;
                    } else {
                        formattedErrorMsg += `${key}: ${value}\n`;
                    }
                }
                
                this.displayMessage(formattedErrorMsg, false);
                throw new Error('Invalid credentials');
            }
            // console.log(await response.text());
            const user2 = await response.json();
            await this.createMatch(user2.id);
          
        } catch (error) {
            console.error('ERROR : ', error);
        }
    }


    async postMatch() {
        const url = `${this.httpProtocol}://${this.host}:${this.backendPort}/pong/join_match/`;
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
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    initWebSocketLobby() {
        const wsProtocol = process.env.PROTOCOL === 'https' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${this.host}:${this.backendPort}/ws/pong/lobby`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = function() {
            console.log('WebSocket(match lobby) connection established.');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { action, match_id } = data;
            if (action == 'create_join') {
                this.getHtmlForWaitingSpinner();
            } else if (action == 'join_play') {
                socket.close();
                history.pushState('', '', `/match/${match_id}`);
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
        if (!alertElement)
            return;
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        setTimeout(() => {
            this.hideMessage(id);
        }, 1500);
    }
    
    hideMessage(id) {
        const alertElement = document.querySelector(`#tournamentForm ${id}`);
        if (!alertElement)
            return;
        alertElement.textContent = '';
        alertElement.style.display = 'none';
    }

    async getHtmlFormTournament() {
        return `<div class="row justify-content-center">
                    <div class="col-xl-4 col-lg-6 col-md-8">
                        <div class="d-flex align-items-center my-3">
                            <button type="button" id="goBackBtn" class="p-1 btn btn-dark me-3">
                                <i id="goBack" class="bi bi-arrow-left-circle m-2"></i>
                            </button>
                            <h3 class="mb-0">Create tournament</h3>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <form id="tournamentForm" class="text-start">
                        <div class="row my-3 justify-content-center align-items-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="tournamentName">Tournament name:</label>
                                <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Pong masters">
                            </div>
                        </div>
                        <div class="row m-2 text-center justify-content-center">
                            <div class="col-lg-6 col-md-8">
                                <div id="redWarning" class="alert alert-danger" role="alert"></div>
                                <div id="greenNotif" class="alert alert-success" role="alert"></div>
                                <button type="submit" id="createTournament" class="my-3 p-1 btn btn-dark btn-sm">Create</button>
                            </div>        
                        </div>            
                    </form>
                </div>`;
    };

    async getHtmlFormLocalTournament() {
        return `<div class="row justify-content-center">
                    <div class="col-xl-4 col-lg-6 col-md-8">
                        <div class="d-flex align-items-center my-3">
                            <button type="button" id="goBackBtn" class="p-1 btn btn-dark me-3">
                                <i id="goBack" class="bi bi-arrow-left-circle m-2"></i>
                            </button>
                            <h3 class="mb-0">Create local tournament</h3>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <form id="tournamentForm" class="text-start">
                        <div class="row my-3 justify-content-center align-items-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="tournamentName">Tournament name:</label>
                                <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Pong masters">
                            </div>
                        </div>
                        <div class="row my-3 justify-content-center align-items-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="tournamentName">Player 2:</label>
                                <input class="form-control form-control-sm" type="text" id="player2" name="player2" required placeholder="Paquito">
                            </div>
                        </div>
                        <div class="row my-3 justify-content-center align-items-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="tournamentName">Player 3:</label>
                                <input class="form-control form-control-sm" type="text" id="player3" name="player3" required placeholder="Taquito">
                            </div>
                        </div>
                        <div class="row my-3 justify-content-center align-items-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="tournamentName">Player 4:</label>
                                <input class="form-control form-control-sm" type="text" id="player4" name="player4" required placeholder="Pollito">
                            </div>
                        </div>
                        <div class="row m-2 text-center justify-content-center">
                            <div class="col-lg-6 col-md-8">
                                <div id="redWarning" class="alert alert-danger" role="alert"></div>
                                <div id="greenNotif" class="alert alert-success" role="alert"></div>
                                <button type="submit" id="createTournament" class="my-3 p-1 btn btn-dark btn-sm">Create</button>
                            </div>        
                        </div>            
                    </form>
                </div>`;
    };

    async getUserData() {
        const jwtAccess = localStorage.getItem('token');
    
        return fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/users/profile/`, {
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
            const response = await fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/users/${id}/`, {
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
            const response = await fetch(`${this.httpProtocol}://${this.host}:${this.backendPort}/pong/pending_matches/${user.id}/`, {
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
            const log_content = document.getElementById('upcoming');
            if (data.length == 0){
                log_content.classList.add('align-items-start', 'justify-content-center');
                log_content.innerText = "No upcoming matches";
                return;
            }
            for (const match of data) {
                console.log(data);
                try {
                    if (!match.user_1 || !match.user_2){
                        // CHECK THIS WITH DANIEL
                        continue;
                    }
                    const log_div = document.createElement('p');
                    log_div.setAttribute('class', 'p-1 log-content');
                    const user_1 = await this.getFriendData(match.user_1);
                    const user_2 = await this.getFriendData(match.user_2);
                    log_div.innerText = `${match.local_tournament} ${user_1.username} vs. ${user_2.username} `;
                    
                    if (match.local_tournament === true){
                        const localButt = document.createElement('button');
                        localButt.setAttribute('class', "px-2 btn btn-dark btn-sm");
                        localButt.setAttribute('id', `${match.id}`);
                        localButt.innerText = 'PLAY';
                        localButt.addEventListener('click', (event) => {
                            if (event.target.id == `${match.id}`){
                                event.preventDefault();
                                navigateTo(`${this.httpProtocol}://${this.host}:${process.env.FRONTEND_PORT}/local_tournament_match/${match.id}`);
                            }
                        });
                        log_div.appendChild(localButt);
                        log_content.appendChild(log_div);
                    }
                    else {
                        const playButt = document.createElement('button');
                        playButt.setAttribute('class', "px-2 btn btn-danger btn-sm");
                        playButt.setAttribute('id', `${match.id}`);
                        playButt.innerText = 'PLAY';
                        playButt.addEventListener('click', (event) => {
                            if (event.target.id == `${match.id}`){
                                event.preventDefault();
                                navigateTo(`${this.httpProtocol}://${this.host}:${process.env.FRONTEND_PORT}/match/${match.id}`);
                            }
                        });
                        log_div.appendChild(playButt);
                        log_content.appendChild(log_div);
                    }

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
        return `<div id="dashboard" class="container">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-4 col-sm-5">
                            <div id="game-actions" class="row justify-content-center">
                                <div class="game-action col">
                                    <button id="launch-local-game" class="btn my-3 py-2" type="button">PLAY A LOCAL MATCH</button>
                                </div>
                            </div>
                            <div id="game-actions" class="row justify-content-center">
                                <div class="game-action col">
                                    <button id="launch-local-tournament" class="btn my-3 py-2" type="button">PLAY A LOCAL TOURNAMENT</button>
                                </div>
                            </div>
                            <div id="game-actions" class="row justify-content-center">
                                <div class="game-action col">
                                    <button id="launch-game-button" class="btn my-3 py-2" type="button">PLAY A MATCH</button>
                                </div>
                            </div>
                            <div id="game-actions" class="row">
                                <div class="game-action col">
                                    <button id="join-tournament" class="btn my-3 py-2" type="button">JOIN TOURNAMENT</button>
                                </div>
                            </div>
                            <div id="game-actions" class="row">
                                <div class="game-action col">
                                    <button id="launch-tournament" class="btn my-3 py-2" type="button">CREATE TOURNAMENT</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-8 col-sm-7" id="game-stats">
                            <div class="row">
                                <h3>Upcoming Matches</h3> 
                                <div id="upcoming"></div>
                            </div>
                           
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
