app.controller('onlineOrderController', ['$rootScope', '$scope', '$route', '$routeParams', '$location', '$http', 'saleOrders', 'customerService', 'pubsubProductService', 'printer', 'settingsGlobal', 'inventoryService', 'orderService', 'ngTableParams', '$modal', 'earningPointService', 
function ($rootScope, $scope, $route, $routeParams, $location, $http, saleOrders, customerService, pubsubProductService, printer, settingsGlobal, inventoryService, orderService, ngTableParams, $modal, earningPointService) {
    var setting = settingsGlobal.getSetting();
    var storeId = $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0;

    $scope.isMultiplePrice = setting.saleSettings.ApplyCustomerPricingPolicy;
    $scope.isDecimal = setting.saleSettings.AllowQuantityAsDecimal;
    $scope.allowPriceModified = setting.saleSettings.AllowPriceModified;
    $scope.Math = window.Math;
    $scope.isProcessing = false;
    $scope.isEditDescription = false;
    $scope.applyEarningPoint = setting.saleSettings.ApplyEarningPoint;

    //set scope for class hover icon
    $scope.isHoverSubFee = false;
    $scope.isHoverAmountPaid = false;
    $scope.isHoverDiscount = false;
    //end set scope for class hover icon

    $scope.saleOrder = new saleOrders();
    // Apply promotion
    $scope.orderId = ($routeParams.orderId) ? parseInt($routeParams.orderId) : 0;
    //var storeId = $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0;
    if ($scope.orderId == 0) {
        var isApplyPromotion = true;
        $scope.saleOrder.init(true, isApplyPromotion, storeId);

        $scope.saleTypeID = 2;
        $scope.orderStatus = 0;
    }
    else {
        $scope.saleOrder.init(true);
        //storeId = $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0;
        $scope.saleOrder.loadOrder($scope.orderId, storeId, function () {
            if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer) {
                $scope.saleOrder.addCustomer($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
            }
            else {
                $scope.saleOrder.changeStore(storeId);
            }
        });

        $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Customer', function () {
            $scope.customer = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer;
            if ($scope.customer) {
                if (!$scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion)
                    $scope.customer.typeName = $scope.customer.type == 1 ? "K.Sỉ" : $scope.customer.type == 2 ? "K.VIP" : '';
                else $scope.customer.typeName = '';

                //Earning Point
                setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
            }
        }, true);
        $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Code', function () {
            if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Code != "") {
                selectShipper();

                if ($scope.saleShippingDatePicker) {
                    if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.shipper.shippingDate != null) {
                        $scope.saleShippingDatePicker.value(new Date(PosimGlobal.convertJsonDateTimeToJs($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.shipper.shippingDate)));
                    }
                    else {
                        $scope.saleShippingDatePicker.value(null);
                    }
                };
            }

            $scope.thisStatus = angular.copy($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.status);


        }, true);
    }

    $scope.getPromotionsOfOrders = function (promotionID) {
        if (promotionID === undefined) return '';
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion) {
            var existItems = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.promotions.filter(function (pItem) {
                return pItem.promotionID == promotionID;
            });
            return existItems.length > 0 ? existItems[0].promotionName : '';
        }

    }
    //end Apply promotion


    $scope.order_info_active = 'tab-pane in active';
    $scope.order_tracked_active = 'tab-pane';
    $scope.getOrderInfo = function () {
        $scope.order_info_active = 'tab-pane in active';
        $scope.order_tracked_active = 'tab-pane';
    };
    $scope.StatusLabel = function (status, type) {
        if (type == 1) {
            switch (status) {
                case 1:
                    return 'Lưu tạm';
                case 2:
                    return 'Hoàn thành';
                default:
                    return '';
            }
        }
        else {
            switch (status) {
                case 1:
                    return 'Đặt hàng';
                case 2:
                    return 'Xác nhận';
                case 3:
                    return 'Giao hàng';
                case 4:
                    return 'Hoàn thành';
                case 5:
                    return 'Đã hủy';
                default:
                    return '';
            }
        }
    };
    $scope.dateTimePickerOptions = {
        max: new Date()
    };
    //Set default time if open calendar
    $("#saleDatePicker").kendoDateTimePicker({
        format: "dd/MM/yyyy HH:mm",
        max: new Date()
    });
    $("#shippingDatePicker").kendoDateTimePicker({
        format: "dd/MM/yyyy HH:mm",
    });

    $scope.saleDatePicker = $("#saleDatePicker").data("kendoDateTimePicker");

    $scope.saleShippingDatePicker = $("#shippingDatePicker").data("kendoDateTimePicker");

    $scope.saleDatePicker.bind("close", function (e) {
        if (e.view === "date") {
            if ($scope.saleDatePicker.value()) {
                var date = $scope.saleDatePicker.value();
                var current = new Date();
                $scope.saleDatePicker.value(new Date(date.getFullYear(), date.getMonth(), date.getDate(), current.getHours(), current.getMinutes(), current.getSeconds()));
            }
            $scope.saleOrder.Items[0].SaleOrder.SaleDate = $scope.saleDatePicker.value();
        }
        else if (e.view === "time") {
            $scope.saleOrder.Items[0].SaleOrder.SaleDate = $scope.saleDatePicker.value();
        }
    });
    $scope.saleShippingDatePicker.bind("close", function (e) {
        if (e.view === "date") {
            if ($scope.saleShippingDatePicker.value()) {
                var date = $scope.saleShippingDatePicker.value();
                var current = new Date();
                $scope.saleShippingDatePicker.value(new Date(date.getFullYear(), date.getMonth(), date.getDate(), current.getHours(), current.getMinutes(), current.getSeconds()));
            }
            $scope.saleOrder.Items[0].SaleOrder.shipper.shippingDate = $scope.saleShippingDatePicker.value();
        }
        else if (e.view === "time") {
            $scope.saleOrder.Items[0].SaleOrder.shipper.shippingDate = $scope.saleShippingDatePicker.value();
        }
    });
    $scope.saleDatePicker.bind("change", function () {
        $scope.saleOrder.Items[0].SaleOrder.SaleDate = this.value();
        //Apply promotion
        $scope.saleOrder.changeSaleDate(this.value() == null ? new Date().toJSON() : $scope.saleOrder.Items[0].SaleOrder.SaleDate.toJSON());
        //end Apply promotion
    });
    $scope.saleShippingDatePicker.bind("change", function () {
        $scope.saleOrder.Items[0].SaleOrder.shipper.shippingDate = this.value();
    });
    $scope.shipperChange = function (data) {
        $scope.shipper = data;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.shipper.shipperId = data.shipperId;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.shipper.name = data.name;
        //$scope.saleShippingDatePicker.value(null);
        selectShipper();
    };
    $scope.$watch('saleOrder.Items[0].SaleOrder.SaleDate', function () {
        if ($scope.saleDatePicker) {
            if ($scope.saleOrder.Items[0].SaleOrder.SaleDate) {
                $scope.saleDatePicker.value(new Date($scope.saleOrder.Items[0].SaleOrder.SaleDate));
            }
            else {
                $scope.saleDatePicker.value(null);
            }

            if ($scope.saleOrder.Items[0].SaleOrder.status > 1) $scope.saleDatePicker.enable(false);
        }
    }, true);


    pubsubProductService.onPickProductItem($scope, function (message) {
        var productItem = message.ProductItem;

        productItem.quantity = 1;
        productItem.discount = 0;
        productItem.discountIsPercent = false;
        productItem.discountInPercent = 0;

        //Apply promotion
        productItem.onItemPromotions = [];
        productItem.onItemPromotionSelected = null;
        //Apply promotion

        //Mặc định là bán lẻ
        productItem.unitPrice = productItem.retailPrice;
        productItem.sellPrice = productItem.retailPrice;
        productItem.subTotal = productItem.retailPrice;

        //Chính sách giá
        if ($scope.isMultiplePrice && $scope.customer) {
            if ($scope.customer.type === 1) {//Giá sỉ
                productItem.unitPrice = productItem.wholeSalePrice;
                productItem.sellPrice = productItem.wholeSalePrice;
                productItem.subTotal = productItem.wholeSalePrice;
            }
            else if ($scope.customer.type === 2) {//Giá vip
                productItem.unitPrice = productItem.vipPrice;
                productItem.sellPrice = productItem.vipPrice;
                productItem.subTotal = productItem.vipPrice;
            }
        }

        if (productItem.isSerial == true) productItem.quantity = 0;

        $scope.addProductItem(productItem);

        $scope.saleOrder.calculateTotalOnline(true);
    });

    $scope.onItemQtyChange = function (item, index) {
        /*
        if (!item) return;
        if (item.qtyAvailable < parseFloat(item.quantity) && item.isUntrackedItemSale === false && item.isInventoryTracked === true) {
            var errorMessage = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + item.itemName + '] và thử lại.'
            $.gritter.add({
                title: 'Thông báo',
                text: errorMessage,
                class_name: 'gritter-warning',
                time: 15000
            });
            item.quantity = item.qtyAvailable;
        };

        //Apply promotion
        $scope.saleOrder.minusProductItem(item);
        */

        if (!item) return;
        if (item.onChangeCount === null || item.onChangeCount === undefined) { item.onChangeCount = 0; }
        item.onChangeCount += 1;
        if (item.onChangeCount == 1) {
            item.quantity = $scope.isDecimal ? parseFloat(item.quantity.replace(/\,/g, '')) : parseInt(item.quantity.replace(/\,/g, ''));
            var errorModel = $scope.saleOrder.minusProductItem(item);
            if (!errorModel.isValid) {
                PosimGlobal.showMessage(errorModel.message, 'warning');
            }
        }
        else {
            item.onChangeCount = 0;
        }
    };

    $scope.addProductItem = function (item, index) {
        if (!item) return;
        var productItem = angular.copy(item);
        if ($scope.isDecimal == false) {
            item.quantity = parseInt(item.quantity);
        }
        else {
            item.quantity = parseFloat(item.quantity);
        }

        if (item.isSerial == true) {
            productItem.openSerial = true;
            //productItem.serialNumbers = [];

            // check exist item
            var existItems = $scope.saleOrder.Items[0].SaleOrder.Details.filter(function (pItem) {
                return pItem.itemId == item.itemId;
            });

            if (existItems.length == 0) {
                var requestData = { storeId: $rootScope.workingStore.StoreID, itemId: productItem.itemId, status: [1] };
                inventoryService.getSerialNumbers(requestData, function (sno) {
                    productItem.serialNumbers = sno.serialNumbers;
                    if (productItem.serialNumbers != null && productItem.serialNumbers.length > 0) {
                        var serialSearch = productItem.serialNumbers.filter(function (s) { return s.serial === $rootScope.keyword; });
                        if (serialSearch.length > 0) {
                            if (productItem.serials == undefined || productItem.serials == null) productItem.serials = [];
                            var existsSerial = productItem.serials.filter(function (s) { return s.serial === serialSearch[0].serial; });
                            if (existsSerial.length > 0) {
                                PosimGlobal.showMessage('Serial [' + existsSerial[0].serial + '] đã có trong hóa đơn. Vui lòng nhập serial khác.', 'warning');
                            }
                            else {
                                productItem.serials.push({ serial: serialSearch[0].serial });
                                productItem.quantity = productItem.serials.length;

                                //build multi select
                                if (productItem.serialNumbers.length > 0) {
                                    var arrSerial = productItem.serialNumbers.filter(function (s) {
                                        return s.serial == serialSearch[0].serial;
                                    });
                                    if (arrSerial.length > 0) {
                                        var index = productItem.serialNumbers.indexOf(arrSerial[0]);
                                        productItem.serialNumbers[index].ticked = true;
                                    }
                                }

                                var errorModel = $scope.saleOrder.addProductItem(productItem);
                                if (!errorModel.isValid) {
                                    PosimGlobal.showMessage(errorModel.message, 'warning');
                                }
                            }
                        }
                        else {
                            var errorModel = $scope.saleOrder.addProductItem(productItem);
                            if (!errorModel.isValid) {
                                PosimGlobal.showMessage(errorModel.message, 'warning');
                            }
                        }
                    }
                    else {
                        PosimGlobal.showMessage('Hàng hóa [' + productItem.itemName + '] chưa khai báo serial. Vui lòng vào nhập kho để khai báo serial cho hàng hóa.', 'warning');
                    }
                    $rootScope.keyword = '';
                },
                function (error) {
                    PosimGlobal.showMessage(error.responseStatus.message, 'error');
                    $rootScope.keyword = '';
                });
            }
            else {
                productItem = existItems[0];
                if (productItem.serialNumbers != null && productItem.serialNumbers.length > 0) {
                    var serialSearch = productItem.serialNumbers.filter(function (s) { return s.serial === $rootScope.keyword; });
                    if (serialSearch.length > 0) {
                        var existsSerial = productItem.serials.filter(function (s) { return s.serial === serialSearch[0].serial; });
                        if (existsSerial.length > 0) {
                            PosimGlobal.showMessage('Serial [' + existsSerial[0].serial + '] đã có trong hóa đơn. Vui lòng nhập serial khác.', 'warning');
                        }
                        else {
                            productItem.serials.push({ serial: serialSearch[0].serial });
                            productItem.quantity = productItem.serials.length;

                            //build multi select
                            if (productItem.serialNumbers.length > 0) {
                                var arrSerial = productItem.serialNumbers.filter(function (s) {
                                    return s.serial == serialSearch[0].serial;
                                });
                                if (arrSerial.length > 0) {
                                    var index = productItem.serialNumbers.indexOf(arrSerial[0]);
                                    productItem.serialNumbers[index].ticked = true;
                                }
                            }

                            var errorModel = $scope.saleOrder.minusProductItem(item);
                            if (!errorModel.isValid) {
                                PosimGlobal.showMessage(errorModel.message, 'warning');
                            }
                        }
                    }
                }
                else {
                    PosimGlobal.showMessage('Hàng hóa [' + item.itemName + '] chưa khai báo serial. Vui lòng vào nhập kho để khai báo serial cho hàng hóa.', 'warning');
                }
                $rootScope.keyword = '';
            }
        }
        else {
            var errorModel = $scope.saleOrder.addProductItem(productItem);
            if (!errorModel.isValid) {
                PosimGlobal.showMessage(errorModel.message, 'warning');
            }
        }
    }



    //Apply Promotion
    $scope.minusQuantity = function (item) {
        item.quantity = Math.max(item.quantity - 1, 1);
        //$scope.saleOrder.minusProductItem(item);
        var errorModel = $scope.saleOrder.minusProductItem(item);
        if (!errorModel.isValid) {
            PosimGlobal.showMessage(errorModel.message, 'warning');
        }
    };
    //End Apply Promotion

    $scope.deleteProductItem = function (index) {
        $scope.saleOrder.deleteProductItem(index);
    }
    $scope.deleteAllProductItem = function () {
        $scope.saleOrder.deleteAllProductItem();
    };
    /// MAIN FUNCTIONS
    $scope.draftOrder = function () {
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion || $scope.isExchangeable) {
            var msg = '';
            if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion && $scope.isExchangeable) {
                msg = 'Chương trình khuyến mãi và đổi điểm tích lũy sẽ được thiết lập lại. Bạn có chắc tiếp tục thao tác này?';
            }
            else if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion && !$scope.isExchangeable) {
                msg = 'Chương trình khuyến mãi sẽ được thiết lập lại. Bạn có chắc tiếp tục thao tác này?';
            }
            else if (!$scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.isPromotion && $scope.isExchangeable) {
                msg = 'Đổi điểm tích lũy sẽ được thiết lập lại. Bạn có chắc tiếp tục thao tác này?';
            }

            bootbox.confirm(msg, function (result) {
                if (result) {
                    draftOrderFunction();
                }
            });
        }
        else {
            draftOrderFunction();
        }

    }
    var draftOrderFunction = function () {
        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }
        else {
            //reset earning point
            resetEarningPoint();

            if ($scope.orderId === 0) {
                if (setting.limit.IsSaleOrderPerDayLimit) {
                    POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                    return;
                }
                $scope.isProcessing = true;
                $scope.saleOrder.draftOrder($scope.draftOrderCallback, $scope.saveOrderError, 1);
            }
            else {
                $scope.isProcessing = true;
                $scope.saleOrder.modifyOrder($scope.modifyOrderCallback, $scope.saveOrderError);
            }
        }
    };

    $scope.confirmOrder = function () {
        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }
        else {
            if (setting.limit.IsSaleOrderPerDayLimit) {
                POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                return;
            }
            $scope.isProcessing = true;
            if ($scope.orderId === 0) {
                $scope.saleOrder.createWhoseSaleOrder($scope.saveOrderCallback, $scope.saveOrderError);
            }
            else {
                $scope.saleOrder.confirmOrder($scope.saveOrderCallback, $scope.saveOrderError);
            }
        }
    }

    $scope.onDeliveryOrder = function () {
        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }

        if ($scope.saleOrder.Items[0].SaleOrder.Details == undefined || $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details.length == 0) {
            $.gritter.add({
                title: 'Thông báo',
                text: 'Xin vui lòng chọn ít nhất 1 hàng hóa cần xuất trước khi lưu đơn hàng. Xin cảm ơn!',
                class_name: 'gritter-warning',
                time: 5000
            });
        }
        else {
            if (setting.limit.IsSaleOrderPerDayLimit) {
                POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                return;
            }
            $scope.isProcessing = true;
            if ($scope.orderId === 0) {
                $scope.saleOrder.saveOnlineOrder($scope.saveOrderCallback, $scope.saveOrderError);
            }
            else {
                $scope.saleOrder.onDeliveryOrder($scope.saveOrderCallback, $scope.saveOrderError, 0);
            }
        }
    }

    $scope.Confirm_DeliveryOrder = function () {
        if (typeof $scope.saleOrder.Items[0].SaleOrder.Customer == 'undefined' || $scope.saleOrder.Items[0].SaleOrder.Customer == null) {
            $.gritter.add({
                title: 'Thông báo',
                text: 'Xin vui lòng nhập thông tin khách hàng để hoàn tất hóa đơn. Xin cảm ơn!',
                class_name: 'gritter-warning',
                time: 5000
            });
            return;
        }

        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }
        else {
            if (setting.limit.IsSaleOrderPerDayLimit) {
                POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                return;
            }
            $scope.isProcessing = true;
            $scope.saleOrder.WhoseSaleDeliveryOrder($scope.saveOrderCallback, $scope.saveOrderError, 0);
        }
    }

    $scope.saveOrderOnline = function () {

        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }
        else {
            if (setting.limit.IsSaleOrderPerDayLimit) {
                POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                return;
            }

            $scope.isProcessing = true;
            //Apply promotion 3
            if ($scope.saleOrder.Items[0].SaleOrder.isPromotion && $scope.saleOrder.Items[0].SaleOrder.optimalPromotions !== undefined) {
                var promotionOnBills = $scope.saleOrder.Items[0].SaleOrder.optimalPromotions.filter(function (p) {
                    return p.promotionType == 2;
                });
                if (promotionOnBills.length > 0 && promotionOnBills[0].isCodeRequired) {
                    $scope.openPromotionCode(promotionOnBills[0], false);
                    return;
                }
            }
            //end Apply promotion 3
            if ($scope.orderId === 0) {
                $scope.saleOrder.saveOrder($scope.saveOrderCallback, $scope.saveOrderError);
            }
            else {
                $scope.saleOrder.finalizeOrderOnline($scope.saveOrderCallback, $scope.saveOrderError);
            }
        }
    }

    $scope.saveOnlineOrderAndPrint = function () {
        var validationResult = validateSaleOrder();
        if (validationResult != 'success') {
            $.gritter.add({
                title: 'Thông báo',
                text: validationResult,
                class_name: 'gritter-warning',
                time: 5000
            });
            $scope.isProcessing = false;
            return;
        }
        else {
            if (setting.limit.IsSaleOrderPerDayLimit) {
                POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
                return;
            }
            $scope.isProcessing = true;
            if ($scope.orderId === 0) {
                $scope.saleOrder.saveOnlineOrder($scope.saveOrderAndPrintCallback, $scope.saveOrderError);
            }
            else {
                $scope.saleOrder.finalizeOrderOnline($scope.saveOrderAndPrintCallback, $scope.saveOrderError);
            }
        }
    }

    //$scope.cancelOrder = function () {
    //    $scope.saleOrder.cancelOrder();
    //    $scope.customerSearchTerm = '';
    //    $scope.customer = null;
    //    $scope.isProcessing = false;
    //}

    $scope.draftOrderCallback = function (data) {
        if (data != undefined && data != null) {
            //if (data.orderId > 0) {
            //    $scope.orderId = data.orderId;
            //    $scope.saleOrder.loadOrder($scope.orderId);
            //}
            $.gritter.add({
                title: 'Thông báo',
                text: 'Đã lưu thành công đơn hàng',
                class_name: 'gritter-success',
                time: 1500
            });
            if (!setting.limit.IsSaleOrderPerDayLimit) {
                $.ajax({
                    type: "POST",
                    url: "/api/auth/GetSettings",
                }).done(function (dataResponse) {
                    localStorage.setItem("settings", JSON.stringify(dataResponse));
                    $rootScope.setting = angular.copy(dataResponse);
                });
            }
            $scope.isProcessing = false;
            $location.path('/order/online');
            $route.reload();
        }
    };

    $scope.modifyOrderCallback = function (data) {
        if (data != undefined && data != null) {
            $.gritter.add({
                title: 'Thông báo',
                text: 'Đã lưu thành công đơn hàng ' + data.saleOrder.saleOrderCode,
                class_name: 'gritter-success',
                time: 1500
            });
            $scope.isProcessing = false;
            $scope.orderId = data.saleOrder.saleOrderId;
            $scope.saleOrder.Items[0].SaleOrder.SaleOrderId = data.saleOrder.saleOrderId;
            $scope.saleOrder.Items[0].SaleOrder.Code = data.saleOrder.saleOrderCode;

            //Earning Point
            if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer != null) {
                setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
            }
        }
    };

    $scope.saveOrderCallback = function (data) {
        if (data != undefined && data != null) {
            $.gritter.add({
                title: 'Thông báo',
                text: 'Đã lưu thành công đơn hàng ' + data.saleOrder.saleOrderCode,
                class_name: 'gritter-success',
                time: 1500
            });
            if (!setting.limit.IsSaleOrderPerDayLimit) {
                $.ajax({
                    type: "POST",
                    url: "/api/auth/GetSettings",
                }).done(function (dataResponse) {
                    localStorage.setItem("settings", JSON.stringify(dataResponse));
                    $rootScope.setting = angular.copy(dataResponse);
                });
            }
            $scope.isProcessing = false;
            $location.path('/order');
        }
    };

    $scope.saveOrderAndPrintCallback = function (data) {
        if (data != undefined && data != null) {
            var request = { saleOrderId: data.saleOrder.saleOrderId };
            var params = request != null ? '?' + $.param(request) : '';
            POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.Order + params, 'GET', null,
                function (callbackData) {
                    var html = printer.initializeOrder(null, 2);
                    if (html) {
                        //Metadata
                        callbackData.saleOrder.Date = new Date();
                        callbackData.saleOrder.companyName = setting.companyInfo.Name;
                        callbackData.saleOrder.companyPhone = setting.companyInfo.PhoneNumber;
                        callbackData.saleOrder.companyAddress = setting.companyInfo.Address;
                        var store = PosimGlobal.getStore(callbackData.saleOrder.storeId, setting.allStores);
                        if (store) {
                            callbackData.saleOrder.storeName = store.StoreName;
                            callbackData.saleOrder.storePhone = store.StorePhone;
                            callbackData.saleOrder.storeAddress = store.StoreAddress;
                        }
                        callbackData.saleOrder.taxCode = setting.companyInfo.TaxCode;
                        var saleUser = PosimGlobal.getUser(callbackData.saleOrder.saleUser, setting.allUsers.UserProfiles);
                        callbackData.saleOrder.saleUserName = saleUser != null ? saleUser.DisplayName : '';
                        var cashier = PosimGlobal.getUser(callbackData.saleOrder.cashier, setting.allUsers.UserProfiles);
                        callbackData.saleOrder.cashierName = cashier != null ? cashier.DisplayName : '';
                        callbackData.saleOrder.saleDateString = PosimGlobal.formatDateJsonToString(callbackData.saleOrder.saleOrderDate);
                        //promotion 2
                        callbackData.saleOrder.totalAsWords = PosimGlobal.convertNumberToWords(callbackData.saleOrder.total);
                        callbackData.saleOrder.totalDiscount = 0;
                        callbackData.saleOrder.totalOldBalance = callbackData.saleOrder.customer != null ? callbackData.saleOrder.customer.totalOldBalance : 0;
                        callbackData.saleOrder.totalRemainBalance = callbackData.saleOrder.paymentBalance + callbackData.saleOrder.totalOldBalance;
                        //vat
                        callbackData.saleOrder.totalVat = 0;
                        callbackData.saleOrder.subTotalWithoutVat = 0;
                        if (callbackData.saleOrder.orderDetails.length > 0) {
                            for (var i = 0; i < callbackData.saleOrder.orderDetails.length; i++) {
                                callbackData.saleOrder.totalDiscount += callbackData.saleOrder.orderDetails[i].quantity * (callbackData.saleOrder.orderDetails[i].discountIsPercent ? Math.round(callbackData.saleOrder.orderDetails[i].discount * callbackData.saleOrder.orderDetails[i].unitPrice / 100) : callbackData.saleOrder.orderDetails[i].discount);
                                //vat
                                callbackData.saleOrder.totalVat += callbackData.saleOrder.orderDetails[i].quantity * callbackData.saleOrder.orderDetails[i].vat;
                                callbackData.saleOrder.subTotalWithoutVat += callbackData.saleOrder.orderDetails[i].quantity * ((callbackData.saleOrder.orderDetails[i].discountIsPercent ? callbackData.saleOrder.orderDetails[i].unitPrice * (1 - callbackData.saleOrder.orderDetails[i].discount / 100) : callbackData.saleOrder.orderDetails[i].unitPrice - callbackData.saleOrder.orderDetails[i].discount) - callbackData.saleOrder.orderDetails[i].vat);
                            }
                        }
                        callbackData.saleOrder.applyEarningPoint = $scope.applyEarningPoint;
                        //end promotion 2

                        //Print
                        printer.print(html, callbackData.saleOrder);
                        //Success Message
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Đã lưu và in thành công đơn hàng ' + callbackData.saleOrder.saleOrderCode,
                            class_name: 'gritter-success',
                            time: 1500
                        });
                    }
                    else {
                        //Warning message
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Đã lưu thành công đơn hàng ' + callbackData.saleOrder.saleOrderCode + '. hóa đơn in chưa in được vì lỗi mẫu in, xin vui lòng kiểm tra lại!',
                            class_name: 'gritter-warning',
                            time: 5000
                        });
                    }
                    $scope.isProcessing = false;
                },
                function (callbackError) {

                    $.gritter.add({
                        title: 'Thông báo',
                        text: 'Đã lưu thành công đơn hàng nhưng chưa in được hóa đơn. Xin vui lòng in lại hóa đơn sau.' + data.saleOrder.saleOrderCode,
                        class_name: 'gritter-warning',
                        time: 1500
                    });
                    $scope.isProcessing = false;
                }, true, 'saveOrderAndPrintCallback');

            if (!setting.limit.IsSaleOrderPerDayLimit) {
                $.ajax({
                    type: "POST",
                    url: "/api/auth/GetSettings",
                }).done(function (dataResponse) {
                    localStorage.setItem("settings", JSON.stringify(dataResponse));
                    $rootScope.setting = angular.copy(dataResponse);
                });
            }
            $scope.isProcessing = false;
            $location.path('/order/viewonline/' + data.saleOrder.saleOrderId);
        }
    };

    $scope.saveOrderError = function (data) {
        //console.log(data);
        var msg = data.responseStatus != null ? data.responseStatus.message : data;
        $.gritter.add({
            title: 'Thông báo',
            //text: 'Lưu đơn hàng không thành công vì ' + data + '. Xin vui lòng thử lại!',
            text: msg,
            class_name: 'gritter-error',
            time: 1500
        });
        $scope.isProcessing = false;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.status = $scope.thisStatus;
    };

    $scope.print = function () {
        var html = printer.initializeOrder(null, 2);
        if (html) {
            //Metadata
            $scope.saleOrder.Date = new Date();
            $scope.saleOrder.companyName = setting.companyInfo.Name;
            $scope.saleOrder.companyPhone = setting.companyInfo.PhoneNumber;
            $scope.saleOrder.companyAddress = setting.companyInfo.Address;
            var store = PosimGlobal.getStore($('#dllInventory').val(), setting.allStores);
            if (store) {
                $scope.saleOrder.storeName = store.StoreName;
                $scope.saleOrder.storePhone = store.StorePhone;
                $scope.saleOrder.storeAddress = store.StoreAddress;
            }
            $scope.saleOrder.taxCode = setting.companyInfo.TaxCode;
            $scope.saleOrder.saleUserName = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Seller == '' ? '' : $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Seller.DisplayName;

            $scope.saleOrder.cashierName = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Cashier == '' ? '' : $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Cashier.DisplayName;
            $scope.saleOrder.saleDateString = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SaleDate;
            //Print
            $scope.saleOrder.orderDetails = angular.copy($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details);
            $scope.saleOrder.customer = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer;
            $scope.saleOrder.subTotal = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SubTotal;
            $scope.saleOrder.discount = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Discount;
            $scope.saleOrder.subFee = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SubFee;
            $scope.saleOrder.total = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total;
            $scope.saleOrder.amountPaid = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid;
            $scope.saleOrder.paymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance;
            $scope.saleOrder.comment = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Comment;
            $scope.saleOrder.saleOrderCode = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Code;
            $scope.saleOrder.saleDateString = dateFormat($scope.saleOrder.saleDateString, "dd/mm/yyyy HH:MM:ss");
            $scope.saleOrder.totalAsWords = PosimGlobal.convertNumberToWords($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total);
            $scope.saleOrder.totalDiscount = 0;
            $scope.saleOrder.totalOldBalance = $scope.saleOrder.customer != null && $scope.saleOrder.customer.totalOldBalance ? $scope.saleOrder.customer.totalOldBalance : 0;
            $scope.saleOrder.totalRemainBalance = $scope.saleOrder.paymentBalance + $scope.saleOrder.totalOldBalance;
            //vat
            $scope.saleOrder.totalVat = 0;
            $scope.saleOrder.subTotalWithoutVat = 0;
            if ($scope.saleOrder.orderDetails.length > 0) {
                for (var i = 0; i < $scope.saleOrder.orderDetails.length; i++) {
                    if ($scope.saleOrder.orderDetails[i].discountIsPercent) {
                        $scope.saleOrder.orderDetails[i].discount = $scope.saleOrder.orderDetails[i].discountInPercent;
                    }
                    $scope.saleOrder.totalDiscount += $scope.saleOrder.orderDetails[i].quantity * ($scope.saleOrder.orderDetails[i].discountIsPercent ? Math.round($scope.saleOrder.orderDetails[i].discount * $scope.saleOrder.orderDetails[i].unitPrice / 100) : $scope.saleOrder.orderDetails[i].discount);
                    //vat
                    $scope.saleOrder.totalVat += $scope.saleOrder.orderDetails[i].quantity * $scope.saleOrder.orderDetails[i].vat;
                    $scope.saleOrder.subTotalWithoutVat += $scope.saleOrder.orderDetails[i].quantity * (($scope.saleOrder.orderDetails[i].discountIsPercent ? $scope.saleOrder.orderDetails[i].unitPrice * (1 - $scope.saleOrder.orderDetails[i].discount / 100) : $scope.saleOrder.orderDetails[i].unitPrice - $scope.saleOrder.orderDetails[i].discount) - $scope.saleOrder.orderDetails[i].vat);
                }
            }
            $scope.saleOrder.applyEarningPoint = $scope.applyEarningPoint;
            $scope.saleOrder.exchangedMoney = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.exchangedMoney;
            printer.print(html, $scope.saleOrder);
        }
    };

    $scope.redirectToCreateOrder = function (type) {
        if (setting.limit.IsSaleOrderPerDayLimit) {
            POSIM.Dialog('Bạn đã sử dụng hết ' + setting.limit.MaxSaleOrderPerDay + ' đơn hàng đã đăng ký theo gói dịch vụ đang sử dụng.', 'Đăng ký thêm hạn mức');
            return;
        }
        if (type == 1) $location.path('/order/create');
        else {
            $location.path('/order/online');
        }
    };

    $scope.cancelOrder = function (saleId, code) {

        bootbox.confirm("Bạn muốn Hủy đơn hàng " + code + " ?", function (result) {
            if (result) {
                var apiUrl = posDomain + '/sale/delete';
                POSIM.CallUniqueService($http, apiUrl, 'DELETE', { saleOrderId: saleId, type: 1 },
                    function () {
                        $location.path('/order');
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Hủy đơn hàng ' + code + ' thành công.',
                            class_name: 'gritter-success',
                            time: 1500
                        });
                    }, function (error) {
                        console.log(error);
                        $.gritter.add({
                            title: 'Thông báo',
                            text: error.responseStatus && error.responseStatus.message ? error.responseStatus.message : 'Hủy đơn hàng ' + code + ' không thành công.',
                            class_name: 'gritter-error',
                            time: 1500
                        });
                    }, true, 'cancelOrder');
            }
        });

    };

    $scope.deleteSale = function (saleId, code) {
        bootbox.confirm("Bạn muốn Xóa đơn hàng " + code + " ?", function (result) {
            if (result) {
                var apiUrl = posDomain + '/sale/delete';
                POSIM.CallUniqueService($http, apiUrl, 'DELETE', { saleOrderId: saleId, type: 0 },
                    function () {
                        $location.path('/order');
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Xóa đơn hàng ' + code + ' thành công.',
                            class_name: 'gritter-success',
                            time: 1500
                        });
                    }, function (error) {
                        console.log(error);
                        $.gritter.add({
                            title: 'Thông báo',
                            text: error.responseStatus && error.responseStatus.message ? error.responseStatus.message : 'Xóa đơn hàng ' + code + ' không thành công.',
                            class_name: 'gritter-error',
                            time: 1500
                        });
                    }, true, 'deleteSale');
            }
        });


    };

    var validateSaleOrder = function () {
        if ($scope.saleOrder.Items[0].SaleOrder.Details == undefined || $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details.length == 0) {
            return 'Xin vui lòng chọn ít nhất 1 hàng hóa cần xuất trước khi lưu đơn hàng. Xin cảm ơn!';
        }
        if ($scope.saleOrder.Items[0].SaleOrder.SubTotal > 99999999999999) {
            return 'Xin vui lòng kiểm tra lại phiếu xuất vì tổng tiền hàng quá lớn và vượt giới hạn cho phép của hệ thống.';
        }
        return 'success';
    };

    $scope.events = [];
    $scope.getEvents = function () {
        $scope.order_tracked_active = 'tab-pane in active';
        $scope.order_info_active = 'tab-pane';
        if ($scope.orderId > 0) {

            orderService.GetEventsById({ beanId: $scope.orderId }, function (data) {
                $scope.events = data.items;
            },
            function (error) {
                console.log('Error: getEvents');
                console.log(error);
            });
        }
    };

    //clone order
    $scope.duplicateOrder = function (orderId) {
        $location.path('/order/clone/' + orderId);
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
    };

    //clone order
    $scope.duplicateOnlineOrder = function (orderId) {
        $location.path('/order/clone/online' + orderId);
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
    };

    /// END MAIN FUNCTIONS

    $scope.isSaved = false;
    $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Details', function () {
        if ($scope.isSaved == false) $scope.savedata = angular.copy($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder);
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.saleTypeID == 0) {
            $scope.isSaved = false;
        }
        else {
            $scope.isSaved = true;
        }
        $scope.saleOrder.calculateTotal();
        if (typeof $scope.saleOrder.Items[0].SaleOrder.payments != 'undefined') {
            $scope.orderStatus = $scope.orderId == 0 ? 0 : $scope.saleOrder.Items[0].SaleOrder.status;
            $scope.saleTypeID = $scope.orderId == 0 ? 2 : $scope.saleOrder.Items[0].SaleOrder.saleTypeID;
        }

    }, true);

    if ($scope.orderId == 0) {
        $scope.saleTypeID = 2;
        $scope.orderStatus = 0;
    };

    $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentMethod = 1;
    $scope.moreAmountPaid = false;
    $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid', function () {
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total > $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid) {
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid;
            $scope.moreAmountPaid = false;
        }
        else {
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total;
            $scope.moreAmountPaid = true;
        }
    });
    $scope.$watch('saleOrder.Items[0].SaleOrder.Discount', function () {
        // console.log($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder);

        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid;
    });
    $scope.quantityContent = "Tổng số lượng: <strong>{{saleOrder.Items[0].SaleOrder.TotalQuantity}}</strong> <br/> Số mặt hàng: <strong>{{saleOrder.Items[0].SaleOrder.Details.length}}</strong>";

    //Customer
    $scope.customerSearchTerm = '';
    $scope.customer = null;

    $scope.initCustomer = function () {
        $scope.customer = {
            customerId: 0,
            name: '',
            phone: '',
            address: '',
            emails: [],
            gender: null,
            birthday: null
        };
    };

    $scope.searchTermChanged = function (searchTerm) {
        //console.log("changed: " + searchTerm);
        var request = new Object();
        request.keyword = searchTerm;
        request.limit = 20;
        request.pageIndex = 0;
        request.sorting = null;
        if (searchTerm == undefined || searchTerm == null || searchTerm == "") return;
        customerService.searchCustomer(request, function (data) {
            $scope.searchCustomers = data.customers;
            $scope.searchCustomerTotal = data.total;
        }, function (error) {
            console.log("search customer error");
        });
    };

    $scope.customerCallback = function (customerResponse) {
        $scope.customer.customerId = customerResponse.customerId;
        $scope.customer.code = customerResponse.code;
        if ($scope.customer.email != '') {
            $scope.customer.emails = [{ email: $scope.customer.email, emailId: 0, primary: true }];
        }
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer = $scope.customer;

        //Apply promotion
        $scope.saleOrder.addCustomer($scope.customer);
        //end Apply promotion

        //Earning Point
        resetEarningPoint();
        setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
    }

    $scope.cancelCustomer = function () {
        $scope.customer = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer;
        //Earning Point
        setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
    };

    $scope.onEmptyListSelect = function () {
        $scope.searchCustomers = [];
        $scope.searchCustomerTotal = 0;
        //Earning Point
        resetEarningPoint();
    };

    $scope.onCustomerSelected = function (c) {
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer = c;
        $scope.customer = c;
        $scope.customer.typeName = c.type == 1 ? "K.Sỉ" : c.type == 2 ? "K.VIP" : '';
        //Chính sách giá
        if ($scope.isMultiplePrice) {
            $scope.saleOrder.repricingOrder($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder);
        }
        $scope.saleOrder.addCustomer(c);

        //Earning Point
        setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);

    };

    $scope.onCustomerDeselected = function () {
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer = null;
        $scope.customer = null;
        //Chính sách giá
        if ($scope.isMultiplePrice) {
            $scope.saleOrder.repricingOrder($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder);
        }
        //Apply promotion
        $scope.saleOrder.removeCustomer();
        //end Apply promotion

        //Earning Point
        resetEarningPoint();
    };

    angular.element('[ng-model="searchParam"]').focus();
    //End Customer

    /*Hint*/
    $scope.$watch(
      function () { return $rootScope.workingStore },
      function (workingStore) {
          $scope.storeName = $rootScope.workingStore.StoreName;
          $scope.hint = {
              countProduct: setting.productCount,
              countSaleOrder: setting.saleOrderCount,
              storeName: $rootScope.workingStore.StoreName
          };
          //Apply promotion
          $scope.saleOrder.changeStore($rootScope.workingStore.StoreID);
          //end Apply promotion
      }
     );

    /*Serial*/
    $scope.toggleSerial = function (productItem) {
        productItem.serialNumbers = [];
        var requestData = { storeId: $rootScope.workingStore.StoreID, itemId: productItem.itemId, status: [1] };
        inventoryService.getSerialNumbers(requestData, function (sno) {
            productItem.serialNumbers = sno.serialNumbers;
            if (productItem.serials.length > 0 && productItem.serialNumbers.length > 0) {
                //build multi select
                var serials = [];
                for (var i = 0; i < productItem.serials.length; i++) {
                    serials.push(productItem.serials[i].serial);
                }
                var arrSerial = productItem.serialNumbers.filter(function (s) {
                    //return s.serial == serialItem.serial;
                    return serials.indexOf(s.serial) > -1;
                });
                if (arrSerial.length > 0) {
                    for (var i = 0; i < arrSerial.length; i++) {
                        var index = productItem.serialNumbers.indexOf(arrSerial[i]);
                        productItem.serialNumbers[index].ticked = true;
                    }
                }
            }
        },
        function (error) {
            $.gritter.add({
                title: 'Thông báo',
                text: error.responseStatus.message,
                class_name: 'gritter-error',
                time: 1500
            });
        });


        productItem.openSerial = !productItem.openSerial;
    };

    $scope.selectSerial = function (serial, item) {
        if (item.serials == undefined || item.serials == null) item.serials = [];
        if (serial.ticked) {
            //Add a serial number
            item.serials.push({ serial: serial.serial });
            item.quantity++;
        }
        else {
            //Remove a serial number
            var arrSerial = item.serials.filter(function (s) {
                return s.serial == serial.serial;
            });
            if (arrSerial.length > 0) {
                var index = item.serials.indexOf(arrSerial[0]);
                item.serials.splice(index, 1);
                item.quantity--;
            }
        }
        //Apply promotion for serial
        $scope.saleOrder.changeQuantityPromotion(item, $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details, 0);
    };

    $scope.removeOrderDetailSerial = function (productItem, serialItem) {
        var resultSerials = productItem.serials.filter(function (s) {
            return serialItem.$$hashKey == s.$$hashKey;
        });
        productItem.serials.splice(productItem.serials.indexOf(resultSerials[0]), 1);
        productItem.quantity--;
        //build multi select
        if (productItem.serialNumbers.length > 0) {
            var arrSerial = productItem.serialNumbers.filter(function (s) {
                return s.serial == serialItem.serial;
            });
            if (arrSerial.length > 0) {
                var index = productItem.serialNumbers.indexOf(arrSerial[0]);
                productItem.serialNumbers[index].ticked = false;
            }
        }
        //Apply promotion for serial
        $scope.saleOrder.changeQuantityPromotion(productItem, $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details, 0);
    };

    /*Set readonly attribute of textbox for datetime kendo control*/
    $scope.$on("kendoWidgetCreated", function (event, widget) {
        if (widget.wrapper != null && widget.wrapper[0].outerHTML != '' && widget.wrapper[0].outerHTML.indexOf('k-datetimepicker') > -1) {
            widget.element.attr('readonly', 'readonly').attr('style', 'background-color: #fff !important');
        }
    });


    // SHIPPER FUNCTIONS
    $scope.shipper = null;

    $scope.initShipper = function () {
        getShipper();

    };

    function getShipper(type) {
        orderService.getShippers(function (data) {
            var shippers = [];
            if (data.shippers != null && data.shippers.length > 0) {
                for (var i = 0; i < data.shippers.length; i++) {
                    shippers.push({ shipperId: data.shippers[i].shipperId, name: data.shippers[i].name });
                }
                shippers = PosimGlobal.buildTree(shippers);
            }
            shippers.unshift({ shipperId: 0, name: '--Tất cả đơn vị VC--' });
            $scope.shippers = shippers;
            $scope.shipper = shippers[0];
        },
        function (error) {
            console.log('Error: getShippers');
            console.log(error);
        });
    };

    function selectShipper() {
        if (typeof $scope.shippers != 'undefined') {
            if ($scope.saleOrder.Items[0].SaleOrder.shipper) {
                var shipper = $scope.shippers.filter(function (s) {
                    return s.shipperId === $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.shipper.shipperId;
                });
                $scope.shipper = shipper[0];
            }
            else {
                $scope.shipper = $scope.shippers[0];
            }
        }

    };

    $scope.openPopupShipper = function (shippers) {
        if (shippers.length > 0) {
            shippers = shippers.slice(1, shippers.length);
        }

        var modalInstance = $modal.open({
            templateUrl: 'modalShipper.html',
            controller: modalShipperController,
            resolve: {
                shippers: function () {
                    return shippers;
                }
            },
            backdrop: 'static',
            scope: $scope
        });

        modalInstance.result.then(function () {
            if ($scope.$parent.initShipper != undefined && typeof $scope.$parent.initShipper === 'function') {
                $scope.$parent.initShipper();
            }
        }, function () { });
    };
    var modalShipperController = function ($scope, $modalInstance, shippers, ngTableParams) {
        $scope.shipper = {};

        var storeId = $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0;
        $scope.shippersTable = new ngTableParams({ page: 1, count: 10 }, {
            total: shippers.length,
            getData: function ($defer, params) {
                $defer.resolve(shippers.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.closeModal = function () {
            $scope.initShipper();
            $modalInstance.close();
        };

        $scope.updateShipper = function (shipper, index) {
            var name = angular.element('#txtShipperName' + shipper.shipperId).val();

            var Shipper = { shipperId: shipper.shipperId, name: name };
            var data = { shipper: Shipper }
            orderService.updateShipper(data, function (item) {
                shipper.$edit = false;
                shipper.name = name;
                $.gritter.add({
                    title: 'Thông báo',
                    text: 'Cập nhật đơn vị vận chuyển ' + name + ' thành công.',
                    class_name: 'gritter-success',
                    time: 1500
                });

            },
            function (error) {
                $.gritter.add({
                    title: 'Thông báo',
                    text: 'Cập nhật đơn vị vận chuyển không thành công.',
                    class_name: 'gritter-error',
                    time: 1500
                });
            });
        };
        $scope.deleteShipper = function (shipper) {
            bootbox.confirm('Bạn có chắc xóa đơn vị vận chuyển này không ?', function (result) {
                if (result) {
                    orderService.deleteShipper({ Id: shipper.shipperId }, function (data) {
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Xóa loại đơn vị vận chuyển thành công.',
                            class_name: 'gritter-success',
                            time: 1500
                        });
                        var index = shippers.indexOf(shipper);
                        if (index > -1) shippers.splice(index, 1);

                        if ($scope.shippersTable.data.length == 1) {
                            $scope.shippersTable.page($scope.tableParams.page() - 1);
                        }
                        $scope.shippersTable.total(shippers.length);
                        $scope.shippersTable.reloadPages();
                        $scope.shippersTable.reload();
                    },
                    function (error) {
                        console.log(error);

                        var msg = error.responseStatus != null ? error.responseStatus.message : error;
                        $.gritter.add({
                            title: 'Thông báo',
                            text: msg,
                            class_name: 'gritter-error',
                            time: 3000
                        });
                    });
                }
            });
        };

        $scope.createShipper = function () {
            createShipper(function () {
                $scope.activeTab('tab-1', 'tab-pane-1', 'tabType');
            });
        };
        $scope.saveAndContinueShipper = function () {
            createShipper();
        }

        var createShipper = function (callback) {
            var validationResult = validateShipper();
            if (validationResult != 'success') {
                $.gritter.add({
                    title: 'Thông báo',
                    text: validationResult,
                    class_name: 'gritter-warning',
                    time: 5000
                });
                return;
            }
            var request = { Shipper: $scope.shipper };
            orderService.createShipper(request, function (shipperResponse) {
                var shipper = { shipperId: shipperResponse.shipperId, name: $scope.shipper.name };
                shippers.push(shipper);
                $scope.shippersTable.total(shippers.length);
                $scope.shippersTable.reloadPages();
                $scope.shippersTable.reload();
                $scope.shipper.name = "";
                if (callback != null && typeof callback === 'function') {
                    callback();
                }
                $.gritter.add({
                    title: 'Thông báo',
                    text: 'Đơn vị VC ' + shipper.name + ' đã được tạo thành công!',
                    class_name: 'gritter-success',
                    time: 1500
                });
            },
            function (shipperResponseError) {
                $.gritter.add({
                    title: 'Thông báo',
                    text: 'Tạo đơn vị VC không thành công, xin vui lòng thử lại!',
                    class_name: 'gritter-error',
                    time: 1500
                });
            });
        };
        var validateShipper = function () {
            var existItems = shippers.filter(function (pItem) {
                return pItem.name == $scope.shipper.name;
            });
            if (existItems.length > 0) {
                return $scope.shipper.name + " đã được tạo .Vui lòng nhập tên khác. Xin cảm ơn !";
            }
            return 'success';
        };

    };
    modalShipperController['$inject'] = ['$scope', '$modalInstance', 'shippers', 'ngTableParams'];
    // END SHIPPER FUNCTIONS


    $scope.isNewPayment = false;

    $scope.showNewPayment = function () {
        $scope.isNewPayment = true;
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total < $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid) {
            $scope.newPayment = 0;
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total;
            $scope.moreAmountPaid = true;
        }
        else {
            $scope.newPayment = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid;
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid;
            $scope.moreAmountPaid = false;
        }

        if (!$scope.newPaymentMethodId || $scope.newPaymentMethodId <= 0) $scope.newPaymentMethodId = 1;
    };

    $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Total', function () {
        $scope.showNewPayment();
    }, true);

    $scope.makeNewPayment = function () {
        //var curr = new Date();
        var request = {
            saleOrderId: $scope.orderId,
            storeId: $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0,
            receiptVoucher: {
                receivedDate: $scope.receivedDate,
                amount: Math.min($scope.newPayment, $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total),
                paymentMethodId: $scope.newPaymentMethodId,
                description: ($scope.newDescription != undefined && $scope.newDescription) ? $scope.newDescription : 'Thu nợ ' + $scope.formatMoney($scope.newPayment) + ' cho đơn hàng ' + $scope.saleOrder.Items[0].SaleOrder.Code
            }
        };
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.CreateReceiptVoucher, 'POST', request, function (data) {
            var request = { saleOrderId: $scope.orderId };
            //$scope.order.getData(api, request);
            $scope.saleOrder.loadOrder($scope.orderId);
            $.gritter.add({
                title: 'Thông báo',
                text: 'Đã cập nhật thanh toán cho đơn hàng thành công.',
                class_name: 'gritter-success',
                time: 1500
            });
        }, function (error) {
            console.log(error);
        }, true, 'saleOrderCreditRepayment');
        $scope.newPayment = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid - $scope.newPayment;
        $scope.isNewPayment = true;
    };

    //$scope.newPaymentChange = function () {
    //var newPayment = parseInt( PosimGlobal.replaceCharacter($scope.newPayment, ',', '') );
    //if (newPayment > ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid)) {
    //    $scope.newPayment = Math.max($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid, 0);
    //}
    //else {
    //    $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.PaymentBalance = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Total - $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.AmountPaid - $scope.newPayment;
    //}
    //};

    $scope.activeTab = function (tabNum, tabId, dataTab) {
        angular.element('[data-tabs="' + dataTab + '"]').removeClass('active');
        angular.element('#' + tabNum).addClass('active');
        angular.element('[data-tab-pane="' + dataTab + '"]').removeClass('in').removeClass('active');
        angular.element('#' + tabId).addClass('in').addClass('active');
    };

    $scope.formatName = function (name) {
        return String(PosimGlobal.replaceCharacter(name, '-', '')).trim();
    };

    $scope.newComment = '';
    $scope.makeNewComment = function () {
        if ($scope.newComment == undefined || $scope.newComment == null || $scope.newComment == '') return;
        var request = {
            saleOrderId: $scope.orderId,
            comment: $scope.newComment
        };
        POSIM.CallUniqueService($http, PosimGlobal.urlRequest.POS.Sale.NewComment, 'POST', request, function (data) {
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Comment = data.comment;
            $.gritter.add({
                title: 'Thông báo',
                text: 'Đã thêm ghi chú cho đơn hàng thành công.',
                class_name: 'gritter-success',
                time: 1500
            });
            $scope.newComment = '';
        }, function (error) {
            console.log(error);
        }, true, 'makeNewComment');
    };
    $scope.$watch('saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.SaleDate', function () {
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SaleDate != undefined && $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SaleDate != null) {
            var newDate = $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.SaleDate;
            $("#receiveDate").kendoDateTimePicker({
                format: "dd/MM/yyyy HH:mm:ss",
                min: newDate,
                max: new Date(),
                timeFormat: "HH:mm", //24 hours format
                interval: 15,
                value: new Date()
            });
            // $scope.receiveDate = $("#receiveDate").data("kendoDateTimePicker");
            //// $scope.receivedDate = angular.copy($scope.receiveDate);
            // $scope.receiveDate.bind("close", function (e) {
            //     if (e.view === "date") {
            //         if ($scope.receiveDate.value()) {
            //             var date = $scope.receiveDate.value();
            //             $scope.receiveDate.value(new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            //         }
            //         $scope.receivedDate = $scope.receiveDate.value();
            //     }
            //     else if (e.view === "time") {
            //         $scope.receivedDate = $scope.receiveDate.value();
            //     }
            // });
            // $scope.receiveDate.bind("change", function () {
            //     $scope.receivedDate = (this.value() != null && this.value() != undefined) ? this.value() : new Date();
            // });
            // $scope.receivedDate = $scope.receiveDate.value();
        }
    }, true);

    $scope.formatMoney = function (number) {
        return PosimGlobal.formatMoney(number);
    };

    //Popup
    $scope.openSubFee = function (e) {
        $scope.subFeePop.open(e);
        angular.element('[data-ng-model="saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.SubFee"]').focus();
    };
    $scope.openDiscount = function (e) {
        $scope.discountPopover.open(e);
        if (angular.element('[data-ng-model="saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Discount"]').length > 0) angular.element('[data-ng-model="saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.Discount"]').focus();
        if (angular.element('[data-ng-model="saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.DiscountInPercent"]').length > 0) angular.element('[data-ng-model="saleOrder.Items[saleOrder.SelectedOrderIndex].SaleOrder.DiscountInPercent"]').focus();
    };
    $scope.openPayment = function (e) {
        $scope.paymentPop.open(e);
        angular.element('#AmountPaid').focus();
    };

    $scope.allowPromotionModified = false;
    if (setting.userProfile != null && setting.userProfile.RolesGranted != null && setting.userProfile.RolesGranted.length > 0) {
        var roles = setting.userProfile.RolesGranted.filter(function (r) {
            return r.RoleId == 1 || r.RoleId == 2;
        });
        if (roles.length > 0) $scope.allowPromotionModified = true;
        else $scope.allowPromotionModified = false;
    }

    //Earning Point
    if ($scope.applyEarningPoint) {
        $scope.getEarningPointConfig = function () {
            earningPointService.getConfig(null, function (data) {
                if (data != null) {
                    $scope.saleOrder.earningPointConfig.convertMoney = data.convertMoney;
                    $scope.saleOrder.earningPointConfig.convertPoint = data.convertPoint;
                    if (data.groupConfig.length > 0) {
                        $scope.saleOrder.earningPointConfig.exchangeMoney = data.groupConfig[0].exchangeMoney;
                        $scope.saleOrder.earningPointConfig.exchangePoint = data.groupConfig[0].exchangePoint;
                    }
                    else {
                        $scope.saleOrder.earningPointConfig.exchangeMoney = 0;
                        $scope.saleOrder.earningPointConfig.exchangePoint = 0;
                    }
                    if ($scope.customer != null && $scope.customer !== undefined) {
                        setEarningPoint($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer);
                    }

                    $scope.earningPointConfig = angular.copy($scope.saleOrder.earningPointConfig);
                }
            },
            function (e) {
                console.log(e);
            });
        };
        $scope.getEarningPointConfig();
        //EndIf
    }

    var setEarningPoint = function (customer) {
        if (customer != null) {
            if ($scope.saleOrder.earningPointConfig.convertMoney != null && $scope.saleOrder.earningPointConfig.convertMoney != undefined &&
                        $scope.saleOrder.earningPointConfig.convertMoney != 1 && $scope.saleOrder.earningPointConfig.convertPoint != 0) {
                $scope.isApplyEarningPoint = true;
                if ($scope.saleOrder.earningPointConfig.convertPoint > 0 || $scope.saleOrder.earningPointConfig.convertPoint != undefined) {
                    $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.earningPointStatus = 1;
                    $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.convertMoney = $scope.saleOrder.earningPointConfig.convertMoney;
                }
                earningPointService.getCustomerPoint({ customerId: customer.customerId },
                    function (data) {
                        if (data != null)
                            customer.remainPoint = data.remainPoint;
                        if (customer.remainPoint > 0) {
                            $scope.isExchangeable = true;
                            var elem = angular.element('#customerSearchInput').parent().next();
                            elem.append('<span id="ep-label" class="label label-success autocomplete-label ep-label">' + customer.remainPoint + '&nbsp;điểm</span>');
                        }
                        else {
                            $scope.isExchangeable = false;
                            var elem = angular.element('#customerSearchInput').parent().next();
                            elem.append('<span id="ep-label" class="label label-success autocomplete-label ep-label">0&nbsp;điểm</span>');
                        }
                    },
                    function (e) { console.log(e) });
            } else {
                customer.remainPoint = 0;
                $scope.isApplyEarningPoint = false;
                $scope.isExchangeable = false;
            }
        }
        else {
            $scope.isApplyEarningPoint = false;
            $scope.isExchangeable = false;
        }

    };
    var resetEarningPoint = function () {
        var elem = angular.element('.ep-label');
        if (elem.length > 0) elem.remove();

        $scope.isApplyEarningPoint = false;
        $scope.isExchangeable = false;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.earningPointStatus = 0;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.convertPoint = 0;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.convertMoney = 0;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.exchangedPoint = 0;
        $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.exchangedMoney = 0;
        if ($scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer != null && $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer.remainPoint != null) {
            $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Customer.remainPoint = 0;
        }
        $scope.saleOrder.calculateTotalOnline(true);
    };
    //Earning Point

    //Exchange Quantity
    $scope.showHideExchangeActions = function (detail, isShow) {
        $scope.saleOrder.showHideExchangeActions(detail, isShow);
    };
    $scope.exchangeQuantity = function (detail) {
        bootbox.confirm('Bạn muốn thực hiện quy đổi <b>' + detail.exchanged.qtyTransacted + '</b> (' + detail.exchanged.unit + ') thành <b>' + detail.exchanged.exchangeQuantity + '</b> (' + detail.unit + ')?', function (isConfirm) {
            if (isConfirm) {
                $scope.saleOrder.exchange(detail, function () {
                    //Cập nhật item trong đơn hàng
                    $scope.saleOrder.updateQtyAvailableAfterExchange(detail);
                    $scope.saleOrder.resetExchangeQuantity(detail);
                    PosimGlobal.showMessage('Thực hiện quy đổi thành công.', 'success');
                },
                function () {
                    PosimGlobal.showMessage('Thực hiện quy đổi không thành công.', 'error');
                });
            }
        });
    };
    $scope.openExchangeQuantityPopup = function (detail) {
        var modalInstance = $modal.open({
            templateUrl: 'modalExchangeQuantity.html',
            controller: modalExchangeQuantityController,
            resolve: {
                exchangeItem: function () {
                    return detail;
                },
                details: function () {
                    return $scope.saleOrder.Items[$scope.saleOrder.SelectedOrderIndex].SaleOrder.Details;
                }
            }
        });

        modalInstance.result.then(function (result) {
            if (result) {
                detail.exchanged.itemId = result.itemId;
                detail.exchanged.qtyTransacted = result.qtyTransacted;
                detail.exchanged.minQtyTransacted = result.qtyTransacted;
                detail.exchanged.toExchangeQuantity = result.toExchangeQuantity;
                detail.exchanged.fromExchangeQuantity = result.fromExchangeQuantity;
                detail.exchanged.unit = result.unit;
                detail.exchanged.exchangeQuantity = (detail.exchanged.qtyTransacted * detail.exchanged.toExchangeQuantity) / detail.exchanged.fromExchangeQuantity;
                detail.exchanged.afterExchangeQuantity = detail.qtyAvailable + detail.exchanged.exchangeQuantity;
                detail.exchanged.description = 'Đổi ' + detail.exchanged.qtyTransacted + ' (' + detail.exchanged.unit + ') thành ' + detail.exchanged.exchangeQuantity + ' (' + detail.unit + ')';

                var existsExchanged = detail.exchanges.filter(function (ex) { return ex.fromItemId == detail.exchanged.itemId; });
                existsExchanged[0].isSelected = true;
                existsExchanged[0].qtyTransacted = angular.copy(detail.exchanged.qtyTransacted);
                existsExchanged[0].minQtyTransacted = angular.copy(detail.exchanged.minQtyTransacted);

                detail.exchanges.forEach(function (ex) {
                    if (ex.fromItemId != detail.exchanged.itemId) {
                        ex.isSelected = false;
                    }
                });

            }
        }, function () { });
    };
    var modalExchangeQuantityController = function ($scope, $modalInstance, $timeout, $http, productService, exchangeItem, details) {
        $scope.exchange = angular.copy(exchangeItem);
        $scope.onchangeQuantity = function (exchanged) {
            if (exchanged.qtyTransacted == null || exchanged.qtyTransacted == undefined || exchanged.qtyTransacted <= 0) {
                exchanged.qtyTransacted = exchanged.fromExchangeQuantity;
            }
            var totalExchangedQuantity = 0;
            var exchangedItems = details.filter(function (d) { return d.itemId != $scope.exchange.itemId && d.exchanged != null && d.exchanged.itemId == exchanged.itemId; });
            if (exchangedItems.length > 0) {
                exchangedItems.forEach(function (ex) {
                    totalExchangedQuantity += ex.exchanged.qtyTransacted;
                });
            }
            var sellQuantity = 0, exchangedQuantity = 0, fromQtyAvailable = 0;
            var existsDetails = details.filter(function (d) { return d.itemId == exchanged.itemId; });
            if (existsDetails.length > 0) {
                sellQuantity = existsDetails[0].quantity;
                exchangedQuantity = (existsDetails[0].exchanged != null ? existsDetails[0].exchanged.exchangeQuantity : 0);
                fromQtyAvailable = existsDetails[0].qtyAvailable;
            }
            else {
                var ex = $scope.exchange.exchanges.filter(function (e) { return e.fromItemId == exchanged.itemId; });
                fromQtyAvailable = ex[0].fromQtyAvailable;
            }
            var quantityAvailableExchange = fromQtyAvailable + exchangedQuantity - sellQuantity - totalExchangedQuantity;
            if (exchanged.qtyTransacted > quantityAvailableExchange) {
                exchanged.qtyTransacted = quantityAvailableExchange;
            }
            else if (exchanged.qtyTransacted <= exchanged.minQtyTransacted) {
                exchanged.qtyTransacted = exchanged.minQtyTransacted;
            }
            exchanged.exchangeQuantity = (exchanged.qtyTransacted * exchanged.toExchangeQuantity) / exchanged.fromExchangeQuantity;
            exchanged.afterExchangeQuantity = $scope.exchange.qtyAvailable + exchanged.exchangeQuantity;
        };
        $scope.addQuantity = function (exchanged) {
            if (exchanged.qtyTransacted == null || exchanged.qtyTransacted == undefined) {
                exchanged.qtyTransacted = exchanged.fromExchangeQuantity;
            }
            exchanged.qtyTransacted += exchanged.fromExchangeQuantity;
            $scope.onchangeQuantity(exchanged);
        };
        $scope.minusQuantity = function (exchanged) {
            if (exchanged.qtyTransacted == null || exchanged.qtyTransacted == undefined) {
                exchanged.qtyTransacted = exchanged.fromExchangeQuantity;
            }
            exchanged.qtyTransacted -= exchanged.fromExchangeQuantity;
            $scope.onchangeQuantity(exchanged);
        };
        $scope.onchangeExchange = function (exchange) {
            $scope.exchange.exchanges.forEach(function (ex) {
                if (ex !== exchange) {
                    ex.isSelected = false;
                }
            });
            $scope.exchange.exchanged = {
                itemId: exchange.fromItemId,
                qtyTransacted: exchange.qtyTransacted,
                minQtyTransacted: exchange.minQtyTransacted,
                fromExchangeQuantity: exchange.fromExchangeQuantity,
                toExchangeQuantity: exchange.toExchangeQuantity,
                exchangeQuantity: (exchange.qtyTransacted * exchange.toExchangeQuantity) / exchange.fromExchangeQuantity,
                afterExchangeQuantity: 0,
                unit: exchange.unit,
                description: ''
            };

            $scope.exchange.exchanged.afterExchangeQuantity = $scope.exchange.qtyAvailable + $scope.exchange.exchanged.exchangeQuantity;
            $scope.exchange.exchanged.description = 'Đổi ' + $scope.exchange.exchanged.qtyTransacted + ' (' + $scope.exchange.exchanged.unit + ') thành ' + $scope.exchange.exchanged.exchangeQuantity + ' (' + $scope.exchange.unit + ')';
        };
        $scope.save = function () {
            var isInterger = $scope.exchange.exchanged.exchangeQuantity + '';
            if (isInterger.indexOf('.') > -1) {
                PosimGlobal.showMessage('Đơn vị sau quy đổi không nên có giá trị thập phân. Vui lòng thiết lập lại quy đổi.', 'warning');
            }
            else {
                $modalInstance.close($scope.exchange.exchanged);
            }
        };
        $scope.closeModal = function () {
            $modalInstance.close();
        };

        //Private

    };
    modalExchangeQuantityController['$inject'] = ['$scope', '$modalInstance', '$timeout', '$http', 'productService', 'exchangeItem', 'details'];
}])