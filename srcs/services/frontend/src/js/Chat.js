// import { BaseClass } from './BaseClass'

// export class Chat extends BaseClass {
//     constructor() {
//         super();
//         this.chatSocket = null;
//         document.addEventListener('click', this.handleDocumentClick.bind(this));
//     }

//     handleDocumentClick(event) {
//         if (event.target.id === 'sendButton') {
//             event.preventDefault();
//             this.handleButtonClick(event);
//         }
//     }
//     handleButtonClick(event) {
//         const token = localStorage.getItem('token');
//         const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
//         chatSocket.onopen = function (e) {
//             chatSocket.send(JSON.stringify({ type: 'authenticate', token: token }));
//             console.log('Socket successfully connected.');
//         };
//         chatSocket.onmessage = function(e) {
//             const data = JSON.parse(e.data);
//             document.querySelector('#chat-log').value += (data.message + '\n');
//         };
//         chatSocket.onclose = function (e) {
//             console.log('Socket closed unexpectedly');
//         };

//         document.querySelector('#chat-message-input').focus();
//         document.querySelector('#chat-message-input').onkeyup = function(e) {
//             if (e.keyCode === 13) {  // enter, return
//                 document.querySelector('#sendButton').click();
//             }
//         };
    
//         document.querySelector('#sendButton').onclick = function(e) {
//             const messageInputDom = document.querySelector('#chat-message-input');
//             const message = messageInputDom.value;
//             chatSocket.send(JSON.stringify({
//                 type: 'message',
//                 token: token,
//                 message: message,
//             }));
//             messageInputDom.value = '';
//         };
//     }
//     // run() {
//     //     throw new Error("Method 'run()' must be implemented.");
//     // }

//     getHtmlForHeader() {
//         return `<nav id="nav-bar">
//                     PROFILE
//                     <a href="/">HOME</a>
//                     <a href="/settings">SETTINGS</a>
//                 </nav>`;
//     }

//     getHtmlForMain() {
//         return `<div class="container"><div class="row"><textarea class="form-control form-control-sm" id="chat-log" cols="100" rows="20"></textarea><br></div>
//         <input class="form-control form-control-sm" id="chat-message-input" type="text" size="50"><button type="submit" id="sendButton" class="btn btn-dark btn-sm">Send</button></div>`;
//     }
// }

import { BaseClass } from './BaseClass';

export class Chat extends BaseClass {
    constructor() {
        super();
        this.chatSocket = null;
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    handleDocumentClick(event) {
        if (event.target.id === 'sendButton') {
            event.preventDefault();
            this.handleButtonClick(event);
        }
    }

    handleButtonClick(event) {
        const token = localStorage.getItem('token');
        const chatId = 5;
        
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
                document.querySelector('#chat-log').value += (data.senderUsername + "@" + data.timestamp + ":" + data.message + '\n');
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
    displayChatHeader() {
        // fetch info from the requested id
    }
    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    PROFILE
                    <a href="/">HOME</a>
                    <a href="/settings">SETTINGS</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<div class="container"><div class="row" id="ChatHeader"></div><div class="row"><textarea class="form-control form-control-sm" id="chat-log" cols="100" rows="20"></textarea><br></div>
        <input class="form-control form-control-sm" id="chat-message-input" type="text" size="50"><button type="submit" id="sendButton" class="btn btn-dark btn-sm">JOIN</button></div>`;
    }

    // Other methods and properties
}
