export class BaseClass {
    constructor() {
        if (this.constructor === BaseClass) {
            throw new Error("Cannot instantiate abstract class.");
        }
        this.httpProtocol = window.location.protocol;
    }

    // run() {
    //     throw new Error("Method 'run()' must be implemented.");
    // }

    // getHtmlForHeader() {
    //     throw new Error("Method 'getHtmlForHeader()' must be implemented.");
    // }

    getHtmlForMain() {
        throw new Error("Method 'getHtmlForMain()' must be implemented.");
    }

    addDocumentClickListener() {
        // console.log("BaseClass adding eventListener");
        this.handleDocumentClickBound = this.handleDocumentClick.bind(this);
        document.getElementById('app').addEventListener('click', this.handleDocumentClickBound);
    }

    removeDocumentClickListener() {
        // console.log("BaseClass removing eventListener");
        document.getElementById('app').removeEventListener('click', this.handleDocumentClickBound);
    }

    async handleDocumentClick(event) {
        // console.log("BaseClass handleDocumentClick");
        return;
    }

    cleanup() {
        // console.log("BaseClass cleanup");
        this.removeDocumentClickListener();
    }
}