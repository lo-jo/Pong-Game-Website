import { BaseClass } from './BaseClass'

export class Dashboard extends BaseClass {
    constructor() {
        super();
        // Set up click event listener on the document
        // document.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleButtonClick(event) {
        if (event.target.id === 'lauch-game-button') {
            this.launchGame();
        }
    }

    access(){
        const jwtAccess = localStorage.getItem('token');
        const url = 'https://localhost:8000/pong/';

        fetch(url, {
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
                    return false
                } else {
                    console.error('Error:', response.status);
                }
            }
            return true;
        })
        .catch(error => console.error('Error:', error));
    }
    
    // Method to join a match
    launchGame() {
        const url = 'https://localhost:8000//matches/join_match/';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* Request data */ })
        };

        // Make the request using the Fetch API
        fetch(url, options)
            .then(response => {
                // Handle response from the backend if necessary
                if (!response.ok) {
                    throw new Error('The request was not successful');
                }
                return response.json(); // or response.text(), etc., depending on the response type
            })
            .then(data => {
                // Do something with the data received from the backend if necessary
                console.log('Backend response:', data);
            })
            .catch(error => {     
                // Handle request errors
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
