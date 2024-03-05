import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';
// import 'bootstrap/js/dist/collapse';

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
        this.navbar = new Navbar();
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
                document.getElementById('status').innerText = 'Offline';

            } else {
                document.getElementById('status').innerText = 'Online';
                statusElement.parentElement.querySelector('.bg-danger').classList.remove('bg-danger');
                statusElement.parentElement.querySelector('.rounded-circle').classList.add('bg-success');
            }
        })
        .catch(error => console.error('Error fetching status:', error));
    }

    generateFriendElements(friends) {
        const friendListContainer = document.getElementById('friendList');
        friendListContainer.innerHTML = '';
        const ul = document.createElement('ul');
        friends.forEach(friend => {
            const li = document.createElement('li');
            let friendInfo = '';
            for (const property in friend) {
                friendInfo += `${friend[property]}, `;
            }
            friendInfo = friendInfo.slice(0, -2);
            li.textContent = friendInfo;
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
            // Handle successful login, e.g., store token in local storage;
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
        accordionBody.innerHTML = `<b>I H8 U,</b> u FUCKING BOOTSTRAP BITCh.`;

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
            
            const friendRequestLink = document.createElement('a');
            friendRequestLink.href = '#';  // Set the href as needed
            friendRequestLink.innerText = 'Send Friend Request';
            friendRequestLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.addFriend(currentUser); // Pass user ID or any necessary data to the function
            });
            // Append the link to the 'friendRequest' div
            document.getElementById('friendRequest').appendChild(friendRequestLink);
          // Display attributes
            document.getElementById('username').innerText = currentUser.username;
            document.getElementById("pic").src = currentUser.getProfilePicPath();
            document.getElementById('email').innerText = currentUser.email;
            document.getElementById('bio').innerText = currentUser.bio;
            document.getElementById('nb').innerText = currentUser.id;
            this.updateAccordionContent(currentUser);
            this.displayStatus(currentUser);
        })
        .catch(error => console.error('Error:', error));
    }

    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<div class="container">
        <p>

        <div class="accordion accordion-flush" id="accordionFlushExample">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
              FRIENDLIST
            </button>
          </h2>
          <div id="flush-collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
            <div class="accordion-body" id="friendList">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
          </div>
        </div>
       

        <div class="position-relative">
        <span class="position-absolute top-0 start-0 p-2 bg-danger border border-light rounded-circle">
        </span>
        <img src="" id="pic" class="avatar" alt="Profile Image" class="img-fluid">
        </div>

		<h1><div class="row" id="username"></div></h1>
		<div class="row" id="pic"></div>
		<div class="row" id="nb"></div>
		<div class="row" id="email"></div>
		<div class="row" id="bio"></div>
        <div class="row" id="friendRequest"></div>
        <div class="row" id="friendlist"> </div>
        <div class="row" id="matchHis">MATCH HISTORY</div>
        <div class="row" id="matchHistory">STATS (wins, losses)</div>
        <div class="row" id="status"><div>
        

    </div>`
    }
}


