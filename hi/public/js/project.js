var refresh = 50;//Время обновления страницы
var noise = false;
var MSG_ON_PAGE = 16;

var app = angular.module('project', ['ngRoute','ngSanitize','server', 'pascalprecht.translate']).
  	config(function($routeProvider) {
    	$routeProvider
    	.when('/', {controller:BodyCtrl, templateUrl:'temps/body.html'})
    	.otherwise({redirectTo:'/auth'});
});

app.directive('message', function() {
  	return {
	    restrict: 'E',
	    transclude: true,
	    templateUrl: 'temps/msg.html'
  	};
});

app.directive('forward',['$interval', function($interval) {
  	return {
	    restrict: 'E',
	    transclude: true,
	    templateUrl: 'temps/frwd.html',
	    link: function (scope, element) {

      		scope.mess.diff = dateDifference(scope.mess.date);

	    	timeoutId = $interval(function() {
	      		scope.mess.diff = dateDifference(scope.mess.date);
		    }, refresh * 10);//Обновляем время в сообщениях

	    }
  	};
}]);

app.directive('window', function() {
  	return {
	    restrict: 'E',
	    transclude: true,
	    templateUrl: 'temps/window.html'
  	};
});


app.config(function ($translateProvider) {
 	$translateProvider.translations('en', {
 		'online'		: 'Online',
		'away'			: 'Away',
		'dnd'			: 'DND',

		'c_b'			: 'Chat background',
		'upload_y'		: 'Upload own image',
		'acc_s'			: 'Account settings',
		'acc_s_pp'		: 'Profile picture',
		'firstname'		: 'Firstname',
		'lastname'		: 'Lastname',
		'save'			: 'Save',
		'acc_s_cp'		: 'Change password',
		'old_pass'		: 'Old password',
		'new_pass'		: 'New password',
		'change'		: 'Change',

		'g_s'			: 'Global search',
		'g_s_r'			: 'Global Search Result',
		'no_results'	: 'No results',
		'dialogs'		: 'Dialogs',
		'users'			: 'Users',

		'recent'		: 'Recent conversations',
		'no_convers'	: 'No converstions',
		'contacts'		: 'Contacts',
		'no_contacts'	: 'No contacts',
		'requests'		: 'Requests',
		'no_requests'	: 'No requests',
		'menu'			: 'Menu',
		'select'		: 'Select',
		'c_c'			: 'Create conversation',

		'cancel'		: 'Cancel',
		'delete'		: 'Delete',
		'accept'		: 'Accept',
		'decline'		: 'Decline',
		'forward'		: 'Forward',

		'type_message'	: 'Type your message for',
		'typing'		: 'is typing',
		'typings'		: 'users are typing',
		'send'			: 'Send',

		//change kinds
		'image' 		: 'Changed image of converstion',
		'name'			: 'Changed name of converstion',
		'invite'		: 'Invite',
		'left'			: 'Left converstion',
		'fw'			: 'Forwarded messages',
		//change kinds

		//Choose
		'chooseUser' 	: 'Choose users',
		'chooseFw' 		: 'Choose where to forward',
		//Choose

		'search'		: 'Search',
		'back'			: 'back',
		'attachments'	: 'Attachments',
		'delete_dialog'	: 'Delete dialog',
		'name_of_conv'	: 'Name of conversation',
		'image_of_conv'	: 'Image of conversation',
		'save'			: 'Save',
		'members'		: 'Members',
		'add'			: 'Add',
		'leave_conv'	: 'Leave conversation',
		'notifications'	: 'Notifications',

		'settings'		: 'Settings',
		'mess_theme'	: 'Choose messenger\'s theme',
		'basic_settings': 'Basic settings',
			'private_msg'	: 'Who can send me private messages',
				'everyone'		: 'Everyone',
				'ver_only'		: 'Verified only',

			'delete_msg'	: 'Delete messages after',
				'a24hrs'		: 'After 24 hours',
				'aweek'			: 'After week',
				'amonth'		: 'After month',
				'no_delete'		: 'Do not delete',

			'open_chat'		: 'Open a chat when receiving a message',
				'always'		: 'Always',
				'never'			: 'Never',
				'only_for_ver'	: 'Only for verified',

			'font'			: 'Font size',
			'profile_g_s'	: 'Show your profile in global search',
				'yes' 			: 'Yes',
				'no'			: 'No',

			'color' 		: 'Choose messenger\'s color',
				'dark'			: 'Dark',
				'ligth'			: 'Light',

			'locale'		: 'Localization',

			'logout'		: 'Logout',
			'compact'		: 'Compact mode'
  	});

  	$translateProvider.translations('ru', {
    	'online'		: 'Online',
		'away'			: 'Отошел',
		'dnd'			: 'Недоступен',

		'c_b'			: 'Фон чатов',
		'upload_y'		: 'Загрузить свою картинку',
		'acc_s'			: 'Настройки аккаунта',
		'acc_s_pp'		: 'Картинка профиля',
		'firstname'		: 'Имя',
		'lastname'		: 'Фамилия',
		'save'			: 'Сохранить',
		'acc_s_cp'		: 'Смена пароля',
		'old_pass'		: 'Старый пароль',
		'new_pass'		: 'Новый пароль',
		'change'		: 'Изменить',

		'g_s'			: 'Глобальный поиск',
		'g_s_r'			: 'Результаты поиска',
		'no_results'	: 'Ничего не нашлось',
		'dialogs'		: 'Диалоги',
		'users'			: 'Люди',

		'recent'		: 'Последние диалоги',
		'no_convers'	: 'Нет диалогов',
		'contacts'		: 'Контакты',
		'no_contacts'	: 'Нет контактов',
		'requests'		: 'Запросы',
		'no_requests'	: 'Нет запросов',
		'menu'			: 'Меню',
		'select'		: 'Выбрать',
		'c_c'			: 'Создать беседу',


		'cancel'		: 'Отмена',
		'delete'		: 'Удалить',
		'accept'		: 'Подтвердить',
		'decline'		: 'Отклонить',
		'forward'		: 'Переслать',

		'type_message'	: 'Введите ваше сообщение для',
		'typing'		: 'печатает',
		'typings'		: 'печатают',
		'send'			: 'Отпр',



		//change kinds
		'image' 		: 'Изменил картинку беседы',
		'name'			: 'Изменил название беседы',
		'invite'		: 'Пригласил',
		'left'			: 'Покинул беседу',
		'fw'			: 'Пересланные сообщения',
		//change kinds

		//Choose
		'chooseUser' 	: 'Выберите пользователей',
		'chooseFw' 		: 'Выберите адресата',
		//Choose

		'search'		: 'Поиск',
		'back'			: 'Назад',
		'attachments'	: 'Прикрепления',
		'delete_dialog'	: 'Удалить диалог',
		'name_of_conv'	: 'Название беседы',
		'image_of_conv'	: 'Картинка беседы',
		'save'			: 'Сохранить',
		'members'		: 'Участники',
		'add'			: 'Пригласить',
		'leave_conv'	: 'Покинуть беседу',
		'notifications'	: 'Уведомления',

		'settings'		: 'Настройки',
		'mess_theme'	: 'Тема мессенджера',
		'basic_settings': 'Основные настройки',
			'private_msg'	: 'Кто может вам писать',
				'everyone'		: 'Все',
				'ver_only'		: 'Только подтвержденные',

			'delete_msg'	: 'Удаление сообщений',
				'a24hrs'		: 'Через 24 часа',
				'aweek'			: 'Через неделю',
				'amonth'		: 'Через месяц',
				'no_delete'		: 'Не удалять',

			'open_chat'		: 'Открывать диалог при получении сообщения',
				'always'		: 'Всегда',
				'never'			: 'Никогда',
				'only_for_ver'	: 'Только для подтвержденных',

			'font'			: 'Размер текста',
			'profile_g_s'	: 'Показывать ваш профиль в глобальном поиске',
				'yes' 			: 'Да',
				'no'			: 'Нет',

			'color' 		: 'Цвет интерфейса',
				'dark'			: 'Темный',
				'ligth'			: 'Светлый',

			'locale'		: 'Язык',

			'logout'		: 'Выйти',
			'compact'		: 'Компактный режим'
    });

  	$translateProvider.preferredLanguage('ru');
});


