function SunoRequest () {
    var self = this;
    var createCORSRequest = function(){
        var xhr = null;
        if(window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }
        else if (typeof XDomainRequest != 'undefined') {
            xhr = new XDomainRequest();
        }
        else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    };
    //self._request = createCORSRequest();
    self.options = {
        'url': '',
        'method': 'GET',
        'headers': {
            'content-type': 'application/json'
        },
        'json': true,
        'body': null
    };
    SunoRequest.prototype.makeJsonRequest = function(url, method, data) {
        var self = this;
        self._request = createCORSRequest();
        self.options.url = url;
        self.options.method = method;
        
        if (data != null) {
            if (method == 'GET' || method == 'get' || method == 'Get') {
                self.options.url += '?' + SunoGlobal.querystring(data);
            }
            else {
                self.options.body = JSON.stringify(data);
            }
        }

        return new Promise(function(resolve, reject) {
            self._request.open(self.options.method, self.options.url, true);
            if (self.options.headers != null) {
                Object.getOwnPropertyNames(self.options.headers).forEach(function(key, idx, array){
                    self._request.setRequestHeader(key, self.options.headers[key]);
                });
            }
            self._request.onload = function(){
                if (self._request.status == 200) {
                    resolve(self._request.response ? JSON.parse(self._request.response) : '');
                }
                else if (self._request.status == 401 && SunoGlobal.isContains(self._request.responseText, 'expired')) {
                    self.refreshToken(function(){
                        self.options.headers['authorization'] = 'Bearer ' + SunoGlobal.token.accessToken;
                        self.makeJsonRequest(url, method, data);
                    });
                }
                else if (self._request.status == 401 && SunoGlobal.isContains(self._request.responseText, 'Missing access token')) {
                    reject('Vui lòng đăng nhập.');
                }
                else if (self._request.status == 403 && SunoGlobal.isContains(self._request.responseText, 'insufficient_scope')) {
                    reject('Bạn chưa được phân quyền để sử dụng tính năng này.');
                }
                else {
                    reject(self._request.responseText);
                }
            };
            self._request.onerror = function(error){
                reject(error);
            };

            self._request.send(self.options.body);
        });
    };
    SunoRequest.prototype.makeRestful = function(url, method, data) {
        var self = this;
        self.options.headers['authorization'] = 'Bearer ' + SunoGlobal.token.accessToken;
        return self.makeJsonRequest(url, method, data);
    };
    SunoRequest.prototype.refreshToken = function(callback){
        var request = createCORSRequest();
        var refreshData = { format: 'json', clientId: SunoGlobal.userProfile.sessionId, token: SunoGlobal.token.refreshToken };
        var url = SunoGlobal.authService.domain + SunoGlobal.authService.refreshTokenUrl + '?' + SunoGlobal.querystring(refreshData);
        request.open('GET', url, true);
        request.onload = function() {
            if (request.response){
                var result = JSON.parse(request.response);
                SunoGlobal.token.refreshToken = result.refreshToken;
                SunoGlobal.token.accessToken = result.accessToken;
            }
            if (callback && typeof callback === 'function'){
                callback();
            }
        };
        request.onerror = function(error) {
            console.log('refreshToken', request.response);
        };

        request.send();
    };
};