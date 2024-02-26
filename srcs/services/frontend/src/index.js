import {registerUser} from './register.js';

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

document.getElementById("register").addEventListener("click", () => {
    console.log("click");
    renderRegister();
    // document.getElementById("content").innerHTML += "<h3>Hello geeks</h3>";
});

// CHECK IF THIS IS NECESSARRY AT SOME POINT
// const navigateTo = (path) => {
//     history.pushState(null, null, path);
//     router();
// };

// // Handle navigation through links
// document.addEventListener('click', (e) => {
//     if (e.target.tagName === 'A') {
//         e.preventDefault();
//         navigateTo(e.target.href);
//     }
// });
