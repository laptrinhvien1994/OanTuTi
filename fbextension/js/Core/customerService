appRoot.service('customerService', ['$http',function ($http) {
    this.getCustomers = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomers + params, 'GET', null, callback, errorCallback);
    };
    this.searchCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SearchCustomer + params, 'GET', null, callback, errorCallback);
    };
    this.deleteCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.DeleteCustomer, 'DELETE', data, callback, errorCallback, true, 'deleteCustomer');
    };
    this.createCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.CreateCustomer, 'POST', data, callback, errorCallback, true, 'createCustomer');
    };
    this.importCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ImportExcel, 'POST', data, callback, errorCallback, true, 'importCustomer');
    };
    this.modifyCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ModifyCustomer, 'PUT', data, callback, errorCallback , true, 'createCustomer');
    };
    this.getCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.DetailCustomer + params, 'GET', data, callback, errorCallback);
    };
    this.getSuppliers = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetSuppliers + params, 'GET', null, callback, errorCallback);
    };
    this.getSupplier = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.DetailSupplier + params, 'GET', data, callback, errorCallback);
    };
    this.createSupplier = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.CreateSupplier, 'POST', data, callback, errorCallback, true, 'createSuplier');
    };
    this.modifySupplier = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ModifySupplier, 'PUT', data, callback, errorCallback, true, 'createSuplier');
    };
    this.deleteSupplier = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.DeleteSupplier, 'DELETE', data, callback, errorCallback, true, 'deleteSupplier');
    };
    this.exportCustomer = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportExcel, 'POST', data, callback, errorCallback, true, 'exportCustomer');
    };

    this.exportCustomersForGroup = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportCustomersForGroup, 'POST', data, callback, errorCallback, true, 'exportCustomersForGroup');
    };

    this.exportCustomersInGroup = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportExcelCustomersInGroup, 'POST', data, callback, errorCallback);
    };

    this.getSupplierTransaction = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SupplierTransaction, 'POST', data, callback, errorCallback);
    };

    this.getSupplierPayment = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SupplierPayment, 'POST', data, callback, errorCallback);
    };

    this.getSupplierItemsHistory = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SupplierItemsHistory, 'POST', data, callback, errorCallback);
    };
    this.getSupplierInfo = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.SupplierInfo, 'POST', data, callback, errorCallback);
    };
    this.exportSupplierItemsHistory = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportSupplierItemsHistory, 'POST', data, callback, errorCallback, true, 'exportSupplierItemsHistory');
    };
    this.exportSupplierTransaction = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportSupplierTransaction, 'POST', data, callback, errorCallback, true, 'exportSupplierTransaction');
    };
    this.exportSupplierPayment = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportSupplierPayment, 'POST', data, callback, errorCallback, true, 'exportSupplierPayment');
    };
    this.makeDebtBalance = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.MakeDebtBalance, 'POST', data, callback, errorCallback, true, 'makeDebtBalance');
    };
    //new for Offline
    this.getCustomersfromDate = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomersfromDate + params, 'GET', null, callback, errorCallback);
    };

    this.exportCustomerById = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportCustomerById, 'POST', data, callback, errorCallback, true, 'exportCustomerById');
    };

    this.exportSupllierById = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.ExportSupllierById, 'POST', data, callback, errorCallback, true, 'exportSupllierById');
    };

    //28/4/2016
    this.getProductsOfCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetProductsOfCustomer + params, 'GET', null, callback, errorCallback);
    };

    this.getPaymentsOfCustomer = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.PaymentsOfcustomer + params, 'GET', null, callback, errorCallback);
    };
    this.getVouchersOfCustomerExport = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.VouchersOfCustomerExport, 'POST', data, callback, errorCallback);
    };

    this.getOldPaymentCustomer = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetOldPaymentCustomer, 'POST', data, callback, errorCallback);
    };

    //Customer Group
    this.getCustomerGroups = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomerGroups, 'POST', data, callback, errorCallback);
    };
    this.createCustomerGroup = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.CreateCustomerGroup, 'POST', data, callback, errorCallback, true, 'createCustomerGroup');
    };
    this.updateCustomerGroup = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.UpdateCustomerGroup, 'PUT', data, callback, errorCallback, true, 'updateCustomerGroup');
    };
    this.deleteCustomerGroup = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.DeleteCustomerGroup, 'DELETE', data, callback, errorCallback, true, 'deleteCustomerGroup');
    };
    this.getCustomerGroup = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomerGroup + params, 'GET', null, callback, errorCallback);
    };
    this.getCustomersByGroup = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomerByGroup, 'POST', data, callback, errorCallback);
    };
    //Group policy
    this.getGroupPolices = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetGroupPolicy + params, 'GET', null, callback, errorCallback);
    };

    //campaign
    this.getCustomersOfGroups =  function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.GetCustomersOfGroups, 'POST', data, callback, errorCallback);
    };
    this.getCampaigns = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetCampaigns + params, 'GET', null, callback, errorCallback);
    };
    this.getCampaign = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetCampaign + params, 'GET', null, callback, errorCallback);
    };
    this.deleteCampaign = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.DeleteCampaign, 'DELETE', data, callback, errorCallback, true, 'deleteCampaign');
    };
    this.createCampaign = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.CreateCampaign, 'POST', data, callback, errorCallback, true, 'createCampaign');
    };
    this.updateCampaign = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.UpdateCampaign, 'POST', data, callback, errorCallback, true, 'updateCampaign');
    };
    this.pushListCampaignDetail = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.CampaignDetailPushList, 'POST',data, callback, errorCallback, true, 'pushListDetail');
    }
    this.exportCustomerOfCampaign = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.ExportCustomerOfCampaign, 'POST', data, callback, errorCallback, true, 'exportCustomerOfCampaign');
    };
    this.exportListCustomerOfCampaign = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.ExportListCustomerOfCampaign, 'POST', data, callback, errorCallback, true, 'exportListCustomerOfCampaign');
    };

    this.updateDetailStatus = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.UpdateDetailStatus, 'POST', data, callback, errorCallback, true, 'updateDetailStatus');
    };
    //campaign template 
    this.getTemplate = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetTemplate + params, 'GET', null, callback, errorCallback);
    };
    this.getTemplates = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetTemplates + params, 'GET', null, callback, errorCallback);
    };
    this.createOrUpdateTemplate = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.CreateOrUpdateTemplate, 'POST', data, callback, errorCallback, true, 'createCampaign');
    };

    this.countCustomers = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Customer.CountCustomers, 'GET', null, callback, errorCallback);
    };

    this.mergeCustomer = function (data, callback, errorCallback) {        
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Customer.MergeCustomer, 'POST', data, callback, errorCallback, true, 'mergeCustomer');
    };

    this.sendSMS = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.SendSMS, 'POST', data, callback, errorCallback, true, 'sendSMS');
    };

    this.getAvailableSms = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetAvailableSms, 'GET', null, callback, errorCallback);
    }

    this.getSmsHistory = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetSmsHistory + params, 'GET', null, callback, errorCallback);
    }

    this.getSmsHistoryDetail = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.Manager.Crm.GetSmsHistoryDetail + params, 'GET', null, callback, errorCallback);
    }

    this.requestCheck = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.Manager.Crm.RequestCheck, 'POST', data, callback, errorCallback, true, 'sendSMS');
    };
}]);
