import { BaseClass } from './BaseClass';

export class Settings extends BaseClass {
    constructor() {
        super();
        this.addDocumentClickListener();
        this.isChecked = false;
        // document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    async handleDocumentClick(event) {
        this.editButton = document.getElementById('editButton');
        this.switchCheck = document.getElementById('twoFA_switch')
        if (event.target.id === 'editButton' && this.editButton && this.editButton.disabled == false) {
            event.preventDefault();
            await this.handleButtonClick(event);
        }
        else if (event.target.id == 'twoFA_switch'){
            this.isChecked = (this.switchCheck.checked) ? true : false;
        }
    }

    removeEventListeners() {
        document.removeEventListener('click', this.boundHandleDocumentClick);
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
        // const switchCheckbox = document.getElementById("twoFA_switch");
        // const isChecked = switchCheckbox.checked;
        console.log("ISCHECKED VALUE", this.isChecked)

        
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
            jsonData.otp_enabled = this.isChecked;
   
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
                
                console.log(JSON.stringify({ username, email, bio, profile_pic, isChecked}));
                throw new Error('Invalid submission');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            // console.log(JSON.stringify({ username, email, bio, profile_pic, isChecked}));
            document.getElementById('app').innerHTML = "Profile succesfully updated";
            this.removeEventListeners();
        })
        .catch(error => {
            console.error('Failed to update profile', error);
        });
    }
    // run() {
    //     throw new Error("Method 'run()' must be implemented.");
    // }

    getHtmlForMain() {
        return `<h1>Edit profile</h1>
        <div class="form-group">
        <form id="editprofile" enctype="multipart/form-data">
            <label for="username">Username:</label>
            <input class="form-control form-control-sm" type="text" id="newusername" name="username" placeholder="Enter username">

            <label for="email">E-mail:</label>
            <input class="form-control form-control-sm" type="email" id="newemail" name="email" placeholder="Enter e-mail">

            <label for="password">bio:</label>
            <input class="form-control form-control-sm" type="text" id="newbio" name="bio" placeholder="bio">

            <div class="mb-3">
                <label for="formFile" class="form-label">Profile Pic:</label>
                <input class="form-control" type="file" id="newavatar">
              </div>

            <div class="form-check form-switch" id="twoFA">
                <input class="form-check-input" type="checkbox" role="switch" id="twoFA_switch">
                <label class="form-check-label" for="flexSwitchCheckDefault" id="twoFA_label"></label>
            </div>
            <br>
            <button type="submit" id="editButton" class="btn btn-dark btn-sm">Submit</button>
        </form>
        </div>`
    }
}



