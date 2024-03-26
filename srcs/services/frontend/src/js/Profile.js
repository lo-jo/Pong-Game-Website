import { BaseClass } from './BaseClass';

class User{
    constructor(username, pic, id, email, bio) {
        this.username = username;
        this.pic = pic;
        this.id = id;
        this.email = email;
        this.bio = bio;
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
        // this.displayProfile();
    }
    // addFriend = (user) => {
    //     const jwtAccess = localStorage.getItem('token');
    //     fetch(user.getFriendReq(), {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${jwtAccess}`,
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Error');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         // Handle successful login, e.g., store token in local storage
    //         console.log('Succesfully signed up', data);
    //         console.log("data: ", data);
    //         alert("SUCCESFULLY ADDED AS FRIEND")
    //     })
    //     .catch(error => {
    //         console.error('Impossible friendship : ', error);
    //         alert("ERRRRRRROR");
    //     });
    // }
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
            // document.getElementById("pic").src = currentUser.getProfilePicPath();
            // document.getElementById('email').innerText = currentUser.email;
            // document.getElementById('bio').innerText = currentUser.bio;
            // document.getElementById('nb').innerText = currentUser.id;
            // this.displayStatus(currentUser);
            // this.updateAccordionContent(currentUser);
            
        })
        .catch(error => console.error('Error:', error));
        
    }

    generateFriendElements(friends) {
        const friendListContainer = document.getElementById('friendList');
        friendListContainer.innerHTML = '';
    
        const ul = document.createElement('ul');
        friends.forEach(friend => {
            const li = document.createElement('li');
            const friendUsername = friend[Object.keys(friend)[0]];
            const friendId = friend[Object.keys(friend)[1]];
            const link = document.createElement('a');
            link.href = `/test/${friendId}`;
            //const butt = document.createElement('button');
            //butt.setAttribute('class', 'btn btn-link');
            link.innerText = `${friendUsername}`;
            // li.appendChild(butt);
            li.appendChild(link);
            // butt.addEventListener('click', (event) => {
            //     event.preventDefault();
            //     this.displayFriendProfile(friendId);
            // });
            ul.appendChild(li);

        });
    
        friendListContainer.appendChild(ul);
    }

    getFriendList = (user) => {
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
        .then(data => {
            console.log("data: ", data);
            this.generateFriendElements(data);
        })
        .catch(error => {
            console.error('Error fetching friendlist : ', error);
        });
    }

    updateAccordionContent = (user) => {
        const accordionBody = document.getElementById('friendList');
        this.getFriendList(user);

    }

    displayProfile() {
        const jwtAccess = localStorage.getItem('token');

        fetch('http://localhost:8000/users/profile/', {
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

            const currentUser = new User(data.username, data.profile_pic, data.id, data.email, data.bio)
            document.getElementById('username').innerText = currentUser.username;
            document.getElementById("pic").src = currentUser.getProfilePicPath();
            document.getElementById('email').innerText = currentUser.email;
            document.getElementById('bio').innerText = currentUser.bio;
            document.getElementById('nb').innerText = currentUser.id;
            this.displayStatus(currentUser);
            this.updateAccordionContent(currentUser);
            // const friendRequestLink = document.createElement('a');
            // friendRequestLink.href = '#';
            // friendRequestLink.innerText = 'Send Friend Request';
            // friendRequestLink.addEventListener('click', (event) => {
            //     event.preventDefault();
            //     this.addFriend(currentUser);
            // });
            // document.getElementById('friendRequest').appendChild(friendRequestLink);
        })
        .catch(error => console.error('Error:', error));
    }

    getHtmlForMain() {
        this.displayProfile();
        return `
    <div class="container text-center">
        <div class="row align-items-start">
            <div class="col" id="leftCol">
                <h1><div class="row justify-content-center" id="username" >
                </div></h1>
                <div class="row position-absolute" style="right: 80%;">
                    <span class="position-relative top-10 end-0 p-2 bg-success border border-light rounded-circle" id="status">
                    </span>
                </div>
                <div class="row justify-content-center">
                    <img src="" id="pic" class="avatar" alt="Profile Image" class="img-fluid">
                </div>
                <div class="row justify-content-center" id="nb"></div>
                <div class="row justify-content-center" id="email"></div>
                <div class="row justify-content-center" id="bio"></div>
                <div class="row justify-content-center" id="pic"></div>
                <div class="row justify-content-center" id="friendRequest"></div>    
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
                    <div class="card card-body" id="friendList">
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    `
    }
}
