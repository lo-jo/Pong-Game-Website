import { BaseClass } from './BaseClass'

export class LandingPage extends BaseClass
{
    constructor() {
        super();
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    <button id="btn-sign-up" class="btn-nav-bar btn btn-outline-warning">Sign up</button>
                    <button id="btn-log-in" class="btn-nav-bar btn btn-outline-warning">Log in</button>
                </nav>`;
    }

    getHtmlForMain() {
        return `<h1>Welcome to our ft_transcendence</h1>`
    }
}