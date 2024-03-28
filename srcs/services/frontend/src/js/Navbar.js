import jwt_decode from 'jwt-decode';

export default class Navbar {
    constructor() {
        console.log("Navbar created!");
        this.isAuthenticated = false;
        // this.checkAuthentication().then(flag => this.isAuthenticated = flag);
        this.updateNavbar();
    }

    setIsAuthenticated(flag) {
        this.isAuthenticated = flag;
    }

    updateNavbar() {
        // const isAuthenticated = await this.checkAuthentication();
        const navbar = document.getElementById('nav-bar');
        console.log("ICIIIII", document.getElementById('nav-bar'));

        if (this.isAuthenticated) {
            navbar.innerHTML = `<a class="navbar-link" href="/profile">Profile</a>
                                <a class="navbar-link" href="/settings">Settings</a>
                                <a class="navbar-link" href="/dashboard">Dashboard</a>
                                <a class="navbar-link" href="/chat">Chat</a>
                                <a class="navbar-link" href="/logout">Log out</a>`;
        } else {
            navbar.innerHTML = `<a class="navbar-link" href="/register">Sign up</a>
                                <a class="navbar-link" href="/login">Log in</a>`;
        }
    }

    getHtml() {
        this.updateNavbar();
        const navbar = document.getElementById('nav-bar');
        return navbar.innerHTML;
    }
}
