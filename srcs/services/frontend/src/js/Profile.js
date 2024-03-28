import { BaseClass } from './BaseClass';
import { navigateTo } from './Router';

class User{
    constructor(username, pic, id, email, bio) {
        this.username = username;
        this.pic = pic;
        this.id = id;
        this.email = email;
        this.bio = bio;
        this.friendMap = new Map();
    }
    getProfilePicPath() {
        return "http://localhost:8000" + this.pic;
    }
    getFriendReq() {
        return "http://localhost:8000/users/friendship/" + this.username + "/";
    }
    getStatus() {
        return "http://localhost:8000/notify/" + this.username + "/";
    }
}

export class Profile extends BaseClass {
    constructor() {
        super();
    }

    displayStatus = (user) =>  {
        const jwtAccess = localStorage.getItem('token');
    
        fetch(user.getStatus(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error:', response.status);
                document.getElementById('status').innerText = 'Offline';
                return; 
            }
            return response.json();
        })
        .then(data => {
            const statusElement = document.getElementById('status');
            if (data.hasOwnProperty('error')) {
                // document.getElementById('status').innerText = 'Offline';
                statusElement.parentElement.querySelector('.bg-danger').classList.remove('bg-success');
                statusElement.parentElement.querySelector('.rounded-circle').classList.add('bg-danger')
            } else {
                // document.getElementById('status').innerText = 'Online';
            }
        })
        .catch(error => console.error('Error fetching status:', error));
    }

    displayFriendProfile(friendId) {
        // console.log("DISPLAY ATTRIBUTES", event.target.getAttribute('value'));
        console.log("FRIEND ID", friendId);
        const jwtAccess = localStorage.getItem('token');

        fetch(`http://localhost:8000/users/${friendId}/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('username').innerText = data.username;
            console.log("TARGET USER", data.username);
            history.pushState('','', `/profile`);
        })
        .catch(error => console.error('Error:', error));
        
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
                const friendData = await this.getFriendData(friendId);
                const friendUsername = friendData.username;
                const friendProfilePic = friendData.profile_pic;
                const contentContainer = document.createElement('div');
                contentContainer.classList.add('d-flex', 'align-items-center');
                const image = document.createElement('img');
                image.setAttribute('src', friendProfilePic);
                image.setAttribute('class', 'friendvatar');
                const link = document.createElement('a');
                link.addEventListener('click', (event) => {
                    if (event.target.tagName === 'A') {
                        event.preventDefault();
                        navigateTo(event.target.href);
                    }
                });
                link.href = `/test/${friendId}`;
                link.innerText = ` ${friendUsername}`;
        
                contentContainer.appendChild(image);
                contentContainer.appendChild(link);
                
                // divRow.appendChild(contentContainer);
                friendListContainer.appendChild(contentContainer);
            }
            catch (error) {
                console.error('Error fetching user data:', error);}
            
            
           
            

        }
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

    async getFriendList(user) {
        const jwtAccess = localStorage.getItem('token');
        fetch(user.getFriendReq(), {
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
        .then(async data => {
            this.generateFriendElements(data);
        })
        .catch(error => {
            console.error('Error fetching friendlist : ', error);
        });
    }

    async displayProfile() {
        const jwtAccess = localStorage.getItem('token');
    
        return fetch('http://localhost:8000/users/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access. Please log in.');
                } else {
                    console.error('Error:', response.status);
                }
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            const currentUser = new User(data.username, data.profile_pic, data.id, data.email, data.bio);
            return currentUser;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
    }
    
    async getHtmlForMain() {
        const currentUser = await this.displayProfile();
        this.displayStatus(currentUser);
        this.getFriendList(currentUser);

        return `<div class="container text-center">
                    <div class="row align-items-start">
                        <div class="col" id="leftCol">
                            <h1><div class="row justify-content-center">${currentUser.username}</div></h1>
                            <div class="row position-absolute" style="right: 80%;">
                                <span class="position-relative top-10 end-0 p-2 bg-success border border-light rounded-circle" id="status"></span>
                            </div>
                            <div class="row justify-content-center">
                                <img src="${currentUser.getProfilePicPath()}" id="pic" class="avatar img-fluid" alt="Profile Image">
                            </div>
                            <div class="row justify-content-center" id="nb">${currentUser.id}</div>
                            <div class="row justify-content-center" id="email">${currentUser.email}</div>
                            <div class="row justify-content-center" id="bio">${currentUser.bio}</div>
                        
                        
                            <div class="row">
                                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                    <button class="btn btn-dark btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                                        Friends
                                    </button>
                                </div>
                                <div class="collapse" id="collapseExample">
                                    <div class="card friend-body" id="friendList"></div>
                                </div>
                            </div>
                        </div>

                        <div class="col" id="right-col">
                            
                            <div class="row" id="wins_losses">
                                <div class="col-1 p-3 p-title" id="stats_title">
                                    Stats
                                </div>
                                <div class="col" id="stat_content">
                                    ** wins / losses content***
                                </div>
                                
                            </div>


                            <div class="row" id="match_log">
                                <div class="col-1 p-3 p-title" id="log_title">
                                    Match history
                                </div>
                                <div class="col" id="log_content">
                                    * match log *
                                </div>
                            </div>

                        </div>
                    </div>
                </div>`;
    }
    
}