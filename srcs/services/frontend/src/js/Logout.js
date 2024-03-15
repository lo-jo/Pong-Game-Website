import { BaseClass } from './BaseClass';

export class Logout extends BaseClass{
    constructor() {
        super();
        this.clearToken();
    }
    clearToken() {
        // if (onlineSocket && onlineSocket.readyState === WebSocket.OPEN)
        //     onlineSocket.close();
        const token = localStorage.getItem('jwt_token');
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem(token);
        localStorage.removeItem('sessionSocket');
        window.localStorage.clear();
    }

    getHtmlForMain() {
        return `<h1>BYE</h1><br>
        You've been successfully logged out.<br>
                SEE U AROUND`
    }
}