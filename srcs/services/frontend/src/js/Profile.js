import { BaseClass } from './BaseClass'

class User{
    constructor(username, pic, id, email, bio, picpath) {
        this.username = username;
        this.pic = pic;
        this.id = id;
        this.email = email;
        this.bio = bio;
        this.picpath = picpath;
      }
      getProfilePicPath() {
        return "https://localhost:8000" + this.pic;
    }
      getFriendReq() {
        return "https://localhost:8000/users/friendship/" + this.username + "/";
    }
}

export class Profile extends BaseClass {
    constructor() {
        super();
        this.displayProfile();
    }

    addFriend = (user) => {
        const jwtAccess = localStorage.getItem('token');
        fetch(user.getFriendReq(), {
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
            // Handle successful login, e.g., store token in local storage
            console.log('Succesfully signed up', data);
            console.log("data: ", data);
            alert("SUCCESFULLY ADDED AS FRIEND")
        })
        .catch(error => {
            console.error('Impossible friendship : ', error);
            alert("ERRRRRRROR");
        });
    }

    displayProfile() {
        const jwtAccess = localStorage.getItem('token');
    
        fetch('https://localhost:8000/users/profile/', {
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
            
            const friendRequestLink = document.createElement('a');
            friendRequestLink.href = '#';  // Set the href as needed
            friendRequestLink.innerText = 'Send Friend Request';
            friendRequestLink.addEventListener('click', (event) => {
                event.preventDefault();
                addFriend(currentUser); // Pass user ID or any necessary data to the function
            });
    
            // Append the link to the 'friendRequest' div
            document.getElementById('friendRequest').appendChild(friendRequestLink);
         
    
          // Display attributes
            document.getElementById('username').innerText = currentUser.username;
            document.getElementById("pic").src = currentUser.getProfilePicPath();
            document.getElementById('email').innerText = currentUser.email;
            document.getElementById('bio').innerText = currentUser.bio;
            document.getElementById('nb').innerText = currentUser.id;
        })
        .catch(error => console.error('Error:', error));
    }

    getHtmlForHeader() {
        return `<nav id="nav-bar">
                    PROFILE
                    <a href="/">HOME</a>
                    <a href="/settings">SETTINGS</a>
                </nav>`;
    }

    getHtmlForMain() {
        return `<div class="container">
			        <img src="" id="pic" class="avatar">
                    <h1><div class="row" id="username"></div></h1>
                    <div class="row" id="pic"></div>
                    <div class="row" id="nb"></div>
                    <div class="row" id="email"></div>
                    <div class="row" id="bio"></div>
                    <div class="row" id="friendRequest"></div>
                    <div class="row" id="friendlist"> DISPLAY FRIEND LIST</div>
                    <div class="row" id="matchHistory">MATCH HISTORY</div>
                    <div class="row" id="matchHistory">STATS (wins, losses)</div>
                </div>`
    }
}