import { BaseClass } from './BaseClass'
import { router } from './Router'
import { Navbar } from './Navbar';

export class MatchLobby extends BaseClass {
    constructor() {
        super();
        this.navbar = new Navbar();
        this.postMatch();
        this.initWebSocket();
        this.match_status = null;
    }
    
    postMatch() {
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
        
        
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('The request was not successful');
                }
                return response.json();
            })
            .then(data => {
                console.log('Backend response:', data);
            })
            .catch(error => {
                console.error('Error making request:', error);
            });
    }

    initWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8000/ws/pong/lobby`;
    
        console.log(wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = function() {
            console.log('WebSocket(match lobby) connection established.');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { action, match_id } = data;
            console.log(action, match_id);
            if (action == 'create_join') {
                this.match_status = 'waiting';
            } else if (action == 'join_play') {
                socket.close();
                history.pushState({ match_id }, '', `/match/${match_id}`);
                router();
            }
            // // Sending match id for join the match in channels
            // socket.send(JSON.stringify({action : "add_me_to_match", match_id : match_id}));
        };

        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    
        socket.onclose = function() {
            console.log('WebSocket (match lobby) connection closed.');
        };
    }

    getHtmlForHeader(){
        return this.navbar.getHtml();
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`;
    }
}