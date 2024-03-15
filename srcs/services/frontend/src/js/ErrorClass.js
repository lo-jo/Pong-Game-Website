import { BaseClass } from './BaseClass'

export class ErrorClass extends BaseClass
{
    constructor() {
        super();
    }

    getHtmlForMain() {
        return `<h1>You need to be logged in</h1>`
    }

    getHtmlForMainNotFound() {
        return `<h1>Not found</h1>`
    }
}