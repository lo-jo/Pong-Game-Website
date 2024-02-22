import jwt_decode from 'jwt-decode';

function loginuser() {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	// Make an AJAX request to your DRF backend for authentication
	fetch('http://localhost:8000/users/token/', {
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
			document.getElementById('content').innerHTML = "successfully logged in"
			// Redirect to another page or perform additional actions
		} else {
			document.getElementById('content').innerHTML = "Invalid Credentials"
		}
	})
	.catch(error => {
		console.error('Error:', error);
		document.getElementById("message").innerText = 'Error during login';
	});
}

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', loginuser);
    }
});