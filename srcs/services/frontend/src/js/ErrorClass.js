import { BaseClass } from './BaseClass'

export class ErrorClass extends BaseClass
{
    constructor() {
        super();
    }
    
    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    <a href="/register">Sign up</a>
                    <a href="/login">Log in</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<h1>You need to be logged in</h1>`
    }

    getHtmlForMainNotFound() {
        return `<h1>Not found</h1>`
    }
}