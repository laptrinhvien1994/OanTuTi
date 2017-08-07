var checkArr = [];
var api = {
	getConversations : "/conversations/get-conversations",
	getSession : "/inbox/get-session",
	getOrderInfoOfCustomer: 'gán url tại đây'
}

angular.module('fbchat', [], function($interpolateProvider) {
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
      enterHandler: '&enterHandler',
      typingHandler: '&typingHandler'
    },
    link: function($scope, element, attrs){
      //console.log(element);
      element.bind('keydown', function(event){
        if(event.keyCode == 13){
          $scope.enterHandler();
        }
        else{
          $scope.typingHandler();
        }
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
      senderID: "@sender",
      imgUrl: "@imgUrl",
      content: "@content",
      isLeftSide : "=isLeftSide",
			chatTime: "@chatTime"
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
			isSelectedConversation: "=isSelectedConversation",
			selectedConversationHander: "&selectedConversationHander",
			customerID : "@customerId",
			customerName: "@customerName",
			updateAt: "@updateAt"
		}
	}
})
.service('facebookService', function(){
	//Thêm các service để dùng Facebook API ở đây
})
.controller('Conversations', ConversationsCtrl);

function asynRequest($http, method, url, data, callback, errorCallback, requestId) {
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
}

function getScrollHeight(offset){

}

function ConversationsCtrl($scope,$http,$q,$timeout){
    $scope.selectedChatData = null;
    var pageIndex = 1;
    var limit = 25;
		debugger;

		//Get conversation List
		asynRequest($http, 'GET', api.getConversations+'?pageIndex='+pageIndex+'&limit='+limit , null, function(data, status) {
        if(data) {
            $scope.conversations = data.data.conversations;
            $scope.ptoken = data.data.act;
            $scope.pId = data.data.id;

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

    asynRequest($http, 'GET', api.getSession , null, function(data, status) {
        if(data) {
          $scope.chatSession = data.data.token;
          // console.log(data.data.token);
        }
      }, function(e) {
        console.log(e);
     },'getSession');

 	 	//Khai báo các tên và giá trị mặc định của các biến binding ra view.
		$scope.selectedConversation = null;
		$scope.getFacebookMessageErrorDescription =  null;
		$scope.isExistingSelectedConversation = false;
		$scope.isLoadedOrder = false;
		$scope.getOrderInfoOfCustomerErrorDescription = null;
		$scope.isCreatingOrder = false;

		//Hàm chọn conversation.
    $scope.selectConversation = function(conversation){
				$scope.isExistingSelectedConversation = true;
        $scope.selectedConversation = conversation ;

				//Sau khi chọn conversation thì load tin nhắn để hiển thị.
        getFacebookMessage(conversation)
				.then(function(rs){
            $scope.selectedChatData = rs.messages;
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

		//Hàm lấy nội dung tin nhắn khi chọn conversation
		//Lấy msg của mỗi user với page khi chọn vào 1 user trong ds user bên phía tay trái.
    var getFacebookMessage = function(c) {
        var deferred = $q.defer();
        var url = c.thread_id+'?fields=messages{message,from,created_time,tags,id,attachments}&access_token=';
        FB.api(
            url+$scope.ptoken,
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

		//Hàm lấy thông tin về đơn hang của customer
		var getOrderInfoOfCustomer = function(){
			var deferred = $q.defer();
			var url = 'url để gọi API lấy thông tin về các đang hàng mà user dã từng mua trc đây';
			asynRequest($http, 'GET', api.getOrderInfoOfCustomer , null, function(data, status) {
	        if(data) {
	          $scope.chatSession = data.data.token;
	         	deferred.resolve(data);
	        }
	      }, function(e) {
	        console.log(e);
					e.description = 'Lấy thông tin các đơn hàng của khách hàng này không thành công, xin thử lại.'
					deferred.reject(e);
	     },'getOrderInfoOfCustomer');
		}

		//Hàm tạo đơn hàng
		$scope.createOrder = function(){
				$scope.isCreatingOrder = true;
		}

		var socket = null;
		//Hàm khởi tạo kết nối socket - chạy khi Init
		var openSocketConnection = function(pID){
			//Kết nối tới server node.
			socket = io.io.('URL of server node', {query: { pageID: pID }});

			//Đăng ký các sự kiện.
			//khi có tin nhắn mới được được server gửi xuống
	    socket.on('sv-send-threadID', function(data){
	      var conversationID = data.threadID;
	      var url = "/" + conversationID + "/messages";
				//gọi Facebook API để lấy nội dung tin nhắn
	      FB.api(url, function(msg){

	      });

				//Đưa conversation đang chọn lên đầu danh sách conversation.
				//Cập nhật trạng thái nếu là đúng với lại conversation đang chọn thì đi lấy tin nhắn và thêm vào, ko thì cập nhật bên trái.
	    });
		}
		openSocketConnection($scope.pID);

		$scope.msgContent = null;
		//Gửi tin nhắn
		$scope.sendMsg = function(){
			var url =  "/" + $scope.selectedConversation.conversationID + "/messages";
			var msgContent = $scope.msgContent;
			//Gửi xong thì refresh lại textarea.
			$scope.msgContent = null;
			FB.api(
				url,
				'POST',
				{
					'message': msgContent;
				},
				function(response){
					if (response && !response.error) {
						//Sau khi gửi thành công thì thêm tin nhắn đã gửi vào nội dung conversation hiện tại.
						var msgObj = {
							message: msgContentm
							from: {
								id: $scope.pId
							}
						}
						$scope.selectedChatData.data.push(msgObj);
						//Cập nhật lại danh sách conversations bên tay trái, đưa conversation hiện tại lên đầu tiên.
						var index = $scope.conversations.findIndex(function(i){ return i.customer_id == $scope.selectedConversation.customer_id });
						var selectedConversation = $scope.conversations[index];
						$scope.conversations.splice(index, 1);
						$scope.conversations.push(selectedConversation);
					}
				}
			);
		}
}
