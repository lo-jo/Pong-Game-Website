import { BaseClass } from './BaseClass';
import { navigateTo } from './Router';

export class Chat extends BaseClass {
    constructor() {
        super();
        // this.navbar = new Navbar();
        this.chatSocket = null;
        this.token = localStorage.getItem('token');
        this.navbar = document.getElementById('nav-bar');
        this.chatBtn = document.getElementById('chatBtn');
    }

    async blockFriendUser(targetId){
        console.log("Blocking", targetId);
        await fetch(`http://localhost:8000/chat/block-user/${targetId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error:', response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Blocked", targetId);
        })
        .catch(error => console.error('Error:', error));
        
    
    }

    async startConvo(targetId) {
        if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
            // this.chatSocket.close();
            this.chatSocket.close();
        }
        this.chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/${targetId}/?token=${this.token}`);
        this.chatSocket.onopen = function (e) {
            console.log('Socket successfully connected.');
            const authenticateMessage = {
                type: 'authenticate',
                token: this.token,
                };
        }
        this.chatSocket.onmessage = function (e) {
            console.log("ON MESSAGE EVENT", e);
            const data = JSON.parse(e.data);
            console.log(e.data);
            document.querySelector('#chatLog').value += (data.senderUsername + ": " + data.message + '\n');
        }.bind(this);
        this.chatSocket.onclose = function (e) {
            console.log('Socket closed unexpectedly');

        }.bind(this);

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function (e) {
            if (e.keyCode == 13){
                console.log('enter');
                const messageInputDom = document.querySelector('#chat-message-input');
                const message = messageInputDom.value;
                this.chatSocket.send(JSON.stringify({
                    type: 'message',
                    token: this.token,
                    message: message,
                }));
                messageInputDom.value = '';
            }
        }.bind(this);
    }

    async initChatWindow(targetId, targetUsername, event) {
        console.log("CLICK SEND EVENT", event);
        event.stopPropagation();
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.innerHTML = '';
        const chatLog = document.createElement('textarea');
        chatLog.setAttribute('id', 'chatLog');
        chatLog.setAttribute('cols', '40');
        chatLog.setAttribute('rows', '10');
        chatWindow.appendChild(chatLog);

        const chatInput = document.getElementById('chatInput');
        chatInput.innerHTML = '';
        const chatForm = document.createElement('input');
        chatForm.setAttribute('class', 'form-control form-control-sm');
        chatForm.setAttribute('id', 'chat-message-input');
        chatForm.setAttribute('type', 'text');
        chatForm.setAttribute('placeholder', `Send message to ${targetUsername}`);
        chatInput.appendChild(chatForm);

        const blockDiv = document.getElementById('blockUser');
        blockDiv.innerHTML = '';
        const blockLink = document.createElement('a');
        blockLink.href = "#";
        blockLink.setAttribute('id', `block_${targetId}`)
        blockLink.innerText = `Block ${targetUsername}`;
        blockLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default action of clicking the link (navigating to a new page)
            this.blockFriendUser(`${targetId}`); // Call the method
        }.bind(this));
        blockDiv.appendChild(blockLink);

        await this.startConvo(targetId);
    }

    // async addClickEvent(friendId, friendUsername){
    //     const sendTarget = document.getElementById(`${friendId}`);
    //     console.log("are we adding events here", sendTarget);

    //     sendTarget.addEventListener('click', (event) => {
    //         event.preventDefault();
    //         console.log('clicked send message', `${friendId}`);
    //         this.initChatWindow(friendId, friendUsername, event);
    //     });
    // }
    async generateFriendElements(friends) {
        const friendListContainer = document.getElementById('friendList');
        friendListContainer.innerHTML = '';
    
        const ul = document.createElement('ul');
        friends.forEach(friend => {
            const li = document.createElement('li');
            const friendUsername = friend[Object.keys(friend)[0]];
            const friendId = friend[Object.keys(friend)[1]];
            
            const messageButton = document.createElement('button');
            messageButton.setAttribute('class', 'btn btn-dark btn-small');
            messageButton.setAttribute('id', `${friendId}`);
            messageButton.innerText = "send";
            li.appendChild(messageButton);
            const link = document.createElement('a');
            link.href = `/test/${friendId}`;
            link.innerText = `${friendUsername}`;
            li.appendChild(link);
            ul.appendChild(li);
            // this.addClickEvent(`${friendId}`, `${friendUsername}`);
        });
        friendListContainer.appendChild(ul);
        ul.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'BUTTON') {
                event.preventDefault();
                console.log('clicked send message', target.id);
                this.initChatWindow(target.id, target.nextSibling.innerText, event);
            }
        });
    }

    handleNavbarClick(event){
            event.preventDefault();
            event.stopImmediatePropagation();
            const buttonElement = event.currentTarget;
            // this.clickEvents.push({ event, path, target: buttonElement  });
            console.log(`click to: ${path}`);
            navigateTo(path);
    }

    async displayFriendList() {
        this.chatBtn = document.getElementById('chatBtn');
        this.chatBtn.removeEventListener('click', this.handleNavbarClick);

        const friendList = document.getElementById('friendList');
        await fetch('http://localhost:8000/users/friendship/loren/', {
            method : 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            this.generateFriendElements(data);
        })
        .catch(error => {
            console.error('Error fetching friendlist : ', error);
        });
    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    PROFILE
                    <a href="/">HOME</a>
                    <a href="/settings">SETTINGS</a>
                </nav>`;
    }

    getHtmlForMain() {
        this.displayFriendList();
        return `<div class="container">
        <div class="row">
        <div class="col">
            <div class="row" id="friendList">
            </div>
        </div>

        <div class="col">
            <div class="row" id="ChatHeader"><h1>Messages</h1></div>
            <div class="row" id="chatWindow">
            </div>

            <div class="row" id="chatInput">
            </div>
            <div class="row" id="blockUser">
            </div>
        </div>
        </div>
            `;
    }

} 
/* <input class="form-control form-control-sm" id="target" placeholder="Who do you want to send a msg to ?" type="text">
<button type="submit" id="sendButton" class="btn btn-dark btn-sm">JOIN</button></div> */
