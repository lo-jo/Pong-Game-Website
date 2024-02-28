import {registerUser} from './register.js';
import {loginUser} from './login.js';
import {profileUser} from './profile.js';
import {editUser} from './edit.js';

const router = () => {
    const path = window.location.pathname;

    switch (path) {
        case '/':
        case '/home':
            renderView('home');
            break;
        case '/game':
            renderView('game');
            break;
        case '/register':
            renderView('register');
        default:
            renderView('notFound');
    }
};

const renderView = (viewName) => {
    fetch(`/${viewName}.js`)
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('app').innerHTML = html;
            if (viewName === 'home') {
                renderHome();
            }
            else if (viewName === 'register') {
                renderRegister();
            }
            else if (viewName === 'notFound') {
                renderNotFound();
            }
        })
        .catch((error) => {
            console.error(`Error loading ${viewName} view:`, error);
            renderNotFound();
        });
};

const renderHome = () => {
    document.getElementById('app').innerHTML = '<h1>Landing page!</h1>';
};

const renderRegister = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './register.js';

    // Define a callback to execute once the script is loaded
    script.onload = () => {
        if (typeof registerUser === 'function') {
            registerUser();
        } else {
            console.error('register view function not found in ./src/game.js');
            renderNotFound();
        }
    };

    script.onerror = (error) => {
        console.error('Error loading register script:', error);
        renderNotFound();
    };

    // Append the CSS file to the head and the script element to the body of the document
    document.body.appendChild(script);
};

const renderNotFound = () => {
    document.getElementById('app').innerHTML = '<h1>404 Page Not Found</h1>';
};

// Initial route on page load
// document.addEventListener('DOMContentLoaded', () => {
//     console.log("HEREEE");
//     router();
// });

const renderLogin = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './login.js';

    // Define a callback to execute once the script is loaded
    script.onload = () => {
        if (typeof loginUser === 'function') {
            loginUser();
        } else {
            console.error('login view function not found in ./src/game.js');
            renderNotFound();
        }
    };

    script.onerror = (error) => {
        console.error('Error loading login script:', error);
        renderNotFound();
    };

    // Append the CSS file to the head and the script element to the body of the document
    document.body.appendChild(script);
};

const renderEdit = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './edit.js';

    // Define a callback to execute once the script is loaded
    script.onload = () => {
        if (typeof editUser === 'function') {
            editUser();
        } else {
            console.error('edit view function not found in ./src/game.js');
            renderNotFound();
        }
    };

    script.onerror = (error) => {
        console.error('Error loading edit script:', error);
        renderNotFound();
    };

    // Append the CSS file to the head and the script element to the body of the document
    document.body.appendChild(script);
};

const renderProfile = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './profile.js';

    // Define a callback to execute once the script is loaded
    script.onload = () => {
        if (typeof profileUser === 'function') {
            profileUser();
        } else {
            console.error('Profile view function not found in ./src/game.js');
            renderNotFound();
        }
    };

    script.onerror = (error) => {
        console.error('Error loading profile script:', error);
        renderNotFound();
    };

    // Append the CSS file to the head and the script element to the body of the document
    document.body.appendChild(script);
};

function handleButtonClick(id) {
    console.log("click");
    const element = document.getElementById(id);

    if (element) {
        switch (id) {
            case "register":
                renderRegister();
                break;
            case "login":
                renderLogin();
                break;
            case "profile":
                renderProfile();
                break;
            case "edit":
                renderEdit();
                break;
            // Add more cases as needed for different IDs
            default:
                console.error("Unknown ID: " + id);
                break;
        }
    } else {
        console.error("Element not found for ID: " + id);
    }
}

// Example usage:
document.getElementById("register").addEventListener("click", () => {
    handleButtonClick("register");
});

document.getElementById("login").addEventListener("click", () => {
    handleButtonClick("login");
});

document.getElementById("profile").addEventListener("click", () => {
    handleButtonClick("profile");
});

document.getElementById("edit").addEventListener("click", () => {
    handleButtonClick("edit");
});


// faire un switch sur les boutons

// CHECK IF THIS IS NECESSARRY AT SOME POINT
const navigateTo = (path) => {
    history.pushState(null, null, path);
    router();
};

// // Handle navigation through links
// document.addEventListener('click', (e) => {
//     if (e.target.tagName === 'A') {
//         e.preventDefault();
//         navigateTo(e.target.href);
//     }
// });
