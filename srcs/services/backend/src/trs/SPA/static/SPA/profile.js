function display_profile() {
	const jwtAccess = localStorage.getItem('token');

	fetch('/users/profile/', {
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
	  const pic = data.profile_pic;
	  const nb = data.id;
	  const email = data.email;
	  const bio = data.bio;
	  const picpath = window.location.origin + pic;
	 console.log(picpath);
	 

	  // Display attributes
	document.getElementById('username').innerText = data.username;
	document.getElementById("pic").src = picpath;
	document.getElementById('email').innerText = email;
	document.getElementById('bio').innerText = bio;
	document.getElementById('nb').innerText = nb;
	})
	.catch(error => console.error('Error:', error));
  

}