import { BaseClass } from './BaseClass';
import jwt_decode from 'jwt-decode';
import { connectUser, router } from './Router';

export class Login extends BaseClass {
    constructor() {
        super();
        this.addDocumentClickListener();
        // this.handleDocumentClickBound = this.handleDocumentClick.bind(this);
        // document.getElementById('app').addEventListener('click', this.handleDocumentClickBound);
    }

    async handleDocumentClick(event) {
        if (event.target.id === 'loginButton') {
            event.preventDefault();
            await this.handleButtonClick(event);
        }
    }

    async handleButtonClick(event) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch('http://localhost:8000/users/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.access) {
                    // call a fetch get on users/profile/
                    // if current_user.otp_enabled is true
                    // >>>>> and if otp_verified is false 
                    // >>>>>>> GENERATE NEW PAGE FOR QR CODE ( pour GET le qr code fron previous get call et display it) 
                    // >>>>>>> +front side: FORM TO SUBMIT
                    // >>>>>>>>>>> fetch POST URL/users/otp/
                    // >>>>>>>>>>>>>>>> verifier la reponse (estce que la key correspond)
                    // >>>>>>>>>>>>>>>> si reponse ok=
                    // >>>>>>>>>>>>>>>> localStorage.setItem('token', data.access);
                    // >>>>>>>>>>>>>>>> connectUser()
                    // >>>>>>>>>>>>>>>> history.pushState({}, '', '/dashboard');
                    // >>>>>>>>>>>>>>>> router();
                    // >>>>>>>>>>>>>>>> si reponse pas OK > fuck off 
                    // else
                    localStorage.setItem('token', data.access);
                    connectUser();
                    history.pushState({}, '', '/dashboard');
                    router();
                } else {
                    console.log("Invalid Credentials");
                    // Handle invalid credentials
                }
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async getHtmlForMain() {
        return `<h1>Login</h1>
                <form id="loginForm">
                    <label for="username">Username:</label>
                    <input class="form-control form-control-sm" type="text" id="username" name="username" required autocomplete="username"><br>
                    <label for="password">Password:</label>
                    <input class="form-control form-control-sm" type="password" id="password" name="password" required autocomplete="current-password"><br>
                    <button type="submit" id="loginButton" class="btn btn-dark btn-sm">Sign-in</button>
                </form>`
    }

    // cleanup() {
    //     super.cleanup();
    //     // document.getElementById('app').removeEventListener('click', this.handleDocumentClickBound);
    // }
}