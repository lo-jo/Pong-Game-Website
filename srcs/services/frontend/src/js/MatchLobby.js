import { BaseClass } from './BaseClass'
import { router } from './Router'

export class MatchLobby extends BaseClass {
    constructor() {
        super();
        this.socket = null;
        this.initWebSocketLobby();
        this.run();
    }
    
    async run()
    {
        await this.postMatch();
    }


    async postMatch() {
        const httpProtocol = window.location.protocol;
        const url = `${httpProtocol}//${this.host}:${this.backendPort}/pong/join_match/`;
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
            else
            {
                const json_response = await response.json();
                
                const { action, match_id } = json_response;
                if (this.socket.readyState === WebSocket.OPEN)
                    this.socket.send(JSON.stringify({'type_message' : 'match_id', 'match_id' : `${match_id}`}));

                console.log(json_response);
                console.log(action);
                if (action === 'join_play')
                {
                    console.log('JOIN PLAY BY HTTP RESPONSE');
                    this.socket.close();
                    history.pushState('', '', `/match/${match_id}`);
                    router();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    initWebSocketLobby() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${this.host}:${this.backendPort}/ws/pong/lobby`;
    
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
                    const { action, match_id } = data;
                    if (action === 'join_play')
                    {
                        console.log('JOIN PLAY BY WSS');
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
