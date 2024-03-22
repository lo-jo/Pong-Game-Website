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
        // console.log(`event.target.id: ${event.srcElement}`); 
        if (target.tagName === 'BUTTON' || target.closest('button')) 
        {
            event.preventDefault();
            console.log('clicked send message', target.id);
            // console.log("inner text sibling", target.nextSibling.innerText);
            this.initChatWindow(target.id, target.innerText, event);
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

    generateChatBubble(sender, message, time){
        return `
        <div class="d-flex flex-row ${(this.profileData.username == sender) ? `justify-content-end` : `justify-content-start`} mb-2">

        <div>
          <p class="small p-2 ms-3 mb-0 rounded-3" style="background-color: #f5f6f7;">
          ${message}</p>
          <p class="small ms-3 mb-0 rounded-3 text-muted">${time}</p>
        </div>
      </div>
            `;



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
            // document.querySelector('#chatLog').innerText += (data.senderUsername + ": " + data.message + '\n');
            document.querySelector('#chatLog').innerHTML += this.generateChatBubble(data.senderUsername, data.message, data.time)
        }.bind(this);
        this.chatSocket.onclose = function (e) {
            console.log('Socket closed unexpectedly');

        }.bind(this);

        // document.querySelector('#chat-message-input').focus();
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
        
        // Create a div for chat log
        const chatLog = document.createElement('div');
        chatLog.setAttribute('id', 'chatLog');
        chatLog.setAttribute('class', 'form-control'); // Add Bootstrap form-control class
        chatLog.style.overflowY = 'scroll'; // Add scroll for overflow
        chatLog.style.height = '200px'; // Adjust height as needed
        chatLog.style.border = '1px solid #ccc'; // Add border for visualization
        chatLog.style.padding = '10px'; // Add padding for visualization
        chatLog.style.marginBottom = '10px'; // Add margin for visualization
        chatLog.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // Add transparent background
        chatLog.style.borderRadius = '5px'; // Add border-radius for visualization
        chatLog.style.overflowWrap = 'break-word'; // Ensure long words wrap correctly
        chatWindow.appendChild(chatLog);
    
        const chatInput = document.getElementById('chatInput');
        chatInput.innerHTML = '';
        const inputGroup = document.createElement('div');
        inputGroup.setAttribute('class', 'input-group');
        const chatInputField = document.createElement('input');
        chatInputField.setAttribute('class', 'form-control'); // Add Bootstrap form-control class
        chatInputField.setAttribute('id', 'chat-message-input');
        chatInputField.setAttribute('type', 'text');
        chatInputField.setAttribute('placeholder', `Send message to ${targetUsername}`);
        const inputGroupAppend = document.createElement('div');
        inputGroupAppend.setAttribute('class', 'input-group-append');
        const iconSpan = document.createElement('span');
        iconSpan.setAttribute('class', 'input-group-text');
        iconSpan.innerHTML = '<i class="bi bi-arrow-right-circle""></i>';
        inputGroupAppend.appendChild(iconSpan);
        inputGroup.appendChild(chatInputField);
        inputGroup.appendChild(inputGroupAppend);
        chatInput.appendChild(inputGroup);
    
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

    async getFriendData(id) {
        const jwtAccess = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/users/${id}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
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
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async generateFriendElements(friends) {
        const friendListContainer = document.getElementById('friendList');
        friendListContainer.innerHTML = '';
    
        for (const friend of friends) {
            const friendUsername = friend[Object.keys(friend)[0]];
            const friendId = friend[Object.keys(friend)[1]];
            
            try {
                // Await the getUserData promise
                const friendData = await this.getFriendData(friendId);
                console.log("FRIEND DATA", friendData);
    
                const divRow = document.createElement('div');
                divRow.classList.add('row', 'friend-row', 'bg-dark', 'text-white', 'p-0', 'mb-0');
    
                const contentContainer = document.createElement('div');
                contentContainer.classList.add('d-flex', 'align-items-center');
    
                const messageButton = document.createElement('button');
                messageButton.setAttribute('class', 'btn btn-dark btn-small mr-2');
                messageButton.setAttribute('id', `${friendId}`);
    
                const chatIcon = document.createElement('i');
                chatIcon.setAttribute('class', 'bi bi-chat');
                chatIcon.setAttribute('id', `${friendId}`);
                messageButton.appendChild(chatIcon);
    
                const image = document.createElement('img');
                image.setAttribute('src', `${friendData.profile_pic}`); // Replace 'image-url.jpg' with your image URL
                image.setAttribute('class', 'chatvatar');
    
                const link = document.createElement('a');
                link.addEventListener('click', (event) => {
                    if (event.target.tagName === 'A') {
                        event.preventDefault();
                        navigateTo(event.target.href);
                    }
                });
                link.href = `/test/${friendId}`;
                link.innerText = ` ${friendUsername}`;
    
                contentContainer.appendChild(messageButton);
                contentContainer.appendChild(image); // Append image
                contentContainer.appendChild(link);
                divRow.appendChild(contentContainer);
                friendListContainer.appendChild(divRow);
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Handle error accordingly
            }
        }
    }
    
    
    
    

    async displayFriendList() {
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
        <div class="row align-items-start">
            <div class="col-2 p-3">
                <h1 class="chat-title">Messages</i></h1>
            </div>

            <div class="col-3">
                <div class="row" id="friendList">
                </div>
            </div>

            <div class="col-6">
                <div class="row" id="chatHeader"></div>
                <div class="row" id="chatWindow"></div>
                <div class="row" id="chatInput"></div>
                <div class="row" id="blockUser"></div>
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
