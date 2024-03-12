import { LandingPage } from './LandingPage.js'
import { Login } from './Login.js'
import { Register } from './Register.js'
import { Profile } from './Profile.js'
import { Settings } from './Settings.js'
import { Dashboard } from './Dashboard.js';
// import { PongGame } from './Game.js';
import { Tournament } from './Tournament.js';
import { MatchLobby } from './MatchLobby.js'
import { Match } from './Match.js'
import { ErrorClass } from './ErrorClass.js'
import { Chat } from './Chat.js';
import { LoadProfile } from './LoadProfile.js'
import { Logout } from './Logout.js';
import { Navbar } from './Navbar.js';


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
            setTimeout(connectUser(), 1000)
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

// '/tournament/:id/match/:id' : {
//     path : '/tournament',
//     view :Tournament,
//     auth : true
// }

// Use the history API to prevent full page reload
// export const navigateTo = (event) => {
//     history.pushState(null, null, event.target);

//     router();

// };

export const navigateTo = (target) => {
    history.pushState(null, null, target);
    router();

    // Remove the event listener using the same function reference
    
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

const navbar = new Navbar();
// navbar.getHtml();

export const router = async () => {
    const status = localStorage.getItem('sessionSocket');
    // console.log("STATUS:", status);
    // if (status != "ONLINE")
    // {
        connectUser();
    // }

    const path = window.location.pathname;
    console.log(`path[${path}]`);
    const matchedRoute = findMatchingRoute(path);

    const viewObject = routes[matchedRoute];
    let id = null;
    
    if (!viewObject) {
        const errorView = new ErrorClass();
        // document.getElementById('header').innerHTML = errorView.getHtmlForHeader();
        await navbar.getHtml();
        document.getElementById('app').innerHTML = errorView.getHtmlForMainNotFound();
        return;
    }

    if (viewObject.auth === true) {
        const token = localStorage.getItem('token');
        if (!token || navbar.checkAuthentication() === false) {
            const errorView = new ErrorClass();
            // document.getElementById('header').innerHTML = errorView.getHtmlForHeader();
            await navbar.getHtml();
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

    // document.getElementById('header').innerHTML = await view.getHtmlForHeader();
    await navbar.getHtml();
    document.getElementById('app').innerHTML = await view.getHtmlForMain();
    // document.body.removeEventListener('click', clickHandler);
}

window.addEventListener("popstate", router);

document.addEventListener('DOMContentLoaded', () => {
    router();
});
