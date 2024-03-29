function showSection(section) {   
	fetch(`./sections/${section}`)
	.then(response => response.text())
	.then(text => {
		document.getElementById('content').innerHTML = text;

		const scriptElements = document.getElementById('content').querySelectorAll('script');
		scriptElements.forEach(script => {
		const newScript = document.createElement('script');
		newScript.text = script.innerText;
		document.head.appendChild(newScript).parentNode.removeChild(newScript);
		})
	})
	.catch(error =>	{
		console.error('Error loading HTML:', error);
		document.getElementById('#content').innerHTML = "Error loading section";
	})
}
document.addEventListener("DOMContentLoaded", function() {
	document.querySelectorAll('button').forEach(button => {
		button.onclick = function() {
			showSection(this.dataset.section)
		}
	})
});
