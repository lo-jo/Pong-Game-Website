import { BaseClass } from './BaseClass'
import { Navbar } from './Navbar';

export class ErrorClass extends BaseClass
{
    constructor() {
        super();
        this.navbar = new Navbar();
    }
    
    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<h1>You need to be logged in</h1>`
    }

    getHtmlForMainNotFound() {
        return `<h1>Not found</h1>`
    }
}