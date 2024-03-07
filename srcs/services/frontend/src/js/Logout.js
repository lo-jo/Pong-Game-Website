import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';

export class Logout extends BaseClass{
    constructor() {
        super();
        this.navbar = new Navbar();
        this.clearToken();
    }
    clearToken() {
        const token = localStorage.getItem('jwt_token');
        // const status = localStorage.getItem('sessionSocket');
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem(token);
        localStorage.removeItem('sessionSocket');
        // sessionStorage.removeItem(status);
        window.localStorage.clear();
    }

    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<h1>BYE</h1><br>
        You've been successfully logged out.<br>
                SEE U AROUND`
    }
}