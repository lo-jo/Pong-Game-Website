function registeruser() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	const email = document.getElementById('email').value;

	fetch('/users/register/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
		},
		body: JSON.stringify({ username, email, password }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Invalid credentials');
		}
		return response.json();
	})
	.then(data => {
		// Handle successful login, e.g., store token in local storage
		console.log('Succesfully signed up', data);
		document.getElementById('content').innerHTML = "successfully signed up";
	})
	.catch(error => {
		console.error('Login failed', error);
	});
}

// Function to get CSRF token from cookies
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}