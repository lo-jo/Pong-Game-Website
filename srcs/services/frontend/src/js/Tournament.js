import { BaseClass } from './BaseClass'
import jwt_decode from 'jwt-decode';

export class Tournament extends BaseClass {
    // constructor() {
    //     super();
    // }

    constructor(dashboardInstance) {
        super();
        this.dashboard = dashboardInstance;
    }

    async createTournament(tournamentName) {
        // document.getElementById('app').innerHTML = await this.getWaitingForGameHtml();

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
            }),
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('The request was not successful');
            }
            const data = await response.json();
            console.log('Backend response:', data);
            return {
                success: true,
                message: `Tournament ${data.name} succesfully created!`,
            };
        } catch (error) {
            console.error('Error making request:', error);
            return {
                success: false,
                message: `Error while creating ${tournamentName}`,
            };
        }
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
        console.log("tournament list", data);
        return data;
    }

    async fetchTournamentData(tournamentId) {
        const httpProtocol = window.location.protocol;
        const jwtAccess = localStorage.getItem('token');
    
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        };
    
        try {
            const response = await fetch(`${httpProtocol}//localhost:8000/pong/tournaments/${tournamentId}/`, options);
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching tournament data:', errorData.error);
            } else {
                const tournamentData = await response.json();
                console.log('Successfully fetched tournament data:', tournamentData);
                return tournamentData;
            }
        } catch (error) {
            console.error('Error fetching tournament data:', error);
        }
    }

    async joinTournament(tournamentId) {
        const joinButton = document.getElementById(`join-button-${tournamentId}`);
        const spinner = document.getElementById(`spinner-${tournamentId}`);

        console.log(`joinButton: ${joinButton.id}`);
        
        try {
            spinner.style.display = 'inline-block';
            joinButton.disabled = true;
    
            await this.fetchJoinTournament(tournamentId);
            await this.displayOpenTournaments();

        } catch (error) {
            console.error('Error joining tournament:', error);
            spinner.style.display = 'none';
            joinButton.textContent = 'Join';
            joinButton.disabled = false;
        } finally {
            // spinner.style.display = 'none';
            joinButton.textContent = 'Joined';
            joinButton.disabled =true;
        }
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

    async getParticipants(userId) {
        const jwtAccess = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const userData = await response.json();
                return userData;
            } else {
                console.error('Error fetching username:', response.status, response.statusText);
                return 'Unknown User';
            }
        } catch (error) {
            console.error('Error fetching username:', error);
            return 'Unknown User';
        }
    }

    async playTournament(tournament) {
        const tournamentData = await this.fetchTournamentData(tournament);
        const currentUser = jwt_decode(localStorage.getItem('token'));
        const players = await Promise.all(tournamentData.participants.map(participant => this.getParticipants(participant.user_id)));
    
        const userIdToUsernameMap = {};
        players.forEach(player => {
            userIdToUsernameMap[player.id] = player.username;
        });
    
        const matches = tournamentData.matches.filter(match => {
            return match.user_1 === currentUser.user_id || match.user_2 === currentUser.user_id;
        }).map(match => {
            const user1Name = userIdToUsernameMap[match.user_1] || 'Unknown user';
            const user2Name = userIdToUsernameMap[match.user_2] || 'Unknown user';
            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${user1Name} vs ${user2Name}</h5>
                        <button class="btn btn-primary" data-match-id="${match.id}">Play</button>
                    </div>
                </div>
            `;
        }).join('');
    
        document.getElementById('app').innerHTML = `<div class="tournamentMatches">
                                                        <h3>Tournament: ${tournamentData.name}</h3>
                                                        ${matches}
                                                    </div>`;
    
        const buttons = document.querySelectorAll('.tournamentMatches .btn-primary');
        buttons.forEach(button => {
            button.addEventListener('click', () => this.startMatch(button.getAttribute('data-match-id')));
        });
    }

    async startMatch(matchId) {
        console.log(`starting matchId: ${matchId}`);
    }

    async displayOpenTournaments() {
        const openTournaments = await this.fetchOpenTournaments();
        const gameStatsDiv = document.getElementById('game-stats');
    
        gameStatsDiv.innerHTML = '';
        gameStatsDiv.innerHTML = '<h2>Tournaments:</h2>';
    
        if (openTournaments.length === 0) {
            gameStatsDiv.innerHTML = '<h2>No open tournaments available 🧐</h2>';
            return;
        }
    
        const tournamentList = document.createElement('ul');
        tournamentList.setAttribute('class', 'list-group');
    
        const currentUserId = jwt_decode(localStorage.getItem('token'));
    
        await Promise.all(openTournaments.map(async tournament => {
            const listItem = document.createElement('li');
            listItem.setAttribute('class', 'list-group-item');
    
            const joinButton = document.createElement('button');
            joinButton.setAttribute('class', 'btn btn-info');
            joinButton.textContent = 'Join';
    
            joinButton.id = `join-button-${tournament.id}`;
            const spinner = document.createElement('span');
            spinner.id = `spinner-${tournament.id}`;
            spinner.className = 'spinner-border spinner-border-sm text-light';
            spinner.style.display = 'none';
    
            const userAlreadyJoined = tournament.participants.some(participant => participant.user_id === currentUserId.user_id);
            const isTournamentFull = tournament.participants.length == 4;
    
            const players = await Promise.all(tournament.participants.map(participant => this.getParticipants(participant.user_id)));
            const usernames = players.map(player => player.username);
            listItem.textContent = `${tournament.name} Players: ${usernames.join(', ')}`;
    
            if (userAlreadyJoined) {
                if (isTournamentFull) {
                    joinButton.setAttribute('class', 'btn btn-success');
                    joinButton.textContent = 'Play';
                    joinButton.addEventListener('click', () => this.playTournament(tournament.id));
                } else {
                    joinButton.setAttribute('class', 'btn btn-secondary');
                    joinButton.disabled = true;
                    joinButton.textContent = 'Joined';
                }
            } else if (isTournamentFull) {
                joinButton.setAttribute('class', 'btn btn-primary');
                joinButton.disabled = true;
                joinButton.textContent = 'Complete';
            } else {
                joinButton.addEventListener('click', () => this.joinTournament(tournament.id));
                joinButton.appendChild(spinner);
            }
    
            listItem.appendChild(joinButton);
            tournamentList.appendChild(listItem);
        }));
    
        gameStatsDiv.appendChild(tournamentList);
    }

    async getWaitingForGameHtml()
    {
        return `<div class="spinner-border" style="color: #fff; width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`
    }
}