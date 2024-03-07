import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
/*Import classes*/
import { navigateTo } from './js/Router.js'

// document.addEventListener('DOMContentLoaded', () => {
//     document.body.addEventListener('click', (event) => {
//         if (event.target.tagName === 'A' && event.target.classList.contains('navButt')) {
//             event.preventDefault();
//             console.log('navbar button clicked: ', event.target);
//             navigateTo(event.target);
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            console.log('navbar button clicked: ', event.target);
            navigateTo(event.target);
        }
    });
});
