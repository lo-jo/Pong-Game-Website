import { BaseClass } from './BaseClass'

export class Dashboard extends BaseClass {
    constructor() {
        super();
        // Set up click event listener on the document
        document.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleButtonClick(event) {
        if (event.target.id === 'lauch-game-button') {
            this.launchGame();
        }
    }
    
    // Method to join a match
    launchGame() {

        const url = 'http://localhost:8000/pong/join_match/';

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

    getHtmlForHeader(){
        return `<nav id="nav-bar">
                    <a href="/profile">Profile</a>
                    <a href="/game">Game</a>
                    <a href="/chat">Chat</a>
                    <a href="/logout">Log out</a>
                </nav>`
    }

    /*Method to get the HTML of the dashboard*/
    getHtmlForMain() {
        return `<div id="main">
                    <div id="game-actions">
                        <div class="game-action">
                            <button id="lauch-game-button" type="button">PLAY A MATCH</button>
                        </div>
                        <div class="game-action">
                            <button type="button">CREATE A TOURNAMENT</button>
                        </div>
                    </div>
                    <div id="game-stats">
                        <h3>LAST MATCHES</h3>
                    </div>
                </div>`;
    }
}
