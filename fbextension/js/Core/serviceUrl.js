if (!window.PosimGlobal) window.PosimGlobal = PosimGlobal = {
    urlRequest: {
        Manager: {
            Customer: {
                GetCustomers: posDomain + '/customers',
                DetailCustomer: posDomain + '/customer',
                CreateCustomer: posDomain + '/customer/create',
                SearchCustomer: posDomain + '/customers/search',
                GetCustomersfromDate: posDomain + '/customersfromdate',
                ExportCustomerById: posDomain + '/exportcustomer',
                ExportSupllierById: posDomain + '/exportsupplier',
                MergeCustomer: posDomain + '/customer/merge',
                //28/4/2016
            },
            User: {
                GetUsers: accountDomain + '/membership/users',
                CreateUser: accountDomain + '/membership/create',
                UpdateUser: accountDomain + '/membership/modify',
                DeleteUser: accountDomain + '/membership/delete',
                ResetPasswordUser: accountDomain + '/membership/resetpassword',
                CreatePasswordUser: accountDomain + '/membership/createpassword',
                GetUserProfile: accountDomain + '/membership/my-profile',
                ChangePwd: accountDomain + '/membership/changePassword',
                UpdateAvatar: accountDomain + '/membership/user/upload-avatar'
            }
        }
    }
};

