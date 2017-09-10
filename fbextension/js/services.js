app.service('settingService', ['$http', function ($http) {
    //Print Template
    this.getPrintTemplates = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetPrintTemplate + params, 'GET', null, callback, errorCallback);
    };
    this.getPrintTemplateContent = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetPrintTemplateContent + params, 'GET', null, callback, errorCallback);
    };

    this.getKeyValue = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetKeyValue, 'POST', data, callback, errorCallback);
    };
}]);
