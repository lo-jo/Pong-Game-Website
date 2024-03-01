import { LandingPage } from './LandingPage.js'
import { Login } from './Login.js'
import { Register } from './Register.js'
import { Profile } from './Profile.js'
import { Settings } from './Settings.js'
import { Dashboard } from './Dahsboard.js';

export const routes = {
    '/' : {
        path : '/',
        view : LandingPage,
    },
    '/dashboard' : {
        path : '/dashboard',
        view : Dashboard,
        css : './css/dashboard.css'
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

export const router = () => {

    const path = window.location.pathname;

    const viewObject = routes[path];

    const view = new viewObject.view();

    if (viewObject.css)
    {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = viewObject.css;
        document.head.appendChild(styleCss);
    }

    document.getElementById('header').innerHTML = view.getHtmlForHeader();

    document.getElementById('app').innerHTML = view.getHtmlForMain();
}
