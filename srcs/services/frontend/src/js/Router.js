import { LandingPage } from './LandingPage.js'
import { Login } from './Login.js'
import { Register } from './Register.js'
import { Profile } from './Profile.js'
import { Settings } from './Settings.js'
import { Dashboard } from './Dashboard.js';
import { PongGame } from './Game.js';
import { ErrorClass } from './ErrorClass.js'
import { Chat } from './Chat.js';
import { Logout } from './Logout.js';

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
    '/game' : {
        path : '/game',
        view : PongGame,
        css : './css/game.css',
        auth : true
    },
    '/chat' : {
        path : '/chat',
        view : Chat,
        auth : true
    },
    '/logout' : {
        path : '/logout',
        view : Logout,
        auth : true
    },
}
let onlineSocket = null;

export const connectUser = () => {
    const token = localStorage.getItem('token');
    console.log("connect user func");

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
            setTimeout(connect, 5000)
        }; 
        function setMessage(message) {
            // Create a new li element
            var newLi = document.createElement('li');
    
            // Create a new anchor element
            var newAnchor = document.createElement('a');
            newAnchor.className = 'dropdown-item text-wrap';
            newAnchor.href = '#';
            newAnchor.textContent = message;
    
            // Append the anchor element to the li element
            newLi.appendChild(newAnchor);
    
            // Get the ul element with the id "notify"
            var ulElement = document.getElementById('notify');
    
            // Append the new li element to the ul element
            ulElement.appendChild(newLi);
    
            // getting object of count
            count = document.getElementById('bellCount').getAttribute('data-count');
            document.getElementById('bellCount').setAttribute('data-count', parseInt(count) + 1);
        }
    }
}

// Use the history API to prevent full page reload
export const navigateTo = (url) => {
    history.pushState(null, null, url);
    console.log(`url[${url}]`);
    router();
};

export const router = () => {
    const status = localStorage.getItem('sessionSocket');
    // console.log("STATUS:", status);
    // if (status != "ONLINE")
    // {
        connectUser();
    // }

    const path = window.location.pathname;
    console.log(`router path[${path}]`);
    const viewObject = routes[path];

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

    const view = new viewObject.view();

    if (viewObject.css) {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = viewObject.css;
        document.head.appendChild(styleCss);
    }

    document.getElementById('header').innerHTML = view.getHtmlForHeader();
    document.getElementById('app').innerHTML = view.getHtmlForMain();
}

window.addEventListener("popstate", router);

document.addEventListener('DOMContentLoaded', () => {
    router();
});
