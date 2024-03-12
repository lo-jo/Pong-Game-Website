import { BaseClass } from './BaseClass';


export class Chat extends BaseClass {
    constructor() {
        super();
        // this.navbar = new Navbar();
        this.chatSocket = null;
        this.token = localStorage.getItem('token');
        
    }

    async startConvo(targetId, targetUsername,) {
        if(this.chatSocket)
            this.chatSocket.close();
        this.chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/${targetId}/?token=${this.token}`);
        this.chatSocket.onopen = function (e) {
            console.log('Socket successfully connected.');
            const authenticateMessage = {
                type: 'authenticate',
                token: this.token,
                };
        }.bind(this);
        this.chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log(e.data);
            document.querySelector('#chatLog').value += (data.senderUsername + ": " + data.message + '\n');
        } .bind(this);
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

    async initChatWindow(targetId, targetUsername, sendTarget) {
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
        await this.startConvo(targetId, targetUsername);
    }

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

            messageButton.addEventListener('click', (event) => {
                const sendTarget = document.getElementById(`${friendId}`);
                if (sendTarget && sendTarget.disabled == false){
                    // event.preventDefault();
                    sendTarget.disabled = true;
                    console.log('clicked send message', `${friendId}`);
                    this.initChatWindow(friendId, friendUsername);
                    sendTarget.disabled = false;
                }
            });
            li.appendChild(messageButton);
            const link = document.createElement('a');
            link.href = `/test/${friendId}`;
            link.innerText = ` ${friendUsername}`;
            li.appendChild(link);
            ul.appendChild(li);
        });
        friendListContainer.appendChild(ul);
    }

    async displayFriendList() {
        const friendList = document.getElementById('friendList');
        await fetch('http://localhost:8000/users/friendship/lo/', {
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
        </div>
        </div>
            `;
    }

} 
/* <input class="form-control form-control-sm" id="target" placeholder="Who do you want to send a msg to ?" type="text">
<button type="submit" id="sendButton" class="btn btn-dark btn-sm">JOIN</button></div> */
