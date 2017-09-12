appRoot.service('promotionService', ['$http', function ($http) {
    this.getPromotions = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotions + params, 'GET', null, callback, errorCallback)
    };
    this.getPromotion = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotion + params, 'GET', null, callback, errorCallback)
    }
    this.getActivePromotion = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetActivePromotion, 'GET', null, callback, errorCallback);
    }
    this.updatePromotion = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.UpdatePromotion, 'PUT', data, callback, errorCallback, true, 'updatePromotion');
    }
    this.createPromotionOnItem = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.CreatePromotionOnItem, 'POST', data, callback, errorCallback, true, 'createPromotion');
    }
    this.deletePromotion = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.DeletePromotion, 'DELETE', data, callback, errorCallback, true, 'deletePromotion');
    }

    this.activePromotion = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.ActivePromotion, 'PUT', data, callback, errorCallback, true, 'activePromotion');
    };
    this.getPromotionOnItemsDetail = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionOnItemsDetail + params, 'GET', null, callback, errorCallback)
    }
    this.getPromotionOnBillDetail = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionOnBillDetail + params, 'GET', null, callback, errorCallback)
    }

    this.updateEvent = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.UpdatePromotionEvent, 'PUT', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'updateEvent');
    }

    this.getPromotionEvent = function (data, callback, errorCallBack) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionEvent + params, 'GET', null, callback, errorCallBack)
    }

    this.getPromotionEvents = function (data, callback, errorCallBack) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionEvents + params, 'GET', null, callback, errorCallBack)
    }

    this.createNewEvent = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.CreatePromotionEvent, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'createNewEvent');
    }

    this.deleteEvent = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.DeletePromotionEvent, 'DELETE', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'deleteEvent');
    }
    //export data to excel file 
    this.exportProductItem = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Promotion.ExportProductItem, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'exportProductItem');
    };

    //apply
    this.getApplying = function (data, callback, errorCallBack) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetApplying, 'POST', data, callback,  errorCallBack)
    }

    this.getBillApplying = function (data, callback, errorCallBack) {
        var params = data != null ? '?' + $.param(data) : '';
         POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetBillApplying + params, 'GET', null, callback, errorCallBack)
    }
    //get ID by Code
    this.getPromotionIdByCode = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionIdByCode + params, 'GET', null, callback, errorCallback)
    }
}]);