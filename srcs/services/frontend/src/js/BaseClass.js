class BaseClass {
    constructor() {
        if (this.constructor === BaseClass) {
            throw new Error("Cannot instantiate abstract class.");
        }
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    getHtml() {
        throw new Error("Method 'getHtml()' must be implemented.");
    }
}