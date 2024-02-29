import jwt_decode from 'jwt-decode';

function connectUser() {
    const token = localStorage.getItem('token');

        // NEED TO PROTECT WEBSOCKET CALL WHEN NO TOKEN WAS FOUND
        // NEED TO PROTECT VIEW TO FORBID NON AUTHENTICATED USERS FROM ENTERING THE PAGE
        const onlineSocket = new WebSocket(`wss://localhost:8000/ws/notify/?token=${token}`);
        onlineSocket.onopen = function (e) {
            onlineSocket.send(JSON.stringify({ type: 'authenticate', token: token }));
            console.log('Socket successfully connected.');
        };

        onlineSocket.onclose = function (e) {
            console.log('Socket closed unexpectedly');
        };
}

function submitLogin() {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	// Make an AJAX request to your DRF backend for authentication
	fetch('https://localhost:8000/users/token/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username,
			password: password,
		}),
	})
	.then(response => response.json())
	.then(data => {
		if (data.access) {
			// Store the JWT token in localStorage
			localStorage.setItem('token', data.access);
			let jwtToken = localStorage.getItem('token');
            let decoded_token = jwt_decode(jwtToken);
            alert(decoded_token.user_id);
			document.getElementById('app').innerHTML = "successfully logged in"
            connectUser();
			// Redirect to another page or perform additional actions
		} else {
			document.getElementById('app').innerHTML = "Invalid Credentials"
		}
	})
	.catch(error => {
		console.error('Error:', error);
		document.getElementById("message").innerText = 'Error during login';
	});
}

// document.addEventListener('DOMContentLoaded', function() {
//     const loginButton = document.getElementById('loginButton');
//     if (loginButton) {
//         loginButton.addEventListener('click', loginuser);
//     }
// });

export const loginUser = () => {
    document.getElementById('app').innerHTML = `
    <h1>Login</h1>
    <form id="loginForm">
        <label for="username">Username:</label>
        <input class="form-control form-control-sm" type="text" id="username" name="username" required><br>
        <label for="password">Password:</label>
        <input class="form-control form-control-sm" type="password" id="password" name="password" required><br>
        <button type="submit" id="loginButton" class="btn btn-dark btn-sm">Sign-in</button>
    </form>
    `;

document.getElementById("loginButton").addEventListener("click", (event) => {
    event.preventDefault();
    // alert("YOU JUST CLICKED LOGIN");
    submitLogin();
});
}