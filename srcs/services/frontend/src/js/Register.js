import { BaseClass } from './BaseClass'

export class Register extends BaseClass
{
    constructor() {
        super();
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    handleDocumentClick(event) {
        if (event.target.id === 'register') {
            event.preventDefault();
            this.handleButtonClick(event);
        }
    }
    handleButtonClick(event) {
        console.log("We are at submitRegister!");
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        console.log(`username ${username} password: ${password} email: ${email}`);
        
        fetch('http://localhost:8000/users/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken'), // Include CSRF token
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
            console.log("data: ", data);
            document.getElementById('app').innerHTML = "successfully signed up";
        })
        .catch(error => {
            console.error('ERROR : ', error);
        });
    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    Sign-up
                    <a href="/login">Log in</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<h1>Sign-up </h1><div class="form-group">
        <form id="loginForm">
            <label for="username">Username:</label>
            <input class="form-control form-control-sm" type="text" id="username" name="username" required placeholder="Enter username">
            <br>
            <label for="email">E-mail:</label>
            <input class="form-control form-control-sm" type="email" id="email" name="email" required placeholder="Enter e-mail">
            <br>
            <label for="password">Password:</label>
            <input class="form-control form-control-sm" type="password" id="password" name="password" required placeholder="Password">
            <br>
            <button type="submit" id="register" class="btn btn-dark btn-sm">Sign-up</button>
        </form>
        </div>`
    }
}