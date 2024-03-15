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
        this.createTournamentButton = document.getElementById('createTournament');
        this.joinTournamentButton = document.getElementById('join-tournament');
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
        } else if (event.target.id === 'createTournament' && this.createTournamentButton && this.createTournamentButton.disabled == false) {
            event.preventDefault();
            const tournamentName = await document.getElementById("tournamentName").value;
            // this.createTournamentButton.disabled = true;
            await this.tournament.createTournament(tournamentName);
            // this.createTournamentButton.disabled = false;
            this.updateView();
            document.getElementById('app').innerHTML = await this.getHtmlForMain();
        } else if (event.target.id === 'join-tournament' && this.joinTournamentButton && this.joinTournamentButton.disabled == false) {
            event.preventDefault();
            // this.joinTournamentButton.disabled = true;
            await this.tournament.displayOpenTournaments();
            // this.joinTournamentButton.disabled = false;
        }
    }

    displayPlayButton() {
        let playButton = document.getElementById('play-button');
        if (!playButton) {
            const gameStatsDiv = document.getElementById('game-stats');
            playButton = document.createElement('button');
            playButton.id = 'play-button';
            playButton.textContent = 'PLAY';
            playButton.addEventListener('click', this.startTournament.bind(this));
            gameStatsDiv.appendChild(playButton);
        }
    }

    async startTournament() {
        console.log('Starting tournament...');
    }

    async getHtmlFormTournament() {
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
