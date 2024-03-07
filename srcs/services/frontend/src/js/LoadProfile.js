import { BaseClass } from './BaseClass';
import { Navbar } from './Navbar';

export class LoadProfile
{
    constructor(id) {
        this.id = id;
        this.navbar = new Navbar();
    }
    
    getHtmlForHeader() {
        return this.navbar.getHtml();
    }

    async displayProfile() {
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

    async getHtmlForMain() {
        const profileData = await this.displayProfile();
        return `<div class="container">
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
                        <span class="position-absolute top-0 start-0 p-2 bg-danger border border-light rounded-circle"></span>
                        <img src="${profileData.profile_pic}" id="pic" class="avatar" alt="Profile Image" class="img-fluid">
                    </div>

		        <h1><div class="row" id="username">${profileData.username}</div></h1>
		            <div class="row" id="pic"></div>
		            <div class="row" id="nb"></div>
		            <div class="row" id="email">${profileData.email}</div>
		            <div class="row" id="bio"></div>
                    <div class="row" id="friendRequest"></div>
                    <div class="row" id="friendlist"> </div>
                    <div class="row" id="matchHis">MATCH HISTORY</div>
                    <div class="row" id="matchHistory">STATS (wins, losses)</div>
                    <div class="row" id="status"><div>
                </div>`
    }

    // getHtmlForMainNotFound() {
    //     return `<h1>Not found</h1>`
    // }
}