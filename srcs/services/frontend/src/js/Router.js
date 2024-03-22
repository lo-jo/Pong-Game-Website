import { LandingPage } from './LandingPage.js'
import { Login } from './Login.js'
import { Register } from './Register.js'
import { Profile } from './Profile.js'
import { Settings } from './Settings.js'
import { Dashboard } from './Dashboard.js';
import { MatchLobby } from './MatchLobby.js'
import { Match } from './Match.js'
import { ErrorClass } from './ErrorClass.js'
import { Chat } from './Chat.js';
import { LoadProfile } from './LoadProfile.js'
import { Logout } from './Logout.js';
import Navbar from './Navbar.js';
import jwt_decode from 'jwt-decode';

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
    '/chat' : {
        path : '/chat',
        view : Chat,
        auth : true
    },
    '/match/:id' : {
        view : Match,
        dinamic : true,
        css : './css/game.css',
        auth : true
    },
    '/test/:id' : {
        view : LoadProfile,
        dinamic : true,
        auth : true
    },
    '/logout' : {
        path : '/logout',
        view : Logout,
        auth : true
    },
}

export let onlineSocket = null;

export const connectUser = () => {
    const token = localStorage.getItem('token');
    // console.log("connect user func");

    if (onlineSocket && onlineSocket.readyState === WebSocket.OPEN) {
        console.log('WebSocket connection already open.');
        return;
    }

    if (token){
        onlineSocket = new WebSocket(`ws://localhost:8000/ws/notify/?token=${token}`);
        
        onlineSocket.onopen = function (e) {
            // localStorage.setItem('sessionSocket', "ONLINE");
            onlineSocket.send(JSON.stringify({ type: 'send_notification', token: token }));
        };
        onlineSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            const message = data.message;
            console.log(message);
            // Call the setMessage function to add the new li element
            // setMessage(message);
    
        };
        onlineSocket.onclose = function (e) {
            console.log('Socket closed unexpectedly');
            // onlinesocket = null;
            setTimeout(connectUser(), 1000)
        }; 
        // function setMessage(message) {
        //     // Create a new li element
        //     var newLi = document.createElement('li');
    
        //     // Create a new anchor element
        //     var newAnchor = document.createElement('a');
        //     newAnchor.className = 'dropdown-item text-wrap';
        //     newAnchor.href = '#';
        //     newAnchor.textContent = message;
    
        //     // Append the anchor element to the li element
        //     newLi.appendChild(newAnchor);
    
        //     // Get the ul element with the id "notify"
        //     var ulElement = document.getElementById('notify');
    
        //     // Append the new li element to the ul element
        //     ulElement.appendChild(newLi);
    
        //     // getting object of count
        //     count = document.getElementById('bellCount').getAttribute('data-count');
        //     document.getElementById('bellCount').setAttribute('data-count', parseInt(count) + 1);
        // }
    }
}

// '/tournament/:id/match/:id' : {
//     path : '/tournament',
//     view :Tournament,
//     auth : true
// }

// Use the history API to prevent full page reload
export const navigateTo = (url) => {
    console.log(`navigateTo called`);
    // event.preventDefault();
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

let previousView = null;
let styleCss = null;
export const router = async () => {
    // connectUser();

    const path = window.location.pathname;
    console.log(`ROUTER path[${path}]`);
    const matchedRoute = findMatchingRoute(path);
    
    const viewObject = routes[matchedRoute];

    let id = null;

    if (previousView && typeof previousView.cleanup === 'function') {
        console.log("CLEANING UP SHITTY EVENT LISTENERS");
        previousView.cleanup();
    }

    if (styleCss) {
        styleCss.remove();
        styleCss = null;
    }

    const token = localStorage.getItem('token');
    const auth = await checkAuthentication();
    if (auth)
        connectUser();
    document.getElementById('app').innerHTML = '';
    document.getElementById('header').innerHTML = '';

    if (!viewObject) {
        const errorView = new ErrorClass();
        navbar.setIsAuthenticated(auth);
        navbar.getHtml().then(html => document.getElementById('header').innerHTML = html);
        document.getElementById('app').innerHTML = errorView.getHtmlForMainNotFound();
        return;
    }

    if (viewObject.auth === true && (!token || auth === false)) {
        // const errorView = new ErrorClass();
        // document.getElementById('header').innerHTML = errorView.getHtmlForHeader();
        // document.getElementById('app').innerHTML = errorView.getHtmlForMain();
        navigateTo("/");
        return;
    } else if (viewObject.auth === false && (token && auth === true))
    {
        navigateTo("/dashboard");
        return;
    }

    if (viewObject.dinamic == true)
    {
        id = path.split('/')[2];
    }
    
    const view = new viewObject.view(id);
    previousView = view;
    
    if (viewObject.css) {
        styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = viewObject.css;
        console.log(viewObject.css)
        console.log(styleCss.href);
        document.head.appendChild(styleCss);
    }

    document.getElementById('app').innerHTML = await view.getHtmlForMain();
    (viewObject.path === '/logout') ? navbar.setIsAuthenticated(false) : navbar.setIsAuthenticated(auth);
    navbar.getHtml().then(html => document.getElementById('header').innerHTML = html);
}

async function checkAuthentication() {
    console.log("checking authentication (Router.js)");
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            return false;
        }

        let decodedToken;
        try {
            decodedToken = jwt_decode(token);
        } catch (decodeError) {
            console.error('Error decoding token:', decodeError.message);
            return false;
        }

        const response = await fetch('http://localhost:8000/users/check-authentication/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // console.error('Error checking authentication:', response.statusText);
            return false;
        }

        const data = await response.json();

        if ('authenticated' in data) {
            return data.authenticated;
        } else {
            // console.error('Invalid response format:', data);
            return false;
        }
    } catch (error) {
        // console.error('Unexpected error checking authentication:', error);
        return false;
    }
}

let navbar = new Navbar();

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded (Router.js)");
    router();
    document.getElementById('header').innerHTML = navbar.getHtml();
    document.getElementById('header').addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.classList.contains('navbar-link')) {
            console.log('LISTENER (Router.js) navbar button clicked: ', event.target);
            event.preventDefault();
            navigateTo(event.target);
        }
    });
});
