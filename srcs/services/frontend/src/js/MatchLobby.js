import { BaseClass } from './BaseClass'
import { router } from './Router'

export class MatchLobby extends BaseClass {
    constructor() {
        super();
        console.log(`MATCH LOBBY constructor()!`);
        this.initWebSocketLobby();
        this.postMatch();
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
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
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
            // if (action == 'create_join') {
            //     this.getHtmlForWaitingSpinner();
            // } else if (action == 'join_play') {
            //     socket.close();
            //     history.pushState('', '', `/match/${match_id}`);
            //     router();
            // }
            if (action == 'join_play') {
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

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<div class="spinner-border" role="status">
                    <span class="visually-hidden">Waiting for someone..</span>
                </div>`;
    }
}
