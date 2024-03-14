import { BaseClass } from './BaseClass';

export class Chat extends BaseClass {
    constructor() {
        super();
        this.chatSocket = null;
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    async handleDocumentClick(event) {
        this.sendButton = document.getElementById('sendButton');
        if (event.target.id === 'sendButton' && this.sendButton && this.sendButton.disabled == false) {
            event.preventDefault();
            this.sendButton.disabled = true;
            this.handleButtonClick(event);
            this.sendButton.disabled = false;
        }
    }

    async handleButtonClick() {
        const token = localStorage.getItem('token');
        const chatId = document.getElementById("target").value
        // Check if the WebSocket connection already exists
        if (!this.chatSocket || this.chatSocket.readyState === WebSocket.CLOSED) {
            this.chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);

            this.chatSocket.onopen = function (e) {
                console.log('Socket successfully connected.');
                const authenticateMessage = {
                    type: 'authenticate',
                    token: token,
                };
            }.bind(this);
            this.chatSocket.onmessage = function (e) {
                const data = JSON.parse(e.data);
                console.log(e.data);
                document.querySelector('#chat-log').value += (data.senderUsername + ": " + data.message + '\n');

            }.bind(this);
            this.chatSocket.onclose = function (e) {
                console.log('Socket closed unexpectedly');
            }.bind(this);
        }

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function (e) {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#sendButton').click();
            }
        };

        document.querySelector('#sendButton').onclick = function (e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            this.chatSocket.send(JSON.stringify({
                type: 'message',
                token: token,
                message: message,
            }));
            messageInputDom.value = '';
        }.bind(this);
    }

    getHtmlForMain() {
        return `<div class="container">
        <div class="row align-items-start">
        <div class="col">
        </div>
        <div class="col">
            <div class="row" id="ChatHeader"><h1>Messages</h1></div>
            <div class="row">
                <textarea class="form-control form-control-sm" id="chat-log" cols="40" rows="10"></textarea><br>
            </div>
            <div class="row">
                <input class="form-control form-control-sm" id="chat-message-input" type="text">
            </div>
            <div class="row">
                <input class="form-control form-control-sm" id="target" placeholder="Who do you want to send a msg to ?" type="text">
                <button type="submit" id="sendButton" class="btn btn-dark btn-sm">JOIN</button></div>
            </div>
        </div>
        </div>
            `;
    }

}
