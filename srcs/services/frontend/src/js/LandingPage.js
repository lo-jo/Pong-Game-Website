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
                    <a href="/register">Sign up</a>
                    <a href="/login">Log in</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<h1>Welcome to our ft_transcendence</h1>`
    }
}