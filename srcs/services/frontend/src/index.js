import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
/*Import classes*/
import { router } from './js/Router.js';

window.addEventListener("popstate", () => {
    console.log("POPSTATE (index.js)");
    router();
});

window.addEventListener("onpopstate", () => {
    console.log("ON POPSTATE (index.js)");
    router();
});
