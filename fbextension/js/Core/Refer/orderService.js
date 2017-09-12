appRoot.service('orderService',['$http', function ($http) {
    this.getOrders = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.Orders + params, 'GET', null, callback, errorCallback);
    };

    this.getOrdersById = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.OrdersById, 'POST', data, callback, errorCallback);
    };

    this.getOrdersInDebit = function (data, callback, errorCallback) {
        //var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.OrdersInDebit, 'POST', data, callback, errorCallback);
    };

    this.totalOrder = function (request, callback, errorCallback) {
        var params = request != null ? '?' + $.param(request) : '';
        var apiUrl = posDomain + '/sales/count';
        POSIM.CallService($http, apiUrl + params, 'GET', null, callback, errorCallback);
    };
    this.getOrderByCode = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.OrderByCode + params, 'GET', null, callback, errorCallback);
    };
    this.saleExport = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.SaleExport, 'POST', data, callback, errorCallback, true, 'saleExport');
    };

    //Tuan
    this.printOrderByIds = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.OrderByIds, 'POST', data, callback, errorCallback);
    };
    this.GetEventsById = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Event.GetEventsById + params, 'GET', null, callback, errorCallback);
    };
    this.previewOrderByIds = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.PreviewOrderByIds, 'POST', data, callback, errorCallback);
    };
    this.toDeliveryOrders = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.ToDeliveryOrders, 'POST', data, callback, errorCallback);
    };
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
    this.createShipper = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Shipper.CreateShipper, 'POST', data, callback, errorCallback, true, 'createShipper');
    }

    this.updateShipper = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Shipper.UpdateShipper, 'PUT', data, callback, errorCallback, true, 'updateShipper');
    };
    this.deleteShipper = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Shipper.DeleteShipper, 'DELETE', data, callback, errorCallback, true, 'deleteShipper');
    };


    this.getReceiptVouchersByCustomerReport = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.ReceiptVouchersByCustomerReport + params, 'GET', null, callback, errorCallback);
    };
    this.deleteReceiptVoucher = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.DeleteReceiptVouchers, 'DELETE', data, callback, errorCallback, true, 'deleteReceiptVoucher');
    };

    this.receiptVoucherExport = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.ReceiptVoucherExport, 'POST', data, callback, errorCallback, true, 'receiptVoucherExport');
    };

    this.creditRePayment = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.CreditRePayment, 'POST', data, callback,
        function (error) {
            console.log(error);
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'saleOrderCreditRepayment');
    };

    //this.createFinanceReceiptVoucher = function ( data,callback,errorCallback)
    //{
    //    POSIM.CallUniqueService($http, PosimGlobal.urlRequest.PosimGlobal.Sale.CreateFinanceReceiptVoucher, 'POST', data.callback, errorCallback);
    //}

    this.updateFinishedOrders = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.FinalizeOnlineSaleOrders, 'PUT', data, callback, errorCallback, true, 'updateFinishedOrders');
    };
    this.getOrderByIds = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.OrderByIds, 'POST', data, callback, errorCallback);
    };

    this.getOrder = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.Order + params, 'GET', null, callback, errorCallback);
    };
}]);