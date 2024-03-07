import { BaseClass } from './BaseClass'
import { router } from './Router'
import { Navbar } from './Navbar';

export class Dashboard extends BaseClass {
    constructor() {
        super();
        this.navbar = new Navbar();
        document.getElementById('app').addEventListener('click', this.handleButtonClick.bind(this));
    }

    async handleButtonClick(event) {
        console.log(`button clicked:[${event.target.id}]`);
        if (event.target.id === 'launch-tournament') {
            history.pushState({}, '', '/dashboard');
            document.getElementById('app').innerHTML = this.getHtmlFormTournament();
        } else if (event.target.id === 'createTournament') {
            event.preventDefault();
            const tournamentName = document.getElementById("tournamentName").value;
            if (tournamentName) {
                history.pushState({ tournamentName }, '', '/tournament');
                router();
            }
        } else if (event.target.id === 'join-tournament') {
            await this.displayOpenTournaments();
        }
    }

    async displayOpenTournaments() {
        const openTournaments = await this.fetchOpenTournaments();
        const gameStatsDiv = document.getElementById('game-stats');
    
        gameStatsDiv.innerHTML = '';

        if (openTournaments.length === 0) {
            gameStatsDiv.innerHTML = '<h2>No open tournaments available 🧐</h2>';
            return;
        }

        const tournamentList = document.createElement('ul');
        tournamentList.setAttribute('class', 'list-group');

        openTournaments.forEach(tournament => {
            const listItem = document.createElement('li');
            listItem.setAttribute('class', 'list-group-item');
            listItem.textContent = `Creator: ${tournament.creator_id}, Name: ${tournament.name}`;

            const joinButton = document.createElement('button');
            joinButton.setAttribute('class', 'btn btn-info');
            joinButton.textContent = 'Join';

            // Set IDs for the button and spinner
            joinButton.id = `join-button-${tournament.id}`;
            const spinner = document.createElement('span');
            spinner.id = `spinner-${tournament.id}`;
            spinner.className = 'spinner-border spinner-border-sm text-light';
            spinner.style.display = 'none';

            joinButton.addEventListener('click', () => this.joinTournament(tournament.id));
            joinButton.appendChild(spinner);
            listItem.appendChild(joinButton);

            tournamentList.appendChild(listItem);
        });

        gameStatsDiv.appendChild(tournamentList);
    }

    async joinTournament(tournamentId) {
        const joinButton = document.getElementById(`join-button-${tournamentId}`);
        const spinner = document.getElementById(`spinner-${tournamentId}`);
        
        try {
            spinner.style.display = 'inline-block';
            // joinButton.innerHTML = '&nbsp;';
            joinButton.disabled = true;
    
            // await this.fetchJoinTournament(tournamentId);
            // await this.displayOpenTournaments();
        } catch (error) {
            console.error('Error joining tournament:', error);
        }
        // } finally {
        //     // Hide spinner and enable the button
        //     spinner.style.display = 'none';
        //     joinButton.disabled = false;
        // }
    }

    async fetchOpenTournaments() {
        const httpProtocol = window.location.protocol;
        const jwtAccess = localStorage.getItem('token');
    
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(`${httpProtocol}//localhost:8000/pong/tournaments/`, options);
        const data = await response.json();
        return data;
    }

    async fetchJoinTournament(tournamentId) {
        const httpProtocol = window.location.protocol;
        const jwtAccess = localStorage.getItem('token');
      
        const options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtAccess}`,
            'Content-Type': 'application/json',
          },
        };
      
        try {
            const response = await fetch(`${httpProtocol}//localhost:8000/pong/join_tournament/${tournamentId}/`, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error joining tournament:', errorData.error);
            } else {
                const tournamentData = await response.json();
                console.log('Successfully joined tournament:', tournamentData);
            }
        } catch (error) {
            console.error('Error joining tournament:', error);
        }
    }

    getHtmlFormTournament() {
        return `<div id="form-tournament container-fluid">
                    <h1>Create tournament </h1>
                    <div class="form-group">
                        <form id="tournamentForm">
                            <label for="tournamentName">Tournament name:</label>
                            <input class="form-control form-control-sm" type="text" id="tournamentName" name="tournamentName" required placeholder="Enter the name of the tournament">
                            <br>
                            <button type="submit" id="createTournament" class="btn btn-dark btn-sm">Create tournament</button>
                        </form>
                    </div>
                </div>`;
    };

    getHtmlForHeader() {
        return this.navbar.getHtml();
    };

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
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

}
