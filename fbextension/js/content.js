window.addEventListener("load", function() {
	// Tạo nút SUNO POS
	var wdiv = document.createElement("div");
	wdiv.id = 'wp-exlayout';
	$('body').append(wdiv);
	var div = document.createElement("div");
	div.id = 'exlayout';
	$(wdiv).append(div);

	// Bắt đầu APP Angular
	//var app = angular.module('SunoApp', []);
	//initModule();
	var html = document.querySelector('#exlayout');
	html.setAttribute('ng-app', '');
	window.Suno = new Object();
	Suno.AuthUrl = 'https://auth.suno.vn/api/';
	Suno.ApiUrl  = 'https://api.suno.vn/api/';
	Suno.Api = {
      login :           Suno.AuthUrl+'auth/hugate?format=json&',
      getSession :      Suno.AuthUrl+'provider/GetUserSession?format=json&',
      bootloader :      Suno.ApiUrl+'bootloader?format=json',
      authBootloader :  Suno.AuthUrl+'bootloader?format=json',
      store:            Suno.ApiUrl+'stores?format=json',
      search :          Suno.ApiUrl+'productitem/search?limit=30&pageIndex=1&format=json&keyword=',
      customers:        Suno.ApiUrl+'customers?limit=30&pageIndex=1&format=json&keyword=',
      serial:           Suno.ApiUrl+'inventory/serialnumbers?format=json',
      submitOrder:      Suno.ApiUrl+'sale/complete?format=json',
      addCustomer:      Suno.ApiUrl+'customer/create?format=json',
      printTemplate:    Suno.ApiUrl+'printtemplate/get',
      receipt :         Suno.ApiUrl+'receipt/create',
      storeReport :     Suno.ApiUrl+'sale/storeReport?',
      auditTrailRecord : Suno.ApiUrl+'audit/create',
      getOrderInfo :    Suno.ApiUrl + 'sale/order?saleOrderId='
    };
    Suno.checkArr = [];

	Suno.asynRequest =  function($http, method, url, data, token, callback, errorCallback, requestId) {
		var checkArr = Suno.checkArr;
		if(checkArr.indexOf(requestId) == -1){
			checkArr.push(requestId);
			if(token != false){
	          headers = { 'Content-Type': 'application/json','Authorization': 'Bearer '+ token };
	          var reqConfig = {
	              method: method,
	              headers: headers,
	              responseType: 'json',
	              url: url,
	              data: data,
	          };
	        }else{
	            var reqConfig = {
	              method: method,
	              responseType: 'json',
	              url: url,
	              data: data,
	          };
	        }


			var http = $http(reqConfig);
			if (!http) return;

			http.then(function (response) {
				var pos = checkArr.indexOf(requestId);
				checkArr.splice(pos,1);
				if (callback !== null && typeof callback === 'function') {
					callback(response);
				}
			}, function (response) {
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
	};

	$('#exlayout').load(chrome.extension.getURL("main.html"),function(htmlResponse){
		angular.bootstrap(html, ['SunoApp'], []);
	});

	
});