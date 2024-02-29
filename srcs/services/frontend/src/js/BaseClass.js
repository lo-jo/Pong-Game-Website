export class BaseClass {
    constructor() {
        if (this.constructor === BaseClass) {
            throw new Error("Cannot instantiate abstract class.");
        }
    }

    // run() {
    //     throw new Error("Method 'run()' must be implemented.");
    // }

    getHtmlForHeader() {
        throw new Error("Method 'getHtmlForHeader()' must be implemented.");
    }

    getHtmlForMain() {
        throw new Error("Method 'getHtmlForMain()' must be implemented.");
    }
}