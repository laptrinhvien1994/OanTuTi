app.service('saleService', ['$http', function ($http) {
    this.draftSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.DraftSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.DraftSaleOrder, 'POST', data, callback, errorCallback, true, 'draftSaleOrder');
    };

    this.modifySaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.ModifySaleOrder, 'PUT', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.ModifySaleOrder, 'PUT', data, callback, errorCallback, true, 'modifySaleOrder');
    };

    this.completeSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback, true, 'completeSaleOrder');
    };

    this.finalizeSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.FinalizeSaleOrder, 'PUT', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.FinalizeSaleOrder, 'PUT', data, callback, errorCallback, true, 'finalizeSaleOrder');
    };

    this.getSaleOrder = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.Order + params, 'GET', null, callback, errorCallback);
    };

    this.searchOrders = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.SearchOrders + params, 'GET', null, callback, errorCallback);
    };

    this.getWithReturns = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GetWithReturns + params, 'GET', null, callback, errorCallback);
    };

    this.storeReport = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.StoreReport + params, 'GET', null, callback, errorCallback);
    };

    this.storeExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.StoreExport, 'POST', data, callback, errorCallback);
    };

    this.GPReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPReport, 'POST', data, callback, errorCallback);
    };

    this.GPExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPExport, 'POST', data, callback, errorCallback);
    };

    this.GPByTimeReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByTimeReport, 'POST', data, callback, errorCallback);
    };

    this.GPByTimeExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByTimeExport, 'POST', data, callback, errorCallback);
    };

    this.GPByStoreReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByStoreReport, 'POST', data, callback, errorCallback);
    };

    this.GPByStoreExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByStoreExport, 'POST', data, callback, errorCallback);
    };

    this.GPByFinanceReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByFinanceReport, 'POST', data, callback, errorCallback);
    };

    this.GPByFinanceExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPByFinanceExport, 'POST', data, callback, errorCallback);
    };

    this.RevenueReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.RevenueReport, 'POST', data, callback, errorCallback);
    };

    this.RevenueReportDetail = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.RevenueReportDetail, 'POST', data, callback, errorCallback);
    };

    this.RevenueExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.RevenueExport, 'POST', data, callback, errorCallback);
    };

    //
    this.GPBySaleUserReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPBySaleUserReport, 'POST', data, callback, errorCallback);
    };
    this.GPBySaleUserExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.GPBySaleUserExport, 'POST', data, callback, errorCallback);
    };


    //add new call service : ConfirmOnlineOrder
    //Tuan
    this.confirmSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.ConfirmSaleOrder, 'PUT', data, callback, errorCallback, true, 'confirmSaleOrder');
    };
    // service: OnDeliveryOnline
    this.onDeliverySaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.OnDeliverySaleOrder, 'PUT', data, callback, errorCallback, true, 'onDeliverySaleOrder');
    };
    // service: Success
    this.finalizeOnlineSaleOrder = function (data, callback, errorCallback) {
        //POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback);
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.FinalizeOnlineSaleOrder, 'PUT', data, callback, errorCallback, true, 'finalizeOnlineSaleOrder');
    };
    this.toDeliverySaleOrder = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.CompleteSaleOrder, 'POST', data, callback, errorCallback, true, 'toDeliverySaleOrder');
    };

    this.getPaymentTypes = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Payment.GetPaymentTypes, 'GET', null, callback, errorCallback);
    };
    //
    this.salePeriodReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.SalePeriodReport, 'POST', data, callback, errorCallback);
    };
    this.salePeriodExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.SalePeriodExport, 'POST', data, callback, errorCallback);
    };
    this.saleProductItemReport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.SaleProductItemReport, 'POST', data, callback, errorCallback);
    };
    this.saleProductItemExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.SaleProductItemExport, 'POST', data, callback, errorCallback);
    };
}]);
