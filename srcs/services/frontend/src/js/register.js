
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function submitRegister() {
console.log("We are at submitRegister!");
const username = document.getElementById('username').value;
const password = document.getElementById('password').value;
const email = document.getElementById('email').value;
console.log(`username ${username} password: ${password} email: ${email}`);

fetch('https://localhost:8000/users/register/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
    },
    body: JSON.stringify({ username, email, password }),
})
.then(response => {
    if (!response.ok) {
        throw new Error('Invalid credentials');
    }
    return response.json();
})
.then(data => {
    // Handle successful login, e.g., store token in local storage
    console.log('Succesfully signed up', data);
    console.log("data: ", data);
    document.getElementById('app').innerHTML = "successfully signed up";
})
.catch(error => {
    console.error('Login failed', error);
    alert("ERRRRRRROR");
});
};

export const registerUser = () => {
    console.log("registerUser HERE");
    document.getElementById('app').innerHTML = `
    <div class="form-group">
    <form id="loginForm">
        <label for="username">Username:</label>
        <input class="form-control form-control-sm" type="text" id="username" name="username" required placeholder="Enter username">
        <br>
        <label for="email">E-mail:</label>
        <input class="form-control form-control-sm" type="email" id="email" name="email" required placeholder="Enter e-mail">
        <br>
        <label for="password">Password:</label>
        <input class="form-control form-control-sm" type="password" id="password" name="password" required placeholder="Password">
        <br>
        <button type="submit" id="signup" class="btn btn-dark btn-sm">Sign-up</button>
    </form>
    </div>`;

    document.getElementById("signup").addEventListener("click", (event) => {
        event.preventDefault();
        console.log("click signup");
        // alert("YOU JUST CLICKED SIGNUP");
        submitRegister();
    });
    

    // document.addEventListener('DOMContentLoaded', function() {
    //     document.getElementById("signup").addEventListener("click", () => {
    //         console.log("click signup");
    //         alert("YOU JUST CLICKED SIGNUP");
    //         submitRegister();
    //         // document.getElementById("content").innerHTML += "<h3>Hello geeks</h3>";
    //     })
    // });
}


