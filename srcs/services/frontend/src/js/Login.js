import { BaseClass } from './BaseClass'
import jwt_decode from 'jwt-decode';

export class Login extends BaseClass
{
    constructor() {
        super();
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    handleDocumentClick(event) {
        if (event.target.id === 'loginButton') {
            event.preventDefault();
            this.handleButtonClick(event);
        }
    }
    handleButtonClick(event) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        // const protocol = window.PROTOCOL;

        // alert(protocol);
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
                // this.router('/profile');
                document.getElementById('app').innerHTML = `successfully logged in <a href="/profile">Profile</a>`
                // document.location.href = '/profile';
                this.connectUser();
            } else {
                document.getElementById('app').innerHTML = "Invalid Credentials"
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("message").innerText = 'Error during login';
        });
    }

    connectUser() {
        const token = localStorage.getItem('token');
        const onlineSocket = new WebSocket(`ws://localhost:8000/ws/notify/?token=${token}`);
        onlineSocket.onopen = function (e) {
            onlineSocket.send(JSON.stringify({ type: 'authenticate', token: token }));
            console.log('Socket successfully connected.');
        };
        onlineSocket.onclose = function (e) {
            console.log('Socket closed unexpectedly');
        };

    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
        <a href="/register">Register</a>
                    Log in
        <a href="/profile">Profile</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<h1>Login</h1>
                <form id="loginForm">
                    <label for="username">Username:</label>
                    <input class="form-control form-control-sm" type="text" id="username" name="username" required><br>
                    <label for="password">Password:</label>
                    <input class="form-control form-control-sm" type="password" id="password" name="password" required><br>
                    <button type="submit" id="loginButton" class="btn btn-dark btn-sm">Sign-in</button>
                </form>`
    }
}