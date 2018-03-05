var s_load = false;

$('#s_save').click(function(){
	if(s_load)return;

	s_load = true;

    var firstname 	= $('input#s_firstname').val().trim();
    var lastname 	= $('input#s_lastname').val().trim();
    var email 		= $('input#s_email').val().trim();
    var image 		= $('input#s_image').val().trim();

	$.post(window.location.origin+'/setting/api/change', {'data': {0: firstname, 1: lastname, 2: email, 3: image}}).done(function( data ) {

			if(data.status == 'OK'){
				$('#s_status').html('Changes saved');
				var form = document.getViewById('login-form');
				form.submit();
			}else{
				$('#s_status').html('Some error was occured');
			}

		s_load = false;
	});
});
