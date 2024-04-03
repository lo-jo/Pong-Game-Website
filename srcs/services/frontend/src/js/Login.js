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
        const res =  await fetch('http://localhost:8000/users/otp_verify/', { 
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
                console.log(res.message);
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
            console.log('submitting code...');
            const codeTwoFa = document.getElementById("codeTwoFa").value;
            if (this.userData)
                await this.verifyCode(codeTwoFa);
        }
    }

    async getUserData() {
        try {
            const response = await fetch(`http://localhost:8000/users/profile/`, {
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
                    <div class="row justify-content-center">
                        <div class="col-2">
                            <h1 class="titreTwofa">Verify 2FA</h1>
                        </div>
                        <div class="col align-items-center">
                            <img src="http://localhost:8000${this.userData.qr_code}" id="qrCode" alt="QR CODE">
                            <div class="col-3">
                            <form id="twofaForm">
                            <label for="password"></label>
                            <input class="form-control form-control-sm p-3 bg-dark text-light border-0" id="codeTwoFa" name="codeTwoFa" required><br>
                            <button type="submit" id="twoFaButton" class="btn btn-dark btn-sm">Send code</button>
                            </form>
                            </div>
                        </div>
                    </div>   
                </div>
        `;
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
                    this.token = data.access;
                    this.userData = await this.getUserData();
                    if (this.userData.otp_enabled  === true && this.userData.otp_verified === false)
                    {
                        
                        document.getElementById('app').innerHTML = await this.getVerifyTwoFaHtml();
                    } else {
                        localStorage.setItem('token', data.access);
                        await connectUser();
                        history.pushState({}, '', '/dashboard');
                        router();
                    }
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