var backgroundPresets = [	'/dialogBacks/preset/1.jpg',
							'/dialogBacks/preset/2.jpg',
							'/dialogBacks/preset/3.jpg',
							'/dialogBacks/preset/4.jpg'];

function BodyCtrl($scope, $sce, $interval, Server, $http, $translate, $timeout){
	$scope.themes = [8,1,2,3,4,5,6,7,9,0];




	Server.update({//
		action: 'update',
		offset: 'Online',
		component: 'user'
	});

	$scope.user = Server.get({//Загрузка текущего пользователя
		action: 'get',
		component: 'user',
		offset: 0
	}, function(data){
		console.log(data);
		var time_st = data.server_time;

		data = data.data;

		for(var i = 0; i<data.contacts.length; i++){
			if((Date.parse(data.contacts[i].user.last_date)+15000) < time_st)data.contacts[i].user.status = "";
		}

		$scope.user = data;
		$translate.use($scope.user.preferences.locale);//Translation

		console.log(data);
		return data;
	});

	$scope.convs = Server.query({//Загрузка последних бесед
		action: 'get',
        component: 'conversation',
		offset: 0
	}, function(data){
		//console.log(data);
		for(var i = 0;i<data.length;i++){
			data[i] = getConv(data[i], $scope.user, $http);//Обработка беседы
			data[i].notification = true;
		}

		return data;
	});

	var toggle = {
		min: function(wndName){
			var wndElem = angular.element(wndName);
			var prevStyle = wndElem.attr('prev-style');

			if (prevStyle)
				wndElem.attr('style', prevStyle);
			else
				wndElem.removeAttr('style');
			wndElem.draggable('enable');
			window.fullscreenWindow = null;
		},
		max: function(wndName){
			var wndElem = angular.element(wndName);

			wndElem.attr('prev-style', wndElem.attr('style'));
			wndElem.css({
				width: 'calc(100% - 310px - 20px)',
				height: 'calc(100% - 42px - 20px)',
				top: '42px',
				left: '310px',
				zIndex: '99'
			});

			wndElem.attr('maximized', true);
			wndElem.draggable('disable');
			window.fullscreenWindow = parseInt(wndName.split('-').slice(-1));
		}
	};

	$scope.fullscreen = function(name){
		if (!$('#'+name).attr('maximized')){
			$('#' + name).attr('maximized', true);
			$('#' + name).resizable('disable');
			$('#' + name).find('#fullscreen-icon').toggleClass("icon-size-fullscreen");
			$('#' + name).find('#fullscreen-icon').toggleClass("icon-size-actual");
			toggle.max('#' + name);
			head = false;
			$('.top_worm').click();
		}
		else{
			$('#' + name).removeAttr('maximized');
			$('#' + name).resizable('enable');
			$('#' + name).find('#fullscreen-icon').toggleClass("icon-size-fullscreen");
			$('#' + name).find('#fullscreen-icon').toggleClass("icon-size-actual");
			toggle.min('#' + name);
		}
	}

	$scope.changeProfilePassword = function(){
		if($scope.old_pass.length < 1 || $scope.new_pass.length < 1)return;
		$http({
		  	url: '/user/api/changeProfilePassword/',
		  	method: "POST",
		  	data: {'old': Base64.encode($scope.old_pass), 'new': Base64.encode($scope.new_pass)},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//$('#new_password').css('background-color', 'rgba(88, 208, 136, 0.1)');
				$scope.old_pass = "";
				$scope.new_pass = "";

				$("#new_password").stop().css("background-color", "rgba(88, 208, 136, 0.1)").animate({ backgroundColor: "#FFFFFF"}, 1500);
			}else{
				//$('#old_password').css('background-color', 'rgba(238, 56, 83, 0.1)');
				$("#old_password").stop().css("background-color", "rgba(238, 56, 83, 0.1)").animate({ backgroundColor: "#FFFFFF"}, 1500);
			}
		});

	}

	$scope.changeProfileData = function(){
		$http({
		  	url: '/user/api/changeProfileData/',
		  	method: "POST",
		  	data: {'firstname': $scope.user.firstname, 'lastname': $scope.user.lastname},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			//console.log(data);
			if(data.status == 'OK'){
				//Успех
			}
		});
	}

	$scope.changeProfileImage = function(element){
		//console.log(cid);
		$scope.$apply(function($scope) {
			if(element.files.length<1)return;

	      	//console.log('files:', element.id);


			var fd = new FormData();

      		fd.append("uploadedFile", element.files[0]);

	      	var xhr = new XMLHttpRequest();

	      	xhr.onload = function() {
	      		var data = JSON.parse(this.responseText);
	      		if(data.status == 'OK'){
	      			$scope.user.image = data.image;
	      		}
  			};


	      	xhr.open("POST", "/user/api/changeProfileImage");
	      	setTimeout(function(){
	      		xhr.send(fd);
	      	}, 0);

	    });
	}

	$scope.changeBackImagePreset = function(backID){
		if($scope.user.chat_background == backgroundPresets[backID - 1]) return;
		$http({
		  	url: '/user/api/change/chat_background/preset',
		  	method: "POST",
		  	data: {'backID': backID},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				$scope.user.chat_background = backgroundPresets[backID - 1];
			}
		});
	}

	$scope.changeBackImage = function(element){
		//console.log(cid);
		$scope.$apply(function($scope) {
			if(element.files.length<1)return;

			var fd = new FormData();
	      	for(var i = 0; i< element.files.length; i++){
	      		fd.append("uploadedFile", element.files[i]);
	      	}
	      	var xhr = new XMLHttpRequest();


	      	xhr.onload = function() {

	      		var data = JSON.parse(this.responseText);
	      		if(data.status == 'OK'){
	      			$scope.user.chat_background = data.image;
	      		}else{
	      			//console.log(data);
	      		}
				//console.log(data);
	      		
  			};


	      	xhr.open("POST", "/user/api/change/chat_background");
	      	setTimeout(function(){
	      		xhr.send(fd);
	      	}, 0);

	    });
	}

	$scope.changeDialogImage = function(element){
		//console.log(cid);
		$scope.$apply(function($scope) {
			if(element.files.length<1)return;

	      	//console.log('files:', element.id);


			var fd = new FormData();
			fd.append("conv", element.id);
	      	for(var i = 0; i< element.files.length; i++){
	      		fd.append("uploadedFile", element.files[i]);
	      	}
	      	var xhr = new XMLHttpRequest();


	      	xhr.upload.onprogress = function(evt){

			    	var percentComplete = (evt.loaded / evt.total)*100;
			    	//console.log(percentComplete);
				    $('#progressbar'+element.id).css( "width", percentComplete+"%");
	      	}

	      	xhr.onload = function() {

	      		var data = JSON.parse(this.responseText);
	      		if(data.status == 'OK'){
	      			/*
	      			for(var i = 0; i<$scope.convs.length; i++){
						if($scope.convs[i]._id == element.id){
							console.log(type);
							(type == 1) ? ($scope.convs[i].image = data.pic + "?" + Date.now()) : ($scope.convs[i].background = data.pic + "?" + Date.now());
							break;
						}
					}*/
	      		}else{
	      			//console.log(data);
	      		}

				$('#progressbar'+element.id).css( "width", "0%");

  			};


	      	xhr.open("POST", "/conversations/api/change/image");
	      	setTimeout(function(){
	      		xhr.send(fd);
	      	}, 0);

	    });
	}

	$scope.loadFiles = function(element){
		//console.log(cid);
		$scope.$apply(function($scope) {
			if(element.files.length<1)return;

	      	//console.log('files:', element.id);


			var fd = new FormData();
			fd.append("conv", element.id);
	      	for(var i = 0; i< element.files.length; i++){
	      		fd.append("uploadedFile", element.files[i]);
	      	}
	      	var xhr = new XMLHttpRequest();

	      	xhr.upload.onprogress = function(evt){

			    	var percentComplete = (evt.loaded / evt.total)*100;
			    	//console.log(percentComplete);
				    $('#progressbar'+element.id).css( "width", percentComplete+"%");
	      	}

	      	xhr.onload = function() {
				    $('#progressbar'+element.id).css( "width", "0%");
  			};


	      	xhr.open("POST", "/dialog/api/sendfile");
	      	setTimeout(function(){
	      		xhr.send(fd);
	      	}, 0);
	    });
	}

	$scope.send = function(conv){//Отправка сообщений
		if(conv == undefined || conv.last_message==undefined || conv.last_message.text.length < 1 || conv.last_message.attachment<1)return;//Если сообщение пустое
		//for(var i = 0;)

		$http({
		  	url: '/dialog/api/sendmsg',
		  	method: "POST",
		  	data: {'conv': conv._id, 'text': conv.last_message.text},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				conv.last_message.text = "";
			}
		});
	};

	$scope.selectMsg = function(msg, conv){
		if(conv.selected == undefined) conv.selected = [];

		if(msg.isSelected){
			for(var i = 0; i<conv.selected.length; i++){
				if(msg._id == conv.selected[i]._id){
					conv.selected.splice(i, 1);
					break;
				}
			}
			msg.isSelected = false;
		}else{
			conv.selected.push(msg);
			msg.isSelected = true;
		}
	}

	$scope.deselect = function(conv){
		for(var i = 0; i<conv.selected.length; i++){
			conv.selected[i].isSelected = false;
		}
		conv.selected = [];
	}

	$scope.selectForward = function(conv, to){
		if(to.length == 0)return;

		var msg_ids = [];
		for(var i = 0; i<conv.selected.length; i++){
			conv.selected[i].isSelected = false;
			if(conv.selected[i].isForward){
				for(var q = 0; q<conv.selected[i].forward.length; q++){
					msg_ids.push(conv.selected[i].forward[q]._id);
				}
			}else{
				msg_ids.push(conv.selected[i]._id);
			}
		}

		$http({
		  	url: '/dialog/api/forward',
		  	method: "POST",
		  	data: {'messages': msg_ids, 'to': to[0]._id},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){

			}
		});
		conv.selected = [];
	}

	$scope.selectDelete = function(conv){
		var i = 0;

		var msg_ids = [];
		while(i < conv.messages.length){
			if(conv.messages[i].isSelected){
				msg_ids.push(conv.messages[i]._id);
			}
			i++;
		}

		$http({
		  	url: '/dialog/api/delete',
		  	method: "POST",
		  	data: {'messages': msg_ids, 'conv': conv._id},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){

			}
		});
		conv.selected = [];
	}

	$scope.showUser = function(user){//Shows user in search, when you click the message
		$scope.global_search = user.firstname + ' ' + user.lastname;
		$scope.slideSearch(1);
	}

	$scope.showActivity = function(evt, conv){
		$http({
		  	url: '/conversations/api/typing',
		  	method: "POST",
		  	data: {
		  		conv: conv._id,
		  		user: $scope.user._id
		  	},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//Успех
			}
		});

		// console.log(conv);
		// console.log(ind);
	};


	$scope.checkCtrlEnter = function(evt, conv){
		//console.log(evt);
		if (evt.ctrlKey && (evt.charCode == 13 || evt.charCode == 10) ){
			evt.preventDefault();
			$scope.send(conv);
			return true;
		}
		else
			return false;
	}

	$scope.setStatus = function(status){//Status of user
		$scope.user.status = status;
		Server.update({//
			action: 'update',
			offset: status,
			component: 'user'
		});
	}

	$scope.global_search = '';
	$scope.$watch("global_search", function(){//Searching
		if($scope.global_search.length<3){
			$scope.slideSearch(0);
			return $scope.global_search_result = [];
		}

		Server.post({
			action: 	'get',
			component: 	'user',
			msg_text: 	$scope.global_search
		}, function(data){
			//console.log(data);

			for(var i = 0; i< data.data.length; i++){
				if( (Date.parse(data.data[i].last_date)+5000) < Date.now() ) data.data[i].status = '';

				data.data[i].isContact = false;
				data.data[i].isMessage = false;
				//console.log(i);
				if(data.data[i]._id == $scope.user._id){
					data.data[i].isMessage = false;
					data.data[i].isContact = true;
				}else
				for(var q = 0; q< $scope.user.contacts.length; q++){//Проверка есть ли этот пользователь у нас в контактах

					if(data.data[i]._id == $scope.user.contacts[q].user._id){
						data.data[i].isContact = true;
						data.data[i].isMessage = ($scope.user.contacts[q].state == 2);
						break;
					}
				}

				if(!data.data[i].isContact && !data.data[i].preferences.isPrivate){
					data.data[i].isMessage = true;
				}

			}



			$scope.global_search_result = data.data;
			return data;
		});
	}, true);

	$scope.$watch("user.contacts", function(){//Contacts
		if($scope.user.contacts!=undefined){
			for(var i = 0; i< $scope.user.contacts.length; i++){
				if( (Date.parse($scope.user.contacts[i].last_date)+5000) < Date.now() )
				$scope.user.contacts[i].status = '';
			}
		}
	}, true);

	$scope.$watch("user.preferences", function(){//Следим за изменениями настроек пользователя

		$http({
		  	url: '/user/api/preferences/',
		  	method: "POST",
		  	data: {'preferences': $scope.user.preferences},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//Успех
			}
		});

	}, true);

	$scope.$watch("user.preferences.locale", function(){//Следим за изменениями настроек языка
		if($scope.user.preferences!=undefined){
			$translate.use($scope.user.preferences.locale);//Translation
		}
	}, true);

	$scope.addcontact = function(contact){
		contact.isContact = true;

		if(contact._id == $scope.user._id)return;//If you trying to add yourself to contacts
		for(var i = 0; i<$scope.user.contacts.length; i++){
			if($scope.user.contacts[i].user._id == contact._id)return;//If such contact already exists
		}

		$http({
		  	url: '/user/api/addcontact/',
		  	method: "POST",
		  	data: {'contact': contact._id, 'isPrivate': contact.preferences.isPrivate},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){

			//console.log(data);
			if(data.status == 'OK'){

				/*
				if(contact.preferences.isPrivate){
					$scope.user.contacts.push({user: contact, state: 0});
				}else{
					$scope.user.contacts.push({user: contact, state: 2});
				}*/

			}else{
			}

        });

	}

	$scope.setContact = function(contact, accept, index){
		contact.menu_hide = true;
		$scope.contactMenu(contact, "#rcontact-"+index);
		$http({
		  	url: '/user/api/setcontact/',
		  	method: "POST",
		  	data: {'contact': contact.user._id, 'isAccept': accept},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){

			//console.log(data);
			if(data.status == 'OK'){
				/*
				if(accept){
					contact.state = 2;
				}else{

					for(var q = 0; q< $scope.user.contacts.length; q++){
						if(contact._id == $scope.user.contacts[q]._id){
							$scope.user.contacts.splice(q, 1);
							break;
						}
					}

				}*/
			}
			contact.menu_hide = false;
        });
	}

	$scope.deleteContact = function(contact, index){
		//console.log(contact);
		//console.log(index);
		$http({
		  	url: '/user/api/deletecontact/',
		  	method: "POST",
		  	data: {'contact': contact._id },
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){

			//console.log(data);
			if(data.status == 'OK'){
				//$scope.user.contacts.splice(index, 1);
			}
        });
	}

	$scope.contactMenu = function(contact, index){
		if(contact.menu){
			$(index).animate({marginRight: '-' + 100 +'%'}, 450, 'easeInOutCirc', function(){
				contact.menu = !contact.menu;
			});
		}else{
			$(index).animate({marginRight: '-' + 0 +'%'}, 450, 'easeInOutCirc', function(){
				contact.menu = !contact.menu;
			});
		}
	}

	$scope.displayImage = function(url){
		$scope.attach_preview = url;
		$scope.is_attach_preview = true;
	}

	$scope.createDialogS = function(user){//Creates dialog with smb not in you contacts
		if(user == undefined)return;
		var members = [];
		members.push(user._id);
		$scope.sendConv(false, members);
	}

	$scope.createDialog = function(contact, index){//Create dialog with contact
		var members = [];
		if(contact.state == 1){
			$scope.acceptContact(contact, index);
		}
		if(contact.state == 2){
			members.push(contact.user._id);
		}
		$scope.sendConv(false, members);
	}

	$scope.createConv = function(emptyArg, users){//Создаем беседдду
		var members = [];
		for(var i = 0; i<users.length; i++){
			members.push(users[i]._id);
		}

		if(members.length == 1)$scope.sendConv(false, members);
		if(members.length>1)$scope.sendConv(true, members);
	}

	$scope.sendConv = function(isConv, members){//Создание диалога
		if(members<1)return;
		$http({
		  	url: '/conversation/api/create',
		  	method: "POST",
		  	data: {'isConv': isConv, 'members': members},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			//console.log(data.error);
			//console.log(getConv(data.conv, $scope.user._id));

			var i = binSearch($scope.convs, data.conv._id, -1, $scope.convs.length);

			if(i != $scope.convs.length && $scope.convs[i]._id == data.conv._id){
				$scope.openChatWindow($scope.convs[i]);
				//$scope.convs[i].active = true;
			}else {
				data.conv.notification = true;
            	$scope.convs.push(getConv(data.conv, $scope.user, $http));
				$scope.openChatWindow($scope.convs[$scope.convs.length - 1]);
			}
        });
	}

	$scope.slideConv = function(conv, x, y){//Slider in dialog window
		if(conv.screen_state == x){
			x = 0;
		}

		if(y == undefined){
			y = 0;
		}

		$('#container-'+conv._id).animate({marginLeft: '-' + x * 100 +'%'}, 300, 'easeInOutCirc', function(){
			switch(y){
				case 1:
					conv.add_mode = false;
				break;
				case 2:
					conv.attach_mode = false;
				break;
			}

			if(x < 2){
				conv.add_mode = false;
				conv.attach_mode = false;
			}

			conv.screen_state = x;
		});
	}

	$scope.slideContacts = function(x){//Slider in contacts
		$scope.contype = x;
		$('.contacts').animate({marginLeft: '-' + x * 100 +'%'}, 300, 'easeInOutCirc');
	}

	$scope.slideSearch = function(x){//Slider in contacts
		$scope.searchtype = x;
		$('.container').animate({marginLeft: '-' + x * 100 +'%'}, 300, 'easeInOutCirc');
	}

	$scope.openChatWindow = function(conv) { //Normal method
		conv.active = true;

		$timeout(function(){
			$("#window-" + conv._id).resizable({
				minHeight: 400,
				minWidth: 350
			});


			$("#window-" + conv._id).draggable({
			    containment:'div#right-true-area',
			    handle: "#head-" + conv._id,
			    cursor: 'move'
			});

			$("#convers-" + conv._id + "-scroll").mCustomScrollbar({
				scrollInertia:450, theme:"dark", 
				setTop: '10000px',
				callbacks:{
					onTotalScrollBack:function(){
						$scope.loadMoreMessages(conv);
					},
					onTotalScrollBackOffset: 50 // <= 61
				}
			});

			$("#settings-"+conv._id+"-scroll").mCustomScrollbar({scrollInertia:450, theme:"dark"});
		});
		
	}

	$scope.closeConv = function(conv){//Закрытие окна диалога/беседы
		conv.active = false;
		conv.screenState = 0;
	}

	$scope.deleteConv = function(conv){
		$http({
		  	url: '/conversations/api/delete',
		  	method: "POST",
		  	data: {'conv': conv._id, 'isConv': conv.isConv},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				for(var i = 0; i<$scope.convs.length; i++){
				if($scope.convs[i]._id == conv._id){
					$scope.convs.splice(i, 1);
					break;
				}
			}
			}
		});
	}

	$scope.changeConvProp = function(conv){
		if(noise)return;

		noise = true;
		$http({
		  	url: '/conversations/api/change',
		  	method: "POST",
		  	data: {'conv': conv._id, 'name': conv.name},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//
			}
			noise = false;
		});
	}

	$scope.setTheme = function (index){//Изменяем темы

		$http({
		  	url: '/user/api/setTheme/',
		  	method: "POST",
		  	data: {'theme': index},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				SetTheme(index);//Стандартный метод смены темы
			}
		});

	}

	$scope.getAddableUsers = function (conv, contacts){//Список пользователей которых можно добавить в конфу
		var cont = [];
		for(var q = 0; q<contacts.length; q++){

			var isAdd = true;

			if(conv!=null){
				for(var i = 0; i<conv.members.length; i++){
					if(contacts[q].state != 2 || conv.members[i]._id == contacts[q].user._id){
						isAdd = false;
					}
				}
			}
			

			if(isAdd){
				cont.push(contacts[q].user);
			}
		}
		return cont;
	}

	$scope.addMemberToConv = function(conv, contact){
		if(contact.length == 0)return;

		$http({
		  	url: '/conversations/api/addmember',
		  	method: "POST",
		  	data: {'conv': conv._id, 'username': contact[0].firstname + " " + contact[0].lastname, 'userID': contact[0]._id},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//
			}
		});
	}

	$scope.openChooseWindow = function(arr, multi, title, next, args){//Открываем окно выбора
		$scope.is_choose_window = true;
		$scope.tmpArr = arr;
		$scope.tmpSelect = [];
		$scope.tmpMulti = multi;
		$scope.tmpNext = next;
		$scope.tmpArgs = args;
		$scope.tmpTitle = title;

		console.log($scope.tmpArr);
	}

	$scope.chooseElement = function(element){//Выбираем элемент
		if(element.isSelect){
			if($scope.tmpMulti){
				for(var i = 0; i < $scope.tmpSelect.length; i++){
					if($scope.tmpSelect[i]._id == element._id){
						$scope.tmpSelect.splice(i, 1);
						break;
					}
				}
			}else{
				$scope.tmpSelect = [];
			}
			element.isSelect = false;
		}else{
			if($scope.tmpMulti){
				$scope.tmpSelect.push(element);
			}else{
				if($scope.tmpSelect.length == 0){
					$scope.tmpSelect.push(element);
				}else{
					$scope.tmpSelect[0].isSelect = false;
					$scope.tmpSelect[0] = element;
				}
			}
			element.isSelect = true;
		}
		
	}

	$scope.chooseDone = function(cancel){//Завершаем выбор
		if(cancel == undefined){
			$scope.tmpNext($scope.tmpArgs, $scope.tmpSelect);
		}

		$scope.is_choose_window = false;

		for(var i = 0; i < $scope.tmpSelect.length; i++){
			$scope.tmpSelect[i].isSelect = false;
		}

		$scope.tmpArr = [];
		$scope.tmpSelect = [];
		$scope.tmpMulti = false;
		$scope.tmpNext = null;
		$scope.tmpArgs = null;
		$scope.tmpSearch = "";
	}

	$scope.loadMoreMessages = function(_conv, cc){//Load messages
		if(_conv.isComplete)return;

		$http({
		  	url: '/conversations/api/loadMessages/',
		  	method: "POST",
		  	data: {'lastID': _conv.messages[0]._id, "convID": _conv._id},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			var scrID = "#msg" + _conv.messages[0]._id;
			var selector = "#convers-"+_conv.cc+"-scroll";

			if(data.status == 'OK'){
				
				_conv.messages 		= data.msg.concat(_conv.messages);
				_conv.isComplete 	= data.isComplete;
				_conv = getConv(_conv, $scope.user, $http);
				//setTimeout('$("#convers-"+_conv.cc+"-scroll").mCustomScrollbar("scrollTo", $("#convers-"+_conv.cc+"-scroll").find("#"+scrID))', 100);	
			}

			/*
			$timeout(function(){
				$(selector).mCustomScrollbar("scrollTo", scrID, {
					scrollInertia: 0
				});
			});*/
			//return $(selector).mCustomScrollbar('scrollTo', scrID);//Maintain position
		});
	}

	var isLoading = 2; //Проверка идет ли сейчас загрузка, что бы не наслаиваться
	var time = new Date();

	var timer = $interval(function (){//Refreshing страницы
		//console.log(time);
		if(isLoading < 2)return;
		isLoading = 0;

		///////////////////////


		$http({//Обновление онлайна и статусов контакта
		  	url: '/notification/api/contacts/',
		  	method: "POST",
		  	data: {'time': time},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){//online only

			if(data.status!='OK') {
				isLoading++; 
				return console.log('Errrrr'); 
			}

			var time_ms = data.server_time;

			//var upd = false;

			var d = 0; // Pointer to Data
			var u = 0; // Pointer to User


			while(d < data.contacts.length && u < $scope.user.contacts.length){ //O(n)
				if($scope.user.contacts[u]._id == data.contacts[d]._id){

					if((Date.parse(data.contacts[d].user.last_date)+15000) > time_ms){
						$scope.user.contacts[u].user.status = data.contacts[d].user.status;
					}else{
						$scope.user.contacts[u].user.status = '';
					}

					if(data.contacts[d].user == null ){///5555
					}else{
					}

					$scope.user.contacts[u].user.image = data.contacts[d].user.image;
					$scope.user.contacts[u].user.name = data.contacts[d].user.name;
					$scope.user.contacts[u].state = data.contacts[d].state;

					d++;
					u++;
					continue;
				}

				if($scope.user.contacts[u]._id < data.contacts[d]._id){
					$scope.user.contacts.splice(u, 1);
				}else{
					$scope.user.contacts.splice(u, 0, data.contacts[d]);
				}
			}

			while (u < $scope.user.contacts.length){
				$scope.user.contacts.splice(u, 1);
			}

			while (d < data.contacts.length){
				$scope.user.contacts.splice(u, 0, data.contacts[d]);
				d++;
			}


			isLoading++;
		});



		///////////////////////

		$http({
		  	url: '/notification/api/messages/',
		  	method: "POST",
		  	data: {'time': time},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			time 	= data.server_time;
			time_ms = Date.parse(time);
			data 	= data.data;
			for(var i = 0; i<data.length; i++){
				data[i] = getConv(data[i], $scope.user, $http, time_ms);

				//console.log(data[i]);

				var isNew = true;
				for(var i2 = 0; i2<$scope.convs.length; i2++){
					if($scope.convs[i2]._id == data[i]._id){
						//4 цикла 0_o  NB , да еще и не работают нормально
						isNew = false; //Проверяем новая конфа или обн старой

						var upd = false;
						while(data[i].messages.length>0){
							upd = false; // Обновление сообщения или новое сообщение

							var curID = binSearch($scope.convs[i2].messages, data[i].messages[0]._id, -1, $scope.convs[i2].messages.length);

							//console.log(curID);
							if(curID != $scope.convs[i2].messages.length && $scope.convs[i2].messages[curID]._id == data[i].messages[0]._id){//BinarySearch
								if(data[i].messages[0].visible){
									$scope.convs[i2].messages[curID] = data[i].messages[0];//Если такое сообщение уже есть, то обновляем его
								}else{
									$scope.convs[i2].messages.splice(curID,1); //Deleting invisible message
								}
							}else{
								if($scope.convs[i2].messages == undefined){
									$scope.convs[i2].messages = [];//If new dialog new messages not appears
								}

								$scope.convs[i2].messages.push(data[i].messages[0]);

								if($scope.user.preferences.chat_open == 1){
									$scope.openChatWindow($scope.convs[i2]);//Если пользователь включил соответствующий параметр
									//$scope.convs[i2].active = true; //Obsolette
								}

								if($scope.convs[i2].notification && data[i].messages[0].user._id != $scope.user._id && $scope.user.status != "DND"){//Если включены уведомления && это не твое сообщение && ты в не в статусе DND, то играется музычка)
									//console.log($scope.user.status);
									playSound('sounds/note.mp3');
								}

								if($scope.convs[i2].active){
									$timeout(function(){
										$("#convers-"+$scope.convs[i2].cc+"-scroll").mCustomScrollbar('scrollTo', 'last');//Адекватная прокрутка
									});
								}
							}

							/*
							for(var q = 0; q<$scope.convs[i2].messages.length; q++){
								if($scope.convs[i2].messages[q]._id == data[i].messages[0]._id){
									if(data[i].messages[0].visible){
										$scope.convs[i2].messages[q] = data[i].messages[0];//Если такое сообщение уже есть, то обновляем его
									}else{
										$scope.convs[i2].messages.splice(q,1); //Deleting invisible message
									}
									
									upd = true;
									break;
								}
							}

							if(!upd){

							}*/
							data[i].messages.splice(0, 1);


						}

						$scope.convs[i2].name 		= data[i].name;
						$scope.convs[i2].image 		= data[i].image;// + "?" + Date.now();
						$scope.convs[i2].status 	= data[i].status;
						$scope.convs[i2].members 	= data[i].members;//Массив людей для опрделения онлайна
						$scope.convs[i2].typing 	= data[i].typing;//Массив печатающих
						$scope.convs[i2].date 		= data[i].date;//Date diff
						$scope.convs[i2].update 	= data[i].update;//Date of last update


						//console.log($scope.convs[i2].messages);
						break;
					}
				}
				if(isNew){
					$scope.convs.push(data[i]);
					if($scope.user.preferences.chat_open == 1){
						$scope.openChatWindow($scope.convs[$scope.convs.length - 1]);//Открываем чат с новым сообщением
					}

					if($scope.user.status != "DND")playSound('sounds/note.mp3');
				}
				//console.log(i2);

			}

	        isLoading++;
            //$scope.active_convs.push(getConv(data.conv, $scope.user._id));
        });



	}, refresh);
}

