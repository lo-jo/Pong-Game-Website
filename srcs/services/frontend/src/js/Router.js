import { LandingPage } from './LandingPage.js'
import { Login } from './Login.js'
import { Register } from './Register.js'
import { Profile } from './Profile.js'
import { Settings } from './Settings.js'
import { Dashboard } from './Dashboard.js';
// import { PongGame } from './Game.js';
import { MatchLobby } from './MatchLobby.js'
import { Match } from './Match.js'
import { ErrorClass } from './ErrorClass.js'
import { Chat } from './Chat.js';
import { LoadProfile } from './LoadProfile.js'

export const routes = {
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
    // '/game' : {
    //     path : '/game',
    //     view : PongGame,
    //     css : './css/game.css',
    //     auth : true
    // },
    '/chat' : {
        path : '/chat',
        view : Chat,
        auth : true
    },
    '/match_lobby' : {
        path : '/match',
        view : MatchLobby,
        auth : true
    },
    '/match/:id' : {
        view : Match,
        dinamic : true,
        // css : './css/game.css',
        auth : true
    },
    '/test/:id' : {
        view : LoadProfile,
        dinamic : true,
        auth : true
    }
}

// Use the history API to prevent full page reload
export const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};


/* Explanation of the modified regular expression:
( ^ ) -> Match the start of the string.
( ${key.replace(/:[^\s/]+/g, '\\d+').replace(/\//g, '\\/')} ) -> This part constructs the regular expression.
    ( key.replace(/:[^\s/]+/g, '\\d+') ) -> This replaces any dynamic parameters (:id) with \\d+, which means "one or more digits". This ensures that only numerical values are accepted after the slash (/).
    ( replace(/\//g, '\\/') ) ->  This escapes any forward slashes (/) in the key to ensure they are treated as literal characters in the regular expression.
( \\/?$ ) -> Match an optional trailing slash at the end of the string.
( $ ) -> Match the end of the string.
*/

function findMatchingRoute(url) {
    for (const key in routes) {
        const regex = new RegExp(`^${key.replace(/:[^\s/]+/g, '\\d+').replace(/\//g, '\\/')}\\/?$`);
        if (regex.test(url)) {
            return key;
        }
    }
    return null;
}


export const router = async () => {
    const path = window.location.pathname;
    const matchedRoute = findMatchingRoute(path);

    const viewObject = routes[matchedRoute];
    let id = null;
    
    if (!viewObject) {
        const errorView = new ErrorClass();
        document.getElementById('header').innerHTML = errorView.getHtmlForHeader();
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

    if (viewObject.dinamic == true)
    {
        id = path.split('/')[2];
    }

    const view = new viewObject.view(id);

    if (viewObject.css) {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = viewObject.css;
        console.log(viewObject.css)
        console.log(styleCss.href);
        document.head.appendChild(styleCss);
    }

    document.getElementById('header').innerHTML = await view.getHtmlForHeader();
    document.getElementById('app').innerHTML = await view.getHtmlForMain();
}

window.addEventListener("popstate", router);

document.addEventListener('DOMContentLoaded', () => {
  router();
});
