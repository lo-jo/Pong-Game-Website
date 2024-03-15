import { BaseClass } from './BaseClass';

export class LandingPage extends BaseClass
{
    constructor() {
        super();
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    getHtmlForMain() {
        return `<h1>Welcome to our ft_transcendence</h1>`
    }
}