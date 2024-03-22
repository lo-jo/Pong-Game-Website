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

    async updateNavbar() {
        // const isAuthenticated = await this.checkAuthentication();
        const navbar = document.getElementById('header');

        if (this.isAuthenticated) {
            navbar.innerHTML = `<nav id="nav-bar">

                                    <a class="navbar-link" href="/profile">Profile</a>
                                    <a class="navbar-link" href="/settings">Settings</a>
                                    <a class="navbar-link" href="/dashboard">Dashboard</a>
                                    <a class="navbar-link" href="/chat">Chat</a>
                                    <a class="navbar-link" href="/logout">Log out</a>



                                    <div class="btn-group dropstart">
                                    <button class="btn btn-black btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i id="notification" class="bi bi-bell"></i>
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="count">
                                        2
                                        <span class="visually-hidden">unread messages</span>
                                        </span>
                                    </button>
                                    <ul class="dropdown-menu" id="alert">
                                    
                                    </ul>
                                  </div>
                                </nav>`;
        } else {
            navbar.innerHTML = `<nav id="nav-bar">
                                    <a class="navbar-link" href="/register">Sign up</a>
                                    <a class="navbar-link" href="/login">Log in</a>
                                </nav>`;
        }
    }

    async getHtml() {
        await this.updateNavbar();
        const navbar = document.getElementById('header');
        return navbar.innerHTML;
    }
}
