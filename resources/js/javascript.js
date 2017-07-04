angular.module('app', [])
.controller('homeController', function(){
  var socket = io.connect('http://localhost:9999');
});
