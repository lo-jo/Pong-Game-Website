import { BaseClass } from './BaseClass'
import { Navbar } from './Navbar';

export class Match extends BaseClass {
    constructor() {
        super();
        this.initWebSocket();
        this.navbar = new Navbar();
        // Set up click event listener on the document
        document.addEventListener('click', this.handleButtonClick.bind(this));
    }
}