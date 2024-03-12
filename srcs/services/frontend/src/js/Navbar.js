import jwt_decode from 'jwt-decode';
import { navigateTo } from './Router.js';

export class Navbar {
    constructor() {
        this.updateNavbar();
    }
    
    async checkAuthentication() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return false;
            }

            let decodedToken;
            try {
                decodedToken = jwt_decode(token);
            } catch (decodeError) {
                console.error('Error decoding token:', decodeError.message);
                return false;
            }

            const response = await fetch('http://localhost:8000/users/check-authentication/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Error checking authentication:', response.statusText);
                return false;
            }

            const data = await response.json();

            if ('authenticated' in data) {
                return data.authenticated;
            } else {
                // console.error('Invalid response format:', data);
                return false;
            }
        } catch (error) {
            console.error('Unexpected error checking authentication:', error);
            return false;
        }
    }

    handleButtonClick(event, path) {
        console.log(`click to: ${path}`);
        event.preventDefault();
        navigateTo(path);
    }

    async updateNavbar() {
        const isAuthenticated = await this.checkAuthentication();
        const navbar = document.getElementById('header');

        if (isAuthenticated) {
            navbar.innerHTML = `<nav id="nav-bar">
                                <button class="btn btn-link" id="profileBtn">Profile</button>
                                <button class="btn btn-link" id="settingsBtn">Settings</button>
                                <button class="btn btn-link" id="dashboardBtn">Dashboard</button>
                                <button class="btn btn-link" id="chatBtn">Chat</button>
                                <button class="btn btn-link" id="logoutBtn">Log out</button>
                                </nav>`;

            document.getElementById('profileBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/profile'));
            document.getElementById('settingsBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/settings'));
            document.getElementById('dashboardBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/dashboard'));
            document.getElementById('chatBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/chat'));
            document.getElementById('logoutBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/logout'));
        } else {
            navbar.innerHTML = `<nav id="nav-bar">
                                    <button class="btn btn-link" id="registerBtn">Sign up</button>
                                    <button class="btn btn-link" id="loginBtn">Log in</button>
                                </nav>`;

            document.getElementById('registerBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/register'));
            document.getElementById('loginBtn').addEventListener('click', (event) => this.handleButtonClick(event, '/login'));
        }
    }

    async getHtml() {
        await this.updateNavbar();
        const navbar = document.getElementById('header');
        return navbar.innerHTML;
    }
}

// navbar.innerHTML = `<nav id="nav-bar">
// <a class="navbar-link" href="/profile">Profile</a>
// <a class="navbar-link" href="/settings">Settings</a>
// <a class="navbar-link" href="/dashboard">Dashboard</a>
// <a class="navbar-link" href="/chat">Chat</a>
// <a class="navbar-link" href="/logout">Log out</a>
// </nav>`;

// navbar.innerHTML = `<nav id="nav-bar">
// <a class="navbar-link" href="/register">Sign up</a>
// <a class="navbar-link" href="/login">Log in</a>
// </nav>`;