import { BaseClass } from './BaseClass';
import jwt_decode from 'jwt-decode';

export class LoadProfile
{
    constructor(id) {
        this.id = id;
    }

    async getUserData() {
        const jwtAccess = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/users/${this.id}/`, {
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
    
    async getFriendshipStatus(user) {
        const jwtAccess = localStorage.getItem('token');
        let decoded_token = jwt_decode(jwtAccess);
        fetch(`http://localhost:8000/users/friendship/${user.username}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
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
            const hasValue = data.some(item => (
                (item.hasOwnProperty("recipient_id") && item.recipient_id === decoded_token.user_id) ||
                (item.hasOwnProperty("sender_id") && item.sender_id === decoded_token.user_id)
              ));
            if (hasValue){
                const friendRequestLink = document.createElement('text');
                friendRequestLink.innerText = `You and ${user.username} are friends :)`;
                document.getElementById('friendRequest').appendChild(friendRequestLink);
            }
                
            else{
                const friendRequestLink = document.createElement('button');
                friendRequestLink.setAttribute('class', 'btn btn-dark');
                friendRequestLink.setAttribute('id', 'addButton');
                friendRequestLink.href = '#';
                friendRequestLink.innerText = 'Add as friend';
                friendRequestLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.addFriend(user);
                });
                document.getElementById('friendRequest').appendChild(friendRequestLink);
            }
        })
        .catch(error => {
            console.error('Error fetching friendlist : ', error);
        });
    }

    displayStatus = (user) => {
        const jwtAccess = localStorage.getItem('token');
        fetch(`http://localhost:8000/notify/${user.username}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error:', response.status);
                return; 
            }
            return response.json();
        })
        .then(data => {
            if (data.hasOwnProperty('error')) {
                document.getElementById('status').classList.remove('bg-success');
                document.getElementById('status').classList.add('bg-danger');
            } else {
                // document.getElementById('status').innerText = 'ON';
            }
            this.getFriendshipStatus(user);
        })
        .catch(error => console.error('Error fetching status:', error));
    }

    addFriend = (user) => {
        const jwtAccess = localStorage.getItem('token');
        fetch(`http://localhost:8000/users/friendship/${user.id}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
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
            document.getElementById('addButton').remove();
            const friendAddedText = document.createElement('text');
            friendAddedText.innerText = `You and ${user.username} are friends :)`;
            document.getElementById('friendRequest').appendChild(friendAddedText);
        })
        .catch(error => {
            console.error('Impossible friendship : ', error);
        });

    }

    async getHtmlForMain() {
        const profileData = await this.getUserData();
        this.displayStatus(profileData);
        return `<div class="container text-center">
        <div class="row align-items-start">
            <div class="col" id="leftCol">
                <h1><div class="row justify-content-center" id="username" >
                </div>${profileData.username}</h1>
                <div class="row position-absolute" style="right: 80%;">
                    <span class="position-relative top-10 end-0 p-2 bg-success border border-light rounded-circle" id="status">
                    </span>
                </div>
                <div class="row justify-content-center">
                    <img src="${profileData.profile_pic}" id="pic" class="avatar" alt="Profile Image" class="img-fluid">
                </div>
                <div class="row justify-content-center" id="nb">${profileData.id}</div>
                <div class="row justify-content-center" id="email">${profileData.email}</div>
                <div class="row justify-content-center" id="bio">${profileData.bio}</div>
                <div  id="friendRequest"></div> 
            </div>
            <div class="col">
            <h1>Stats</h1>
                    
            </div>
            </div>
        </div>
    </div>`
    };
}