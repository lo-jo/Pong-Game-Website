import { BaseClass } from './BaseClass';
import { router } from './Router';

export class Register extends BaseClass
{
    constructor() {
        super();
        this.addDocumentClickListener();
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
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

    async handleDocumentClick(event) {
        if (event.target.id === 'register') {
            event.preventDefault();
            // this.registerButton.disabled = true;
            await this.handleButtonClick(event);
            // this.registerButton.disabled = false;
        }
    }
    // async handleButtonClick(event) {
    //     console.log("We are at submitRegister!");
    //     const username = document.getElementById('username').value;
    //     const password = document.getElementById('password').value;
    //     const email = document.getElementById('email').value;
    //     console.log(`username ${username} password: ${password} email: ${email}`);
        
    //     await fetch('http://localhost:8000/users/register/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'X-CSRFToken': this.getCookie('csrftoken'), // Include CSRF token
    //         },
    //         body: JSON.stringify({ username, email, password }),
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             const msg = await response.text();
    //             // document.getElementById('app').innerHTML = "Invalid Credentials";
    //             this.displayMessage(msg, false);
    //             throw new Error('Invalid credentials');
                
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         // Handle successful login, e.g., store token in local storage
    //         // console.log('Succesfully signed up', data);
    //         // console.log("data: ", data);
    //         // document.getElementById('app').innerHTML = "successfully signed up";
    //         // Redirect to another page or perform additional actions
    //         history.pushState({}, '', '/login');
    //         router();
    //     })
    //     .catch(error => {
    //         console.error('ERROR : ', error);
    //     });
    // }
    async handleButtonClick(event) {
        console.log("We are at submitRegister!");
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        console.log(`username ${username} password: ${password} email: ${email}`);
        
        try {
            const response = await fetch('http://localhost:8000/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'), // Include CSRF token
                },
                body: JSON.stringify({ username, email, password }),
            });
    
            if (!response.ok) {
                let responseData = await response.text(); // Get response text
                const errorData = JSON.parse(responseData);
                let formattedErrorMsg = '';
                for (const [key, value] of Object.entries(errorData)) {
                    if (Array.isArray(value)) {
                        formattedErrorMsg += `${key}: ${value.join(', ')}\n`;
                    } else {
                        formattedErrorMsg += `${key}: ${value}\n`;
                    }
                }
                this.displayMessage(formattedErrorMsg, false);
                throw new Error('Invalid credentials');
            }
            const data = await response.json();
            history.pushState({}, '', '/login');
            router();
        } catch (error) {
            console.error('ERROR : ', error);
        }
    }
    

    async getHtmlForMain() {
        return `<h1>Sign-up </h1><div class="form-group">
        <form id="loginForm">
            <label for="username">Username:</label>
            <input class="form-control form-control-sm" type="text" id="username" name="username" required placeholder="Enter username" autocomplete="username">
            <br>
            <label for="email">E-mail:</label>
            <input class="form-control form-control-sm" type="email" id="email" name="email" required placeholder="Enter e-mail">
            <br>
            <label for="password">Password:</label>
            <input class="form-control form-control-sm" type="password" id="password" name="password" required placeholder="Password" autocomplete="current-password">
            <br>
            <button type="submit" id="register" class="btn btn-dark btn-sm">Sign-up</button>
            <div id="redWarning" class="alert alert-danger" role="alert" style="display :none;"></div>
        </form>
        </div>`
    }

}