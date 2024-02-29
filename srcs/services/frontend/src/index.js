import { initGameTwoD } from './js/game.js';
// import {registerUser} from './js/register.js';

// import {profileUser} from './js/profile.js';
import {editUser} from './js/edit.js';
import 'bootstrap/dist/css/bootstrap.css';
/*Import classes*/
import { LandingPage } from './js/LandingPage.js'
import { Login } from './js/Login.js'
import { Register } from './js/Register.js'
import { Profile } from './js/Profile.js'
import { Settings } from './js/Settings.js'

const routes = {
    '/' : {
        path : '/',
        view : LandingPage,
    },
    '/login' : {
        path : '/login',
        view : Login
    },
    '/register' : {
        path : '/register',
        view : Register
    },
    '/profile' : {
        path : '/profile',
        view : Profile
    },
    '/settings' : {
        path : '/settings',
        view : Settings
    },
}

// const buttons = {
//     'btn-sign-up' : {
//         path : '/login',
//         view : Login
//     },
//     'btn-log-in' : {
//         path : '/register',
//         view : Register
//     }
// }

const router = () => {

    const path = window.location.pathname;

    const viewObject = routes[path];

    const view = new viewObject.view();

    document.getElementById('header').innerHTML = view.getHtmlForHeader();

    document.getElementById('app').innerHTML = view.getHtmlForMain();
}


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
