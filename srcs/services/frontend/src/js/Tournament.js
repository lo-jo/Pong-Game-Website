import { BaseClass } from './BaseClass'
import jwt_decode from 'jwt-decode';

export class Tournament extends BaseClass {
    constructor() {
        super();
    }

    async createTournament(tournamentName) {
        document.getElementById('app').innerHTML = await this.getWaitingForGameHtml();
    
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
            return;
        } catch (error) {
            console.error('Error making request:', error);
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

    async joinTournament(tournamentId) {
        const joinButton = document.getElementById(`join-button-${tournamentId}`);
        const spinner = document.getElementById(`spinner-${tournamentId}`);

        console.log(`joinButton: ${joinButton.id}`);
        
        try {
            spinner.style.display = 'inline-block';
            joinButton.disabled = true;
    
            await this.fetchJoinTournament(tournamentId);
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

    async displayOpenTournaments() {
        console.log('HERE IN THE DISPLAY OPEN TOURNAMENT FUNC')
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

        const currentUserId =  jwt_decode(localStorage.getItem('token'));
    
        await Promise.all(openTournaments.map(async tournament => {
            // console.log(tournament);
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
            const players = await Promise.all(tournament.participants.map(participant => this.getParticipants(participant.user_id)));
            const usernames = players.map(player => player.username);
            listItem.textContent = `${tournament.name} Players: ${usernames.join(', ')}`;
    
            if (userAlreadyJoined) {
                joinButton.disabled = true;
                joinButton.textContent = 'Joined';
            } else {
                joinButton.addEventListener('click', () => this.joinTournament(tournament.id));
                joinButton.appendChild(spinner);
            }

            // if (userAlreadyJoined) {
            //     joinButton.disabled = true;
            //     joinButton.textContent = 'Joined';
            // } else {
            //     joinButton.addEventListener('click', async () => {
            //         const spinner = document.getElementById(`spinner-${tournament.id}`);
            //         if (spinner) {
            //             spinner.style.display = 'inline-block';
            //             joinButton.disabled = true;
            //             await this.joinTournament(tournament.id);
            //         } else {
            //             console.error('Spinner element not found');
            //         }
            //     });
            //     joinButton.appendChild(spinner);
            // }
    
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

    async getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    async getHtmlForMain() {
        return `<p>Tournament</p>`;
    }
}