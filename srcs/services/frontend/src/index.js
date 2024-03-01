import 'bootstrap/dist/css/bootstrap.css';
/*Import classes*/
import { LandingPage } from './js/LandingPage.js'
import { Login } from './js/Login.js'
import { Register } from './js/Register.js'
import { Profile } from './js/Profile.js'
import { Settings } from './js/Settings.js'
import { Dashboard } from './js/Dahsboard.js';
import { PongGame } from './js/Game.js';
import { ErrorClass } from './js/ErrorClass.js'

const routes = {
    '/' : {
        path : '/',
        view : LandingPage,
        auth : false
    },
    '/dashboard' : {
        path : '/dashboard',
        view : Dashboard,
        css : './css/dashboard.css',
        auth : true
    },
    '/login' : {
        path : '/login',
        view : Login,
        auth : false
    },
    '/register' : {
        path : '/register',
        view : Register,
        auth : false
    },
    '/profile' : {
        path : '/profile',
        view : Profile,
        auth : true
    },
    '/settings' : {
        path : '/settings',
        view : Settings,
        auth : true
    },
    '/game' : {
        path : '/game',
        view : PongGame,
        css : './css/game.css',
        auth : true
    },
}

const router = () => {
    const path = window.location.pathname;
    const viewObject = routes[path];

    if (!viewObject) {
        const errorView = new ErrorClass();
        document.getElementById('app').innerHTML = errorView.getHtmlForMainNotFound();
        return;
    }

    if (viewObject.auth === true) {
        const token = localStorage.getItem('token');
        if (!token) {
            const errorView = new ErrorClass();
            document.getElementById('header').innerHTML = errorView.getHtmlForHeader();
            document.getElementById('app').innerHTML = errorView.getHtmlForMain();
            return;
        }
    }

    const view = new viewObject.view();

    if (viewObject.css) {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = viewObject.css;
        document.head.appendChild(styleCss);
    }

    document.getElementById('header').innerHTML = view.getHtmlForHeader();
    document.getElementById('app').innerHTML = view.getHtmlForMain();
};

// Initial route on page load
document.addEventListener('DOMContentLoaded', () => {
    router();

    // Retrieve the initial state from the history
    // const initialState = window.history.state || {};
    // // Use the initial state to render the correct view
    // if (initialState.view) {
    //     renderView(initialState.view);
    // } else {
    //     router();
    // }
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
