appRoot.service('posimSettingService', ['$http', function ($http) {
    //Print Template
    this.getPrintTemplates = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetPrintTemplate + params, 'GET', null, callback, errorCallback);
    };
    this.getPrintTemplateContent = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetPrintTemplateContent + params, 'GET', null, callback, errorCallback);
    };
	//OFFLINE: For offline service function
    this.insertPrintTemplates = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetPrintTemplate + params, 'GET', null, callback, errorCallback, true, 'insertPrintTemplates');
    };

    this.setPrintTemplate = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.SetPrintTemplate, 'POST', data, callback, errorCallback, true, 'setPrintTemplate');
    };
    this.resetPrintTemplate = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.ResetPrintTemplate, 'POST', data, callback, errorCallback, true, 'resetPrintTemplate');
    };

    this.generateSampleData = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.GenerateSampleData, 'POST', data, callback, errorCallback, true, 'generateSampleData');
    };
    this.deleteSampleData = function (callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.DeleteSampleData, 'DELETE', null, callback, errorCallback, true, 'deleteSampleData');
    };
    //End PrintTemplate
    this.ping = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.Ping, 'GET', null, callback, errorCallback);
    }

    //add new
    //Tuấn
    //9/7/2015
    this.setImageSetting = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.SetImageSetting, 'POST', data, callback, errorCallback, true, 'setImageSetting');
    };

    this.getKeyValue = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.PosimSetting.GetKeyValue, 'POST', data, callback, errorCallback);
    };
    this.postKeyValue = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.PostKeyValue, 'POST', data, callback, errorCallback, true, 'postKeyValue');
    };
}]);
