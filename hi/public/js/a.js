function resize(){

	var height = document.body.clientHeight;

	//alert(height);
	document.getElementById('content-page').style.height = height - 75 + "px";
	document.getElementById('left-part').style.height = height - 75 - 50 + "px";
	document.getElementById('scroll-conv').style.height = height - 75 - 48 - 60 + "px";
}