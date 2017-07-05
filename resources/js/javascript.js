angular.module('app', ['ngRoute'])
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
})
.controller('homeController',['$scope','$rootScope','$location' ,function($scope, $rootScope, $location){
  //Socket connect to Server
  var socket = io.connect('http://localhost:9999',{ query : "userID=123"});
  socket.on('send', function(data){
    console.log(socket);
    console.log(data);
  });

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
          getIP()
        ])
        .then(function(data){
          if(!data[0].errorCode && !data[1].errorCode){
            $scope.userName = data[0].name;
            $scope.imgUrl = data[0].url;
            $scope.userIP = data[1].ip;
            $scope.userLocation = data[1].city + '_' + data[1].country;
            window.localStorage.setItem('userName', $scope.userName);
            window.localStorage.setItem('imgUrl', $scope.imgUrl);
            window.localStorage.setItem('ip', $scope.userIP);
            window.localStorage.setItem('userLocation', $scope.userLocation);
            $rootScope.$broadcast('userName', { userName: $scope.userName });
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
    $scope.isLoggedin = true;
    $scope.$apply();
  });
}])
.controller('chatController', ['$scope', function($scope){

}])
.controller('profileController', ['$scope', function($scope){

}])
.controller('contactController', ['$scope', function($scope){

}])
.controller('battleController', ['$scope', function($scope){

}]);
