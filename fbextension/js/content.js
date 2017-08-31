window.addEventListener("load", function() {
	// Tạo nút SUNO POS
	var wdiv = document.createElement("div");
	wdiv.id = 'wp-exlayout';
	$('body').append(wdiv);
	var div = document.createElement("div");
	div.id = 'exlayout';
	$(wdiv).append(div);

	// Bắt đầu APP Angular
	var app = angular.module('SunoApp', []);
	var html = document.querySelector('#exlayout');
	html.setAttribute('ng-app', '');
	var AuthUrl = 'https://auth.suno.vn/api/';
	var ApiUrl  = 'https://api.suno.vn/api/'; 
	var Api = {
      login :           AuthUrl+'auth/hugate?format=json&',
      getSession :      AuthUrl+'provider/GetUserSession?format=json&',
      bootloader :      ApiUrl+'bootloader?format=json',
      authBootloader :  AuthUrl+'bootloader?format=json',
      store:            ApiUrl+'stores?format=json',
      search :          ApiUrl+'productitem/search?limit=30&pageIndex=1&format=json&keyword=',
      customers:        ApiUrl+'customers?limit=30&pageIndex=1&format=json&keyword=',
      serial:           ApiUrl+'inventory/serialnumbers?format=json',
      submitOrder:      ApiUrl+'sale/complete?format=json',
      addCustomer:      ApiUrl+'customer/create?format=json',
      printTemplate:    ApiUrl+'printtemplate/get',
      receipt :         ApiUrl+'receipt/create',
      storeReport :     ApiUrl+'sale/storeReport?',
      auditTrailRecord : ApiUrl+'audit/create',
      getOrderInfo :    ApiUrl + 'sale/order?saleOrderId='
    };
    var checkArr = [];

	function asynRequest ($http, method, url, data, token, callback, errorCallback, requestId) {
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

	$('#exlayout').load(chrome.extension.getURL("main.html"),function(){
		var app = angular.module('SunoApp', []);
		app.controller('MainController', function ($scope,$http,$q,$timeout){

			$scope.userSession = JSON.parse(localStorage.getItem('sn_ac_tk'));
			$scope.stores = JSON.parse(localStorage.getItem('sn_store_list'));
			$scope.setting = JSON.parse(localStorage.getItem('sn_bootloader'));

			if($scope.stores && $scope.stores.stores.length > 0){
				$scope.currentStore = $scope.stores.stores[0];
			}
			// Helper function
			$scope.isOpening = false;
			$scope.openPanel = function(){
				$scope.panel = {'display':'block'};
				$scope.isOpening = true;
			}
			$scope.closePanel = function(){
				$scope.panel = {'display':'none'};
				$scope.isOpening = false;
			}

			$scope.isShowMenu = false;
			$scope.isOpenDiscountPopOver = false;

			$scope.showHideMenu = function(){
				$scope.isShowMenu = !$scope.isShowMenu;
			}

			$scope.focusInput = function(){
				if($scope.isShowMenu){
					$scope.isShowMenu = false;	
				} 
			}

			$scope.removeItem = function(item){
				console.log(item);
			}

			//Prevent negative or null value in quantity textbox of item.
			$scope.quantityChange = function(item){
				if(item.quantity == null || item.quantity == 'undefined' || item.quantity == 0 || item.quantity < 1){
					item.quantity = 1;
				}
			}

			$scope.itemHover = function($event){
				$event.currentTarget.childNodes[9].style.backgroundImage = "url('https://www.facebook.com/rsrc.php/v3/yx/r/ogYrclupeJV.png')";
			}

			$scope.itemLeave = function($event){
				$event.currentTarget.childNodes[9].style.backgroundImage = "none";
			}

			$scope.showHideDiscountPopOver = function(item){
				$scope.isOpenDiscountPopOver = !$scope.isOpenDiscountPopOver;
				//Nếu mà hiện thì mới tính position.
				if($scope.isOpenDiscountPopOver){
					$timeout(function(){
					console.log($('div#popover2').offset());
					console.log($('#id_'+item.itemId).offset());
					var popOverPosition = $('div#popover2').offset();
					var giftButtonPosition = $('#id_'+item.itemId).offset();
					var topOffset = giftButtonPosition.top + 15;
					var leftOffset = giftButtonPosition.left - 94;
					$('div#popover2').offset({ top: topOffset, left: leftOffset });
					}, 0);	
				}
				else{
					$('div#popover2').css({
						top : 0,
						left : -9999
					});
				}
				
				
				// var index = $scope.selectedOrder.saleOrder.orderDetails.findIndex(function(i){
				// 	return i.itemId == item.itemId;
				// }); 
				// console.log($('#id_'+item.itemId).offset());
				// console.log($('div#popover2').offset());
				// var coordinate = $('#id_'+item.itemId).position(); 
				// var liHeight = $('.items-in-orderList')[0].offsetHeight;
				// var topHeight = coordinate.top;
				// var itemHeight = ($scope.selectedOrder.saleOrder.orderDetails.length - index - 1) * liHeight;
				// var topValue = topHeight - liHeight + 15 - itemHeight; //14px is img gift height
				// var leftValue = coordinate.left - 44;
				// $('div#popover2').css({ 
				// 	'top' : topValue + 'px',
				// 	'left' : leftValue + 'px'
				// });
				// //console.log($('#mCSB_2_container'));
				//$('#id_' + item.itemId).webuiPopover({title:'Title111',content:'Content'});
			 }

			$scope.closeDiscountPopOver = function(){
				$scope.isOpenDiscountPopOver = false;
			}

			$scope.hideBackdrop = function(){
				$scope.isOpenDiscountPopOver = false;
				$scope.isOpenConfigPopOver = false;
			}

			$scope.isDiscountByPercent = false;

			$scope.changeDiscountMethod = function(){
				debugger;
				$scope.isDiscountByPercent = !$scope.isDiscountByPercent;
			}

			$scope.isOpenConfigPopOver = false;

			$scope.showHideConfig = function(){
				$scope.isOpenConfigPopOver = !$scope.isOpenConfigPopOver;
			}
			
			var saleOrder = {
				"storeId": null,
				"createdBy": null,
				"subTotal": 0,
				"discount": 0,
				"DiscountInPercent": 0,
				"IsDiscountPercent": false,
				"tax": 0,
				"promotionId": 0,
				"comment": "",
				"customer": null,
				"payments": [
					{
					  "voucherId": 0,
					  "code": "",
					  "receivedDate": null,
					  "status": 3,
					  "paymentMethodId": 1,
					  "amount": 0,
					  "balance": 0,
					  "description": ""
					}
				],
				"orderDetails": [],
				"saleOrderCode": "",
				"saleOrderDate": null,
				"saleUser": null,
				"cashier": null,
				"totalQuantity": 0,
				"total": 0,
				"tableName":null,
				"subFee": null,
				"subFeeName": null,
				"amountPaid": 0,
				"paymentBalance": 0,
				"saleTypeID": 0,
				"status": 0,
				"shipper": {
					"shipperId": 0,
					"name": "",
					"shippingDate": null,
					"comment": "",
					"shipper": ""
				}
			}
			
			$scope.n = {};
			$scope.setNotification = function(status,header,message){
				jQuery('.notification-panel').show(500);

				$scope.nActived = true;
				$scope.nClass = status;
				$scope.n.header = header;
				$scope.n.body = message;

				setTimeout(function() {
				    jQuery('.notification-panel').fadeOut('slow');
				}, 3000);
			}

			// Login function
			$scope.getSession = function(u,p){
			    var deferred = $q.defer();
			    var url = Api.login;
			    var data = {
			    	username : u,
			    	password : p
			    }
			    asynRequest($http, 'POST', url, data, false, function(data,status){
			      if(data){
			        deferred.resolve(data);
			      }
			    },function(error,status){
			      deferred.reject(error);
			    },'getSession');
			    return deferred.promise;
			}

			$scope.getUserInfo = function(sessionId){
				var deferred = $q.defer();
			    var url = Api.getSession + 'clientId=' + sessionId;
			    asynRequest($http, 'GET', url, null, false, function(data,status){
			      if(data){
			        deferred.resolve(data);
			      }
			    },function(error,status){
			      deferred.reject(error);
			    },'getUserInfo');
			    return deferred.promise;
			}

			$scope.getBootloader = function(token){
			    var deferred = $q.defer();
			    var url = Api.bootloader;
			    asynRequest($http, 'POST', url, null, token, function(data,status){
			        if(data){			          
			          deferred.resolve(data);
			        }
			    },function(error,status){
			      deferred.reject(error);
			    },'getBootloader');
			    return deferred.promise;
			}

			$scope.getStoreList = function(token){
			    var deferred = $q.defer();
			    var url = Api.store;
			    asynRequest($http, 'GET', url, null, token, function(data,status){
			        if(data){
			          deferred.resolve(data);
			        }
			    },function(error,status){
			      deferred.reject(error);
			    },'getStoreList');
			    return deferred.promise;
			}

			$scope.login = function(u,p){
				$scope.getSession(u,p).then(function(res){
					$scope.getUserInfo(res.data.sessionId).then(function(res){
						console.log('--UserSession--');
						// console.log(res.data);
						localStorage.setItem('sn_ac_tk',JSON.stringify(res.data.userSession));
						$scope.userSession = res.data.userSession;
						$scope.getBootloader($scope.userSession.accessToken).then(function(res){
							console.log('--ApiBootloader--');
							localStorage.setItem('sn_bootloader',JSON.stringify(res.data));
							// console.log(res.data);
							$scope.getStoreList($scope.userSession.accessToken).then(function(res){
								console.log('--StoreList--');
								localStorage.setItem('sn_store_list',JSON.stringify(res.data));
								// console.log(res.data);
								$scope.currentStore = res.data.stores[0];
								$scope.setNotification('success','Đăng nhập thành công!','Xin chào '+$scope.userSession.displayName);
							},function(error){
								$scope.setNotification('error','Lỗi',error.data.responseStatus.message);
							});
						},function(error){
							$scope.setNotification('error','Lỗi',error.data.responseStatus.message);
						});
					},function(error){
						$scope.setNotification('error','Lỗi',error.data.responseStatus.message);
					});
				},function(error){
					$scope.setNotification('error','Lỗi',error.data.responseStatus.message);
				});
			}

			// Search product
			$scope.get_search_rs = function(key){
				if(key.length > 3){
					var url = Api.search + key +'&storeId='+$scope.currentStore.storeID;
				    asynRequest($http, 'GET', url, null, $scope.userSession.accessToken, function(res,status){
				      if(res){
				        $scope.searchList = res.data;
				        console.log(res.data);
				        $scope.searchList.items.forEach(function(d){
				        	d.img = d.image.thumbnail ? d.image.thumbnail : 'https://pos.suno.vn/Content/themes/ace/img/no-image.png';
				        });
				        $timeout(function(){
							$('.search-result').mCustomScrollbar({
								setHeight: 300,
								theme:'minimal-dark',
								scrollbarPosition: 'outside'
							});
						 },100);
				      }
				    },function(error,status){
				      $scope.setNotification('error','Lỗi',error.responseStatus.message);
				    },'get_search_rs');
				}
			}

			$scope.selectedOrder = {
				'saleOrder' : saleOrder
			};



			$scope.pickProduct = function(item){
				var index = $scope.selectedOrder.saleOrder.orderDetails.findIndex(function(i){
					return i.itemId == item.itemId;
				});
				if(index != -1){
					$scope.selectedOrder.saleOrder.orderDetails[index].quantity++;
				}
				else{
					item.quantity = 1;
					$scope.selectedOrder.saleOrder.orderDetails.push(item);
				}
			}

			$scope.removeItem = function(item){
				var index = $scope.selectedOrder.saleOrder.orderDetails.indexOf(item);
				$scope.selectedOrder.saleOrder.orderDetails.splice(index, 1);
			}

		});

	    /* --- Made by justgoscha and licensed under MIT license --- */
	    app.filter('charLimit', function(){
	    	return function(text, maxChar){
	    		if(text.length > maxChar){
	    			var txt = text.slice(0, maxChar) + "...";
	    			return txt;
	    		}
	    		return text;
	    	}
	    })
		app.directive('autocomplete', ['$compile', function ($compile) {
		    var index = -1;

		    var template = ['<div class="autocomplete {{attrs.class}}" id="{{attrs.id}}">',
                                '<span class="input-icon input-icon-right" style="width:100%;">',
                                    '<input type="text" ng-model="searchParam" placeholder="{{attrs.placeholder}}" class="{{attrs.inputclass}}" id="{{attrs.inputid}}" autocomplete="off" ng-focus="onFocus()" />',
                                    '<i class="icon-remove red" style="cursor:pointer;" ng-show="searchParam" ng-click="removeText()"></i>',
                                '</span>',
                                '<ul ng-show="completing" class="mCustomScrollbar" data-mcs-axis="y">',
                                    '$AutocompleteTemplate$',
                                '</ul>',
                                '<ul id="no-result" ng-show="searchParam && (suggestions == null || suggestions.length == 0)"><li>Không tìm thấy kết quả phù hợp</li></ul>',
                            '</div>'];

		    return {
		        restrict: 'E',
		        scope: {
		            searchParam: '=ngModel',
		            suggestions: '=data',
		            onType: '=onType',
		            onSelect: '=onSelect',
		            onFocus: '=onFocus'
		        },
		        controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
		            function $scopeApply() {
		                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
		                    $scope.$apply();
		                }
		            }

		            // the index of the suggestions that's currently selected
		            $scope.selectedIndex = -1;

		            // set new index
		            $scope.setIndex = function (i) {
		                $scope.selectedIndex = parseInt(i);
		            };

		            this.setIndex = function (i) {
		                $scope.setIndex(i);
		                $scopeApply();
		            };

		            $scope.getIndex = function (i) {
		                return $scope.selectedIndex;
		            };

		            $scope.removeText = function () {
		                $scope.searchParam = '';
		            };

		            // watches if the parameter filter should be changed
		            var watching = true;

		            // autocompleting drop down on/off
		            $scope.completing = false;

		            // scanning from barcode scanner
		            $scope.scanning = false;
		            var typingPromise;
		            // starts autocompleting on typing in something
		            $scope.$watch("searchParam", function (newValue, oldValue) {
		                var delay = 300; //150;
		                //if ((oldValue == undefined || oldValue == '') && newValue) delay = 0;//scanning == true
		                if ((oldValue == undefined || oldValue == '') && newValue) { delay = 0; $scope.scanning = true; }//scanning == true
		                if (typingPromise) $timeout.cancel(typingPromise);//does nothing, if timeout already done
		                typingPromise = $timeout(function () {//Set timeout
		                    if (watching && $scope.searchParam) {
		                        $scope.completing = true;
		                        $scope.searchFilter = $scope.searchParam;
		                        $scope.selectedIndex = -1;
		                    }
		                    if ($scope.searchParam && $scope.searchParam != '' && $scope.searchParam.length > 1) {
		                        // function thats passed to on-type attribute gets executed
		                        if ($scope.onType)
		                            $scope.onType($scope.searchParam);
		                    }
		                    else {
		                        $scope.completing = false;
		                        $scope.scanning = false;
		                    }
		                }, delay);
		            });

		            var timeoutPromise;
		            // starts scanning after typing in something
		            $scope.$watch("suggestions", function () {
		                if (timeoutPromise) $timeout.cancel(timeoutPromise);  //does nothing, if timeout already done
		                timeoutPromise = $timeout(function () {   //Set timeout

		                    if ($scope.scanning === true && $scope.suggestions.length === 1) {
		                        //console.log('scanning promise:' + $scope.scanning);
		                        $scope.select($scope.suggestions[0]);
		                    }
		                    else if ($scope.scanning === true && $scope.suggestions.length >= 2 && $scope.suggestions.length <= 3) //
		                    {
		                        var existsKeywords = $scope.suggestions.filter(function (s) { return s.barcode.trim() === $scope.searchParam.trim(); });
		                        if (existsKeywords.length > 0) {
		                            $scope.select(existsKeywords[0]);
		                        }

		                    }
		                    $scope.scanning = false;
		                }, 200); //50
		            });

		            // for hovering over suggestions
		            this.preSelect = function (suggestion) {

		                watching = false;

		                // this line determines if it is shown
		                // in the input field before it's selected:
		                //$scope.searchParam = suggestion;

		                $scopeApply();
		                watching = true;

		            };

		            $scope.preSelect = this.preSelect;

		            this.preSelectOff = function () {
		                watching = true;
		            };

		            $scope.preSelectOff = this.preSelectOff;

		            // selecting a suggestion with RIGHT ARROW or ENTER
		            $scope.select = function (suggestion, isclearsearch) {
		                if (suggestion) {
		                    //$scope.searchParam = suggestion;
		                    //$scope.searchParam = isclearsearch == true ? '' : suggestion.Name;
		                    $scope.searchFilter = suggestion;
		                    if ($scope.onSelect) {
		                        $scope.onSelect(suggestion);
		                    }
		                }
		                watching = false;
		                $scope.completing = false;
		                $scope.scanning = false;
		                setTimeout(function () { watching = true; }, 50); //150
		                $scope.setIndex(-1);
		                $scope.searchParam = '';
		                $scope.suggestions = [];
		            };
		        }],
		        link: function (scope, element, attrs) {
		            function $scopeApply() {
		                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
		                    scope.$apply();
		                }
		            }

		            var attr = '';

		            // Default atts
		            scope.attrs = {
		                "placeholder": "start typing...",
		                "class": "",
		                "id": "",
		                "inputclass": "",
		                "inputid": ""
		            };

		            for (var a in attrs) {
		                attr = a.replace('attr', '').toLowerCase();
		                // add attribute overriding defaults
		                // and preventing duplication
		                if (a.indexOf('attr') === 0) {
		                    scope.attrs[attr] = attrs[a];
		                }
		            }

		            if (attrs.clickActivation) {
		                element[0].onclick = function (e) {
		                    if (!scope.searchParam) {
		                        scope.completing = true;
		                        $scopeApply();
		                    }
		                };
		            }

		            var keyupFiredCount = 0;
		            function DelayExecution(f, delay) {
		                var timer = null;
		                return function () {
		                    var context = this, args = arguments;

		                    clearTimeout(timer);
		                    timer = window.setTimeout(function () {
		                        f.apply(context, args);
		                    },
                            delay || 100);
		                };
		            }

		            var key = { left: 37, up: 38, right: 39, down: 40, enter: 13, esc: 27, space: 32 };

		            element[0].addEventListener("keyup", DelayExecution(function (e) {
		                keyupFiredCount = keyupFiredCount + 1;
		            }), true);

		            element[0].addEventListener("blur", function (e) {
		                keyupFiredCount = 0;
		                // disable suggestions on blur
		                // we do a timeout to prevent hiding it before a click event is registered
		                setTimeout(function () {
		                    scope.select();
		                    scope.setIndex(-1);
		                    $scopeApply();
		                }, 300); //300
		            }, true);

		            element[0].addEventListener("keydown", function (e) {
		                var keycode = e.keyCode || e.which;

		                var l = angular.element(this).find('li').length - 1;

		                if (scope.searchParam === '') {
		                    keyupFiredCount = 0;
		                }

		                // implementation of the up and down movement in the list of suggestions
		                switch (keycode) {
		                    case key.up:
		                        index = scope.getIndex() - 1;
		                        //if (index < -1) {
		                        //    index = l - 1;
		                        //} else if (index >= l) {
		                        //    index = -1;
		                        //    scope.setIndex(index);
		                        //    scope.preSelectOff();
		                        //    break;
		                        //}
		                        if (index < 0) {
		                            index = 0;
		                        }
		                        else if (index > l - 1) {
		                            index = l - 1;
		                        }
		                        scope.setIndex(index);

		                        if (index !== -1) {
		                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
		                            var height = angular.element(angular.element(this).find('li')[index]).height() + 10;
		                            var ul = angular.element(this).find('ul')[0];
		                            if (ul && height > 0 && index >= 0 && index < l - 1) ul.scrollTop = Math.max(ul.scrollTop - height, 0);
		                        }

		                        $scopeApply();

		                        break;
		                    case key.down:
		                        index = scope.getIndex() + 1;
		                        //if (index < -1) {
		                        //    index = l - 1;
		                        //} else if (index >= l) {
		                        //    index = -1;
		                        //    scope.setIndex(index);
		                        //    scope.preSelectOff();
		                        //    $scopeApply();
		                        //    break;
		                        //}
		                        if (index < 0) {
		                            index = 0;
		                        }
		                        else if (index > l - 1) {
		                            index = l - 1;
		                        }
		                        scope.setIndex(index);

		                        if (index !== -1) {
		                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
		                            var height = angular.element(angular.element(this).find('li')[index]).height() + 10;
		                            var ul = angular.element(this).find('ul')[0];
		                            if (ul && height > 0 && index > 0 && index < l - 1) ul.scrollTop = Math.min(ul.scrollTop + height, height * l);
		                        }
		                        break;
		                    case key.left:
		                        break;
		                    case key.right:
		                    case key.enter:
		                        scope.scanning = false;
		                        index = scope.getIndex();
		                        //scope.preSelectOff();
		                        if (index !== -1) {
		                            //scope.select(scope.$eval(angular.element(angular.element(this).find('li')[index]).attr('val')), true);
		                            scope.select(scope.suggestions[index]);
		                        }
		                        else {
		                            if (scope.suggestions.length === 1) {
		                                scope.select(scope.suggestions[0]);
		                                //console.log('scanning:' + scope.scanning + ' keyupFiredCount:' + keyupFiredCount);
		                                keyupFiredCount = 0;
		                            }
		                            else if ((keyupFiredCount <= 1) && (scope.searchParam && scope.searchParam !== '') && scope.searchParam.length >= 4) {
		                                scope.scanning = true;
		                                console.log('scanning:' + scope.scanning + ' keyupFiredCount:' + keyupFiredCount);
		                                keyupFiredCount = 0;
		                            }
		                        }
		                        scope.setIndex(-1);
		                        $scopeApply();

		                        break;
		                    case key.space:
		                        index = scope.getIndex();
		                        break;
		                    case key.esc:
		                        // disable suggestions on escape
		                        scope.select();
		                        scope.setIndex(-1);
		                        $scopeApply();
		                        e.preventDefault();
		                        break;
		                    default:
		                        return;
		                }

		                if (scope.getIndex() !== -1 || keycode == key.enter)
		                    e.preventDefault();
		            });

		            var itemTemplate = $('#' + attrs.templateId).text();
		            var arrTemplate = [];
		            for (var i = 0; i < template.length; i++) {
		                if (template[i] === '$AutocompleteTemplate$') {
		                    arrTemplate.push(itemTemplate);
		                }
		                else {
		                    arrTemplate.push(template[i]);
		                }
		            }

		            //Compile Template
		            element.append($compile(arrTemplate.join(''))(scope));
		            //Focus Textbox
		            //angular.element(element).find('input[type="text"]')[0].focus();
		        }
		        //templateUrl: ''
		    };
		}]);

		app.directive('suggestion', function () {
		    return {
		        restrict: 'A',
		        require: '^autocomplete', // ^look for controller on parents element
		        link: function (scope, element, attrs, autoCtrl) {
		            element.bind('mouseenter', function () {
		                autoCtrl.preSelect(attrs.val);
		                autoCtrl.setIndex(attrs.index);
		            });

		            element.bind('mouseleave', function () {
		                autoCtrl.preSelectOff();
		            });
		        }
		    };
		});

		angular.bootstrap(html, ['SunoApp'], []);
	});

	
});