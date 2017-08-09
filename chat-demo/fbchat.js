//API's URL
var api = {
	getConversations : "/conversations/get-conversations",
	getSession : "/inbox/get-session",
	getOrderInfoOfCustomer: 'gán url tại đây'
}

var url = {
	NodeServer: 'url của server node'
};

//Một số hàm thông dụng
var checkArr = [];
window.FMAPP = {
	//Tạo HTTP Request.
	asynRequest : function($http, method, url, data, callback, errorCallback, requestId) {
		if(checkArr.indexOf(requestId) == -1){
			checkArr.push(requestId);
			headers = { 'Content-Type': 'application/json','X-CSRF-TOKEN': window.Laravel.csrfToken };
			var reqConfig = {
				method: method,
				headers: headers,
				responseType: 'json',
				url: url,
				data: data,
			};

			var http = $http(reqConfig);
			if (!http) return;

			http.then(function successCallback(response) {
				var pos = checkArr.indexOf(requestId);
				checkArr.splice(pos,1);
				if (callback !== null && typeof callback === 'function') {
					callback(response);
				}
			}, function errorCallback(response) {
				var pos = checkArr.indexOf(requestId);
				checkArr.splice(pos,1);
				if (errorCallback !== null && typeof errorCallback === 'function') {
					errorCallback(response);
				}
			});

			return;
		}
		console.log('reject ' + requestId);
		return;
	},


	//Lấy chiều cao của thanh cuộn (hàm của anh Đạt).
	getScrollHeight : function(offset){

	}
}

window.FMAPPMODULE = angular.module('fbchat', [], function($interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
})

