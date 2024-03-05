import jwt_decode from 'jwt-decode';

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

    async updateNavbar() {
        const isAuthenticated = await this.checkAuthentication();
        // console.log(`isAuthenticated: ${isAuthenticated}`);
        const navbar = document.getElementById('header');

        if (isAuthenticated) {
            navbar.innerHTML = `<nav id="nav-bar">
                                <a href="/profile">Profile</a>
                                <a href="/dashboard">Dashboard</a>
                                <a href="/chat">Chat</a>
                                <a href="/#">Log out</a>
                                </nav>`;
        } else {
            navbar.innerHTML = `<nav id="nav-bar">
                                    <a href="/register">Sign up</a>
                                    <a href="/login">Log in</a>
                                </nav>`;
        }
    }

    async getHtml() {
        await this.updateNavbar();
        const navbar = document.getElementById('header');
        return navbar.innerHTML;
    }
}
