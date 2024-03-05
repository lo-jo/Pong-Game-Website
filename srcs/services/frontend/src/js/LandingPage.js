import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';

export class LandingPage extends BaseClass
{
    constructor() {
        super();
        this.navbar = new Navbar();
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<h1>Welcome to our ft_transcendence</h1>`
    }
}