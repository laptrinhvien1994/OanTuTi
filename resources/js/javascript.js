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
.controller('homeController',['$scope' ,function($scope){
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

  window.checkLoginState = function(){
    FB.getLoginStatus(function(data){
      if(data.status === 'connected'){
        console.log('You have logged');
      }
      else{
        console.log('Your havent logged yet');
      }
    })
  }

}])
.controller('contactController', ['$scope', function($scope){

}]);
