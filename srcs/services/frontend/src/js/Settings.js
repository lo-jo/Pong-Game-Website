import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';

export class Settings extends BaseClass {
    constructor() {
        super();
        this.navbar = new Navbar();
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }
    handleDocumentClick(event) {
        if (event.target.id === 'editButton') {
            event.preventDefault();
            this.handleButtonClick(event);
        }
    }
    async handleButtonClick(event) {
        const getData = async () => {
            const jwtAccess = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/users/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtAccess}`,
                    'Content-Type': 'application/json',
                },
            }); 
            const data = await response.json(); //parse JSON data
            return data;
        }
    
        let url;
        const myObject = await getData().then(data => {
                            let objet = {}
                            objet.data = data;
                            url = "http://localhost:8000/users/update_profile/" + objet.data.id + "/";
                            console.log(url);
                            objet.url = url;
                            return objet;
                        })
                        .catch(error => {   console.error(error);});
        
        const jwtAccess = localStorage.getItem('token');
    
        const username = document.getElementById('newusername').value;
        const email = document.getElementById('newemail').value;
        const bio = document.getElementById('newbio').value;
        const profile_pic = document.getElementById('newavatar');
        
            // Prepare data object for JSON
            const jsonData = {};
            if (username.trim() !== '') {
                jsonData.username = username.trim();
            }
            if (email.trim() !== '') {
                jsonData.email = email.trim();
            }
            if (bio.trim() !== '') {
                jsonData.bio = bio.trim();
            }
    
            // Create FormData for file upload
            const formData = new FormData();
            if (profile_pic.files && profile_pic.files.length > 0) {
                formData.append('profile_pic', profile_pic.files[0]);
                const fileName = profile_pic.files[0].name;
                console.log('Selected File:', fileName)
            }
            else
                console.log('No file selected');
    
            // Merge JSON and file data into FormData
            for (const [key, value] of Object.entries(jsonData)) {
                formData.append(key, value);
            }
        
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${jwtAccess}`,
            },
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                
                console.log(JSON.stringify({ username, email, bio, profile_pic }));
                throw new Error('Invalid submission');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('app').innerHTML = "Profile succesfully updated";
        })
        .catch(error => {
            console.error('Failed to update profile', error);
        });
    }
    // run() {
    //     throw new Error("Method 'run()' must be implemented.");
    // }

    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    getHtmlForMain() {
        return `<h1>Edit profile</h1>
        <div class="form-group">
        <form id="editprofile" enctype="multipart/form-data">
            <label for="username">Username:</label>
            <input class="form-control form-control-sm" type="text" id="newusername" name="username" placeholder="Enter username">
            <br>
            <label for="email">E-mail:</label>
            <input class="form-control form-control-sm" type="email" id="newemail" name="email" placeholder="Enter e-mail">
            <br>
            <label for="password">bio:</label>
            <input class="form-control form-control-sm" type="text" id="newbio" name="bio" placeholder="bio">
            <br>
            <div class="mb-3">
                <label for="formFile" class="form-label">Default file input example</label>
                <input class="form-control" type="file" id="newavatar">
              </div>
            <button type="submit" id="editButton" class="btn btn-dark btn-sm">Submit</button>
        </form>
        </div>`
    }
}