import { BaseClass } from './BaseClass';

export class Sock extends BaseClass
{
    constructor() {
        super();
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    getHtmlForMain() {
        return `
        <div class="wrapper"><h1>game completed</h1></div>
            
            <p><br>Redirection to the dashboard in<p><time><strong id="seconds">5</strong><br> seconds</time>.</p>
        `
    }
}