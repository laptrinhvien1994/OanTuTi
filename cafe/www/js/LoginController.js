angular.module('SunoPosCafe.loginController', [])
.controller('LoginCtrl', ["$q", "$scope", "$rootScope", "$http", "Auth", "$state", "$ionicSideMenuDelegate", "$ionicPopup", "toaster", "$PouchDB", LoginCtrl]);
function LoginCtrl($q, $scope, $rootScope, $http, AuthFactory, $state, $ionicSideMenuDelegate, $ionicPopup, toaster, $PouchDB) {
    $scope.$watch('$root.appVersion', function () {
        $scope.appVersion = $rootScope.appVersion;
    });
    $scope.offline = null;
    $ionicSideMenuDelegate.canDragContent(false);

    //force reload tab nếu nhận được yêu cầu cần reload lại bên Pos Controller.
    if ($rootScope.hasOwnProperty('forceReload') && $rootScope.forceReload) {
        delete $rootScope.forceReload;
        window.location.reload(true);
    }

    $scope.hasAccount = false;
    $scope.initLogin = function () {
        AuthFactory.getAccount()
        //AuthFactory.getSessionId()
        .then(function (data) {
            if (data.docs.length > 0) {
                $scope.hasAccount = true;
                $scope.loginData = {
                    'username': data.docs[0].account.username,
                    'password': data.docs[0].account.password
                };
            } else {
                $scope.hasAccount = false;
                $scope.loginData = {
                    'username': '',
                    'password': ''
                };
            }
            if ($scope.loginData.username && $scope.loginData.password) {
                $scope.hasAccount = true;
                setTimeout(function () {
                    $scope.doLogin();
                }, 1000);
            } else {
                $scope.hasAccount = false;
            }
            //if (data.docs.length > 0) {
            //    var url = Api.getSession + 'cliendId=' + data.docs[0].session;
            //    asynRequest($state, $http, 'GET', url, false, 'json', null, function (data, status) {
            //        console.log(data);
            //    }, function (e, status) {
            //        $scope.hasAccount = false;
            //        $scope.loginData = {
            //            username: '',
            //            password: ''
            //        };
            //    });
            //}
            //else {
            //    $scope.hasAccount = false;
            //    $scope.loginData = {
            //        username: '',
            //        password: ''
            //    };
            //}
        });
    }
    $scope.$watch('$root.w_logout', function () {
        if ($rootScope.w_logout == false) {
            $scope.hasAccount = false;
        }
    });


    $scope.resetUser = function () {
        //localStorage.removeItem('account');
        //localStorage.removeItem('bootloader');
        //localStorage.removeItem('setting');
        //localStorage.removeItem('store');
        //localStorage.removeItem('token');
        //localStorage.removeItem('user');
        Promise.all([
            $PouchDB.DBSettings.$removeDoc({ _id: 'account' }),
            $PouchDB.DBSettings.$removeDoc({ _id: 'bootloader' }),
            $PouchDB.DBSettings.$removeDoc({ _id: 'setting' }),
            $PouchDB.DBSettings.$removeDoc({ _id: 'store' }),
            $PouchDB.DBSettings.$removeDoc({ _id: 'token' }),
            $PouchDB.DBSettings.$removeDoc({ _id: 'user' })
        ]).then(function (data) {
            window.location.reload(true);
        });
    }

    // $scope.$on('w_logout', function(event, args) {
    //   var status = args.status;
    //   console.log(args);
    //   if(status == 1){
    //     $scope.hasAccount = false;
    //     console.log('logout current hasAccount ' + $scope.hasAccount);
    //   }
    // });

    $scope.openLink = function (url) {
        if (window.cordova) {
            cordova.InAppBrowser.open(url, '_system');
        }
    }

    $scope.getAuthBootloader = function () {
        var deferred = $q.defer();
        var url = Api.authBootloader;
        asynRequest($state, $http, 'POST', url, $scope.token, 'json', null, function (data, status) {
            if (data) {
                //console.log('getAuthBootloader', data);
                AuthFactory.setBootloader(data).then(function (info) {
                    deferred.resolve(data);
                });
            }
        }, function (error, status) {
            deferred.reject("Có lỗi xảy ra!");
            return $ionicPopup.alert({
                title: 'Thông báo',
                template: 'Có sự cố khi đăng nhập, vui lòng thử lại!'
            });
        }, true, 'getAuthBootloader');
        return deferred.promise;
    }

    $scope.getStoreList = function () {
        var deferred = $q.defer();
        var url = Api.store;
        asynRequest($state, $http, 'GET', url, $scope.token, 'json', null, function (data, status) {
            if (data) {
                //Check lỗi chưa có kho
                if (data.stores) {
                    //console.log('getStoreList', data);
                    AuthFactory.setStoreList(data.stores).then(function (info) {
                        deferred.resolve(data);
                    }).catch(function (error) {
                        console.log(error);
                        deferred.reject("Có lỗi xảy ra");
                    });
                }
                else {
                    deferred.reject("Có lỗi xảy ra");
                }
            }
        }, function (error, status) {
            deferred.reject("Có lỗi xảy ra!");
            return $ionicPopup.alert({
                title: 'Thông báo',
                template: 'Có sự cố khi đăng nhập, vui lòng thử lại!'
            });
        }, true, 'getStoreList');
        return deferred.promise;
    }

    $scope.getBootloader = function () {
        var deferred = $q.defer();
        var url = Api.bootloader;
        asynRequest($state, $http, 'POST', url, $scope.token, 'json', null, function (data, status) {
            if (data) {
                AuthFactory.setSetting(data).then(function (info) {
                    deferred.resolve(data);
                });
            }
        }, function (error, status) {
            deferred.reject("Có lỗi xảy ra!");
            return $ionicPopup.alert({
                title: 'Thông báo',
                template: 'Có sự cố khi đăng nhập, vui lòng thử lại!'
            });
        }, true, 'getBootloader');
        return deferred.promise;
    }

    $('#loginFrm').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.target.blur();
        }
    });

    $scope.getSession = function (sessionId) {
        var deferred = $q.defer();
        var url = Api.getSession + 'clientId=' + sessionId;
        asynRequest($state, $http, 'GET', url, false, 'json', null, function (data, status) {
            if (data) {
                AuthFactory.setToken({
                    clientId: sessionId,
                    token: data.userSession.accessToken,
                    expires: data.userSession.accessTokenExpired,
                    refreshToken: data.userSession.refreshToken
                }).then(function () {
                    $scope.token = data.userSession.accessToken;
                    delete data.userSession.accessToken;
                    delete data.userSession.accessTokenExpired;
                    delete data.userSession.refreshToken;
                    return Promise.all([
                        AuthFactory.setUser(data.userSession)
                        //AuthFactory.setAccount($scope.loginData)
                    ]);
                }).then(function () {
                    deferred.resolve(data);
                });
            }
        }, function (error, status) {
            deferred.reject("Có lỗi xảy ra!");
            return $ionicPopup.alert({
                title: 'Thông báo',
                template: 'Thông tin đăng nhập không đúng!'
            });
        }, true, 'getSession');
        return deferred.promise;
    }

    $scope.login = function () {
        var deferred = $q.defer();
        url = Api.login + 'username=' + $scope.loginData.username + '&password=' + $scope.loginData.password;
        asynRequest($state, $http, 'GET', url, false, 'json', null, function (data, status) {
            if (data) {
                $scope.sessionId = data.sessionId;
                AuthFactory.setSessionId(data.sessionId)
                .then(function (data) {
                    deferred.resolve(data);
                });
            }
        }, function (error, status) {
            deferred.reject("Có lỗi xảy ra!");
            if (error == null)
                return $ionicPopup.alert({
                    title: 'Thông báo',
                    template: 'Vui lòng kiểm tra kết nối internet của bạn'
                });
            else
                $ionicPopup.alert({
                    title: 'Thông báo',
                    template: 'Thông tin đăng nhập không đúng'
                });
        }, true, 'login');
        return deferred.promise;
    }


    $scope.doLogin = function () {
        if (window.cordova) {
            var isAndroid = ionic.Platform.isAndroid();
            var isIPad = ionic.Platform.isIPad();
            var isIOS = ionic.Platform.isIOS();
        }

        if ($scope.loginData.username == '' || $scope.loginData.password == '') {
            return $ionicPopup.alert({
                title: 'Thông báo',
                template: 'Vui lòng nhập thông tin tài khoản!'
            });
        }


        $scope.$watch("offline", function (n) {
            if (n)
                if (n.action == "submit-order")
                    toaster.pop('error', "", 'Kết nối internet không ổn định hoặc đã mất kết nối internet, vui lòng lưu đơn hàng sau khi có internet trở lại!');
                else
                    toaster.pop('error', "", 'Kết nối internet không ổn định hoặc đã mất kết nối internet, thao tác hiện không thể thực hiện được, vui lòng thử lại sau!');
            $scope.offline = null;
        });

        $scope.login().then(function (data) {
            return $scope.getSession($scope.sessionId);
        }).then(function (data) {
            return Promise.all([$scope.getBootloader(), $scope.getStoreList(), $scope.getAuthBootloader()]);
        }).then(function (data) {
            $state.go('pos');
        }).catch(function (error) {
            toaster.pop('error', "", 'Đăng nhập không thành công, xin thử lại!');
        });

        //$scope.login().then(function () {
        //    return $scope.getSession($scope.sessionId)
        //}).then(function () {
        //    return $scope.getBootloader();
        //}).then(function () {
        //    return $scope.getStoreList();
        //}).then(function () {
        //    return $scope.getAuthBootloader()
        //}).then(function () {
        //    $state.go('pos');
        //});
        //            }, function () {
        //                // $ionicPopup.alert({
        //                //   title: 'Thông báo',
        //                //   template: 'Chưa lấy được danh sách cửa hàng!'
        //                // });
        //            });
        //        }, function () {
        //            // $ionicPopup.alert({
        //            //   title: 'Thông báo',
        //            //   template: 'Chưa lấy được bootloader !'
        //            // });
        //        });
        //    }, function () {
        //        // $ionicPopup.alert({
        //        //   title: 'Thông báo',
        //        //   template: 'Thông tin đăng nhập không đúng!'
        //        // });
        //    });
        //});

        // $scope.login().then(function(){
        //   $scope.getSession($scope.sessionId).then(function(){
        //     $scope.getBootloader().then(function(){
        //       $scope.getStoreList().then(function(){
        //         $scope.getAuthBootloader().then(function(){
        //           $state.go('pos');
        //         });
        //       },function(){
        //         // $ionicPopup.alert({
        //         //   title: 'Thông báo',
        //         //   template: 'Chưa lấy được danh sách cửa hàng!'
        //         // });
        //       });
        //     },function(){
        //       // $ionicPopup.alert({
        //       //   title: 'Thông báo',
        //       //   template: 'Chưa lấy được bootloader !'
        //       // });
        //     });
        //   },function(){
        //     // $ionicPopup.alert({
        //     //   title: 'Thông báo',
        //     //   template: 'Thông tin đăng nhập không đúng!'
        //     // });
        //   });
        // },function(){
        //    // $ionicPopup.alert({
        //    //   title: 'Thông báo',
        //    //   template: 'Thông tin đăng nhập không đúng!'
        //    // });
        // });
    };
}
