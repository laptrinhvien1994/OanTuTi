appRoot.service('productService',['$http', '$rootScope', function ($http, $rootScope) {
    //Product Items
    this.getProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItems + params, 'GET', null, callback, errorCallback);
    };
    this.getProductItemsByCategory = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemsByCategory, 'POST', data, callback, errorCallback);
    };

    this.getProductItemsByIds = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemsByIds, 'POST', data, callback, errorCallback);
    };

    this.getProductItemsByProductIDs = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.ProductUtilityGetItems, 'POST', data, callback, errorCallback);
    };

    this.searchProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItems + params, 'GET', null, callback, errorCallback);
    };

    this.searchProductItemsMaterials = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItemsMaterials + params, 'GET', null, callback, errorCallback);
    };

    this.searchProductItemsMaterialsHistory = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItemsMaterialsHistory + params, 'GET', null, callback, errorCallback);
    };

    this.searchProductItemsInStore = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItemsInStore + params, 'GET', null, callback, errorCallback);
    };
    this.searchProductItemsWithNonActive = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.SearchProductItemsWithNonActive + params, 'GET', null, callback, errorCallback);
    };
    this.getNewProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetNewProductItems + params, 'GET', null, callback, errorCallback);
    };
    this.getBestSellingProductItems = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetBestSelllingProductItems + params, 'GET', null, callback, errorCallback);
    };
    this.deleteProductItem = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.ProductItems.DeleteProductItem, 'DELETE', data, callback, errorCallback, true, 'deleteProductItem');
    };
    //Product
    this.getProducts = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetProducts + params, 'GET', null, callback, errorCallback);
    };
    this.getProduct = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetProduct + data, 'GET', null, callback, errorCallback);
    };
    this.searchProduct = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.SearchProduct + params, 'GET', null, callback, errorCallback);
    };
    this.createProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.CreateProduct, 'POST', data, callback, errorCallback, true, 'createProduct');
    };
    this.deleteProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.DeleteProduct, 'DELETE', data, callback, errorCallback, true, 'deleteProduct');
    };
    this.removeProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.RemoveProduct, 'DELETE', data, callback, errorCallback, true, 'removeProduct');
    };
    this.updateProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateProduct, 'PUT', data, callback, errorCallback, true, 'updateProduct');
    };

    this.updateMaterials = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateMaterials, 'PUT', data, callback, errorCallback, true, 'updateMaterials');
    }

    this.updateProductItem = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.ProductItems.UpdateProductItem, 'PUT', data, callback, errorCallback, true, 'updateProductItem');
    };

    this.importProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.ImportExcel, 'POST', data, callback, errorCallback, true, 'importProduct');
    };

    this.countProducts = function (callback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.CountProducts, 'GET', null, callback,
        function (error) {
            console.log(error);
        });
    };

    this.getProductImage = function (data, callback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetProductImage + params, 'GET', null, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: 'Hiển thị hình ảnh hàng hóa không thành công.',
                class_name: 'gritter-error',
                time: 2000
            });
        });
    };

    this.updateProductImage = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateProductImage, 'PUT', data, callback, errorCallback, true, 'updateProductImage');
    };

    this.exportExcel = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.ExportExcel, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'exportExcel');
    };

    this.printBarcode = function (data, callback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.PrintBarcode, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        });
    };


    //region "productImagesetting"
    //author: Tuấn
    //9/7/2015
    this.updateProductImageSetting = function (data, callback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateProductImageSetting, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'updateProductImageSetting');
    };
    //

    //get Lịch sữ giá
    //16/9/2015
    //Tuan
    this.getPriceHistory = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetPriceHistory + params, 'GET', null, callback, errorCallback);
    };
    //end

    this.getProductItemsForPurschase = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemsForPuschase, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        });
    };

    this.updateProductDashboard = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.ProductItems.UpdateProductDashboard, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'updateProductDashboard');
    };

    this.ProductUtility = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.ProductUtility, 'POST', data, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        }, true, 'ProductUtility');
    };
    this.productUtilityPreview = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.ProductUtilityPreview, 'POST', data, callback);
    };

    //OFFLINE: get Product for offline
    this.getProductItemsfromDate = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemsfromDate + params, 'GET', null, callback, errorCallback);
    };

    this.getProductItemSaleReturn = function (data, callback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemSaleReturn + params, 'GET', null, callback, function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 2000
            });
        });
    };

    this.updateBasicProduct = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateBasicProduct, 'PUT', data, callback, errorCallback, true, 'updateBasicProduct');
    };

    this.updateExchangeQuantity = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateExchangeQuantity, 'PUT', data, callback, errorCallback, true, 'updateExchangeQuantity');
    };

    this.getExchangeQuantity = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetExchangeQuantity, 'POST', data, callback, errorCallback);
    };

    this.getExchangeQuantityUnit = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetExchangeQuantityUnit, 'POST', data, callback, errorCallback);
    };

    this.balanceExchangeQuantity = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.ProductItems.BalanceExchangeQuantity, 'POST', data, callback, errorCallback);
    };

    this.getUnitCombo = function (callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.Product.GetUnitCombo, 'GET', null, callback, errorCallback);
    };

    this.createUnitCombo = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.CreateUnitCombo, 'POST', data, callback, errorCallback);
    };

    this.updateUnitCombo = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.UpdateUnitCombo, 'PUT', data, callback, errorCallback);
    };

    this.deleteUnitCombo = function (data, callback, errorCallback) {
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Product.DeleteUnitCombo, 'DELETE', data, callback, errorCallback);
    };

    this.getProductItemMaterials = function (data, callback, errorCallback) {
        var params = data != null ? '?' + $.param(data) : '';
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetProductItemMaterials + params, 'GET', null, callback, errorCallback);
    };

    this.getMaterialsOfItems = function (data, callback, errorCallback) {
        POSIM.CallService($http, PosimGlobal.urlRequest.POS.ProductItems.GetMaterialsOfItems, 'POST', data, callback, errorCallback);
    };
}]);
