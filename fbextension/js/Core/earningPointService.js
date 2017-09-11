appRoot.service('earningPointService', ['$http', function ($http) {
    this.saveConfig = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.EarningPoint.SaveConfig, 'POST', data, callback, errorCallback);
    };
    this.getConfig = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.EarningPoint.GetConfig + params, 'GET', null, callback, errorCallback);
    };
    this.getCustomerPoint = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.EarningPoint.GetCustomerPoint + params, 'GET', null, callback, errorCallback);
    };
    this.updateCustomerPoint = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.EarningPoint.UpdateCustomerPoint, 'PUT', data, callback, errorCallback, true, 'updateCustomerPoint');
    };
    this.importCustomerPointsPreview = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.EarningPoint.ImportCustomerPointsPreview, 'POST', data, callback, errorCallback, true, 'importCustomerPointsPreview');
    };
    this.importCustomerPoints = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.EarningPoint.ImportCustomerPoints, 'POST', data, callback, errorCallback, true, 'importCustomerPoints');
    };
    this.getEarningHistory = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.EarningPoint.GetEarningHistory, 'POST', data, callback, errorCallback);
    };
}]);