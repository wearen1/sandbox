$('input#message-text').keypress(function(e) {

	var key = e.which;
	console.log(e);
	if(key == 13){  // the enter key code
		$('#submit-mess').click();
		return false;  
	}
});

var currentConversation = "-1";
var spotlight_users = [];
var members = [];
var messages = [];
var conversations = [];

document.getElementById('search-conv-input').addEventListener("input", function() {
	if($('input#search-conv-input').val().trim()){
		$('#spotlight').show();
		searchUsers($('input#search-conv-input').val().trim());
	}else{
		$('#spotlight').hide();
	}
}, false);

function searchUsers(name){
	if(name.length<3){
		spotlight_users = [];
		$("#spotlight").html('');
		return;
	}
	$.post(window.location.href+'user/api/get', {'name': name}).done(function( data ) {
			

            var i = 0;
			var spotlight = '';
			spotlight_users = data;
			for(i;i<data.length;i++){
				var user = data[i];
				spotlight+= '<div onclick="addToConv(\''+i+'\')">'+user.firstname+'<br>'+user.lastname+'<hr></div>';
			}
			$("#spotlight").html(spotlight);
		
	});
}

function addToConv(i){
	members.push(spotlight_users[i]._id);
	//alert(members);
}

function createConversation(){
	$.post(window.location.href+'conversation/api/create', {'members': members}).done(function( data ) {
		if(data.status == 'OK'){
			alert(data.conversationID);
			members = [];
		}
	});
}

function send(){
	var msgdata = $('input#message-text').val().trim();

	$.post(window.location.href+'dialog/api/sendmsg', {'data': msgdata, 'conversationID': conversations[currentConversation]._id}).done(function( data ) {
			
			if(data.status == 'OK'){
				$('input#message-text').val('');
			}
            
		
	});
} 

function dialog(convID){
	//currentConversation = conversations[convID]._id;
	$('.cid'+currentConversation).removeAttr('id');
	$('.cid'+convID).attr('id', 'active-tab');
	currentConversation = convID;
	$('.conv-name').html(conversations[convID].name);
	$('.conv-avatar-prop').attr('src', conversations[convID].image); 
	messages = [];
	start();
}

setInterval(start, 500);

function start(){

	var c_offset = '0';
	if(conversations.length>0)c_offset = conversations[conversations.length-1]._id;
	$.get( window.location.href+"conversation/api/get/"+c_offset, { }).done(function( data ) {
			if(data.length<1)return;
			var i = 0;
			var convs = '';

			if(conversations.length == 0){
			 	$("#mCSB_1_container").html('');
				if(data.length == 0)return $("#mCSB_1_container").html('No conversations');
			}

			for(i;i<data.length;i++){
				var conv = data[i];
				var name = '';
				var image = '';
				if(!conv.isConv){
					if(conv.members[0]._id == userID){
						conv.name = conv.members[1].firstname + ' ' + conv.members[1].lastname;
						conv.image = conv.members[1].image;
					}else{
						conv.name = conv.members[0].firstname + ' ' + conv.members[0].lastname;
						conv.image = conv.members[0].image;
					}
				}else{
					conv.name = conv.members[0].firstname + ', ' + conv.members[1].firstname + '...';
				}
				//convs+= '<div onclick="dialog(\''+conv._id+'\');">'+conv.name+'<hr></div>';
				conversations.push(conv);
				$("#mCSB_1_container").prepend(''+
					'<div class="conversation cid'+(conversations.length-1)+'" onclick="dialog(\''+(conversations.length-1)+'\');">'+
                    '    <img class="fl_l avatar" style="width: 50px; height: 50px;" src="'+conv.image+'"></img>'+//conv.image
                    '    <div class="fl_l info">'+
                    '        <div class="fl_l info-top">'+
                    '            <div class="fl_l username">'+conv.name+'<span class="fl_r activity" id="dnd"></span></div>'+
                    '            <div class="fl_r date">14:38</div>'+
                    '        </div>'+
                    '        <div class="fl_l info-bottom">'+
                    '            <div class="fl_l read"></div>'+
                    '            <div class="fl_l text">Да, все нормально, вроде.</div>'+
                    '        </div>'+
                    '    </div>'+
                    '</div>');
			}
			//$("#mCSB_1_container").html(convs);
			resize();
	});

	if(currentConversation!='-1'){
		var m_offset = '0';
		if(messages.length>0)m_offset = messages[messages.length-1]._id;
		$.get( window.location.href+"dialog/api/messages/"+conversations[currentConversation]._id+"/"+m_offset, { }).done(function( data ) {
				var i = 0;
				var dialog = '';
				console.log(data);
				if(data.status != 'OK')return $("#mCSB_2_container").html(data.message);;

				if(messages.length == 0){
				 	$("#mCSB_2_container").html('');
					if(data.messages.length == 0)return $("#mCSB_2_container").html('No messages');
				}

				for(i;i<data.messages.length;i++){
					var message = data.messages[i];
					messages.push(message);
					var al = 'text-align: left;';
					if(message.user._id == userID)al = 'text-align:right;';
					//dialog+= '<div style="'+al+'">'+message.text+'</div>';

					$("#mCSB_2_container").append('<div class="fl_l message"><img src="'+message.user.image+'" class="fl_l member-avatar"></img><div class="fl_l mess-text">' + message.text + '</div><div class="fl_r date" id="mess-date" time="'+Date.parse(message.date)+'">'+dateDifference(message.date)+'</div></div>');

				}
				//$("#mCSB_2_container").html(dialog);
			
		});
	}else{
		$("#mCSB_2_container").html('Choose conversation');
	}

	//$("#mess-date").html(dateDifference($("#mess-date").attr('time')));
}