if (!window.POSIM) window.POSIM = POSIM = {
    settings: {
        urlRequest: {
            refreshToken: PosimGlobal.urlRequest.AUTHORIZE.RefreshToken,
            refreshTokenWithData: PosimGlobal.urlRequest.AUTHORIZE.RefreshTokenWithData,
            refreshInfo: PosimGlobal.urlRequest.AUTHORIZE.RefreshInfo
        },
        header: {
            key: 'Authorization',
            value: 'Bearer'
        },
        clientSession: {
            accessToken: '',
            userId: null,
            displayName: ''
        },
        data: {
            isExpired: false
        }
    },
    asynRequest: function ($http, method, url, async, header, data, callback, errorCallback, unique, requestId) {
        //var objData = data !== null ? JSON.stringify(data) : null;
        var isAsync = true;
        isAsync = async === null ? true : async;

        var reqConfig = {
            method: method,
            headers: header !== null ? { 'Content-Type': 'application/json', 'Authorization': header.value } : null,
            responseType: 'json',
            url: url,
            data: data,
            unique: unique ? unique : null,
            requestId: requestId ? requestId : null
        };

        var httpService = $http;
        if (unique === true && requestId && requestId != '') {
            httpService = POSIM.uniqueRequestsAwareHttpService($http);
        };

        var http = httpService(reqConfig);

        if (!http) return;

        http
        .success(function (successResponse, status) {
            if (callback !== null && typeof callback === 'function') {
                callback(successResponse);
            }
        })
        .error(function (errorResponse, status) {
            if (header !== null) {
                if (status == 401 && PosimGlobal.isContains(errorResponse.error_description, 'expired')) {
                    POSIM.RefreshToken($http, method, url, data, callback);
                }
                else if (status == 401 && PosimGlobal.isContains(errorResponse.error_description, 'Missing access token')) {
                    //Redirect to login page.
                    window.location = PosimGlobal.replaceCharacter(accountDomain, 'api', 'account/login');
                    console.log('Redirect to login page');
                }
                else if (status == 403 && PosimGlobal.isContains(errorResponse.error, 'insufficient_scope')) {
                    $.gritter.add({
                        title: 'Thông báo',
                        text: 'Bạn chưa được phân quyền để sử dụng chức năng này.',
                        class_name: 'gritter-warning',
                        time: 2000
                    });
                }
                else if (status == 406) {
                    var message = errorResponse.responseStatus.message;
                    $.gritter.add({
                        title: 'Thông báo',
                        text: message + 'Xin vui lòng liên hệ với chúng tôi để được hỗ trợ. Xin cảm ơn.',
                        class_name: 'gritter-warning',
                        time: 5000
                    });
                    //POSIM.Dialog(errorResponse.responseStatus.message);
                }
                else if (status == 500) {
                    if (errorCallback !== null && typeof errorCallback === 'function') {
                        errorCallback(errorResponse);
                    }
                    //Redirect to error page.
                    console.log('Redirect to error page');
                }
                else {
                    if (errorCallback !== null && typeof errorCallback === 'function') {
                        errorCallback(errorResponse);
                    }
                }
            }
            else {
                if (errorCallback !== null && typeof errorCallback === 'function') {
                    errorCallback(errorResponse);
                }
            }
        })
    },
    onceRequest: function ($http, method, url, header, data, callback, errorCallback) {
        $http({
            method: method,
            headers: header !== null ? { 'Content-Type': 'application/json', 'Authorization': header.value } : null,
            url: url,
            data: data
        }).success(function (successResponse, status) {
            if (callback !== null && typeof callback === 'function') {
                callback(successResponse);
            }
        }).error(function (errorResponse, status) {
            if (errorCallback !== null && typeof errorCallback === 'function') {
                errorCallback(errorResponse);
            }
        });
    }
    RefreshToken: function ($http, method, url, data, callback) {
        var urlRefreshToken = POSIM.settings.urlRequest.refreshToken;
        var methodRefreshToken = 'POST';
        var localSettings = window.localStorage.settings != undefined ? JSON.parse(window.localStorage.settings) : undefined;
        if (localSettings != undefined && localSettings.sessionId != undefined && localSettings.refreshToken != undefined) {
            methodRefreshToken = 'GET';
            urlRefreshToken = POSIM.settings.urlRequest.refreshTokenWithData +
                '?format=json&clientId=' + localSettings.sessionId + '&token=' + localSettings.refreshToken;
        }
        POSIM.asynRequest($http, methodRefreshToken, urlRefreshToken, true, null, null, function (d) {
            POSIM.settings.clientSession.accessToken = d.accessToken;
            if (window.localStorage.settings != undefined) {
                var settings = JSON.parse(window.localStorage.settings);
                settings.accessToken = d.accessToken;
                settings.refreshToken = d.refreshToken;
                window.localStorage.setItem("settings", JSON.stringify(settings));
                POSIM.asynRequest($http, 'POST', POSIM.settings.urlRequest.refreshInfo, true, null, null,
                    function (result) { }, function (error) { });
            }
            //POSIM.CallService($http, url, method, data, callback);
            POSIM.settings.header.value = 'Bearer ' + POSIM.settings.clientSession.accessToken;
            POSIM.onceRequest($http, method, url, POSIM.settings.header, data, callback, null);
        },
        function (error) {
            console.log(error);
            if (error != undefined && error.responseStatus != undefined &&
                PosimGlobal.isContains(error.responseStatus.message, 'Unauthorized')) {
                //Redirect to login page.
                console.log('Redirect to login page due ' + error.responseStatus.message);
                window.location = PosimGlobal.replaceCharacter(accountDomain, 'api', 'account/login');
            }
            else {
                //Try to call again if refresh token has been done from other 
                //POSIM.CallService($http, url, method, data, callback);
                POSIM.settings.header.value = 'Bearer ' + POSIM.settings.clientSession.accessToken;
                POSIM.onceRequest($http, method, url, POSIM.settings.header, data, callback,
                    function (error) {
                        console.log('Redirect to login page due ' + error);
                        window.location = PosimGlobal.replaceCharacter(accountDomain, 'api', 'account/login');
                    });
            }
        });
    },
    CallService: function ($http, serviceUrl, method, data, callback, errorCallback) {
        POSIM.settings.header.value = 'Bearer ' + POSIM.settings.clientSession.accessToken;
        POSIM.asynRequest($http, method, serviceUrl, true, POSIM.settings.header, data, callback, errorCallback);
    },
    CallUniqueService: function ($http, serviceUrl, method, data, callback, errorCallback, unique, requestId, $q) {
        POSIM.settings.header.value = 'Bearer ' + POSIM.settings.clientSession.accessToken;
        POSIM.asynRequest($http, method, serviceUrl, true, POSIM.settings.header, data, callback, errorCallback, unique, requestId);
    },
    uniqueRequestsAwareHttpService: function ($http) {
        var DUPLICATED_REQUEST_STATUS_CODE = 499; // I just made it up - nothing special
        var EMPTY_BODY = '';
        var EMPTY_HEADERS = {};

        var uniqueRequestOptionName = "unique";
        var requestIdOptionName = 'requestId';

        // should we care about duplicates check
        function checkForDuplicates(requestConfig) {
            return !!requestConfig[uniqueRequestOptionName];
        }

        // find identical request in pending requests
        function checkIfDuplicated(requestConfig) {
            var duplicated = $http.pendingRequests.filter(function (pendingReqConfig) {
                return pendingReqConfig[requestIdOptionName] && pendingReqConfig[requestIdOptionName] === requestConfig[requestIdOptionName];
            });
            return duplicated.length > 0;
        }

        var modifiedHttpService = function (requestConfig) {
            if (checkForDuplicates(requestConfig) && checkIfDuplicated(requestConfig)) {
                return;
                // return rejected promise with response consistent with those from $http calls
                //return buildRejectedRequestPromise(requestConfig);
            }
            return $http(requestConfig);
        };

        return modifiedHttpService;
    }

};
