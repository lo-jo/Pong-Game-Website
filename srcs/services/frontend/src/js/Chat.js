import { BaseClass } from './BaseClass';
import { navigateTo } from './Router';

export class Chat extends BaseClass {
    constructor() {
        super();
        this.chatSocket = null;
        this.token = localStorage.getItem('token');
        this.profileData;
        this.addDocumentClickListener();
    }

    async handleDocumentClick(event) {
        const target = event.target;
        console.log(`event.target.id: ${event.srcElement}`); 
        if (target.tagName === 'BUTTON') 
        {
            event.preventDefault();
            console.log('clicked send message', target.id);
            this.initChatWindow(target.id, target.nextSibling.innerText, event);
        }
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
        if (this.chatSocket != null && this.chatSocket.readyState === WebSocket.OPEN) {
            // this.chatSocket.close();
            console.log("CLOSEEEEEE here");
            this.chatSocket.close();
            this.chatSocket = null;
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
            event.preventDefault(); 
            this.blockFriendUser(`${targetId}`); 
        }.bind(this));
        blockDiv.appendChild(blockLink);

        await this.startConvo(targetId);
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
            li.appendChild(messageButton);
            const link = document.createElement('a');
            link.addEventListener('click', (event) => {
                if (event.target.tagName === 'A') {
                    console.log('chatjsdklsjfsdkljf', event.target);
                    event.preventDefault();
                    navigateTo(event.target.href);
                }
            });
            link.href = `/test/${friendId}`;
            link.innerText = `${friendUsername}`;
            li.appendChild(link);
            ul.appendChild(li);
        });
        friendListContainer.appendChild(ul);
    }

    async displayFriendList() {
        console.log("PRINTIN USER DATA", this.profileData);
        await fetch(`http://localhost:8000/users/friendship/${this.profileData.username}/`, {
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

    async getUserData() {
        try {
            const response = await fetch(`http://localhost:8000/users/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            const data = await response.json();
            this.profileData = data;
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    PROFILE
                    <a href="/">HOME</a>
                    <a href="/settings">SETTINGS</a>
                </nav>`;
    }

    async getHtmlForMain() {
        await this.getUserData();
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

    cleanup() {
        console.log("Chat cleanup");
        this.removeDocumentClickListener();
        if (this.chatSocket != null && this.chatSocket.readyState === WebSocket.OPEN) {
            this.chatSocket.close();
            this.chatSocket = null;
        }
    }
} 
/* <input class="form-control form-control-sm" id="target" placeholder="Who do you want to send a msg to ?" type="text">
<button type="submit" id="sendButton" class="btn btn-dark btn-sm">JOIN</button></div> */