function getConv(data, user, $http, time_ms){//Обработка конфы
	if(time_ms == undefined)time_ms = Date.now();

	if(!data.isConv){
		if(data.members.length>1){ //Если беседа заархивирована ничего не меняется
			var c_id = 0;
			if(data.members[0]._id == user._id){
				c_id = 1;
			}

			data.name 	= data.members[c_id].firstname + ' ' + data.members[c_id].lastname;
			data.image 	= data.members[c_id].image;

			//console.log(Date.parse(data[i].members[c_id].last_date) + '|' + Date.now());
			if( (Date.parse(data.members[c_id].last_date)+15000) > time_ms )
				data.status = data.members[c_id].status;
		}else{
			data.theme = user.preferences.theme;
			//console.log(data);
		}
	}else{
		if((!data.settings_mode || data.settings_mode == undefined) && (data.image == undefined||data.image.length<5)){//Если беседа редактируется, то ничего не меняется
			data.name 	= data.members[0].firstname + ', ' + data.members[1].firstname + '...';
			data.image 	= data.members[0].image;
		}

		data.theme 	= user.preferences.theme;
	}

	if(data.notification == undefined){
		data.notification = true;
	}

	if(data.typing!=null)
		for(var i = data.typing.length-1; i>-1; i--){//Печатающие
			//console.log(Date.parse(data.typing[i].last_date)+"||"+Date.now() + "||" + time_ms);
			if((Date.parse(data.typing[i].last_date)+10000)<time_ms || data.typing[i].user._id == user._id){
				data.typing.splice(i,1);
			}
		}

	if(data.messages!=null){//Если в беседе есть сообщения

		data.unread = 0;
		for(var i = 0;i<data.messages.length;i++){
			data.messages[i].diff = dateDifference(data.messages[i].date);

			if(data.messages[i].user._id == user._id){//Статус сообщения отправлено/получено
				if(!data.messages[i].readed){
					data.messages[i].state = 'send';
				}else{
					data.messages[i].state = 'read';
				}
			}else{
				if(!data.messages[i].readed){
					if(data.active){//Отчеты о прочтении
						$http({
						  	url: '/dialog/api/readMessage/',
						  	method: "POST",
						  	data: {'message': data.messages[i]._id},
						  	headers: { 'Content-Type': 'application/json' }
						}).success(function(res){
							//Nothing here
						});
						data.messages[i].readed = true;
					}
					data.unread++;
				}
			}
		}//Обработка дат в сообщениях

	}
	return data;
}


function binSearch(arr, key, l, r){
	if(1 >= r - l)
        return r;

	var m = Math.ceil((r + l)/2);

	if(arr[m]._id >= key){
		return binSearch(arr, key, l, m);
	}else{
		return binSearch(arr, key, m, r);
	}
}