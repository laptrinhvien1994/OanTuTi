angular.module('app', ['ngRoute'])
.config(function($routeProvider){
  $routeProvider
  .when('/',{
    templateUrl: 'resources/home.html',
    controller : 'homeController'
  })
  .when('/profile', {
    templateUrl: 'resources/profile.html',
    controller: 'profileController'
  })
  .when('/chat', {
    templateUrl: 'resources/chat.html',
    controller: 'chatController'
  })
  .when('/contact', {
    templateUrl: 'resources/contact.html',
    controller: 'contactController'
  })
  .when('/battle', {
    templateUrl: 'resources/battle.html',
    controller: 'battleController'
  });
})
.controller('homeController',['$scope' ,function($scope, $route){
  //Socket connect to Server
  //var socket = io.connect('http://localhost:9999');




  //Get Facebook SDK
  window.fbAsyncInit = function() {
		FB.init({
			appId            : '1379571228747543',
			autoLogAppEvents : true,
			xfbml            : true,
			version          : 'v2.9',
			cookie			 : true
		});
		FB.AppEvents.logPageView();

		//Subscribe Login State Event
		FB.Event.subscribe("auth.login", function(response){
		});
	};

	//Get Facebook's SDK for Javascript
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/vi_VN/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));


	$scope.logout = function(){
		if(FB != undefined){
			FB.getLoginStatus(function(response){
				if(response.status == 'connected'){
					FB.logout(function(data){
						console.log('Log out');
					});
				}
				else{
					console.log('you are already log out');
				}
			}, true);
		}
	};

	$scope.login = function(){
		if(FB != undefined){
			FB.getLoginStatus(function(response) {
				if(response.status != 'connected'){
					FB.login(function(response){
						if (response.authResponse) {
							FB.api('/me', function(response) {
								console.log('Response after login successfully', response);
								$scope.fbID = response.id;
							});
						} else {
							console.log('cancelled login or not fully authorize.');
						}
					}, //{ auth_type: 'reauthenticate'},
						{
							scope: 'email' ,
							return_scopes: true,
							auth_type: 'rerequest'
						}
					);
				}
				else{
					console.log('Is Logging');
				}
			}, true);
		}
	};


}]);
