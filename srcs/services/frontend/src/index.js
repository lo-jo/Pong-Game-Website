import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
/*Import classes*/
import { navigateTo } from './js/Router.js'
import { Navbar } from './js/Navbar.js';

/////////////////////////////////////////////////////////////
// // TO BE FIXED: full page reload when URL is change directly
// const handleLinkClick = (event) => {
//     event.preventDefault();
//     const href = event.target.getAttribute('href');
//     history.pushState({}, '', href);
//     router();
// };

// document.addEventListener('DOMContentLoaded', () => {
//     router();

//     document.body.addEventListener('click', (event) => {
//         if (event.target.tagName === 'A') {
//             // console.log("HERE WE MADE CLICK");
//             handleLinkClick(event);
//         }
//     });

//     window.addEventListener('popstate', router);
// });

///////////////////////////////////////////////////////

// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOMContentLoaded called() in index.js");
//     // alert('Here');
//     // navigateTo('/');
// });

// console.log("Here");