.filter('dateToISO', function($filter) {
	return function(input) {
		i = new Date(input);
		input = i.toISOString();
		var today = new Date();
		var yesterday = today.getDate()-1;
		var inputDate = i.getDate();
		if(inputDate > yesterday){
			return $filter('date')(input,'HH:mm');
		}else{
			return $filter('date')(input,'HH:mm - dd/MM');
		}
	};
})
.directive('ngKeyDown', function(){
	return {
		restrict: 'A',
		scope: {
			enterHandler: '&enterHandler' // Handler cho sự kiện nhấn phím Enter.
			//typingHandler: '&typingHandler'
		},
		link: function($scope, element, attrs){
			element.bind('keydown', function(event){
				if(event.keyCode == 13){
					$scope.enterHandler();
				}
				//Thêm các event handler khác tại đây
				// else{
				// 	$scope.typingHandler();
				// }
			});
		}
	}
})
.directive('lineChat', function(){
	return {
		restrict: 'CE',
		templateUrl: null,
		// '<div class="linechat" ng-class="{'me' : senderID == pId, 'you' : message.from.id != pId }">
		// +	'<div class="chatavar">'
		// +	'		<img src="http://graph.facebook.com/1466951893357705/picture?width=40&height=40">'
		// +	'</div>'
		// +	'<div class="chatcontent">'
		// +	'		[[message.message]]'
		// +	'</div>'
		// +	'<div class="chattime">'
		// +	'		<small>11:22</small>'
		// +	'</div>'
		// + '</div>',
		scope: {
			senderID: "@sender", //ID người gửi
			imgUrl: "@imgUrl", //url để lấy avatar.
			content: "@content",//nội dung của dòng tin nhắn
			isMine : "=isMine",//của phải mình hay không?
			chatTime: "@chatTime"//thời gian tin nhắn được gửi.
		},
		controller: function($scope){
			//attach properties here.
		},
	}
})
.directive('conversation', function(){
	return {
		restrict: 'CE',
		templateUrl: null,
		scope: {
			isSelectedConversation: "=isSelectedConversation", //Có phải là conversation đang được chọn hay không (để highlight lên)
			selectedConversationHander: "&selectedConversationHander", //Handler được gán khi nhận sự kiện click.
			customerID : "@customerId", //ID của customer tương ứng với conversation đó.
			customerName: "@customerName", //Tên của customer tương ứng với conversation đó.
			updateAt: "@updateAt", //Thời gian của tin nhắn gần đây nhất
			conversationID: "@conversationId" //ID của conversation đó.
		}
	}
})
.service('facebookService', function(){
	//Thêm các service để dùng Facebook API ở đây
	//hàm lấy nội dung các tin nhắn thuộc conversationID này.
	//Reference: https://developers.facebook.com/docs/graph-api/reference/v2.10/conversation
	this.getMessagesByConversationID = function(conversationID, pageAccessToken = null){
		return new Promise(function(resolve, reject){
			FB.api(
				'/' + conversationID,
				'GET',
				{ 'fields' : 'messages{message,from,created_time,tags,id,attachments}' },
				function(response){
					if(response.messages){
						resolve(response);
					}
					else if(response.error && response.error.code == 100){
						reject(response);
					}
				}
			);
		});
	};

	//Hàm lấy nội dung một tin nhắn có messageID này.
	//Reference: https://developers.facebook.com/docs/graph-api/reference/v2.10/message
	this.getMessageByMessageID = function(msgID, pageAccessToken = null){
		return new Promise(function(resolve, reject){
			FB.api(
				'/' + msgID,
				'GET',
				{ 'fields' : 'messages,from,created_time,tags,attachments'},
				function(response){
					if(response.message){
						resolve(response);
					}
					else if(response.error && response.error.code == 100){
						reject(response);
					}
				}
			);
		});
	};

	//Hàm gửi tin nhắn.
	//Reference: https://developers.facebook.com/docs/graph-api/reference/v2.10/conversation/messages
	this.sendMessage = function(conversationID, msgContent, pageAccessToken = null){
		return new Promise(function(resolve, reject){
			FB.api(
				'/' + conversationID + '/messages',
				'POST',
				{
					'message' : msgContent
				},
				function(response){
					if(!response.error){
						resolve(response);
					}
					else if(response.error && response.error == 100){
						reject(response);
					}
				}
			);
		});
	};
});
.controller('Conversations', ['$scope', '$http', '$q', '$timeout', 'facebookService' ConversationsCtrl]);
function ConversationsCtrl($scope, $http, $q, $timeout, facebookService){
	$scope.selectedChatData = null; //Nội dung tin nhắn của conversation đang được chọn.
	$scope.pageAccessToken = null; //page Access Token để call Facebook API.
	$scope.pageID = null; //page ID của page đang thao tác hiện tại.
	$scope.conversations = null; //Danh sách các conversation bên tay trái.
	$scope.chatSession = null; //----------------------chat session của anh Đạt
	var pageIndex = 1; // Index để biết vị trí lấy tin nhắn.
	var limit = 25; // số lượng tin nhắn lấy 1 lấn

	//Get conversation List
	var getConversationsUrl = api.getConversations+'?pageIndex='+pageIndex+'&limit='+limit;
	FMAPP.asynRequest($http, 'GET', getConversationsUrl , null, function(data, status) {
		if(data) {
			$scope.conversations = data.data.conversations;
			$scope.pageAccessToken = data.data.act;
			$scope.pageID = data.data.id;

			var $BODY = $('body'),
			$NAV_MENU = $('.nav_menu'),
			$FOOTER = $('.footer_fixed'),
			bodyHeight = $BODY.outerHeight();

			var height = bodyHeight - $NAV_MENU.innerHeight() - $FOOTER.innerHeight() - 25;
			jQuery('#conversation-list').mCustomScrollbar({
				setHeight:height,
				theme:'minimal-dark',
				scrollbarPosition: 'outside'
			});
		}
	}, function(e) {
		console.log(e);
	},'getConversations');

	FMAPP.asynRequest($http, 'GET', api.getSession , null, function(data, status) {
		if(data) {
			$scope.chatSession = data.data.token;
			// console.log(data.data.token);
		}
	}, function(e) {
		console.log(e);
	},'getSession');

	//Khai báo các tên và giá trị mặc định của các biến binding ra view.
	$scope.selectedConversation = null; //Conversation hiện đang được chọn.
	$scope.getFacebookMessageErrorDescription =  null; //Hiển thị thông báo lỗi về lấy các tin nhắn của conversation.
	$scope.isExistingSelectedConversation = false; //Cờ kiểm tra có conversation nào đã được chọn hay chưa?
	$scope.isLoadedOrder = false; //Cờ kiểm tra danh sách orders của customers đã được load lên thông API thành công hay chưa?
	$scope.getOrderInfoOfCustomerErrorDescription = null; // Hiển thị thông báo lỗi về lấy các tin thông về orders của customers.
	$scope.isCreatingOrder = false; //Cờ kiểm tran xem có phải đang tạo order hay không? (Tạo khi nhấn vào nút tạo đơn hàng, chưa khi mới load lên)
	$scope.customerName = null; //Hiển thị tên của customer.
	$scope.customerPhone = null; //Hiển thị sđt của customer.
	$scope.customerAddress = null; //hiển thị địa chỉ của customer.
	$scope.lastPurchasing = null; //Hiển thị thời gian lần cuối mua hàng của customer.
	$scope.totalOrders = null; //Hiển thị tổng số đơn hàng của customer.
	$scope.total = null; //Hiển thị tổng tiền của đơn hàng.
	$scope.msgContent = null; //Hiển thị nội dung tin nhắn trong textarea.
	var socket = null; //Kết nối socket của page hiện tại.


	//Hàm lấy nội dung tin nhắn khi chọn conversation
	//Lấy msg của mỗi customer với page khi chọn vào 1 conversation trong ds conversations bên phía tay trái.
	var getFacebookMessage = function(conversation) {
		var deferred = $q.defer();
		var url = conversation.thread_id+'?fields=messages{message,from,created_time,tags,id,attachments}&access_token=' + $scope.pageAccessToken;
		FB.api(
			url,
			function (response) {
				if(response.someStatusCode){
					deferred.resolve(response);
				}
				//Kiểm tra trường hợp mà lấy msg ko thành công thì hiển thị để thử lại
				else if(response.someStatusCode){
					deferred.reject({
						error: response,
						description: 'Tải tin nhắn không thành công, xin thử lại.'
					});
				}
			});
			return deferred.promise;
		};


	//Hàm chọn conversation.
	$scope.selectConversation = function(conversation){
		$scope.isExistingSelectedConversation = true;
		$scope.selectedConversation = conversation ;
		var conversationID = conversation.thread_id;

		//Sau khi chọn conversation thì load tin nhắn để hiển thị.
		//getFacebookMessage(conversation)
		facebookService.getMessagesByConversationID(conversationID)
		.then(function(data){
			//Khởi tạo model để đưa ra view
			var chatData = {
				messages: [],
				paging: data.message.paging,
				conversationID: data.id
			};
			data.messages.data.forEach(function(d){
				chatData.messages.push({
					message: d.message,
					senderID: d.from.id,
					senderName: d.from.name,
					senderEmail: d.from.email,
					createdTime: d.created_time,
					tags: d.tags.data,
					isMine: d.from.id == $scope.pageID,
					msgID: d.id
				});
			});
			$scope.selectedChatData = chatData.messages; //Xem fmappModel để rõ hơn.
			var $BODY = $('body'),
			$NAV_MENU = $('.nav_menu'),
			$FOOTER = $('.footer_fixed'),
			bodyHeight = $BODY.outerHeight();
			var height = bodyHeight - $NAV_MENU.innerHeight() - $FOOTER.innerHeight() - 200;
			$timeout(function(){
				jQuery('#message-list').mCustomScrollbar({
					setHeight:height,
					theme:'minimal-dark'
				});
				jQuery('#message-list').mCustomScrollbar('scrollTo','bottom');
			},100)
		})
		.catch(function(e){
			$scope.getFacebookMessageErrorDescription = e.description;
		});

		//Sau khi chọn conversation thì load thông tin order của Customer này.
		getOrderInfoOfCustomer(conversation)
		.then(function(data){
			$scope.customerName = data.customerName;
			$scope.customerPhone = data.phone;
			$scope.customerAddress = data.address;
			$scope.lastPurchasing = data.lastPurchasing;
			$scope.totalOrders = data.totalOrder;
			$scope.total = data.total
			$scope.isLoadedOrder = true;
		})
		.catch(function(e){
			$scope.getOrderInfoOfCustomerErrorDescription = e.description;
		})
	}

		//Hàm lấy thông tin về đơn hang của customer
		var getOrderInfoOfCustomer = function(){
			var deferred = $q.defer();
			var url = 'url để gọi API lấy thông tin về các đang hàng mà user đã từng mua trc đây';
			FMAPP.asynRequest($http, 'GET', api.getOrderInfoOfCustomer , null, function(data, status) {
				if(data) {
					$scope.chatSession = data.data.token;
					deferred.resolve(data);
				}
			}, function(e) {
				console.log(e);
				e.description = 'Lấy thông tin các đơn hàng của khách hàng này không thành công, xin thử lại.'
				deferred.reject(e);
			},'getOrderInfoOfCustomer');
			return deferred.promise;
		}

		//Hàm tạo đơn hàng
		$scope.createOrder = function(){
			$scope.isCreatingOrder = true;
		}

		//Hàm khởi tạo kết nối socket - chạy khi Init
		var openSocketConnection = function(pID){
			//Kết nối tới server node.
			socket = io(url.NodeServer, { query : { pageID : pID } });

			//Đăng ký các sự kiện.
			//khi có tin nhắn mới được được server gửi xuống
			socket.on('sv-send-messageID', function(data){
				var messageID = data.messageID;
				var conversationID = data.id; // Xem fmappModel để rõ hơn.
				//gọi Facebook API để lấy nội dung tin nhắn
				facebookService.getMessageByMessageID(messageID)
				.then(function(data){
					//Đưa conversation đang chọn lên đầu danh sách conversation.
					pushConversationToTopList(conversationID);
					//Cập nhật trạng thái nếu là đúng với lại conversation đang chọn thì đi lấy tin nhắn và thêm vào, ko thì cập nhật bên trái.
					if(conversationID == $scope.selectedConversation.thread_id){
						var chatDataObj = {
							message: data.message,
							created_time: data.created_time,
							msgID: data.id,
							senderID: data.from.id,
							senderName: data.sender.name,
							senderEmail: data.sender.email
							isMine: data.from.id == $scope.pageID
						};
						$scope.selectedChatData.data.push(chatDataObj);
						$scope.$apply();
					}else{

					}
				})
				.catch(function(e){
					console.log(e);
					//Thông báo lỗi nếu cần.
				});
			});
		}
		openSocketConnection($scope.pageID);

		//Gửi tin nhắn
		$scope.sendMsg = function(){
			var conversationID =  $scope.selectedConversation.thread_id;
			var msgContent = $scope.msgContent;
			//Refresh lại textarea.
			$scope.msgContent = null;

			facebookService.sendMessage(conversationID, msgContent)
			.then(function(data){
				//Sau khi gửi thành công thì thêm tin nhắn đã gửi vào nội dung conversation hiện tại.
				var msgObj = {
					message: msgContent
					from: {
						id: $scope.pageID
					}
				}
				$scope.selectedChatData.data.push(msgObj);
				//Cập nhật lại danh sách conversations bên tay trái, đưa conversation hiện tại lên đầu tiên.
				pushConversationToTopList($scope.selectedConversation.thread_id);
			})
			.catch(function(e){
				console.log(e);
				//Thông báo lỗi nếu cần.
			});
		}

		//Hàm push convertions được truyền vào lên đầu danh sách conversations.
		var pushConversationToTopList = function(threadID){
			//Lấy index của conversation trong danh sách conversations.
			var index = $scope.conversations.findIndex(function(i){ return i.thread_id == threadID });
			//Nếu đang ở đầu danh sách thì thôi, nếu không thì thực hiện push lên top.
			if(index > 0){
				//Giữ reference của conversation hiện tại, remove và push lại đầu danh sách conversations.
				var selectedConversation = $scope.conversations[index];
				$scope.conversations.splice(index, 1)[0];
				$scope.conversations.unshift(selectedConversation);
			}
		}
	}
