function display_profile() {
	const jwtAccess = localStorage.getItem('token');
    console.log("WHY ARE YOU NOT EXECUTING THIS PROPERLY");

	fetch('http://localhost:8000/users/profile/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${jwtAccess}`,
			'Content-Type': 'application/json',
		},
	})
	.then(response => {
        if (!response.ok) {
            // Check for unauthorized (status code 401) or other errors
            if (response.status === 401) {
                console.error('Unauthorized access. Please log in.');
				document.getElementById('content').innerHTML = "You need to login to see this page."
            } else {
                console.error('Error:', response.status);
            }
            throw new Error('Unauthorized');
        }
        return response.json();
    })
	.then(data => {
	  const username = data.username;
      console.log(username);
	  const pic = data.profile_pic;
      console.log(pic);
	  const nb = data.id;
	  const email = data.email;
	  const bio = data.bio;
	  const picpath = "http://localhost:8000" + pic;
	  console.log(picpath);
	 

	  // Display attributes
        document.getElementById('username').innerText = username;
        document.getElementById("pic").src = picpath;
        document.getElementById('email').innerText = email;
        document.getElementById('bio').innerText = bio;
        document.getElementById('nb').innerText = nb;
	})
	.catch(error => console.error('Error:', error));
  

}

export const profileUser = () => {
    document.getElementById('content').innerHTML = `
    <div class="container">
		<div class="row">
			<img src="" id="pic" class="avatar">
		</div>
		<h1><div class="row" id="username"></div></h1>
		<div class="row" id="pic"></div>
		<div class="row" id="nb"></div>
		<div class="row" id="email"></div>
		<div class="row" id="bio"></div>
        <div class="row" id="add as friend">ADD AS FRIEND</div>
        <div class="row" id="friendlist"> DISPLAY FRIEND LIST</div>
        <div class="row" id="matchHistory">MATCH HISTORY</div>
        <div class="row" id="matchHistory">STATS (wins, losses)</div>
	</div>`;

        display_profile();

}