import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';
import jwt_decode from 'jwt-decode';
import { router } from './Router.js';

export class Login extends BaseClass
{
    constructor() {
        super();
        this.navbar = new Navbar();
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
                document.getElementById('app').innerHTML = "successfully logged in"
                this.connectUser();
                // Redirect to another page or perform additional actions
                history.pushState({}, '', '/dashboard');
                router();
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
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<h1>Login</h1>
                <form id="loginForm">
                    <label for="username">Username:</label>
                    <input class="form-control form-control-sm" type="text" id="username" name="username" required autocomplete="username"><br>
                    <label for="password">Password:</label>
                    <input class="form-control form-control-sm" type="password" id="password" name="password" required autocomplete="current-password"><br>
                    <button type="submit" id="loginButton" class="btn btn-dark btn-sm">Sign-in</button>
                </form>`
    }
}