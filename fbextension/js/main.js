window.app = angular.module('SunoApp', []);
app.controller('MainController', function ($scope,$http,$q,$timeout){
	var Api = Suno.Api;
	var asynRequest = Suno.asynRequest;
	$scope.userSession = JSON.parse(localStorage.getItem('sn_ac_tk'));
	$scope.stores = JSON.parse(localStorage.getItem('sn_store_list'));
	$scope.setting = JSON.parse(localStorage.getItem('sn_bootloader'));

	$scope.isShowUserContext = false;
	$scope.isShowDisCountItem = false;
	$scope.isShowDisCountOrder = false;
	$scope.isShowConfig = false;
	$scope.isShowCreateCustomer = false;
	$scope.isShowDelivery = false;
	$scope.isShowPaid = false;
	$scope.isShowDetail = false;
	$scope.isShowNotification = false;
	$scope.isShowPaidSection = false;
	$scope.isShowDeliverySection = false;

	if($scope.stores && $scope.stores.stores.length > 0){
		$scope.currentStore = $scope.stores.stores[0];
	}
	// Helper function
	$scope.isOpening = false;
	$scope.openPanel = function(){
		$scope.panel = {'display':'block'};
		$scope.isOpening = true;
		$timeout(function(){
			$('.pos-panel').css('width', '240px');
		}, 50);
	}
	$scope.closePanel = function(){
		$scope.panel = {'display':'none'};
		//delay 0.55s để kịp ẩn pos-panel
		$timeout(function(){
			$('.pos-panel').css('width', '0px');
		}, 50)
		.then(function(){
			$timeout(function(){
				$scope.isOpening = false;
			}, 550);
		});
	}

	$scope.isOpenDiscountPopOver = false;

	$scope.focusInput = function(){
		if($scope.isShowContextMenu){
			$scope.isShowContextMenu = false;	
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
			//console.log($('div#popover2').offset());
			//console.log($('#id_'+item.itemId).offset());
			//var popOverPosition = $('div#popover2').offset();
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
	}

	$scope.closeDiscountPopOver = function(){
		$scope.isOpenDiscountPopOver = false;
		$('div#popover2').css({
			top: 0,
			left: -9999
		});
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
		$timeout(function(){
			var btnPosition = $('#toolbar').offset();
			var topOffset = btnPosition.top + 4;
			var leftOffset = btnPosition.left + 214;
			$('#config-popover').offset({ top: topOffset, left: leftOffset });
		}, 100);
	}

	$scope.isOpenDiscountOrderPopOver = false;

	$scope.showHideDiscountOrder = function(){
		$scope.isOpenDiscountOrderPopOver = !$scope.isOpenDiscountOrderPopOver;
		$timeout(function(){
			var btnPosition = $('#discount-order').offset();
			var topOffset = btnPosition.top - 134;
			var leftOffset = btnPosition.left - 95;
			$('#popover1').offset({ top: topOffset, left: leftOffset });
		}, 100);
	}

	$scope.isShowHideCreateCustomer = false;
	$scope.showHideCreateCustomer = function(){
		$scope.isShowHideCreateCustomer = !$scope.isShowHideCreateCustomer;
		$scope.isOpenConfigPopOver = false;
		$('body').on('mousewheel touchmove', function(e) {
			      e.preventDefault();
			});
		$('body').on('scroll', function(e){
			e.preventDefault();
			e.stopPropagation();
			return false;
		})
	}

	$scope.closeCreateCustomerPopOver = function(){
		$scope.isShowHideCreateCustomer = false;
	}

	$scope.isShowContextMenu = false;
	$scope.showHideUserContextMenu = function(){
		$scope.isShowContextMenu = !$scope.isShowContextMenu;
		$timeout(function(){
			var btnPosition = $('#menu').offset();
			var topOffset = btnPosition.top + 29;
			var leftOffset = btnPosition.left - 79.5;
			$('#user-menu').offset({ top: topOffset, left: leftOffset});
		},100)
	}

	//$('[id^="profile_pic_header"]');
	
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

	$scope.getCustomerSearchResult = function(key){
		if(key.length > 3){
			var url = Api.customers + key + '&storeId='+$scope.currentStore.storeID;
			asynRequest($http, 'GET', url, null, $scope.userSession.accessToken, function(response, status){
				if(response){
					$scope.customerList = response.data;
				}
			}, function(error, status){
				$scope.setNotification('error', 'Lỗi', error.responseStatus.message);
			}, 'get_search_customer');
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


