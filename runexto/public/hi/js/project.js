var refresh = 5000;//Время обновления страницы

angular.module('project', ['ngRoute','server']).
  config(function($routeProvider) {
    $routeProvider.
	    when('/', {controller:BodyCtrl, templateUrl:'temps/body.html'}).
	    //when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
	    //when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
	    otherwise({redirectTo:'/'});
});


function BodyCtrl($scope, $interval, Server, $http){

	$scope.themes = [8,1,2,3,4,5,6,7,9];



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
		return data;
	});



	$scope.convs = Server.query({//Загрузка последних бесед
		action: 'get',
        component: 'conversation',
		offset: 0
	}, function(data){
		console.log(data);
		for(var i = 0;i<data.length;i++){
			data[i] = getConv(data[i], $scope.user._id);//Обработка беседы
			data[i].notification = true;
		}

		return data;
	});

	/*$scope.active_convs = [];
	$scope.changeConv = function(conv){//Смена.добавление диалога

		for(var i = 0; i<$scope.convs.length;i++)
			if($scope.convs[i]._id == conv._id)
				$scope.convs[i].active = true; //Closing convs
		return;
		//console.log(Server);
		var pos = $scope.active_convs.length;//Длина массива
		for(var i = 0; i<pos; i++){
			if($scope.active_convs[i]._id == conv._id)return;
		}

		$scope.active_convs.push(conv);

		$scope.active_convs[pos].messages = Server.query({
			action: 	'messages',
        	component: 	'dialog',
			offset: 	0,
			convID: 	conv._id
		}, function(data){ 				//Обработка полученного массива
			console.log(data);
			for(var i = 0;i<data.length;i++){
				data[i].diff = dateDifference(data[i].date);
			}

			return data;
		});

	}*/ //OBSOLETE

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
	      	xhr.open("POST", "/dialog/api/sendfile");
	      	xhr.send(fd);
	        
	    });
	}

	$scope.send = function(conv, index){//Отправка сообщений
		if(conv == undefined && conv.last_message.attachment.text.length < 1 && conv.last_message.attachment<1)return;//Если сообщение пустое
		//for(var i = 0;)

		$http({
		  	url: '/dialog/api/sendmsg',
		  	method: "POST",
		  	data: {'conv': conv._id, 'text': conv.last_message.text},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			if(data.status == 'OK'){
				//Успех
			}
		});

	}

	$scope.setStatus = function(status){//Status of user
		Server.update({//
			action: 'update',
			offset: status,
			component: 'user'
		});
	}

	$scope.global_search = '';
	$scope.$watch("global_search", function(){//Searching
		if($scope.global_search.length<3)return $scope.global_search_result = [];

		Server.post({
			action: 	'get',
			component: 	'user',
			msg_text: 	$scope.global_search
		}, function(data){
			console.log(data);

			for(var i = 0; i< data.data.length; i++){
				if( (Date.parse(data.data[i].last_date)+60000*10) < Date.now() )
				data.data[i].status = '';
			}
			
			$scope.global_search_result = data.data;
			return data;
		});
	}, true);

	$scope.$watch("user.contacts", function(){//Contacts

		for(var i = 0; i< $scope.user.contacts.length; i++){
			if( (Date.parse($scope.user.contacts[i].last_date)+60000*10) < Date.now() )
			$scope.user.contacts[i].status = '';
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

	$scope.addcontact = function(contact){
		$http({
		  	url: '/user/api/addcontact/',
		  	method: "POST",
		  	data: {'contact': contact._id, 'isPrivate': contact.preferences.isPrivate},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){

			console.log(data);
			if(data.status == 'OK'){
				if($scope.user.contacts==null)$scope.user.contacts = [];

				if($scope.user.contacts.isPrivate)
					$scope.user.contacts.push({user: contact, accept: 0});
				else
					$scope.user.contacts.push({user: contact, accept: 2});
			}
        });
		
	}

	$scope.acceptContact = function(contact, index){
		$http({
		  	url: '/user/api/acceptcontact/',
		  	method: "POST",
		  	data: {'contact': contact.user._id},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){

			//console.log(data);
			if(data.status == 'OK'){
				$scope.user.contacts.splice(index, 1);
			}
        });
	}

	$scope.createDialog = function(contact, index){
		var members = [];
		if(contact.accept == 1){
			$scope.acceptContact(contact, index);
		}
		if(contact.accept == 2){
			members.push(contact.user._id);
		}
		$scope.sendConv(false, members);
	}

	$scope.createConv = function(){//Создаем беседдду
		var members = [];
		for(var i = 0; i<$scope.user.contacts.length; i++){
			if($scope.user.contacts[i].select) members.push($scope.user.contacts[i].user._id);
		}
		
		if(members.length>0)$scope.sendConv(true, members);
	}

	$scope.sendConv = function(isConv, members){//Создание диалога
		if(members<1)return;
		$http({
		  	url: '/conversation/api/create',
		  	method: "POST",
		  	data: {'isConv': isConv, 'members': members},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			console.log(data.conv);
			//console.log(getConv(data.conv, $scope.user._id));

			for(var i = 0; i<$scope.convs.length; i++){
				if($scope.convs[i]._id == data.conv._id){
					$scope.convs[i].active = true;
					break;
				}
			}

			if(i == $scope.convs.length){
				data.conv.active = true;
				data.conv.notification = true;
            	$scope.convs.push(getConv(data.conv, $scope.user._id));
			}
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

	var isLoading = 1; //Проверка идет ли сейчас загрузка, что бы не наслаиваться
	var time = new Date();

	var timer = $interval(function (){//Refreshing страницы

		if(isLoading < 1)return;
		isLoading = 0;

		///////////////////////

		

		///////////////////////

		$http({
		  	url: '/notification/api/messages/',
		  	method: "POST",
		  	data: {'time': time},
		  	headers: { 'Content-Type': 'application/json' }
		}).success(function(data){
			//console.log(data);
			for(var i = 0; i<data.length; i++){
				data[i] = getConv(data[i], $scope.user._id, $http);

				console.log(data[i]);

				var isNew = true;
				for(var i2 = 0; i2<$scope.convs.length; i2++){
					if($scope.convs[i2]._id == data[i]._id){
						//4 цикла 0_o  NB , да еще и не работают нормально
						isNew = false; //Проверяем новая конфа или обн старой

						var upd = false;
						while(data[i].messages.length>0){

							upd = false;
							for(var q = 0; q<$scope.convs[i2].messages.length; q++){
								if($scope.convs[i2].messages[q]._id == data[i].messages[0]._id){
									$scope.convs[i2].messages[q] = data[i].messages[0];//Если такое сообщение уже есть, то обновляем его

									upd = true;
									break;
								}
							}

							if(!upd){
								$scope.convs[i2].messages.push(data[i].messages[0]);

								if($scope.user.preferences.chat_open == 1)$scope.convs[i2].active = true;

								if($scope.convs[i2].notification && data[i].messages[0].user._id != $scope.user._id){
									playSound('sounds/note.mp3');
								}
							}
							data[i].messages.splice(0, 1);
						}


						/*for(var q = 0; q<$scope.convs[i2].messages.length; q++){// Обновляем или добавляем сообщения

							for(var q1 = 0; q1<data[i].messages.length; q1++){
								if($scope.convs[i2].messages[q]._id == data[i].messages[q1]._id){
									$scope.convs[i2].messages[q] = data[i].messages[q1];//Если такое сообщение уже есть, то обновляем его
								}else{
									$scope.convs[i2].messages.push(data[i].messages[q1]);//Если нет, то добавляем
								}
							}
						}*/

						$scope.convs[i2].date = data[i].date;
						$scope.convs[i2].update = data[i].update;
						//console.log($scope.convs[i2].messages);
						break;
					}
				}
				if(isNew){
					if($scope.user.preferences.chat_open == 1)data[i].active = true; //Открываем чат с новым сообщением
					$scope.convs.push(data[i]);
					playSound('sounds/note.mp3');
				}
				//console.log(i2);

			}

			//////////////////////////////
			var cc = 0;
			for(var i = 0; i<$scope.convs.length; i++){
				$scope.convs[i] = getConv($scope.convs[i], $scope.user._id, $http);
				if($scope.convs[i].active){
					$("#window-"+cc).draggable({
					    containment:'div#right-true-area',
					    handle: "#head-"+cc,
					    cursor: 'move'
					});

					$("#convers-"+cc+"-scroll").mCustomScrollbar({scrollInertia:450, theme:"dark"});

					cc++;
				}
			}
			//////////////////////////////

	        time = new Date();//Время обновления
	        isLoading++;
            //$scope.active_convs.push(getConv(data.conv, $scope.user._id));
        });

	}, refresh);
}

function getConv(data, userID, $http){//Обработка конфы
	if(!data.isConv){

		var c_id = 0;
		if(data.members[0]._id == userID){
			c_id = 1;
		}

		data.name = data.members[c_id].firstname + ' ' + data.members[c_id].lastname;
		data.image = data.members[c_id].image;

		if(data.members[c_id].preferences!=null)
			data.theme = data.members[c_id].preferences.theme;
		else data.theme = 8; // Убрать эту конструкцию перед продакшн

		//console.log(Date.parse(data[i].members[c_id].last_date) + '|' + Date.now());
		if( (Date.parse(data.members[c_id].last_date)+15000) > Date.now() )
			data.status = data.members[c_id].status;
	}else{
		data.name = data.members[0].firstname + ', ' + data.members[1].firstname + '...';
		data.image = data.members[0].image;
	}
	if(data.messages!=null){//Если в беседе есть сообщения

		data.unread = 0;
		for(var i = 0;i<data.messages.length;i++){
			data.messages[i].diff = dateDifference(data.messages[i].date);

			if(data.messages[i].user._id == userID){//Статус сообщения отправлено/получено
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