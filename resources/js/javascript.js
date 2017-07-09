angular.module('app', ['ngRoute', 'ngSanitize'])
.value('$$emoticonSet', {
  Yahoo: {
    ":))": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/21.gif',
    ":)": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/1.gif',
    ":D": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/4.gif',
    ";)": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/3.gif',
    "=))": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/24.gif',
    ":P": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/10.gif',
    ":-bd": 'http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/113.gif'
  },
  Facebook:{
    ":v": 'url',
    ";)": 'url'
  }
})
.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'resources/template/home.ejs',
    controller : 'homeController'
  })
  // .when('/home',{
  //   templateUrl: 'resources/template/home.ejs',
  //   controller : 'homeController'
  // })
  .when('/profile', {
    templateUrl: 'resources/template/profile.ejs',
    controller: 'profileController'
  })
  .when('/chat', {
    templateUrl: 'resources/template/chat.ejs',
    controller: 'chatController'
  })
  .when('/contact', {
    templateUrl: 'resources/template/contact.ejs',
    controller: 'contactController'
  })
  .when('/battle', {
    templateUrl: 'resources/template/battle.ejs',
    controller: 'battleController'
  })
  .otherwise({
      redirectTo: '/home'
  });
  // $locationProvider
  // .html5Mode({ enabled: true, requireBase: false });
  $locationProvider
  .hashPrefix('');

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
  };
})
.directive('userOnline', function(){
  return {
    restrict: 'E',
    templateUrl: 'resources/template/useronline.ejs',
    scope: {
      imgUrl: "@imgUrl",
      userName: "@userName",
    },
    controller: function($scope){
      //attach properties here
    }
  }
})
.directive('availableRoom', function(){
  return {
    restrict: 'E',
    templateUrl: 'resources/template/availableroom.ejs',
    scope: {
      roomID: "@roomId",
      roomName: "@roomName",
      roomMode: "@roomMode",
      owner: "@owner",
      totalUsers: "@totalUser"
    },
    controller: function($scope){
      //attach properties here.
    }
  }
})
.directive('message', function($compile, $timeout){
  return {
    restrict: 'CE',
    templateUrl: 'resources/template/message.ejs',
    scope: {
      senderName: "@sender",
      imgUrl: "@imgUrl",
      content: "@content",
      isLeftSide : "=isLeftSide",
      isMerged: "=isMerged"
    },
    controller: function($scope){
      //attach properties here.
    },
  }
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
.factory('$replaceTextToEmotions', function($$emoticonSet){
  var replaceTextToEmotions = function(plainText, emoticonVendor){
    for(iconShortcut in $$emoticonSet[emoticonVendor]){
        imgElement = '<img src="' + $$emoticonSet[emoticonVendor][iconShortcut] + '"/>';
        plainText = plainText.replaceAll(iconShortcut, imgElement);
    }
    return plainText;
  };
  return replaceTextToEmotions;
})
.factory('$DB', function(){
  var publicAPI = {
  }
  return publicAPI;
})
.filter('resizeName', function(){
  return function(value, maxLength){
    if(value.length > maxLength){
      value = value.slice(0, maxLength - 3) + "...";
    }
    return value;
  }
})
.filter('emoticons', function($replaceTextToEmotions){
  return function(plainText, emoticonVendor){
    return $replaceTextToEmotions(plainText, emoticonVendor);
  }
})
.controller('homeController',['$scope','$rootScope','$location' ,function($scope, $rootScope, $location){

  window.fbAsyncInit = function() {
		FB.init({
			appId            : '1379571228747543',
			autoLogAppEvents : true,
			xfbml            : true,
			version          : 'v2.9',
			cookie			 : true
		});
		FB.AppEvents.logPageView();
	};

	//Get Facebook's SDK for Javascript
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/vi_VN/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));


  $scope.userID = null;
  $scope.accessToken = null;
  $scope.userName = null;
  $scope.imgUrl = null;
  $scope.userIP = null;
  $scope.userLocation = null;

  var getImage = function(){
    return new Promise(function(resolve, reject){
      FB.api('/'+$scope.userID, 'GET',
        {"fields":"name,picture.width(150).height(150)"},
        function(data) {
          if(data.picture){
            resolve({ name: data.name, url: data.picture.data.url });
          }
          else{
            reject({ error: 'Get Image Failed!', errorCode: 500 });
          }
        }
      );
    });
  };

  var getIP = function(){
    return new Promise(function(resolve, reject){
      $.getJSON('http://freegeoip.net/json/?callback=?', function(data){
        if(data.ip){
          resolve({ ip: data.ip, city: data.city, country_name: data.country });
        }
        else{
          reject({ error: 'Get IP Failed!', errorCode: 500 });
        }
      });
    });
  }

  window.checkLoginState = function(){
    FB.getLoginStatus(function(data){
      if(data.status === 'connected'){
        //console.log('You have logged');
        $scope.userID = data.authResponse.userID;
        $scope.accessToken = data.authResponse.accessToken;
        window.localStorage.setItem('userID', $scope.userID);
        window.localStorage.setItem('accessToken',{ userName: $scope.accessToken });
        Promise.all([
          getImage(),
          //getIP()
        ])
        .then(function(data){
          if(!data[0].errorCode){ //&& !data[1].errorCode){
            $scope.userName = data[0].name;
            $scope.imgUrl = data[0].url;
            //$scope.userIP = data[1].ip;
            //$scope.userLocation = data[1].city + '_' + data[1].country;
            window.localStorage.setItem('userName', $scope.userName);
            window.localStorage.setItem('imgUrl', $scope.imgUrl);
            //window.localStorage.setItem('ip', $scope.userIP);
            //window.localStorage.setItem('userLocation', $scope.userLocation);
            $rootScope.$broadcast('userName', { userName: $scope.userName, imgUrl: $scope.imgUrl });
            $location.url('/chat');
          }else{
            data.forEach(function(r){ if(r.errorCode) console.log(r.error); });
          }
        })

      }
      else{
        //console.log('Your havent logged yet');
        if(window.localStorage.getItem('userID')
        || window.localStorage.getItem('accessToken')
        || window.localStorage.getItem('userName')
        || window.localStorage.getItem('imgUrl')
        || window.localStorage.getItem('ip')){
          window.localStorage.clear();
        }
      }
    })
  }

}])
.controller('contactController', ['$scope', function($scope){

}])
.controller('accountController', ['$scope', function($scope){
  $scope.userName = 'Chưa đăng nhập.';
  $scope.isLoggedin = false;
  $scope.$on('userName', function(event, args){
    $scope.userName = 'Chào, ' + args.userName;
    $scope.imgUrl = args.imgUrl;
    $scope.isLoggedin = true;
    $scope.$apply();
  });
}])
.controller('chatController', ['$scope', function($scope){
  $scope.$on('userName', function(event, args){
  });

  $scope.userList = [
    { userName: 'Người dùng 1', imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png'},
    { userName: 'Người dùng 2', imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png'},
    { userName: 'Người dùng 3', imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png'},
  ];

  $scope.roomList = [
    { roomName: 'One two three', roomMode : 1, owner : 'Người dùng 1', totalUser : 3},
    { roomName: 'One two three', roomMode : 2, owner : 'Người dùng 1', totalUser : 2}
  ];

  $scope.messageList = [];
  //   { isLeftSide: true, sender: 'Người dùng 1', content: 'Đây là tin nhắn có nội dung dài để kiểm tra xem có bị lỗi CSS hay không', imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png'},
  //   { isLeftSide: false, sender: 'Người dùng 1', content: 'Xin chào', imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png'},
  // ];

  $scope.emoticonVendor = 'Yahoo';
  $scope.messageContent = null;
  $scope.isTyping = false;
  $scope.thisUser = null;
  //Socket connect to Server
  var userID = Math.floor(Math.random()*10000);
  var socket = io.connect('http://localhost:9999',{ query : "userID="+ userID });

  socket.on('server-message-content', function(data){
    var lastItem = getLastItem();
    var message = {
      senderID: data.senderID,
      isLeftSide: data.senderID != userID,
      sender: data.senderID != userID ? 'Người dùng 2' : 'Người dùng 1',
      content: data.content,
      imgUrl: 'http://jnvtsoaa-dev.hol.es/images/user-icon-male.png',
      isMerged: lastItem ? (lastItem.senderID == data.senderID ? true : false) : false
    };
    $scope.messageList.push(message);
    $scope.$apply();
    //Scroll to bottom
    $('.scrollbar2').scrollTop($('.scrollbar2')[0].scrollHeight);
  })
  .on('server-is-typing', function(data){
    $scope.isTyping = true;
    $scope.$apply();
  })
  .on('server-typing-stopped', function(data){
    $scope.isTyping = false;
    $scope.$apply();
  });

  $scope.sendMessage = function(){
    if(validateMessage()){
      socket.emit('client-message-content', {
        senderID : userID,
        content: $scope.messageContent
      });
      $scope.messageContent = null;
      $scope.isTyping = false;
      $scope.$apply();
    }
  };

  $scope.sendIsTypingSignal = function(){
    if(validateMessage()){
      socket.emit('client-is-typing', {
        senderID : userID
      });
    }else{
      socket.emit('client-typing-stopped', {
        senderID : userID
      });
    }
  };

  var getLastItem = function(){
    if($scope.messageList.length > 0){
      return $scope.messageList[$scope.messageList.length-1];
    }else{
      return null;
    }
  };

  var validateMessage = function(){
    //Check empty message.
    if($scope.messageContent == null || $scope.messageContent == '') return false;
    return true;
  }

}])
.controller('profileController', ['$scope', function($scope){
  $scope.$on('userName', function(event, args){

  });
}])
.controller('contactController', ['$scope', function($scope){
  $scope.$on('userName', function(event, args){

  });
}])
.controller('battleController', ['$scope', function($scope){
  $scope.$on('userName', function(event, args){

  });
}]);


$(document).ready(function(){
  var bgList = [
    'http://www.1366x768.net/large/201112/3382.jpg',
    //'http://file.vforum.vn/hinh/2016/04/texure-hieu-ung-bokeh-dep-cho-photoshop-3.jpg'
    //'http://file.vforum.vn/hinh/2015/05/hinh-nen-powerpoint-don-gian-26.jpg',
    //'http://file.vforum.vn/hinh/2015/11/vforum.vn-hinh-nen-xanh-dep-cho-may-tinh-4.jpg',
    //'http://wallpapercave.com/wp/xL6SXfZ.jpg',
    //'http://file.vforum.vn/hinh/2016/04/texure-hieu-ung-bokeh-dep-cho-photoshop-15.jpg'
  ];
  var count= 0;
  window.setInterval(function(){
      if(count == bgList.length - 1){
        count = 0;
      }else{
        count++;
      }
      $('body').css('background-image', "url('"+bgList[count]+"')");
  }, 5000);
  // $('.li-user').hover(function(){
  //   $('.user-avatar').css({"-webkit-transform":"rotate(360deg)","transform":"rotate(360deg)"});
  // }, function(){
  //});
});
