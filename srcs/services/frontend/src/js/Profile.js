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

    async generateFriendElements(friendMap) {
        const friendListContainer = document.getElementById('friendList');
        friendListContainer.innerHTML = '';
    
        for (const [friendId, friend] of friendMap.entries()) {
            const divRow = document.createElement('div');
            divRow.classList.add('row', 'friend-row', 'text-white');
            const friendUsername = friend.username;
            const friendProfilePic = friend.profile_pic;
            
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
            
            divRow.appendChild(contentContainer);
            friendListContainer.appendChild(divRow);
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
            user.friendMap.clear();
            console.log(data);
            for (const friend of data) {
                try {
                    const friendData = await this.getFriendData(friend[Object.keys(friend)[1]]);
                    user.friendMap.set(friend[Object.keys(friend)[1]], friendData);
                } catch (error) {
                    console.error('Error fetching friend data:', error);
                }
            }
            this.generateFriendElements(user.friendMap);
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
                            <div class="row justify-content-center" id="pic">${currentUser.pic}</div>
                            <div class="row justify-content-center" id="friendRequest">${currentUser.friendRequest}</div>    
                        </div>
                        <div class="col">
                            <h1>Stats</h1>
                            <div class="row">
                                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                                    <button class="btn btn-dark btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                                        Friends
                                    </button>
                                </div>
                                <div class="collapse" id="collapseExample">
                                    <div class="card card-body" id="friendList">${currentUser.friendList}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
    }
    

    // async displayProfile() {
    //     const jwtAccess = localStorage.getItem('token');

    //     fetch('http://localhost:8000/users/profile/', {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${jwtAccess}`,
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             if (response.status === 401) {
    //                 console.error('Unauthorized access. Please log in.');
    //             } else {
    //                 console.error('Error:', response.status);
    //             }
    //             throw new Error('Unauthorized');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         const currentUser = new User(data.username, data.profile_pic, data.id, data.email, data.bio)
    //         document.getElementById('username').innerText = currentUser.username;
    //         document.getElementById("pic").src = currentUser.getProfilePicPath();
    //         document.getElementById('email').innerText = currentUser.email;
    //         document.getElementById('bio').innerText = currentUser.bio;
    //         document.getElementById('nb').innerText = currentUser.id;
    //         this.displayStatus(currentUser);
    //         this.getFriendList(currentUser);
    //         return currentUser;
    //     })
    //     .catch(error => console.error('Error:', error));
    // }

    // async getHtmlForMain() {
    //     await this.displayProfile();
    //     return `<div class="container text-center">
    //                 <div class="row align-items-start">
    //                     <div class="col" id="leftCol">
    //                         <h1><div class="row justify-content-center" id="username" >
    //                         </div></h1>
    //                         <div class="row position-absolute" style="right: 80%;">
    //                             <span class="position-relative top-10 end-0 p-2 bg-success border border-light rounded-circle" id="status">
    //                             </span>
    //                         </div>
    //                         <div class="row justify-content-center">
    //                             <img id="pic" class="avatar img-fluid" alt="Profile Image">
    //                         </div>
    //                         <div class="row justify-content-center" id="nb"></div>
    //                         <div class="row justify-content-center" id="email"></div>
    //                         <div class="row justify-content-center" id="bio"></div>
    //                         <div class="row justify-content-center" id="pic"></div>
    //                         <div class="row justify-content-center" id="friendRequest"></div>    
    //                     </div>
    //                     <div class="col">
    //                     <h1>Stats</h1>
    //                             <div class="row">
    //                             <div class="d-grid gap-2 d-md-flex justify-content-md-start">
    //                                 <button class="btn btn-dark btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
    //                                     Friends
    //                                 </button>
    //                             </div>
    //                         <div class="collapse" id="collapseExample">
    //                             <div class="card card-body" id="friendList">
    //                         </div>
    //                         </div>
    //                     </div>
    //                     </div>
    //                 </div>
    //             </div>`;
    // }
}
