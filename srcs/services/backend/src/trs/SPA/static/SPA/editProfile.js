// username email bio
// PUT request

async function edit_profile() {
	const getData = async () => {
		const jwtAccess = localStorage.getItem('token');
		const response = await fetch('/users/profile/', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${jwtAccess}`,
				'Content-Type': 'application/json',
			},
		}); 
		//assuming API returns JSON data
		const data = await response.json(); //parse JSON data
		return data;
	}

	let url;
	const myObject = await getData().then(data => {
						let objet = {}
						objet.data = data;
						url = "/users/update_profile/" + objet.data.id + "/";
						objet.url = url;
						return objet;
					})
					.catch(error => {   console.error(error);});
	
	const jwtAccess = localStorage.getItem('token');

	const username = document.getElementById('newusername').value;
	const email = document.getElementById('newemail').value;
	const bio = document.getElementById('newbio').value;
	const profile_pic = document.getElementById('newavatar');
	
	//const profile_pic = document.querySelector('newavatar');
	
	//	const selectedFile = profile_pic.files[0];
	//	console.log("my selected filed", selectedFile);
	
	//console.log('Number of files selected:', profile_pic.files[0]);

	// const test = {};
	// if (username.trim() !== '') {
	// 	test.username = username.trim();
	// }
	// if (email.trim() !== '') {
	// 	test.email = email.trim();
	// }
	// if (bio.trim() !== '') {
	// 	test.bio = bio.trim();
	// }
	// if (profile_pic.trim() !== '') {
	// 	test.profile_pic = profile_pic.trim();
	// }
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
		document.getElementById('content').innerHTML = "Profile succesfully updated";
	})
	.catch(error => {
		console.error('Failed to update profile', error);
	});
}
