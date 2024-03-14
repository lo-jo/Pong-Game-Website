export class BaseClass {
    constructor() {
        // this.handleDocumentClickBound = this.handleDocumentClick.bind(this);
        // document.addEventListener('click', this.handleDocumentClickBound);
        if (this.constructor === BaseClass) {
            throw new Error("Cannot instantiate abstract class.");
        }
    }

    // handleDocumentClick(event) {
    //     console.log("BaseClass handleDocumentClick");
    //     return;
    // }
    // run() {
    //     throw new Error("Method 'run()' must be implemented.");
    // }

    // getHtmlForHeader() {
    //     throw new Error("Method 'getHtmlForHeader()' must be implemented.");
    // }

    getHtmlForMain() {
        throw new Error("Method 'getHtmlForMain()' must be implemented.");
    }

    // cleanup() {
    //     document.removeEventListener('click', this.handleDocumentClickBound);
    // }
}