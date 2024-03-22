import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
/*Import classes*/
import { router } from './js/Router.js';
// import dotenv from 'dotenv';

const remote_server = process.env.REMOTE;
console.log(remote_server);
localStorage.setItem('remote_server', remote_server);


window.addEventListener("popstate", () => {
    console.log("POPSTATE (index.js)");
    router();
});

window.addEventListener("onpopstate", () => {
    console.log("ON POPSTATE (index.js)");
    router();
});
