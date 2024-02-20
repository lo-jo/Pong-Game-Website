import { initGameThreeD, initGameTwoD } from './game.js';

const router = () => {
    const path = window.location.pathname;

    switch (path) {
        case '/':
            renderView('home');
            break;
        case '/home':
            renderView('home');
            break;
        case '/game':
            renderView('game');
            break;
        default:
            renderView('notFound');
    }
};

const renderView = (viewName) => {
    fetch(`/${viewName}.js`)
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('app').innerHTML = html;
            if (viewName === 'game') {
                renderGame();
            }
            else if (viewName === 'home') {
                renderHome();
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

const renderGame = () => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './src/game.js';

    const styleCss = document.createElement('link');
    styleCss.rel = 'stylesheet';
    styleCss.href = './src/css/game.css';

    // Define a callback to execute once the script is loaded
    script.onload = () => {
        if (typeof initGameTwoD === 'function') {
            initGameTwoD();
        } else {
            console.error('initGameTwoD function not found in ./src/game.js');
            renderNotFound();
        }
    };

    script.onerror = (error) => {
        console.error('Error loading game script:', error);
        renderNotFound();
    };

    // Append the CSS file to the head and the script element to the body of the document
    document.head.appendChild(styleCss);
    document.body.appendChild(script);
};

const renderNotFound = () => {
    document.getElementById('app').innerHTML = '<h1>404 Page Not Found</h1>';
};

// Initial route on page load
document.addEventListener('DOMContentLoaded', () => {
    router();
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
