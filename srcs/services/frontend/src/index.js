import { initGameTwoD } from './js/game.js';
import {registerUser} from './js/register.js';
import {loginUser} from './js/login.js';
import {profileUser} from './js/profile.js';
import {editUser} from './js/edit.js';
import 'bootstrap/dist/css/bootstrap.css';
/*Import classes*/
import { LandingPage } from './js/LandingPage.js'

const routes = {
    '/' : {
        path : '/',
        view : LandingPage,
    }
}

const router = () => {

    const path = window.location.pathname;

    const viewObject = routes[path];

    const view = new viewObject.view();

    document.getElementById('header').innerHTML = view.getHtmlForHeader();

    document.getElementById('app').innerHTML = view.getHtmlForMain();
}


// const router = () => {
//     const path = window.location.pathname;

//     switch (path) {
//         case '/':
//         case '/home':
//             renderView('home');
//             break;
//         case '/game':
//             renderView('game');
//             break;
//         case '/toto':
//             renderView('toto')
//     }
// };

// const renderView = (viewName) => {
//     fetch(`/${viewName}.js`)
//         .then((response) => response.text())
//         .then((html) => {
//             document.getElementById('app').innerHTML = html;
//             if (viewName === 'game') {
//                 renderGame();
//             }
//             else if (viewName === 'home') {
//                 renderHome();
//             }
//             else if (viewName == 'toto'){
//                 renderToto();
//             }
//             else if (viewName === 'notFound') {
//                 renderNotFound();
//             }
//         })
//         .catch((error) => {
//             console.error(`Error loading ${viewName} view:`, error);
//             renderNotFound();
//         });
//     // window.history.pushState({ view: viewName }, '', '/');
//     // Use replaceState to update the current history entry with additional information
//     // if (window.history.replaceState) {
//     //     //prevents browser from storing history with each change:
//     //     window.history.replaceState({ view: viewName }, '', '/');
//     // }
// };

// const renderRegister = () => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = './js/register.js';

//     // Define a callback to execute once the script is loaded
//     script.onload = () => {
//         if (typeof registerUser === 'function') {
//             registerUser();
//         } else {
//             console.error('register view function not found in ./js/register.js');
//             renderNotFound();
//         }
//     };

//     script.onerror = (error) => {
//         console.error('Error loading register script:', error);
//         renderNotFound();
//     };

//     // Append the CSS file to the head and the script element to the body of the document
//     document.body.appendChild(script);
// };

// const renderLogin = () => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = './js/login.js';

//     // Define a callback to execute once the script is loaded
//     script.onload = () => {
//         if (typeof loginUser === 'function') {
//             loginUser();
//         } else {
//             console.error('login view function not found in ./js/game.js');
//             renderNotFound();
//         }
//     };

//     script.onerror = (error) => {
//         console.error('Error loading login script:', error);
//         renderNotFound();
//     };

//     // Append the CSS file to the head and the script element to the body of the document
//     document.body.appendChild(script);
// };

// const renderEdit = () => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = './js/edit.js';

//     // Define a callback to execute once the script is loaded
//     script.onload = () => {
//         if (typeof editUser === 'function') {
//             editUser();
//         } else {
//             console.error('edit view function not found in ./js/game.js');
//             renderNotFound();
//         }
//     };

//     script.onerror = (error) => {
//         console.error('Error loading edit script:', error);
//         renderNotFound();
//     };

//     // Append the CSS file to the head and the script element to the body of the document
//     document.body.appendChild(script);
// };

// const renderProfile = () => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = './js/profile.js';

//     // Define a callback to execute once the script is loaded
//     script.onload = () => {
//         if (typeof profileUser === 'function') {
//             profileUser();
//         } else {
//             console.error('Profile view function not found in ./js/game.js');
//             renderNotFound();
//         }
//     };

//     script.onerror = (error) => {
//         console.error('Error loading profile script:', error);
//         renderNotFound();
//     };

//     // Append the CSS file to the head and the script element to the body of the document
//     document.body.appendChild(script);
// };

// function handleButtonClick(id) {
//     console.log("click");
//     const element = document.getElementById(id);

//     if (element) {
//         switch (id) {
//             case "register":
//                 renderRegister();
//                 break;
//             case "login":
//                 renderLogin();
//                 break;
//             case "profile":
//                 renderProfile();
//                 break;
//             case "edit":
//                 renderEdit();
//                 break;
//             // Add more cases as needed for different IDs
//             default:
//                 console.error("Unknown ID: " + id);
//                 break;
//         }
//     } else {
//         console.error("Element not found for ID: " + id);
//     }
// }

// // Example usage:
// document.getElementById("register").addEventListener("click", () => {
//     handleButtonClick("register");
// });

// document.getElementById("login").addEventListener("click", () => {
//     handleButtonClick("login");
// });

// document.getElementById("profile").addEventListener("click", () => {
//     handleButtonClick("profile");
// });

// document.getElementById("edit").addEventListener("click", () => {
//     handleButtonClick("edit");
// });

// const renderHome = () => {
//     document.getElementById('app').innerHTML = '<h1>Landing page!</h1>';
// };

// const renderToto = () => {
//     document.getElementById('app').innerHTML = '<h1>Toto!</h1>';
// };


// const renderGame = () => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = 'game.js';

//     const styleCss = document.createElement('link');
//     styleCss.rel = 'stylesheet';
//     styleCss.href = './css/game.css';

//     // Define a callback to execute once the script is loaded
//     script.onload = () => {
//         if (typeof initGameTwoD === 'function') {
//             initGameTwoD();
//         } else {
//             console.error('initGameTwoD function not found in ./js/game.js');
//             renderNotFound();
//         }
//     };

//     script.onerror = (error) => {
//         console.error('Error loading game script:', error);
//         renderNotFound();
//     };

//     // Append the CSS file to the head and the script element to the body of the document
//     document.head.appendChild(styleCss);
//     document.body.appendChild(script);
// };

// const renderNotFound = () => {
//     document.getElementById('app').innerHTML = '<h1>404 Page Not Found</h1>';
// };

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
