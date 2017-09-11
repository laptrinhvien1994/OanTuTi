app.factory("saleOrders", ['$rootScope', 'userService', 'saleService', 'settingsGlobal', '$http', 'promotion', 'productService', 'promotionService', function ($rootScope, userService, saleService, settingsGlobal, $http, promotion, productService, promotionService) {
    var setting = settingsGlobal.getSetting();

    function saleOrders(data) {
        if (data) {
            this.setData(data);
        };
    };
    saleOrders.prototype = {
        setData: function (data) {
            angular.extend(this, data);
        },

        getData: function (limit, pageIndex, fromDate, toDate) {
            var request = new Object();
            request.limit = limit;
            request.pageIndex = pageIndex;
            request.fromDate = fromDate;
            request.toDate = toDate;
            var scope = this;
            var callback = function (data) {
                scope.setData(data);
            };
            var error = function (error) {
                console.log('Error: getData');
                console.log(error);
            };
            saleOrderServices.getSaleOrders(request, callback, error);
        },

        init: function (singleOrder, isApplyPromotion, storeId) {
            //parse storeId if type = string 
            storeId = typeof storeId == 'string' ? parseInt(storeId) : storeId;
            this.Items = [];
            this.Promotions = [];
            if (singleOrder) {
                this.Count = 0;
                this.SelectedOrderIndex = 0;
                this.createNewOrder(isApplyPromotion, storeId);
            }
            else {
                for (var i = 1; i <= 3; i++) {
                    var order = {
                        SaleOrder: {
                            Code: '',
                            TotalQuantity: 0,
                            SubTotal: 0,
                            Discount: 0,
                            DiscountInPercent: 0,
                            IsDiscountPercent: false,
                            Tax: 0,
                            SubFee: null,
                            SubFeeName: null,
                            Total: 0,
                            AmountPaid: 0,
                            IsReady: false,
                            IsPaid: false,
                            Payment: 0,
                            Balance: 0,
                            PaymentMethod: 1, //1: Cash | 2: Card | 3: Bank Transfer
                            //SaleDate: new Date(),
                            SaleDate: null,
                            Comment: '',
                            Customer: null,
                            Details: [],
                            Detail: {},
                            //add
                            saleTypeID: 0,
                            status: 0,
                            shipper: null,
                            receiptVouchers: [],
                            isMultiplePrice: false,
                            allowPriceModified: false,
                            //promotion
                            isPromotion: false,
                            promotionID: 0,
                            onBillPromotions: [],
                            onBillPromotionSelected: null,
                            promotions: [],
                            manualSelected: 0, //0: auto optimized, 1: promotion on item, 2: promotion on bill
                            optimal: 0,
                            earningPointStatus: 0,
                            convertPoint: 0,
                            convertMoney: 0,
                            exchangedMoney: 0,
                            exchangedPoint: 0
                        }
                    };
                    this.Items.push(order);
                    if (isApplyPromotion) {
                        var saleDate = order.SaleOrder.SaleDate === null ? new Date() : order.SaleOrder.SaleDate;
                        this.initPromotion(storeId, saleDate.toJSON(), 1);
                    }
                }
            }
            this.SelectedOrderIndex = 0;
            this.SelectedReceiptVoucher = 0;
            this.Count = 3;
            //User
            var lstUsers = angular.copy(setting.allUsers.UserProfiles);
            this.Users = lstUsers.filter(function (user) { return user.IsActived; });
            var currentUser = PosimGlobal.getUser(setting.userProfile.UserId, this.Users);
            for (i = 0; i < this.Items.length; i++) {
                this.Items[i].SaleOrder.Seller = currentUser;
                this.Items[i].SaleOrder.Cashier = currentUser;
                this.Items[i].SaleOrder.shipper = {
                    shipperId: 0,
                    name: '',
                    shippingDate: null,
                    comment: '',
                    shipper: ''
                };
                this.Items[i].SaleOrder.receiptVouchers = [
                     {
                         paymentMethodId: 1,
                         status: 3,
                         amount: 0
                     },
                     {
                         paymentMethodId: 2,
                         status: 3,
                         amount: 0
                     },
                    {
                        paymentMethodId: 3,
                        status: 3,
                        amount: 0

                    }
                ]
            }

            this.earningPointConfig = {};

            //End User
        },

        initPromotion: function (storeId, saleDate, saleType, callback) {
            var scope = this;
            var promoObj = new promotion(storeId, saleDate, saleType);
            if (setting.saleSettings.ApplyPromotion != undefined && setting.saleSettings.ApplyPromotion == true && saleType != 3) {
                promotionService.getActivePromotion(function (result) {
                    promoObj.isCallService = result;
                    promoObj.init(function () {
                        scope.Promotions.push(promoObj);
                        if (callback !== undefined && typeof callback === 'function') {
                            callback();
                        }
                    });
                }, function (error) {
                    scope.Promotions.push(promoObj);
                    console.log(error);
                });
            }
            else {
                scope.Promotions.push(promoObj);
            }
        },

        selectOrder: function (index) {
            this.SelectedOrderIndex = index;
        },

        createNewOrder: function (isApplyPromotion, storeId) {
            this.Users = angular.copy(setting.allUsers.UserProfiles);
            var currentUser = PosimGlobal.getUser(setting.userProfile.UserId, this.Users);
            var order = {
                SaleOrder: {
                    Code: '',
                    TotalQuantity: 0,
                    SubTotal: 0,
                    Discount: 0,
                    DiscountInPercent: 0,
                    IsDiscountPercent: false,
                    SubFee: null,
                    SubFeeName: null,
                    Tax: 0,
                    Total: 0,
                    AmountPaid: 0,
                    IsReady: false,
                    IsPaid: false,
                    Payment: 0,
                    Balance: 0,
                    PaymentMethod: 1, //1: Cash | 2: Card | 3: Bank Transfer
                    //SaleDate: new Date(),
                    SaleDate: null,
                    Seller: currentUser,
                    Cashier: currentUser,
                    Comment: '',
                    Customer: null,
                    Details: [],
                    Detail: {},
                    //add
                    saleTypeID: 0,
                    status: 0,
                    isMultiplePrice: false,
                    allowPriceModified: false,
                    //promotion
                    isPromotion: false,
                    promotionID: 0,
                    onBillPromotions: [],
                    onBillPromotionSelected: null,
                    promotions: [],
                    manualSelected: 0, //0: auto optimized, 1: promotion on item, 2: promotion on bill
                    optimal: 0,
                    earningPointStatus: 0,
                    convertPoint: 0,
                    convertMoney: 0,
                    exchangedMoney: 0,
                    exchangedPoint: 0,
                    isInit: true, // Checking saleOrder is recently created.
                    receiptVouchers: [
                        {
                            paymentMethodId: 1,
                            status: 3,
                            amount: 0
                        },
                         {
                             paymentMethodId: 2,
                             status: 3,
                             amount: 0
                         },
                        {
                            paymentMethodId: 3,
                            status: 3,
                            amount: 0

                        }
                    ]
                }
            };
            this.Items.push(order);
            if (isApplyPromotion) {
                var saleDate = order.SaleOrder.SaleDate === null ? new Date() : order.SaleOrder.SaleDate;
                this.initPromotion(storeId, saleDate.toJSON(), 1);
            }
            this.Count = this.Count + 1;
            this.SelectedOrderIndex = this.Count - 1;
        },

        deleteOrder: function (index) {
            if (this.Items.length == 1) {
                this.SelectedOrderIndex = 0;
                return;
            }
            this.Items.splice(index, 1);
            this.Promotions.splice(index, 1);
            this.Count = this.Count - 1;
            if (this.SelectedOrderIndex == 0) {
                this.SelectedOrderIndex = 0;
            }
            else if (this.SelectedOrderIndex >= index) {
                this.SelectedOrderIndex = this.SelectedOrderIndex - 1;
            }
            else {
                this.SelectedOrderIndex = this.SelectedOrderIndex + 1
            }
        },

        cancelOrder: function () {
            var saleOrder = this.Items[this.SelectedOrderIndex].SaleOrder;
            saleOrder.Code = '',
            saleOrder.TotalQuantity = 0,
            saleOrder.SubTotal = 0,
            saleOrder.Discount = 0,
            saleOrder.DiscountInPercent = 0,
            saleOrder.IsDiscountPercent = false,
            saleOrder.Tax = 0,
            saleOrder.Total = 0,
            saleOrder.AmountPaid = 0,
            IsReady = false,
            saleOrder.IsPaid = false,
            saleOrder.Payment = 0,
            saleOrder.Balance = 0,
            saleOrder.PaymentMethod = 1, //1= Cash | 2= Card | 3= Bank Transfer
            //saleOrder.SaleDate = new Date(),
            saleOrder.SaleDate = null,
            saleOrder.Comment = '',
            saleOrder.Customer = null,
            saleOrder.Details = [],
            saleOrder.Detail = {}
            //Promotion
            saleOrder.promotionID = 0;
            saleOrder.isPromotion = false;
            saleOrder.onBillPromotions = [];
            saleOrder.onBillPromotionSelected = null;
            saleOrder.promotions = [];
            saleOrder.manualSelected = 0;
            saleOrder.optimal = 0;
            //Reset promotion
            this.Promotions[this.SelectedOrderIndex].canclePromotion(function () { });
            //Reset EarningPoint
            saleOrder.earningPointConfig = {};
            saleOrder.convertPoint = 0;
            saleOrder.earningPointStatus = 0;
            saleOrder.exchangedPoint = 0;
            saleOrder.exchangedMoney = 0;
        },

        validateOrder: function (order) {
            if (!order || !order.Details)
                return 'Hóa đơn bán hàng không hợp lệ.';
            if (order.TotalQuantity <= 0) {
                if (order.Detail && order.Details.length > 0) {
                    if (order.Details[0].isSerial) {
                        return 'Xin chọn serial/imei cho hàng hóa [' + order.Details[0].itemName + '] trước khi lưu. Xin cảm ơn!';
                    }
                    else {
                        return 'Xin nhập số lượng cho hàng hóa [' + order.Details[0].itemName + '] trước khi lưu. Xin cảm ơn!';
                    }
                }
                else {
                    return 'Chọn ít nhất 1 hàng hóa cần bán trước khi lưu. Xin cảm ơn!';
                }
            }

            if (order.saleTypeID < 2 || order.status < 3) {
                var existsUntrackedSale = order.Details.filter(function (detail) {
                    return detail.exchanged == null && detail.qtyAvailable < detail.quantity && detail.isUntrackedItemSale === false && detail.isInventoryTracked === true;
                });
                if (existsUntrackedSale.length > 0) return 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + existsUntrackedSale.map(function (d) { return d.itemName; }).join(',') + '] và thử lại.';
            }

            
            if (typeof (order.shipper) != 'undefined' && order.shipper.shipperId == 0 && order.status > 2) {
                order.status = null;
                return 'Chọn Đơn vị vận chuyển đơn hàng trước khi lưu. Xin cảm ơn!';
            }
            if (order.Customer == null && order.status >= 1 && order.saleTypeID > 1) {
                order.status = null;
                return 'Chọn hoặc tạo mới Khách hàng trước khi lưu. Xin cảm ơn!';
            }

            var amountPaid = 0;
            if (typeof (order.AmountPaid) == "string") {
                amountPaid = order.AmountPaid ? parseFloat(order.AmountPaid.replace(/\,/g, '')) : 0;
            }
            else if (typeof (order.AmountPaid) == "number") amountPaid = order.AmountPaid;
            //Multiple payment methods
            if (order.PaymentMethods > 1) {
                if (typeof (order.TotalAmountPaid) == "string") {
                    amountPaid = order.AmountPaid ? parseFloat(order.TotalAmountPaid.replace(/\,/g, '')) : 0;
                }
                else if (typeof (order.TotalAmountPaid) == "number") amountPaid = order.TotalAmountPaid;
            }

            if (!setting.saleSettings.AllowDebtPayment && amountPaid < order.Total) {
                order.AmountPaid = amountPaid;
                return 'Hệ thống được cấu hình không cho phép bán nợ. Xin vui lòng thanh toán đủ mỗi lần bán.';
            }

            if (setting.saleSettings.AllowDebtPayment && amountPaid < order.Total && order.Customer == null) {
                order.AmountPaid = amountPaid;
                return 'Xin vui lòng thêm thông tin khách hàng khi bán nợ.';
            }

            //Nếu giá mới cao hơn đơn giá => lưu đơn giá cho hóa đơn này là giá mới
            for (i = 0; i < order.Details.length; i++) {
                var sellPrice = parseInt(order.Details[i].sellPrice);
                if (!isNaN(sellPrice) && sellPrice > order.Details[i].unitPrice) {
                    order.Details[i].unitPrice = sellPrice;
                }
            }

            return 'success';
        },

        loadOrder: function (orderId, storeId, callback) {
            if (!orderId) return;
            var request = { saleOrderId: orderId };
            var scope = this;
            saleService.getSaleOrder(request,
                function (data) {
                    if (!data || !data.saleOrder) return;
                    var order = {
                        SaleOrder: {
                            SaleOrderId: data.saleOrder.saleOrderId,
                            Code: data.saleOrder.saleOrderCode,
                            TotalQuantity: data.saleOrder.totalQuantity,
                            SubTotal: data.saleOrder.subTotal,
                            Discount: data.saleOrder.discount,
                            DiscountInPercent: 0,
                            IsDiscountPercent: false,
                            Tax: data.saleOrder.tax,
                            SubFee: data.saleOrder.subFee,
                            SubFeeName: data.saleOrder.subFeeName,
                            Total: data.saleOrder.total,
                            AmountPaid: data.saleOrder.amountPaid,
                            payments: data.saleOrder.payments,
                            IsPaid: true,
                            Balance: data.saleOrder.paymentBalance,
                            PaymentMethod: 1, //1: Cash | 2: Card | 3: Bank Transfer
                            SaleDate: data.saleOrder.status == 1 && data.saleOrder.saleTypeID == 1 ? new Date() : PosimGlobal.convertJsonDateTimeToJs(data.saleOrder.saleOrderDate),
                            Comment: data.saleOrder.comment,
                            Customer: data.saleOrder.customer,
                            SaleUser: data.saleOrder.saleUser,
                            Cashier: data.saleOrder.cashier,
                            Seller: PosimGlobal.getUser(data.saleOrder.saleUser, scope.Users),
                            Cashier: PosimGlobal.getUser(data.saleOrder.cashier, scope.Users),
                            Details: [],
                            //get 2 data
                            saleTypeID: data.saleOrder.saleTypeID,
                            status: data.saleOrder.status,
                            shipperID: data.saleOrder.shipperID,
                            shipper: typeof data.saleOrder.shipper == 'undefined' ? data.saleOrder.shipper = {
                                shipperId: 0,
                                name: '',
                                shippingDate: null,
                                comment: '',
                                shipper: '',
                            } : data.saleOrder.shipper,
                            isPromotion: data.saleOrder.isPromotion,
                            promotionID: data.saleOrder.promotionId,
                            firstLoad: true,
                            earningPointStatus: data.saleOrder.earningPointStatus,
                            convertPoint: data.saleOrder.convertPoint,
                            convertMoney: data.saleOrder.convertMoney,
                            exchangedMoney: data.saleOrder.exchangedMoney,
                            exchangedPoint: data.saleOrder.exchangedPoint,
                            //isInit: true, // Checking saleOrder is recently created.
                            //receiptVouchers: [
                            //    {
                            //        voucherId : 0,
                            //        paymentMethodId: 1,
                            //        status: 3,
                            //        amount: 0
                            //    },
                            //    {
                            //        voucherId: 0,
                            //        paymentMethodId: 2,
                            //        status: 3,
                            //        amount: 0
                            //    },
                            //   {
                            //       voucherId: 0,
                            //       paymentMethodId: 3,
                            //       status: 3,
                            //       amount: 0

                            //   }
                            //]
                        }
                    };
                    for (i = 0; i < data.saleOrder.orderDetails.length; i++) {
                        var item = data.saleOrder.orderDetails[i];
                        item.itemId = item.productItemId;
                        //item.unitPrice = item.unitPrice;
                        item.sellPrice = item.unitPrice - (item.discountIsPercent ? Math.round(item.discount * item.unitPrice / 100) : item.discount);
                        item.discountInPercent = item.discountIsPercent ? item.discount : (item.unitPrice == 0 ? 0 : Math.round(item.discount * 100 / item.unitPrice));
                        item.discount = item.discountIsPercent ? Math.round(item.discount / 100 * item.unitPrice) : item.discount;

                        //promotion 
                        item.onItemPromotions = [];
                        item.onItemPromotionSelected = null;
                        //
                        item.totalExchangedQuantity = 0;
                        order.SaleOrder.Details.push(item);
                        
                    };
                    //if (data.saleOrder.payments.length > 0) {
                    //    for (var i = 0; i < data.saleOrder.payments.length; i++) {
                    //        //order.SaleOrder.receiptVouchers[data.saleOrder.payments[i].paymentMethodId - 1].amount = data.saleOrder.payments[i].amount;
                    //        //order.SaleOrder.receiptVouchers[data.saleOrder.payments[i].paymentMethodId - 1].voucherId = data.saleOrder.payments[i].voucherId;
                    //        var receiptVoucher = order.SaleOrder.receiptVouchers.filter(function (item) { return item.paymentMethodId == data.saleOrder.payments[i].paymentMethodId; });
                    //        if(receiptVoucher != undefined && receiptVoucher.length > 0)
                    //        {

                    //            receiptVoucher[0].amount = data.saleOrder.payments[i].amount;
                    //            receiptVoucher[0].voucherId = data.saleOrder.payments[i].voucherId;
                    //        }
                    //    }
                    //}
                    scope.Items[scope.SelectedOrderIndex] = order;

                    //promotion
                    if (order.SaleOrder.status <= 1) {
                        scope.initPromotion(storeId, new Date().toJSON(), order.SaleOrder.saleTypeID, function () {
                            if (callback !== undefined && typeof callback === 'function') {
                                callback();
                            }
                        });
                    }
                    else {
                        scope.Items[scope.SelectedOrderIndex].SaleOrder.promotions = data.saleOrder.promotions;
                    }
                    //end promotion

                    ////Exchange quantity
                    //var exchanges = order.SaleOrder.Details.filter(function (d) { return d.productType == PosimGlobal.productType.exchange; });
                    //if (exchanges.length > 0) {
                    //    for (var i = 0; i < exchanges.length; i++) {
                    //        var detail = exchanges[i];
                    //        scope.makeExchangeQuantity(detail);
                    //    }
                    //}
                },
                function (error) {
                    console.log('Could not get order with id : ' + orderId);
                    console.log(error);
                }
            );
        },

        prepareOrder: function (order) {
            if (!order) return null;
            //if (order.SaleDate == null || order.SaleDate == undefined) order.SaleDate = new Date();
            if (typeof (order.AmountPaid) == 'string') {
                order.AmountPaid = order.AmountPaid != null && order.AmountPaid != undefined && order.AmountPaid != '' ? parseFloat(order.AmountPaid.replace(/\,/g, '')) : 0;
            }
            var Balance = 0;
            order.payments = [];

            var isMultipleReceiptVouchers = (order.receiptVouchers == undefined || order.receiptVouchers == null) ? false : order.receiptVouchers[0].amount == 0 && order.receiptVouchers[1].amount == 0 && order.receiptVouchers[2].amount == 0 ? false : true;
            if (isMultipleReceiptVouchers) {
                var receiptSelected = order.receiptVouchers[0].amount > 0 ? 0 : order.receiptVouchers[1].amount > 0 ? 1 : order.receiptVouchers[2].amount > 0 ? 2 : 0;
                var receiptPayments = order.receiptVouchers.filter(function (r) { return ( r.amount > 0 || r.voucherId > 0 ) });
                if (receiptPayments.length > 1) {

                    var totalPay = 0;
                    receiptPayments.forEach(function (r) {
                        var VoucherId = 0;
                        if(r.voucherId !=0 ) VoucherId = r.voucherId
                        var p = {
                            voucherId: VoucherId,
                            code: '',
                            receivedDate: order.SaleDate,
                            status: 3,//1:InProgress;2:Pending;3:Completed
                            paymentMethodId: r.paymentMethodId,
                            amount: parseFloat(r.amount),
                            description: order.Comment
                        }
                        totalPay += parseFloat(r.amount);
                        order.payments.push(p);
                    });
                    Balance = order.Total - totalPay;
                }
                else {

                    var amountVal = angular.copy(order.receiptVouchers[receiptSelected].amount);
                    if (typeof (amountVal) == 'string') {
                        amountVal = parseFloat(amountVal.replace(/\,/g, ''));
                    }
                    order.payments = [
                         {
                             voucherId: 0,
                             code: '',
                             receivedDate: order.SaleDate,
                             status: 3,//1:InProgress;2:Pending;3:Completed
                             paymentMethodId: order.receiptVouchers[receiptSelected].paymentMethodId,
                             amount: Math.min(amountVal, order.Total),
                             balance: Math.min(order.AmountPaid, order.Total) - amountVal,
                             description: order.Comment
                         }
                    ];
                    Balance = order.Total - amountVal;
                }
                SelectedReceiptVoucher = receiptSelected;
            }
            else {
                if (!order.payments || order.payments.length == 0) {
                    order.payments = [
                         {
                             voucherId: 0,
                             code: '',
                             receivedDate: order.SaleDate,
                             status: 3,//1:InProgress;2:Pending;3:Completed
                             paymentMethodId: order.PaymentMethod,
                             amount: Math.min(order.AmountPaid, order.Total),
                             balance: order.Balance,
                             description: order.Comment
                         }
                    ]
                }
                //else {
                //    order.payments[order.payments.length - 1].status = 3;
                //    order.payments[order.payments.length - 1].receivedDate = order.SaleDate;
                //    order.payments[order.payments.length - 1].paymentMethodId = order.PaymentMethod;
                //    order.payments[order.payments.length - 1].amount = Math.min(order.AmountPaid, order.Total);
                //    order.payments[order.payments.length - 1].balance = order.Balance;
                //    order.payments[order.payments.length - 1].description = order.Comment;
                //};
                Balance = order.Total - order.AmountPaid;
            }

            //EarningPoint: Calculate ConvertPoint
            if (order.earningPointStatus != undefined && order.earningPointStatus == 1) {
                order.convertPoint = Math.floor(order.Total / this.earningPointConfig.convertMoney) * this.earningPointConfig.convertPoint;
                if (order.convertPoint == 0) order.earningPointStatus = 0;
            }

            var request = {
                saleOrder: {
                    storeId: $('#dllInventory').length > 0 ? $('#dllInventory').val() : 0,
                    subTotal: order.SubTotal,
                    discount: order.Discount,
                    tax: order.Tax,
                    promotionId: order.promotionID,
                    comment: order.Comment,
                    customer: order.Customer,
                    payments: order.payments,
                    orderDetails: [],
                    saleOrderId: order.SaleOrderId,
                    saleOrderCode: order.Code,
                    saleOrderDate: order.SaleDate,
                    saleUser: order.Seller != undefined ? order.Seller.UserId : 0,
                    cashier: order.Cashier != undefined ? order.Cashier.UserId : 0,
                    totalQuantity: order.TotalQuantity,
                    total: order.Total,
                    subFee: order.SubFee && !isNaN(order.SubFee) ? order.SubFee : null,
                    subFeeName: order.subFeeName ? order.SubFeeName : null,
                    amountPaid: order.AmountPaid,
                    paymentBalance: Math.max(Balance, 0),
                    //add
                    saleTypeID: order.saleTypeID,
                    status: order.status,
                    shipper: order.shipper,
                    shipperID: order.shipperID,
                    isPromotion: order.isPromotion,
                    convertPoint: order.convertPoint,
                    convertMoney: order.convertMoney,
                    earningPointStatus: order.earningPointStatus,
                    exchangedMoney: order.exchangedMoney,
                    exchangedPoint: order.exchangedPoint
                },
                beforeStatus: order.beforeStatus
            };
            for (var i = 0; i < order.Details.length; i++) {
                var item = order.Details[i];
                //Nếu giá mới cao hơn đơn giá => lưu đơn giá cho hóa đơn này là giá mới
                var sellPrice = parseInt(item.sellPrice);
                if (!isNaN(sellPrice) && sellPrice > item.unitPrice) {
                    item.unitPrice = sellPrice;
                }
                var orderDetail = {
                    saleOrderDetailId: 0,
                    productItemId: item.itemId,
                    itemName: item.itemName,
                    barcode: item.barcode,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discountIsPercent ? item.discountInPercent : item.discount,
                    discountIsPercent: item.discountIsPercent,
                    isGiftProduct: false,
                    subTotal: item.subTotal,
                    isInventoryTracked: item.isInventoryTracked,
                    isUntrackedItemSale: item.isUntrackedItemSale,
                    isSerial: item.isSerial,
                    serials: item.serials,
                    promotionId: item.promotionID,
                    isTaxable: item.isTaxable,
                    tax: item.tax,
                    vat: 0,
                    productType: item.productType,
                    unit: item.unitName,
                    exchangeQuantityItem: null
                };
                if (orderDetail.isTaxable) {
                    var priceWithFee = 0;
                    var price = orderDetail.unitPrice - (orderDetail.discountIsPercent ? orderDetail.discount * orderDetail.unitPrice / 100 : orderDetail.discount);
                    //Phân bổ giảm giá trên hóa đơn
                    if (request.saleOrder.subTotal <= 0) {
                        if (request.saleOrder.totalQuantity > 0) {
                            price -= (request.saleOrder.discount * orderDetail.quantity) / request.saleOrder.totalQuantity;
                        }
                    }
                    else {
                        price -= (request.saleOrder.discount / request.saleOrder.subTotal) * price;
                    }

                    //Phân bổ phí vận chuyển
                    if (request.saleOrder.subFee != null && request.saleOrder.subFee > 0) {
                        if (request.saleOrder.subTotal <= 0) {
                            if (request.saleOrder.totalQuantity > 0) {
                                priceWithFee = price + (request.saleOrder.subFee * orderDetail.quantity) / request.saleOrder.totalQuantity;
                            }
                        }
                        else {
                            priceWithFee = price + (request.saleOrder.subFee * orderDetail.unitPrice) / request.saleOrder.subTotal;
                        }
                    }
                    else {
                        priceWithFee = price;
                    }

                    orderDetail.vat = (priceWithFee * orderDetail.tax / 100) / (1 + (orderDetail.tax / 100));
                }
                if (item.productType == PosimGlobal.productType.exchange && item.exchanged != null) {
                    orderDetail.exchangeQuantityItem = {
                        productItemId: item.exchanged.itemId,
                        exchangeQuantity: item.exchanged.exchangeQuantity,
                        qtyAvailable: item.exchanged.qtyAvailable,
                        qtyTransacted: item.exchanged.qtyTransacted,
                        unit: item.exchanged.unit
                    };
                }
                request.saleOrder.orderDetails.push(orderDetail);
            };
            return request;
        },

        draftOrder: function (onSuccess, onError, type) {

            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var request = this.prepareOrder(order);
            if (type != null) {
                request.saleOrder.saleTypeID = 2;
            }
            //Call service to draft sale order
            saleService.draftSaleOrder(request, onSuccess, onError);
        },

        modifyOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var request = this.prepareOrder(order);
            //Call service to modify sale
            saleService.modifySaleOrder(request, onSuccess, onError);
        },

        saveOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                var request = this.prepareOrder(order);
                //Call service to complete sale order
                saleService.completeSaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        finalizeOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                var request = this.prepareOrder(order);
                //Call service to complete sale order
                saleService.finalizeSaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //Tuan
        //confirmOnlineOrder

        confirmOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                var request = this.prepareOrder(order);
                //Call service to complete sale order
                saleService.confirmSaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //saveOnline
        saveOnlineOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            order.saleTypeID = 2;
            //  order.status = 3;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {

                var request = this.prepareOrder(order);
                //Call service to complete sale order
                saleService.toDeliverySaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //Delivery
        onDeliveryOrder: function (onSuccess, onError, type) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var beforeStatus = angular.copy(order.status);
            order.status = 3;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                var request = this.prepareOrder(order);
                request.beforeStatus = beforeStatus;
                //Call service to complete sale order
                saleService.onDeliverySaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //complete
        finalizeOrderOnline: function (onSuccess, onError, type) {

            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                var request = this.prepareOrder(order);
                if (type == 1) {
                    request.type = type;
                }
                //Call service to complete sale order
                saleService.finalizeOnlineSaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //createWhoseSale
        createWhoseSaleOrder: function (onSuccess, onError) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            order.saleTypeID = 2;
            order.status = 2;
            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {

                var request = this.prepareOrder(order);
                //Call service
                saleService.confirmSaleOrder(request, onSuccess, onError);
            }
            else {
                onError(validationResult);
            }
        },

        //WhoseSale Confirm and Delivery
        WhoseSaleDeliveryOrder: function (onSuccess, onError, type) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var oldStatus = order.status;

            order.status = 3;

            var validationResult = this.validateOrder(order);
            if (validationResult == 'success') {
                order.saleTypeID = 2;
                // order.status = 4;
                order.beforeStatus = 0;
                var request = this.prepareOrder(order);
                //Call service
                saleService.onDeliverySaleOrder(request, onSuccess, onError);
            }
            else {
                order.status = oldStatus;
                onError(validationResult);
            }
        },

        //loadCloneOrder
        loadCloneOrder: function (orderId, storeId, callback) {
            if (!orderId) return;
            var request = { saleOrderId: orderId };
            var scope = this;
            saleService.getSaleOrder(request,
                function (data) {
                    if (!data || !data.saleOrder) return;
                    var order = {
                        SaleOrder: {
                            SaleOrderId: 0,// data.saleOrder.saleOrderId,
                            Code: data.saleOrder.saleOrderCode + ' - Copy',
                            TotalQuantity: data.saleOrder.totalQuantity,
                            SubTotal: data.saleOrder.subTotal,
                            Discount: data.saleOrder.discount,
                            DiscountInPercent: 0,
                            IsDiscountPercent: false,
                            Tax: data.saleOrder.tax,
                            SubFee: data.saleOrder.subFee,
                            SubFeeName: data.saleOrder.subFeeName,
                            Total: data.saleOrder.total,
                            AmountPaid: data.saleOrder.amountPaid,
                            payments: data.saleOrder.payments,
                            IsPaid: true,
                            Balance: data.saleOrder.paymentBalance,
                            PaymentMethod: 1, //1: Cash | 2: Card | 3: Bank Transfer
                            SaleDate: null,
                            Comment: data.saleOrder.comment,
                            Customer: data.saleOrder.customer,
                            SaleUser: data.saleOrder.saleUser,
                            Cashier: data.saleOrder.cashier,
                            Seller: PosimGlobal.getUser(data.saleOrder.saleUser, scope.Users),
                            Cashier: PosimGlobal.getUser(data.saleOrder.cashier, scope.Users),
                            Details: [
                            ],
                            //get 2 data
                            saleTypeID: data.saleOrder.saleTypeID,
                            status: 0,
                            shipperID: data.saleOrder.shipperID,
                            shipper: typeof data.saleOrder.shipper == 'undefined' ? data.saleOrder.shipper = {
                                shipperId: 0,
                                name: '',
                                shippingDate: null,
                                comment: ''
                            } : data.saleOrder.shipper,
                            isPromotion: data.saleOrder.isPromotion,
                            promotionID: data.saleOrder.promotionId
                        }
                    };
                    for (i = 0; i < data.saleOrder.orderDetails.length; i++) {
                        var item = data.saleOrder.orderDetails[i];
                        item.itemId = item.productItemId;
                        //item.unitPrice = item.unitPrice;
                        item.sellPrice = item.unitPrice - (item.discountIsPercent ? (item.discount * item.unitPrice / 100) : item.discount);
                        item.discountInPercent = item.discountIsPercent ? item.discount : (item.unitPrice == 0 ? 0 : item.discount * 100 / item.unitPrice);
                        item.discount = item.discountIsPercent ? item.discount / 100 * item.unitPrice : item.discount;
                        item.qtyAvailable = 1000000000; //Để bỏ qua validation cho đơn hàng copy
                        order.SaleOrder.Details.push(item);
                    };
                    scope.Items[scope.SelectedOrderIndex] = order;

                    //promotion
                    if (order.SaleOrder.status <= 1) {
                        scope.initPromotion(storeId, new Date().toJSON(), function () {
                            if (callback !== undefined && typeof callback === 'function') {
                                callback();
                            }
                        });
                    }
                    //end promotion

                },
                function (error) {
                    console.log('Could not get order with id : ' + orderId);
                    console.log(error);
                }
            );
        },

        //Chính sách giá
        repricingOrder: function (order) {
            if (!order || !order.Details) return;

            var lastIndex = order.Details.indexOf(order.Detail);

            var type = order.Customer ? order.Customer.type : 0;
            for (i = 0; i < order.Details.length; i++) {
                var detail = order.Details[i];
                if (!detail) continue;

                switch (type) {
                    case 1:
                        if (detail.wholeSalePrice) detail.unitPrice = detail.wholeSalePrice;
                        break;
                    case 2:
                        if (detail.vipPrice) detail.unitPrice = detail.vipPrice;
                        break;
                    default:
                        detail.unitPrice = detail.retailPrice;
                        break;
                };
                if (detail.unitPrice == undefined || detail.unitPrice == null) detail.unitPrice = 0;
                //calculatePrice : recalculate sellPrice
                order.Detail = detail;
                this.calculatePrice(detail.discountIsPercent, detail.discountIsPercent ? detail.discountInPercent : detail.discount);
            };
            //calculateTotal
            this.calculateTotal();

            //restore detail selected index
            order.Detail = order.Details[lastIndex];
        },

        addProductItem: function (productItem) {
            var result = {
                isValid: true,
                message: '',
                action: ''
            };
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            //Restore unitPrice = 0 if it is undefined
            if (productItem.unitPrice == undefined || productItem.unitPrice == null) {
                productItem.unitPrice = 0;
                productItem.sellPrice = 0;
                productItem.subTotal = 0;
            }

            var existsItems = details.filter(function (d) { return d.itemId == productItem.itemId; });
            if (existsItems.length > 0) {
                var detail = existsItems[0];
                if (detail.productType != PosimGlobal.productType.exchange) {
                    detail.totalExchangedQuantity = 0;
                    if (detail.qtyAvailable < detail.quantity + 1 && detail.isUntrackedItemSale === false && detail.isInventoryTracked === true) {
                        result.isValid = false;
                        result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + productItem.itemName + '] và thử lại.';
                        result.action = '';
                    }
                    else {
                        detail.quantity = detail.quantity + 1;
                        var index = details.indexOf(detail);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = index;

                        //Apply promotion
                        this.changeQuantityPromotion(detail, details, 1);
                    }
                }
                else if (detail.productType == PosimGlobal.productType.exchange) {
                    detail.totalExchangedQuantity = this.getTotalExchangeQuantity(detail);
                    if (detail.qtyAvailable < detail.totalExchangedQuantity + detail.quantity + 1 && detail.isInventoryTracked === true) {
                        detail.quantity = detail.quantity + 1;
                        var index = details.indexOf(detail);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = index;

                        //Exchange Quantity
                        result = this.makeExchangeQuantity(detail);
                        if (result.isValid) {
                            //Apply promotion
                            this.changeQuantityPromotion(detail, details, 1);
                        }
                    }
                    else {
                        detail.quantity = detail.quantity + 1;
                        var index = details.indexOf(detail);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = index;

                        //Apply promotion
                        this.changeQuantityPromotion(detail, details, 1);
                    }
                }
            }
            else {
                if (productItem.productType != PosimGlobal.productType.exchange) {
                    //Hàng hóa cơ bản
                    productItem.totalExchangedQuantity = 0;
                    if (productItem.qtyAvailable <= 0 && productItem.isUntrackedItemSale === false && productItem.isInventoryTracked === true) {
                        result.isValid = false;
                        result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + productItem.itemName + '] và thử lại.';
                        result.action = '';
                    }
                    else {
                        details.unshift(productItem);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = details.indexOf(productItem);

                        //Apply promotion
                        this.addItemPromotion(productItem, details);
                    }
                }
                else if (productItem.productType == PosimGlobal.productType.exchange) {
                    //Hàng quy đổi
                    productItem.totalExchangedQuantity = this.getTotalExchangeQuantity(productItem);
                    if (productItem.qtyAvailable <= productItem.totalExchangedQuantity && productItem.isInventoryTracked === true) {
                        details.unshift(productItem);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = details.indexOf(productItem);

                        //Exchange Quantity
                        result = this.makeExchangeQuantity(productItem);
                        if (result.isValid) {
                            //Apply promotion
                            this.addItemPromotion(productItem, details);
                        }
                    }
                    else {
                        details.unshift(productItem);
                        this.Items[this.SelectedOrderIndex].SaleOrder.lastInputedIndex = details.indexOf(productItem);

                        //Apply promotion
                        this.addItemPromotion(productItem, details);
                    }
                }
            }
            return result;
        },

        deleteProductItem: function (index) {
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            var detail = angular.copy(details[index]);
            details.splice(index, 1);

            //Apply promotion
            var scope = this;
            var itemObj = {
                itemID: detail.itemId,
                quantity: detail.quantity,
                retailPrice: detail.retailPrice
            };
            var subTotal = 0;
            for (var i = 0; i < details.length; i++) {
                subTotal += details[i].quantity * details[i].retailPrice;
            }
            this.Promotions[this.SelectedOrderIndex].removeItem(itemObj, subTotal, function () {
                if (scope.Items[scope.SelectedOrderIndex].SaleOrder.Details.length == 0) {
                    scope.Items[scope.SelectedOrderIndex].SaleOrder.manualSelected = 0;
                    scope.emptyPromotion();
                }
                else {
                    scope.applyPromotion();
                }
            });
        },

        deleteAllProductItem: function () {
            this.Items[this.SelectedOrderIndex].SaleOrder.Details = [];
            this.emptyPromotion();
        },

        minusProductItem: function (productItem) {
            var result = {
                isValid: true,
                message: '',
                action: ''
            };
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            if (productItem.productType != PosimGlobal.productType.exchange) {
                if (productItem.qtyAvailable < productItem.quantity && productItem.isUntrackedItemSale === false && productItem.isInventoryTracked === true) {
                    result.isValid = false;
                    result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + productItem.itemName + '] và thử lại.';
                    result.action = '';
                }
                else {
                    this.changeQuantityPromotion(productItem, details, 0);
                }
            }
            else if (productItem.productType == PosimGlobal.productType.exchange) {
                //Exchange quantity 
                productItem.totalExchangedQuantity = this.getTotalExchangeQuantity(productItem);
                if (productItem.qtyAvailable < productItem.totalExchangedQuantity + productItem.quantity && productItem.isInventoryTracked === true) {
                    result = this.makeExchangeQuantity(productItem);
                    if (result.isValid) {
                        this.changeQuantityPromotion(productItem, details, 0);
                    }
                }
                else {
                    //Reset quy đổi của hàng hóa
                    this.resetExchangeQuantity(productItem);
                    this.changeQuantityPromotion(productItem, details, 0);
                }
                
            }
            return result;
        },

        addCustomer: function (customer) {
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            //Apply promotion
            var scope = this;
            var customerObj = {
                customerId: customer.customerId,
                type: customer.type
            };
            var subTotal = 0;
            var listItem = [];
            for (var i = 0; i < details.length; i++) {
                subTotal += details[i].quantity * details[i].retailPrice;
                var itemObj = {
                    itemID: details[i].itemId,
                    quantity: details[i].quantity,
                    retailPrice: details[i].retailPrice
                };
                listItem.push(itemObj);
            }
            this.Promotions[this.SelectedOrderIndex].addCustomer(listItem, subTotal, customerObj, function () {
                scope.applyPromotion();
            });
        },

        removeCustomer: function () {
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            //Apply promotion
            var scope = this;
            var subTotal = 0;
            var listItem = [];
            for (var i = 0; i < details.length; i++) {
                subTotal += details[i].quantity * details[i].retailPrice;
                var itemObj = {
                    itemID: details[i].itemId,
                    quantity: details[i].quantity,
                    retailPrice: details[i].retailPrice
                };
                listItem.push(itemObj);
            }
            this.Promotions[this.SelectedOrderIndex].removeCustomer(listItem, subTotal, function () {
                scope.applyPromotion();
            });
        },

        changeStore: function (storeId) {
            //Apply promotion
            if (this.Promotions[this.SelectedOrderIndex]) {
                var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
                var scope = this;
                var subTotal = 0;
                var listItem = [];
                for (var i = 0; i < details.length; i++) {
                    subTotal += details[i].quantity * details[i].retailPrice;
                    var itemObj = {
                        itemID: details[i].itemId,
                        quantity: details[i].quantity,
                        retailPrice: details[i].retailPrice
                    };
                    listItem.push(itemObj);
                }
                this.Promotions[this.SelectedOrderIndex].changeStore(listItem, subTotal, storeId, function () {
                    scope.applyPromotion();
                });
            }

        },

        changeSaleDate: function (saleDate) {
            if (this.Promotions[this.SelectedOrderIndex]) {
                //Apply promotion
                var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
                var scope = this;
                var subTotal = 0;
                var listItem = [];
                for (var i = 0; i < details.length; i++) {
                    subTotal += details[i].quantity * details[i].retailPrice;
                    var itemObj = {
                        itemID: details[i].itemId,
                        quantity: details[i].quantity,
                        retailPrice: details[i].retailPrice
                    };
                    listItem.push(itemObj);
                }
                this.Promotions[this.SelectedOrderIndex].changeDate(listItem, subTotal, saleDate, function () {
                    scope.applyPromotion();
                });
            }
        },
        //On sellPrice change
        sellPriceChange: function () {
            var detail = this.Items[this.SelectedOrderIndex].SaleOrder.Detail;

            if (detail == undefined || detail == null) return;

            if (detail.sellPrice && isNaN(detail.sellPrice)) detail.sellPrice = parseFloat(detail.sellPrice.replace(/\,/g, ''));

            if (detail.sellPrice >= detail.unitPrice) {
                detail.discount = 0;
                detail.discountInPercent = 0;
            }
            else {
                detail.discount = detail.unitPrice - detail.sellPrice;
                if (detail.unitPrice == undefined || detail.unitPrice == null || detail.unitPrice == 0) {
                    detail.discountInPercent = 0;
                }
                else {
                    detail.discountInPercent = Math.round(detail.discount * 100 / detail.unitPrice);
                }
            }
        },

        //On item price change
        calculatePrice: function (isPercent, value) {
            var detail = this.Items[this.SelectedOrderIndex].SaleOrder.Detail;

            if (detail == undefined || detail == null) return;

            if (isPercent != undefined && isPercent != null) {
                detail.discountIsPercent = isPercent;
            }

            if (value && isNaN(value)) value = parseFloat(value);
            if (detail.discount && isNaN(detail.discount)) detail.discount = parseFloat(detail.discount.replace(/\,/g, ''));
            if (detail.discountInPercent && isNaN(detail.discountInPercent)) detail.discountInPercent = parseFloat(detail.discountInPercent.replace(/\,/g, ''));

            if (detail.discountIsPercent) {
                if (value != undefined && value != null) {
                    detail.discountInPercent = value;
                }
                if (detail.discountInPercent > 100) detail.discountInPercent = 100;
                detail.discount = Math.round(detail.unitPrice * detail.discountInPercent / 100);
            }
            else {
                if (value != undefined && value != null) {
                    detail.discount = (value > detail.unitPrice) ? detail.unitPrice : value;
                }

                if (detail.discount > detail.unitPrice) detail.discount = detail.unitPrice;

                if (detail.unitPrice == undefined || detail.unitPrice == null || detail.unitPrice == 0) {
                    detail.discountInPercent = 0;
                }
                else {
                    detail.discountInPercent = Math.round(detail.discount * 100 / detail.unitPrice);
                }
            }
            detail.sellPrice = detail.unitPrice - detail.discount;
        },

        //On item change
        calculateTotal: function () {
            var saleOrder = this.Items[this.SelectedOrderIndex].SaleOrder;
            saleOrder.TotalQuantity = 0;
            saleOrder.SubTotal = 0;
            saleOrder.Tax = 0;
            for (i = 0; i < saleOrder.Details.length; i++) {
                var item = saleOrder.Details[i];
                if (!item.quantity) item.quantity = 0;
                else if (item.quantity && typeof (item.quantity) == "string") item.quantity = parseFloat(item.quantity.replace(/\,/g, ''));
                saleOrder.TotalQuantity += item.quantity;
                //item.subTotal = item.quantity * (item.unitPrice - item.discount);
                item.subTotal = item.quantity * item.sellPrice;
                saleOrder.SubTotal += item.subTotal;
                saleOrder.Tax += (item.quantity * item.tax);
            };
            //calculate discount
            if (saleOrder.IsDiscountPercent) {
                saleOrder.Discount = Math.round(saleOrder.SubTotal * saleOrder.DiscountInPercent / 100);
            }
            else {
                saleOrder.Discount = Math.min(saleOrder.Discount, saleOrder.SubTotal);
            }
            //calculate total
            saleOrder.Total = saleOrder.SubTotal - saleOrder.Discount;
            if (saleOrder.SubFee) {
                if (typeof (saleOrder.SubFee) == "string") saleOrder.SubFee = parseFloat(saleOrder.SubFee.replace(/\,/g, ''));
                saleOrder.Total += saleOrder.SubFee;
            }

            if (saleOrder.Details.length == 0) {
                saleOrder.exchangedMoney = 0;
                saleOrder.exchangedPoint = 0;
            }

            if (saleOrder.exchangedPoint > 0 && saleOrder.exchangedMoney > 0) {
                var exchangeablePoint = saleOrder.exchangedPoint;
                var Total = angular.copy(saleOrder.Total);
                var OriginTotal = angular.copy(saleOrder.Total);
                Total = Total - saleOrder.exchangedMoney;
                if (Total < 0) {
                    saleOrder.exchangedMoney = 0;
                    saleOrder.exchangedPoint = 0;
                    Total = OriginTotal - saleOrder.exchangedMoney;
                }
                saleOrder.Total = Total;
            }
            if (!saleOrder.IsPaid) saleOrder.AmountPaid = saleOrder.Total;
            saleOrder.Payment = saleOrder.Total - saleOrder.AmountPaid;
        },

        calculateTotalOnline: function (IsPaid) {
            var saleOrder = this.Items[this.SelectedOrderIndex].SaleOrder;
            saleOrder.TotalQuantity = 0;
            saleOrder.SubTotal = 0;
            saleOrder.Tax = 0;
            for (i = 0; i < saleOrder.Details.length; i++) {
                var item = saleOrder.Details[i];
                if (!item.quantity) item.quantity = 0;
                else if (item.quantity && typeof (item.quantity) == "string") item.quantity = parseFloat(item.quantity.replace(/\,/g, ''));
                saleOrder.TotalQuantity += item.quantity;
                //item.subTotal = item.quantity * (item.unitPrice - item.discount);
                item.subTotal = item.quantity * item.sellPrice;
                saleOrder.SubTotal += item.subTotal;
                saleOrder.Tax += (item.quantity * item.tax);
            };
            //calculate discount
            if (saleOrder.IsDiscountPercent) {
                saleOrder.Discount = Math.round(saleOrder.SubTotal * saleOrder.DiscountInPercent / 100);
            }
            else {
                saleOrder.Discount = Math.min(saleOrder.Discount, saleOrder.SubTotal);
            }
            if (IsPaid != null && IsPaid != undefined) saleOrder.IsPaid = IsPaid;
            //calculate total
            saleOrder.Total = saleOrder.SubTotal - saleOrder.Discount;
            if (saleOrder.SubFee) {
                if (typeof (saleOrder.SubFee) == "string") saleOrder.SubFee = parseFloat(saleOrder.SubFee.replace(/\,/g, ''));
                saleOrder.Total += saleOrder.SubFee;
            }

            if (saleOrder.Details.length == 0) {
                saleOrder.exchangedMoney = 0;
                saleOrder.exchangedPoint = 0;
            }

            if (saleOrder.exchangedPoint > 0 && saleOrder.exchangedMoney > 0) {
                var exchangeablePoint = saleOrder.exchangedPoint;
                var Total = angular.copy(saleOrder.Total);
                var OriginTotal = angular.copy(saleOrder.Total);
                Total = Total - saleOrder.exchangedMoney;
                if (Total < 0) {
                    saleOrder.exchangedMoney = 0;
                    saleOrder.exchangedPoint = 0;
                    Total = OriginTotal - saleOrder.exchangedMoney;
                }
                saleOrder.Total = Total;
            }

            if (!saleOrder.IsPaid) saleOrder.AmountPaid = saleOrder.Total;
            saleOrder.Payment = saleOrder.Total - saleOrder.AmountPaid;
        },

        //On order discount change
        calculateDiscount: function (isPercent, value) {

            var saleOrder = this.Items[this.SelectedOrderIndex].SaleOrder;

            if (saleOrder == undefined || saleOrder == null) return;

            if (isPercent != undefined && isPercent != null) {
                saleOrder.IsDiscountPercent = isPercent;
            }

            if (value && isNaN(value)) value = parseFloat(value);
            if (saleOrder.Discount && isNaN(saleOrder.Discount)) saleOrder.Discount = parseFloat(saleOrder.Discount.replace(/\,/g, ''));
            if (saleOrder.DiscountInPercent && isNaN(saleOrder.DiscountInPercent)) saleOrder.DiscountInPercent = parseFloat(saleOrder.DiscountInPercent.replace(/\,/g, ''));

            if (saleOrder.IsDiscountPercent) {
                if (value != undefined && value != null) {
                    saleOrder.DiscountInPercent = value;
                }
                if (saleOrder.DiscountInPercent > 100) saleOrder.DiscountInPercent = 100;
                saleOrder.Discount = Math.round(saleOrder.SubTotal * saleOrder.DiscountInPercent / 100);
            }
            else {
                if (value != undefined && value != null) {
                    saleOrder.Discount = value > saleOrder.SubTotal ? saleOrder.SubTotal : value;
                }

                if (saleOrder.Discount > saleOrder.SubTotal) saleOrder.Discount = saleOrder.SubTotal;

                if (saleOrder.SubTotal == undefined || saleOrder.SubTotal == null || saleOrder.SubTotal == 0) {
                    saleOrder.DiscountInPercent = 0;
                }
                else {
                    saleOrder.DiscountInPercent = Math.round(saleOrder.Discount * 100 / saleOrder.SubTotal);
                }
            }
            //recalculate total
            saleOrder.Total = saleOrder.SubTotal - saleOrder.Discount;
            if (saleOrder.SubFee) {
                if (typeof (saleOrder.SubFee) == "string") saleOrder.SubFee = parseFloat(saleOrder.SubFee.replace(/\,/g, ''));
                saleOrder.Total += saleOrder.SubFee;
            }

            //Calculate Exchange Money
            if (saleOrder.exchangedPoint > 0 && saleOrder.exchangedMoney > 0) {
                var exchangeablePoint = saleOrder.exchangedPoint;
                var Total = angular.copy(saleOrder.Total);
                var OriginTotal = angular.copy(saleOrder.Total);
                Total = Total - saleOrder.exchangedMoney;
                if (Total < 0) {
                    saleOrder.exchangedMoney = 0;
                    saleOrder.exchangedPoint = 0;
                    Total = OriginTotal - saleOrder.exchangedMoney;
                }
                saleOrder.Total = Total;
            }

            if (!saleOrder.IsPaid) saleOrder.AmountPaid = saleOrder.Total;
            saleOrder.Payment = saleOrder.Total - saleOrder.AmountPaid;
        },

        //Create ReceiptVouchers
        createReceiptVoucher: function (requests, onSuccess) {
            if (requests == null || requests == undefined) return;
            for (var i = 0 ; i < requests.receiptVoucher.length; i++) {
                var request = {
                    saleOrderId: requests.saleOrderId,
                    storeId: requests.storeId,
                    isUpdateAmountPaid: false,
                    receiptVoucher: requests.receiptVoucher[i]
                }
                //Call service to complete sale order
                POSIM.CallService($http, PosimGlobal.urlRequest.POS.Sale.CreateReceiptVoucher, 'POST', request, onSuccess);
            }
        },

        //Promotion
        checkAppliedPromotion: function (promotion, order) {
            var result = false;
            if (promotion.isPromotion && (promotion.optimal === 1 || promotion.optimal === 2 || promotion.optimal === 3) && (order.Customer == null || order.Customer.type == null || order.Customer.type == 0)) {
                result = true;
            }
            else {
                result = false;
            }
            return result;
        },
        applyPromotion: function () {
            var scope = this;
            var promotion = this.Promotions[this.SelectedOrderIndex];
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var applyOptimalPromotion = function (order, promotion, subTotal) {
                //Apply optimal promotions
                if (promotion.optimal == 1) {
                    //onItems
                    for (var i = 0; i < order.Details.length; i++) {
                        var detail = order.Details[i];
                        var optimalPromotionOnItem = detail.onItemPromotions.filter(function (p) {
                            return p.isSelected === true;
                        });
                        if (optimalPromotionOnItem.length > 0) {
                            detail.promotionID = optimalPromotionOnItem[0].promotionID;
                            detail.onItemPromotionSelected = optimalPromotionOnItem[0];
                            //Update discount
                            var discountValue = detail.onItemPromotionSelected.isPercent ? Math.round(detail.retailPrice * detail.onItemPromotionSelected.discountPercent / 100) : detail.onItemPromotionSelected.discountPrice;
                            discountValue = discountValue > detail.retailPrice ? detail.retailPrice : discountValue;
                            detail.discountIsPercent = detail.onItemPromotionSelected.isPercent;
                            detail.discountInPercent = detail.onItemPromotionSelected.isPercent ? detail.onItemPromotionSelected.discountPercent : 0;
                            detail.discount = discountValue;
                            detail.unitPrice = detail.retailPrice;
                            detail.sellPrice = detail.retailPrice - discountValue;
                            detail.subTotal = detail.quantity * detail.sellPrice;
                        }
                    }
                    order.optimal = 1;
                }
                else if (promotion.optimal == 2) {
                    //onBill
                    var optimalPromotionOnBill = order.onBillPromotions.filter(function (p) {
                        return p.isSelected === true;
                    });
                    if (optimalPromotionOnBill.length > 0) {
                        order.promotionID = optimalPromotionOnBill[0].promotionID;
                        order.onBillPromotionSelected = optimalPromotionOnBill[0];
                        //Update discount
                        order.Discount = order.onBillPromotionSelected.isPercent ? Math.round(subTotal * order.onBillPromotionSelected.discountPercent / 100) : order.onBillPromotionSelected.discountPrice;
                        order.optimal = 2;
                    }
                }
                else if (promotion.optimal == 3) {
                    order.isPromotion = false;
                    order.promotionID = 0;
                    order.optimal = 3;

                    //Reset promotion price
                    scope.resetPricePromotion(order.optimal);
                }
            };
            if (setting.saleSettings.ApplyPromotion !== undefined && setting.saleSettings.ApplyPromotion == true && this.saleType != 3) {
                if (this.checkAppliedPromotion(promotion, order)) {
                    order.isPromotion = promotion.isPromotion;
                    order.promotions = [];
                    order.onBillPromotions = [];
                    order.Discount = 0;
                    order.optimal = 0;
                    order.promotionID = 0;
                    order.firstLoad = false;

                    //Caculate sub total without discount and reset promotion on items
                    var subTotal = 0;

                    //Get selected promotions (if have)
                    var selectedItemIds = [];
                    var selectedBill = 0;
                    if (order.manualSelected == 1) {
                        //select promotions on item
                        for (var i = 0; i < order.Details.length; i++) {
                            var detail = order.Details[i];
                            if (detail.onItemPromotionSelected != null) {
                                selectedItemIds.push({ itemId: detail.itemId, promotionID: detail.onItemPromotionSelected.promotionID });
                            }
                            else {
                                //Check optimal promotion
                                var onItems = promotion.items.filter(function (item) {
                                    return item.itemID == detail.itemId;
                                });
                                if (onItems.length > 0) {
                                    var promotionItem = onItems[0];
                                    if (promotionItem.promotions.length > 0) {
                                        for (var j = 0; j < promotionItem.promotions.length; j++) {
                                            if (promotionItem.promotions[j].isSelected) {
                                                selectedItemIds.push({ itemId: detail.itemId, promotionID: promotionItem.promotions[j].promotionID });
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (order.manualSelected == 2) {
                        //select promotions on bill
                        selectedBill = order.onBillPromotionSelected.promotionID;
                    }

                    //Pick promotions on items
                    for (var i = 0; i < order.Details.length; i++) {
                        var detail = order.Details[i];
                        detail.onItemPromotions = [];
                        detail.onItemPromotionSelected = null;
                        detail.promotionID = 0;
                        detail.unitPrice = detail.retailPrice;
                        detail.sellPrice = detail.retailPrice;
                        detail.subTotal = detail.retailPrice;
                        detail.discount = 0;

                        subTotal += detail.quantity * detail.retailPrice;
                        var onItems = promotion.items.filter(function (item) {
                            return item.itemID == detail.itemId;
                        });
                        if (onItems.length > 0) {
                            var promotionItem = onItems[0];
                            if (promotionItem.promotions.length > 0) {
                                for (var j = 0; j < promotionItem.promotions.length; j++) {
                                    var promo = {
                                        promotionID: promotionItem.promotions[j].promotionID,
                                        promotionName: promotionItem.promotions[j].promotionName,
                                        promotionType: promotionItem.promotions[j].promotionType,
                                        isCodeRequired: promotionItem.promotions[j].isCodeRequired,
                                        isPercent: promotionItem.promotions[j].isPercent,
                                        discountPercent: promotionItem.promotions[j].discountPercent,
                                        discountPrice: promotionItem.promotions[j].discountPrice,
                                        discountValue: promotionItem.promotions[j].discountValue,
                                        isSelected: promotionItem.promotions[j].isSelected
                                    };
                                    detail.onItemPromotions.push(promo);
                                    //insert promotions list
                                    var existsPromo = order.promotions.filter(function (p) { return p.promotionID === promo.promotionID; });
                                    if (existsPromo.length == 0) order.promotions.push(promo);
                                }
                            }
                        }
                    }

                    //Pick promotions on bills
                    order.onBillPromotionSelected = null;
                    if (promotion.bills.length > 0) {
                        for (var i = 0; i < promotion.bills.length; i++) {
                            var promo = {
                                promotionID: promotion.bills[i].promotionID,
                                promotionCode: promotion.bills[i].promotionCode,
                                promotionName: promotion.bills[i].promotionName,
                                promotionType: promotion.bills[i].promotionType,
                                isCodeRequired: promotion.bills[i].isCodeRequired,
                                isPercent: promotion.bills[i].isPercent,
                                discountPercent: promotion.bills[i].discountPercent,
                                discountPrice: promotion.bills[i].discountPrice,
                                discountValue: promotion.bills[i].discountValue,
                                isSelected: promotion.bills[i].isSelected
                            };
                            order.onBillPromotions.push(promo);
                            //insert promotions list
                            var existsPromo = order.promotions.filter(function (p) { return p.promotionID === promo.promotionID; });
                            if (existsPromo.length == 0) order.promotions.push(promo);
                        }
                    }

                    //Apply promotion
                    if (order.manualSelected > 0) {
                        //Apply selected promotions
                        if (order.manualSelected == 1) {
                            //onItem
                            var isExists = true;
                            for (var i = 0; i < selectedItemIds.length; i++) {
                                var selectedItem = selectedItemIds[i];
                                var existsPromotion = order.promotions.filter(function (p) {
                                    return p.promotionID === selectedItem.promotionID;
                                });
                                if (existsPromotion.length == 0) {
                                    isExists = false;
                                    break;
                                }
                            }

                            if (isExists) {
                                for (var i = 0; i < order.Details.length; i++) {
                                    var detail = order.Details[i];
                                    if (detail.onItemPromotions.length > 0) {
                                        for (var j = 0; j < detail.onItemPromotions.length; j++) {
                                            var promo = detail.onItemPromotions[j];
                                            var existsSelectedPromotion = selectedItemIds.filter(function (p) {
                                                return p.itemId === detail.itemId && p.promotionID === promo.promotionID;
                                            });
                                            if (existsSelectedPromotion.length > 0) {
                                                detail.promotionID = promo.promotionID;
                                                detail.onItemPromotionSelected = promo;
                                                //Update discount
                                                var discountValue = detail.onItemPromotionSelected.isPercent ? Math.round(detail.retailPrice * detail.onItemPromotionSelected.discountPercent / 100) : detail.onItemPromotionSelected.discountPrice;
                                                discountValue = discountValue > detail.retailPrice ? detail.retailPrice : discountValue;
                                                detail.discountIsPercent = detail.onItemPromotionSelected.isPercent;
                                                detail.discountInPercent = detail.onItemPromotionSelected.isPercent ? detail.onItemPromotionSelected.discountPercent : 0;
                                                detail.discount = discountValue;
                                                detail.unitPrice = detail.retailPrice;
                                                detail.sellPrice = detail.retailPrice - discountValue;
                                                detail.subTotal = detail.quantity * detail.sellPrice;
                                                break;
                                            }
                                        }
                                    }
                                }
                                order.optimal = 1;
                            }
                            else {
                                applyOptimalPromotion(order, promotion, subTotal);
                            }

                        }
                        else if (order.manualSelected == 2) {
                            //onBill
                            var promotionID = selectedBill;
                            var existsPromotion = order.promotions.filter(function (p) {
                                return p.promotionID === promotionID;
                            });
                            if (existsPromotion.length > 0) {
                                var optimalPromotionOnBill = order.onBillPromotions.filter(function (p) {
                                    return p.promotionID === promotionID;
                                });
                                order.promotionID = optimalPromotionOnBill[0].promotionID;
                                order.onBillPromotionSelected = optimalPromotionOnBill[0];
                                //Update discount
                                order.Discount = order.onBillPromotionSelected.isPercent ? Math.round(subTotal * order.onBillPromotionSelected.discountPercent / 100) : order.onBillPromotionSelected.discountPrice;
                                order.optimal = 2;
                            }
                            else {
                                applyOptimalPromotion(order, promotion, subTotal);
                            }
                        }
                    }
                    else {
                        applyOptimalPromotion(order, promotion, subTotal);
                    }

                    //recalculate total
                    order.Total = order.SubTotal - order.Discount;
                    if (order.SubFee) {
                        if (typeof (order.SubFee) == "string") order.SubFee = parseFloat(order.SubFee.replace(/\,/g, ''));
                        order.Total += order.SubFee;
                    }
                    if (!order.IsPaid) order.AmountPaid = order.Total;
                    order.Payment = order.Total - order.AmountPaid;
                }
                else {
                    this.emptyPromotion();
                }
            }
        },
        emptyPromotion: function () {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var promotion = this.Promotions[this.SelectedOrderIndex];
            //reset promotion on sale order

            order.promotionID = 0;
            order.promotions = [];
            order.optimal = 0;


            if (order.isPromotion) {
                var type = !setting.saleSettings.ApplyCustomerPricingPolicy ? 0 : order.Customer ? order.Customer.type : 0;
                order.Discount = 0;
                for (i = 0; i < order.Details.length; i++) {
                    var detail = order.Details[i];

                    //Reset discount
                    detail.discountIsPercent = false;
                    detail.discountInPercent = 0;
                    detail.discount = 0;
                    //Reset promotion on item
                    detail.promotionID = 0;
                    detail.onItemPromotions = [];
                    detail.onItemPromotionSelected = null;

                    switch (type) {
                        case 1:
                            if (detail.wholeSalePrice) detail.unitPrice = detail.wholeSalePrice;
                            break;
                        case 2:
                            if (detail.vipPrice) detail.unitPrice = detail.vipPrice;
                            break;
                        default:
                            detail.unitPrice = detail.retailPrice;
                            break;
                    };
                    if (detail.unitPrice == undefined || detail.unitPrice == null) detail.unitPrice = 0;
                    //calculatePrice : recalculate sellPrice
                    order.Detail = detail;
                    this.calculatePrice(detail.discountIsPercent, detail.discountIsPercent ? detail.discountInPercent : detail.discount);
                };
                //calculateTotal
                this.calculateTotal();
            }
            //Reset promotion on bill
            order.onBillPromotions = [];
            order.onBillPromotionSelected = null;
            order.isPromotion = false;
        },
        selectPromotion: function (promotionModel) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            order.isPromotion = true;
            if (promotionModel.manualSelected > 0) {
                var promotion = this.Promotions[this.SelectedOrderIndex];
                order.manualSelected = promotionModel.manualSelected;
                if (promotionModel.manualSelected == 1) {
                    for (var i = 0; i < order.Details.length; i++) {
                        var detail = order.Details[i];
                        var existsItems = promotionModel.items.filter(function (i) { return i.itemId === detail.itemId; });
                        if (existsItems.length > 0) {
                            detail.onItemPromotionSelected = existsItems[0].onItemPromotionSelected;
                        }
                    }
                }
                else if (promotionModel.manualSelected == 2) {
                    order.onBillPromotionSelected = promotionModel.onBills;
                }
                this.applyPromotion();
            }
            else {
                order.manualSelected = promotionModel.manualSelected;
                this.applyPromotion();
            }
        },
        addItemPromotion: function (productItem, details) {
            //Apply promotion
            var scope = this;
            var itemObj = {
                itemID: productItem.itemId,
                quantity: productItem.quantity,
                retailPrice: productItem.retailPrice
            };
            var subTotal = 0;
            for (var i = 0; i < details.length; i++) {
                subTotal += details[i].quantity * details[i].retailPrice;
            }
            this.Promotions[this.SelectedOrderIndex].addItem(itemObj, subTotal, function () {
                scope.applyPromotion();
            });
        },
        changeQuantityPromotion: function (productItem, details, type) {
            //Apply promotion
            var scope = this;
            var itemObj = {
                itemID: productItem.itemId,
                quantity: productItem.quantity,
                retailPrice: productItem.retailPrice
            };
            var subTotal = 0;
            for (var i = 0; i < details.length; i++) {
                subTotal += details[i].quantity * details[i].retailPrice;
            }
            this.Promotions[this.SelectedOrderIndex].changeQuantity(itemObj, type, subTotal, function () {
                scope.applyPromotion();
            });
        },
        resetPricePromotion: function (optimal) {
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            var promotion = this.Promotions[this.SelectedOrderIndex];
            //reset promotion on sale order

            order.promotionID = 0;
            order.promotions = [];
            order.optimal = optimal;

            //var type = order.Customer ? order.Customer.type : 0;
            var type = !setting.saleSettings.ApplyCustomerPricingPolicy ? 0 : order.Customer ? order.Customer.type : 0;
            order.Discount = 0;
            for (i = 0; i < order.Details.length; i++) {
                var detail = order.Details[i];

                //Reset discount
                detail.discountIsPercent = false;
                detail.discountInPercent = 0;
                detail.discount = 0;
                //Reset promotion on item
                detail.promotionID = 0;
                detail.onItemPromotions = [];
                detail.onItemPromotionSelected = null;

                switch (type) {
                    case 1:
                        if (detail.wholeSalePrice) detail.unitPrice = detail.wholeSalePrice;
                        break;
                    case 2:
                        if (detail.vipPrice) detail.unitPrice = detail.vipPrice;
                        break;
                    default:
                        detail.unitPrice = detail.retailPrice;
                        break;
                };
                if (detail.unitPrice == undefined || detail.unitPrice == null) detail.unitPrice = 0;
                //calculatePrice : recalculate sellPrice
                order.Detail = detail;
                this.calculatePrice(detail.discountIsPercent, detail.discountIsPercent ? detail.discountInPercent : detail.discount);
            };
            //calculateTotal
            this.calculateTotal();

            //Reset promotion on bill
            order.onBillPromotions = [];
            order.onBillPromotionSelected = null;
            order.isPromotion = false;
        },

        //EarningPoint
        applyExchangePoint: function (applyExchange) {
            var exchangedMoney = applyExchange.ExchangedMoney;
            var exchangedPoint = applyExchange.ExchangedPoint;
            var order = this.Items[this.SelectedOrderIndex].SaleOrder;
            order.exchangedMoney = exchangedMoney;
            order.exchangedPoint = exchangedPoint;
            order.IsPaid = false;
            if (order.saleTypeID <= 1) {
                this.calculateTotal();
            }
            else {
                this.calculateTotalOnline(false);
            }
        },

        //Exchange Quantity
        resetExchangeQuantity: function (detail) {
            detail.isExchangeQuantity = false;
            detail.exchanged = null;
            detail.exchanges = [];
            //this.updateExchangeAvailable();
        },
        showHideExchangeActions: function (detail, isShow) {
            if (detail.exchanged) {
                detail.exchanged.showActions = isShow;
            }
        },
        getTotalExchangeQuantity: function (detail) {
            var totalExchangedQuantity = 0;
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            var exchangedItems = details.filter(function (item) { return item.itemId != detail.itemId && item.exchanged != null && item.exchanged.itemId == detail.itemId; });
            if (exchangedItems.length > 0) {
                exchangedItems.forEach(function (ex) {
                    totalExchangedQuantity += ex.exchanged.qtyTransacted;
                });
            }
            return totalExchangedQuantity;
        },
        updateQtyAvailableAfterExchange: function (detail) {
            if (detail.exchanged != null) {
                detail.qtyAvailable = detail.exchanged.afterExchangeQuantity;
                var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
                var exchangableItem = details.filter(function (item) { return item.itemId == detail.exchanged.itemId && item.exchanged != null; });
                if (exchangableItem.length > 0) {
                    var item = exchangableItem[0];
                    item.qtyAvailable = item.qtyAvailable - detail.exchanged.qtyTransacted;
                    item.exchanged.afterExchangeQuantity = item.qtyAvailable + item.exchanged.exchangeQuantity;
                }
            }
        },
        updateExchangeAvailable: function () {
            var $this = this;
            var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
            details.forEach(function (d) {
                //Cập nhật những số lượng quy đổi (source) của hàng hóa.
                d.totalExchangedQuantity = $this.getTotalExchangeQuantity(d);
                var exchangeQuantity = 0;
                if (d.exchanged != null) {
                    exchangeQuantity = d.exchanged.exchangeQuantity;
                    var notExists = details.filter(function (item) { return item.itemId == d.exchanged.itemId; })
                    if (notExists.length == 0) {
                        if (d.exchanges != null && d.exchanges.length > 0) {
                            var existsExchanges = d.exchanges.filter(function (ex) {
                                return ex.fromItemId == d.exchanged.itemId;
                            });
                            if (existsExchanges.length > 0) existsExchanges[0].fromQuantity = existsExchanges[0].fromQtyAvailable - d.exchanged.qtyTransacted;
                        }
                    }
                }
                if (d.qtyAvailable + exchangeQuantity < d.quantity + d.totalExchangedQuantity) {
                    d.quantity = d.qtyAvailable + exchangeQuantity - d.totalExchangedQuantity;
                }

                var exchangeItems = details.filter(function (item) { return item.itemId != d.itemId && item.exchanges != null && item.exchanges.filter(function (ex) { return ex.fromItemId == d.itemId; }).length > 0; });
                if (exchangeItems.length > 0) {
                    exchangeItems.forEach(function (ex) {
                        for (var i = 0; i < ex.exchanges.length; i++) {
                            if (ex.exchanges[i].fromItemId == d.itemId) {
                                ex.exchanges[i].fromQuantity = ex.exchanges[i].fromQtyAvailable - d.quantity - d.totalExchangedQuantity;
                                break;
                            }
                        }
                    });
                }
            });
        },
        calculateExchange: function (detail) {
            if (detail.exchanges != null && detail.exchanges.length > 0) {
                var units = detail.units.filter(function (u) { return u.itemId == detail.itemId; });
                detail.unit = units.length > 0 ? units[0].unit : '';
                detail.exchanges.forEach(function (ex) {
                    var fromItemUnits = detail.units.filter(function (u) { return u.itemId == ex.fromItemId; });
                    ex.unit = fromItemUnits.length > 0 ? fromItemUnits[0].unit : '';
                    ex.isSelected = false;
                });

                var ex = detail.exchanges[0];
                ex.isSelected = true;
                detail.exchanged = {
                    itemId: ex.fromItemId,
                    qtyTransacted: ex.qtyTransacted,
                    minQtyTransacted: ex.minQtyTransacted,
                    fromExchangeQuantity: ex.fromExchangeQuantity,
                    toExchangeQuantity: ex.toExchangeQuantity,
                    exchangeQuantity: (ex.qtyTransacted * ex.toExchangeQuantity) / ex.fromExchangeQuantity,
                    afterExchangeQuantity: 0,
                    unit: ex.unit,
                    description: ''
                };
                detail.exchanged.afterExchangeQuantity = detail.qtyAvailable + detail.exchanged.exchangeQuantity;
                detail.exchanged.description = 'Đổi ' + detail.exchanged.qtyTransacted + ' (' + detail.exchanged.unit + ') thành ' + detail.exchanged.exchangeQuantity + ' (' + detail.unit + ')';
            }
            else {
                console.log('Không có điều kiện quy đổi. Kiểm tra lại.');
            }
        },
        getExchanges: function (detail) {
            var $this = this;
            if (detail.units == null || detail.units.length == 0) {
                var request = { productItemIds: [] };
                request.productItemIds.push(detail.itemId);
                detail.exchangeConfig.forEach(function (ex) {
                    request.productItemIds.push(ex.fromItemId);
                });
                productService.getExchangeQuantityUnit(request, function (data) {
                    if (data.exchangesUnit != null && data.exchangesUnit.length > 0) {
                        detail.units = data.exchangesUnit;
                        $this.calculateExchange(detail);
                    }
                    else {
                        console.log('Đơn vị quy đổi (giá trị thuộc tính) không tồn tại hoặc bị xóa.');
                    }
                },
                function (error) { console.log(error); });
            }
            else {
                $this.calculateExchange(detail);
            }
        },
        checkExchangeAvailable: function (detail, exchanges) {
            var result = false;
            var existsQuantity = exchanges.filter(function (ex) {
                return ex.toItemId == detail.itemId && ex.storeId == $rootScope.workingStore.StoreID && ex.fromQtyAvailable > 0;
            });
            detail.exchanges = [];
            if (existsQuantity.length > 0) {
                var details = this.Items[this.SelectedOrderIndex].SaleOrder.Details;
                for (var i = 0; i < existsQuantity.length; i++) {
                    var remainQuantity = detail.quantity + detail.totalExchangedQuantity - detail.qtyAvailable;
                    var exchange = existsQuantity[i]; 
                    var totalExchangedQuantity = 0;
                    var exchangedItems = details.filter(function (d) { return d.itemId != detail.itemId && d.exchanged != null && d.exchanged.itemId == exchange.fromItemId; });
                    if (exchangedItems.length > 0) {
                        exchangedItems.forEach(function (ex) {
                            totalExchangedQuantity += ex.exchanged.qtyTransacted;
                        });
                    }
                    var sellQuantity = 0, exchangedQuantity = 0;
                    var existsDetails = details.filter(function (d) { return d.itemId == exchange.fromItemId; });
                    if (existsDetails.length > 0) {
                        sellQuantity = existsDetails[0].quantity;
                        exchangedQuantity = (existsDetails[0].exchanged != null ? existsDetails[0].exchanged.exchangeQuantity : 0);
                    }
                    var quantityAvailableExchange = exchange.fromQtyAvailable + exchangedQuantity - sellQuantity - totalExchangedQuantity;
                    if (quantityAvailableExchange > 0) {
                        if (exchange.fromExchangeQuantity <= exchange.toExchangeQuantity) {
                            //Quy đổi thuận: Từ đơn vị cao -> thấp
                            var count = 1;
                            for (var j = 1; j <= quantityAvailableExchange; j++) {
                                var exchangeQuantity = (j * exchange.toExchangeQuantity) / exchange.fromExchangeQuantity;
                                if (exchangeQuantity >= remainQuantity) {
                                    exchange.qtyTransacted = j;
                                    exchange.minQtyTransacted = j;
                                    detail.exchanges.push(exchange);
                                    result = true;
                                    break;
                                }
                                count += 1;
                            }

                            if (count > quantityAvailableExchange) {
                                //Kiểm tra khả năng quy đổi nếu có thể.
                                var exchangeQuantity = Math.ceil((remainQuantity * exchange.toExchangeQuantity) / exchange.fromExchangeQuantity);
                                if (exchangeQuantity > quantityAvailableExchange) {
                                    exchange.qtyTransacted = quantityAvailableExchange;
                                    exchange.minQtyTransacted = quantityAvailableExchange;
                                    detail.exchanges.push(exchange);
                                    result = true;
                                    break;
                                }
                            }
                            
                        }
                        else {
                            //Quy đổi nghịch: Từ đơn vị thấp -> cao
                            var qtyTransacted = (remainQuantity * exchange.fromExchangeQuantity / exchange.toExchangeQuantity);
                            if (qtyTransacted <= quantityAvailableExchange) {
                                exchange.qtyTransacted = qtyTransacted;
                                exchange.minQtyTransacted = qtyTransacted;
                                detail.exchanges.push(exchange);
                                result = true;
                                break;
                            }
                            else if (quantityAvailableExchange >= exchange.fromExchangeQuantity) {
                                //Kiểm tra khả năng quy đổi nếu có thể.
                                var remain = Math.floor((quantityAvailableExchange * exchange.toExchangeQuantity) / exchange.fromExchangeQuantity);
                                qtyTransacted = (remain * exchange.fromExchangeQuantity / exchange.toExchangeQuantity);
                                exchange.qtyTransacted = qtyTransacted;
                                exchange.minQtyTransacted = qtyTransacted;
                                detail.exchanges.push(exchange);
                                result = true;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                result = false;
            }
            return result;
        },
        makeExchangeQuantity: function (detail) {
            var result = {
                isValid: true,
                message: '',
                action: ''
            };
            if (detail.hasExchangeQuantity === undefined || detail.hasExchangeQuantity == true) {
                if (detail.exchangeConfig != null && detail.exchangeConfig.length > 0) {
                    if (detail.exchanged != null) {
                        var quantity = setting.saleSettings.AllowQuantityAsDecimal ? parseFloat(detail.quantity) : parseInt(detail.quantity);
                        if (quantity + detail.totalExchangedQuantity > detail.qtyAvailable) {
                            var isHasExchangeQuantity = this.checkExchangeAvailable(detail, detail.exchangeConfig);
                            if (isHasExchangeQuantity) {
                                this.getExchanges(detail);
                            }
                            else {
                                if (detail.isUntrackedItemSale === false) {
                                    detail.quantity = detail.qtyAvailable - detail.totalExchangedQuantity;
                                    result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + detail.itemName + '] và thử lại.';
                                    result.isValid = false;
                                }
                                else {
                                    result.isValid = true;
                                }
                                this.resetExchangeQuantity(detail);
                            }
                        }
                    }
                    else {
                        var isHasExchangeQuantity = this.checkExchangeAvailable(detail, detail.exchangeConfig);
                        if (isHasExchangeQuantity) {
                            this.getExchanges(detail);
                        }
                        else {
                            if (detail.isUntrackedItemSale === false) {
                                detail.quantity = detail.qtyAvailable - detail.totalExchangedQuantity;
                                result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + detail.itemName + '] và thử lại.';
                                result.isValid = false;
                            }
                            else {
                                result.isValid = true;
                            }
                            this.resetExchangeQuantity(detail);
                        }
                    }
                    detail.hasExchangeQuantity = true;
                }
                else {
                    //lần đầu
                    var $this = this;
                    productService.getExchangeQuantity({ productItemId: detail.itemId }, function (data) {
                        if (data.exchanges != null && data.exchanges.length > 0) {
                            detail.exchangeConfig = data.exchanges;
                            detail.exchangeConfig.forEach(function (e) { e.fromQuantity = angular.copy(e.fromQtyAvailable); });
                            var isHasExchangeQuantity = $this.checkExchangeAvailable(detail, detail.exchangeConfig);
                            if (isHasExchangeQuantity) {
                                $this.getExchanges(detail);
                            }
                            else {
                                if (detail.isUntrackedItemSale === false) {
                                    detail.quantity = detail.qtyAvailable - detail.totalExchangedQuantity;
                                    result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + detail.itemName + '] và thử lại.';
                                    result.isValid = false;
                                    $this.resetExchangeQuantity(detail);
                                    //if (detail.qtyAvailable <= 0) {
                                    //    var details = $this.Items[$this.SelectedOrderIndex].SaleOrder.Details;
                                    //    var index = details.indexOf(detail);
                                    //    details.splice(index, 1);
                                    //}
                                    PosimGlobal.showMessage(result.message, 'warning');
                                }
                                else {
                                    result.isValid = true;
                                }
                            }
                            detail.hasExchangeQuantity = true;
                        }
                        else {
                            if (detail.isUntrackedItemSale === false) {
                                detail.quantity = detail.qtyAvailable - detail.totalExchangedQuantity;
                                result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + detail.itemName + '] và thử lại.';
                                result.isValid = false;
                                $this.resetExchangeQuantity(detail);
                                //if (detail.qtyAvailable <= 0) {
                                //    var details = $this.Items[$this.SelectedOrderIndex].SaleOrder.Details;
                                //    var index = details.indexOf(detail);
                                //    details.splice(index, 1);
                                //}
                                PosimGlobal.showMessage(result.message, 'warning');
                            }
                            else {
                                result.isValid = true;
                            }
                            detail.hasExchangeQuantity = false;
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }
            }
            else {
                if (detail.isUntrackedItemSale === false) {
                    detail.quantity = detail.qtyAvailable;
                    this.resetExchangeQuantity(detail);
                    result.message = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + detail.itemName + '] và thử lại.';
                    result.isValid = false;
                }
                else {
                    result.isValid = true;
                }
                detail.hasExchangeQuantity = false;
            }
            return result;
        },
        exchange: function (detail, onSuccess, onError) {
            var request = {
                storeId: $rootScope.workingStore.StoreID,
                toItemId: detail.itemId,
                fromItemId: detail.exchanged.itemId,
                fromQtyTransacted: detail.exchanged.qtyTransacted,
                exchangeQuantity: detail.exchanged.exchangeQuantity
            };

            productService.balanceExchangeQuantity(request, function (data) {
                if (data == true) {
                    if (onSuccess != null && typeof onSuccess === 'function') onSuccess();
                }
                else {
                    if (onError != null && typeof onError === 'function') onError();
                }
            },
            function (error) {
                console.log(error);
                if (onError != null && typeof onError === 'function') onError();
            });
        }

    };
    return saleOrders;
}]);
