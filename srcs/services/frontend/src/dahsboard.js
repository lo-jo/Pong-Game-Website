class Dashboard {
    constructor() {
        // Set up click event listener on the document
        document.addEventListener('click', this.handleButtonClick.bind(this));
    }

    // Handle button click
    handleButtonClick(event) {
        // Check if the click came from the 'lauch-game-button' button
        if (event.target.id === 'lauch-game-button') {
            // Launch the game (make request to backend)
            this.launchGame();
        }
    }

    // Method to launch the game (make request to backend)
    launchGame() {
        // URL of your backend endpoint
        const url = 'http://your-backend.com/api/launch-game';

        // Request options (e.g., a POST request with JSON data)
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

    // Method to get the HTML of the dashboard
    getHTML() {
        return `<div>
                    <button id='lauch-game-button'>
                        Let's play
                    </button>
                </div>`;
    }
}
