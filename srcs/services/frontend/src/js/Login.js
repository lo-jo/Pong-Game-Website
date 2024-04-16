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

    async verifyCode(codeTwoFa) {
        const res =  await fetch(`${this.httpProtocol}//localhost:8000/users/otp_verify/`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otp: codeTwoFa,
            }),
            });
            if (!res.ok)
            {
                console.error(res.error);
            }
            else {
                // console.log(res.message);
                localStorage.setItem('token', this.token);
                await connectUser();
                history.pushState({}, '', '/dashboard');
                router();
            }
    }

    async handleDocumentClick(event) {
        if (event.target.id === 'loginButton') {
            event.preventDefault();
            await this.handleButtonClick(event);
        } else if (event.target.id === 'twoFaButton'){
            event.preventDefault();
            // console.log('submitting code...');
            const codeTwoFa = document.getElementById("codeTwoFa").value;
            if (this.userData)
                await this.verifyCode(codeTwoFa);
        }
    }

    async getUserData() {
        try {
            const response = await fetch(`${this.httpProtocol}//localhost:8000/users/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            const data = await response.json();
            this.userData = data;
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async getVerifyTwoFaHtml() {
        console.log("userData: ", this.userData);
        return `<div class="container-fluid">
                    <div class="row align-items-center">
                        <div class="col-2">
                            <h1 class="titreTwofa">Verify 2FA</h1>
                        </div>
                        <div class="col-lg-4 col-md-8 col-10 align-items-center justify-content-center">
                            <div class="row">
                            <p> Enter your verification code from your Google Authenticator app </p>
                                <form id="twofaForm">
                                    <label for="password"></label>
                                    <input class="form-control form-control-sm p-3 bg-dark text-light border-0" id="codeTwoFa" name="codeTwoFa" style="text-align: center;" required><br>

                                    <button type="submit" id="twoFaButton" class="btn btn-dark btn-sm">Send code</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>`;
    }

    async handleButtonClick(event) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${this.httpProtocol}//localhost:8000/users/token/`, {
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
                    this.token = data.access;
                    this.userData = await this.getUserData();
                    if (this.userData.otp_enabled  === true)
                    {
                        document.getElementById('app').innerHTML = await this.getVerifyTwoFaHtml();
                    } else {
                        localStorage.setItem('token', data.access);
                        await connectUser();
                        history.pushState({}, '', '/dashboard');
                        router();
                    }
                } else {
                    // console.log("Invalid Credentials");
                    this.displayMessage("Invalid Credentials", false);
                    // Handle invalid credentials
                }
            } else {
                console.error('Error:', response.statusText);
                this.displayMessage("Invalid Credentials", false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    hideMessage(id) {
        const alertElement = document.getElementById("redWarning");
        alertElement.textContent = '';
        alertElement.style.display = 'none';
    }

    displayMessage(message, flag) {
        const id = (flag) ? ".alert-success" : ".alert-danger";
        const alertElement = document.getElementById("redWarning");
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        setTimeout(() => {
            this.hideMessage(id);
        }, 1500);
    }

    async getHtmlForMain() {
        return `<h1 class="mb-3">Login</h1>
                <div class="form-group">
                    <form id="loginForm" class="text-start">
                        <div class="row my-3 justify-content-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="username">Username:</label>
                                <input class="form-control form-control-sm" type="text" id="username" name="username" required autocomplete="username">
                            </div>        
                        </div>
                        <div class="row my-3 justify-content-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <label for="password">Password:</label>
                                <input class="form-control form-control-sm" type="password" id="password" name="password" required autocomplete="current-password">
                            </div>        
                        </div>
                        <div class="row m-3 text-center justify-content-center">
                            <div class="col-xl-4 col-lg-6 col-md-8">
                                <button type="submit" id="loginButton" class="p-1 btn btn-dark">Sign-in</button>
                                <div id="redWarning" class="my-2 alert alert-danger" role="alert" style="display :none;"></div>
                            </div>        
                        </div>            
                    </form>
                </div>`;
    }
}