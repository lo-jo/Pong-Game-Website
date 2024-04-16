import { BaseClass } from './BaseClass'
import { router } from './Router'

export class MatchLobby extends BaseClass {
    constructor() {
        super();
        this.socket = null;
        this.run();
    }
    
    async run()
    {
        this.initWebSocketLobby();
        await this.postMatch();
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
    
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = function() {
            console.log('WebSocket(match lobby) connection established.');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type_message } = data;
            switch (type_message)
            {
                case 'action':
                    const { action } = data;
                    const { match_id } = data;
                    console.log(action);
                    this.socket.send(JSON.stringify({'type_message' : 'match_id', 'match_id' : `${match_id}`}));
                    if (action === 'join_play')
                    {
                        console.log('JOIIIINNN PLAY');
                        this.socket.close();
                        history.pushState('', '', `/match/${match_id}`);
                        router();
                    }
                    break;
                case 'request_ping':
                    this.socket.send(JSON.stringify({'type_message' : 'ping', 'url' : `${window.location.href}`}));
                    break;
                case 'match_aborted':
                    this.socket.close();
                    break;
            }
        };

        this.socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        this.socket.onclose = function() {
            console.log('WebSocket (match lobby) connection closed.');
        };
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<div>
                    <p> Waiting for someone...</p>
                    <br>
                </div>
                <div class="spinner-border" role="status">
                </div>`;
    }
}
