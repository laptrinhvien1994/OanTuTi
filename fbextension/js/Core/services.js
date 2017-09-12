app.service('customerService', ['$http',function ($http) {
    this.getCustomers = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomers + params, 'GET', null, callback, errorCallback);
    };
    this.searchCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SearchCustomer + params, 'GET', null, callback, errorCallback);
    };
    this.createCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.CreateCustomer, 'POST', data, callback, errorCallback, true, 'createCustomer');
    };

    this.getCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.DetailCustomer + params, 'GET', data, callback, errorCallback);
    };
}]);


app.service('earningPointService', ['$http', function ($http) {
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
}]);


app.service('orderService',['$http', function ($http) {
    ///SHIPPER
    this.getShipper = function (data,callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Shipper.GetShipper, 'GET', null, callback, errorCallback);
    };
    this.getShippers = function (callback, errorCallback) {
        //var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Shipper.GetShippers, 'GET', null, callback, errorCallback);
    };
    this.searchShipper = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Shipper.SearchShippers + params, 'GET', null, callback, errorCallback);
    };
}]);


app.service('posimSettingService', ['$http', function ($http) {
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
    this.postKeyValue = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.PosimSetting.PostKeyValue, 'POST', data, callback, errorCallback, true, 'postKeyValue');
    };
}]);


app.service('productService',['$http', '$rootScope', function ($http, $rootScope) {
    //Product Items
    this.getProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItems + params, 'GET', null, callback, errorCallback);
    };

    this.searchProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItems + params, 'GET', null, callback, errorCallback);
    };
    //Product
    this.getProducts = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetProducts + params, 'GET', null, callback, errorCallback);
    };
    this.getProduct = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetProduct + data, 'GET', null, callback, errorCallback);
    };
}]);

app.service('promotionService', ['$http', function ($http) {
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
    
    this.getPromotionOnItemsDetail = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionOnItemsDetail + params, 'GET', null, callback, errorCallback)
    }
    this.getPromotionOnBillDetail = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionOnBillDetail + params, 'GET', null, callback, errorCallback)
    }

    this.getPromotionEvent = function (data, callback, errorCallBack) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionEvent + params, 'GET', null, callback, errorCallBack)
    }

    this.getPromotionEvents = function (data, callback, errorCallBack) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionEvents + params, 'GET', null, callback, errorCallBack)
    }

    //get ID by Code
    this.getPromotionIdByCode = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Promotion.GetPromotionIdByCode + params, 'GET', null, callback, errorCallback)
    }
}]);

app.service('saleService', ['$http', function ($http) {
    this.draftSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.DraftSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.DraftSaleOrder, 'POST', data, callback, errorCallback, true, 'draftSaleOrder');
    };

    this.confirmSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.ConfirmSaleOrder, 'PUT', data, callback, errorCallback, true, 'confirmSaleOrder');
    };
    // service: OnDeliveryOnline
    this.onDeliverySaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.OnDeliverySaleOrder, 'PUT', data, callback, errorCallback, true, 'onDeliverySaleOrder');
    };
    
    this.toDeliverySaleOrder = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback, true, 'toDeliverySaleOrder');
    };

}]);

