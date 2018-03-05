function div(val, by){
	return (val - val % by) / by;
}


function dateDifference(d2){
	var now = Date.now();
	d2 = Date.parse(d2);
	var difference = now - d2;
	
	var differenceBack = div(difference, 1000);
	
	var d = div(differenceBack, (24*60*60));
	if(d>0)return d+"d";
	
	var h = div(differenceBack, (60*60));
	if(h>0)return h+"h";
	
	var m = div(differenceBack, (60));
	if(m>0)return m+"m";
	


	//if(differenceBack<10) Стереть комментарии если нужна точность до секунд
		return "now";
	//else
	//	return differenceBack+"s";
}

function playSound(soundfile) {
 	document.getElementById("dummy").innerHTML =
 		"<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
 }