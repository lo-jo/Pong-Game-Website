import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
/*Import classes*/
import { router } from './js/Router.js';


// document.addEventListener('DOMContentLoaded', () => {
//     document.body.addEventListener('click', (event) => {
//         if (event.target.tagName === 'A') {
//             event.preventDefault();
//             // console.log('navbar button clicked: ', event.target);
//             navigateTo(event.target);
//         }
//     });
// });

// window.addEventListener('DOMContentLoaded', () => {
//     // router();
//     document.body.addEventListener('click', (event) => {
//         if (event.target.classList.contains('navbar-link')) {
//             console.log(`navbar-link[${event.target}]`);
//             event.preventDefault();
//             navigateTo(event.target);
//         }
//     });
// });

// window.addEventListener("popstate", router);

// document.addEventListener('DOMContentLoaded', () => {
//     router();
// });

//////////////////////////////////////////////////////////////

// const urlRoute = (event) => {
//     console.log(`passing through urlRoute`);
// 	event = event || window.event;
// 	event.preventDefault();
// 	window.history.pushState({}, "", event.target.href);
// 	router();
// };

// create document click that watches the nav links only
// document.addEventListener("click", (e) => {
// 	const { target } = e;
// 	if (!target.matches("nav a")) {
// 		return;
// 	}
// 	e.preventDefault();
// 	urlRoute();
// });

/////////////////////////////////////////////////////////////////

// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOM content loaded (index.js)");
//     router();
//     document.selectElementById('header').addEventListener('click', (event) => {
//         if (event.target.tagName === 'A' && event.target.classList.matches('navbar-link')) {
//             event.preventDefault();
//             console.log('LISTENER (index.js) navbar button clicked: ', event.target);
//             navigateTo(event);
//         }
//     });
// });

window.addEventListener("popstate", () => {
    console.log("POPSTATE");
    router();
});

window.addEventListener("onpopstate", () => {
    console.log("ON POPSTATE");
    router();
});
