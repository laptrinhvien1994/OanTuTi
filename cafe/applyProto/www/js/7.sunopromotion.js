var P = function(){};
P.prototype = SunoBasicSaleOrder.prototype;

function SunoPromotion(storeId) { 
    this.request = new SunoRequest();
    this.storeId = storeId;
 };
SunoPromotion.prototype = new P();
SunoPromotion.prototype.constructor = SunoPromotion;
SunoPromotion.uber = SunoBasicSaleOrder.prototype;
SunoPromotion.prototype.promotionType = {
    None: 0,
    onItem: 1,
    onBill: 2,
    onCode: 3
};

SunoPromotion.prototype.promotion = null;
SunoPromotion.prototype.promotions = [];

/*
    Description: Tạo cấu trúc đơn hàng. 
*/
SunoPromotion.prototype.generateSaleOrder = function() {
    var self = this;
    var saleOrder = self.constructor.uber.generateSaleOrder();
    saleOrder.isPromotion = false;
    saleOrder.promotionId = 0;
    saleOrder.promotionOnBill = [];
    saleOrder.promotionOnBillSelected = null;
    saleOrder.promotionOnItem = [];
    saleOrder.promotionType = self.promotionType.None;
    return saleOrder;
};

/*
    Description: Tạo cấu trúc hàng hóa trong đơn hàng. 
*/
SunoPromotion.prototype.generateOrderDetail = function(item) {
    var self = this;
    var saleOrderDetail = self.constructor.uber.generateOrderDetail(item);
    saleOrderDetail.promotionId = 0;
    saleOrderDetail.promotionOnItemSelected = null;
    return saleOrderDetail;
};
/*
    Description: Tạo cấu trúc khuyến mãi. 
*/
SunoPromotion.prototype.generatePromotion = function() {
    var promotion = new Object();
    promotion.isPromotion = false;
    promotion.isCallApi = false;
    promotion.promotionOnItem = [];
    promotion.promotionOnBill = [];
    return promotion;
};

/* 
    Description: Tạo mới đơn hàng.
*/
SunoPromotion.prototype.createNewOrder = function(saleType) {
    var self = this;
    var saleOrder = self.generateSaleOrder();
    saleOrder.saleTypeId = saleType !== undefined && saleType !== null ? saleType : self.saleType.retail;
    self.promotion = self.generatePromotion();
    if (SunoGlobal.saleSetting.isApplyPromotion && saleOrder.saleTypeId != self.saleType.online) {
        var data = { format: 'json' };
        self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getActivePromotionUrl, 'GET', data)
        .then(function(body){
            self.promotion.isCallApi = body;
            if (self.promotion.isCallApi) {
                //Lấy danh sách CTKM trên hóa đơn
                var promotionData = { format: 'json', saleDate: saleOrder.saleDate.toJSON()};
                self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getPromotionOnBillUrl, 'GET', promotionData)
                .then(function(result){
                    if (result != null && result.response != null && result.response.length > 0) {
                        self.promotion.promotionOnBill = result.response;
                    }
                    self.promotions.push(self.promotion);
                })
                .catch(function(error){
                    console.log('createNewOrder: getPromotionOnBillUrl', error);
                    self.promotions.push(self.promotion);
                });
            }
            else {
                self.promotions.push(self.promotion);
            }
        })
        .catch(function(error){
            console.log('createNewOrder: getActivePromotionUrl', error);
            self.promotions.push(self.promotion);
        });
    }
    else {
        self.saleOrders.push(saleOrder);
        self.saleOrder = saleOrder;
        self.promotions.push(self.promotion);
    }
};

/* 
    Description: Chọn đơn hàng. 
*/
SunoPromotion.prototype.selectOrder = function(uid) {
    var self = this;
    self.constructor.uber.selectOrder(uid);
    var index = self.saleOrders.indexOf(self.saleOrder);
    if (index > -1) {
        self.promotion = self.promotions[index];
    }
};

/*
    Description: Hủy đơn hàng hiện tại. 
*/
SunoBasicSaleOrder.prototype.cancelOrder = function() {
    var self = this;
    self.constructor.uber.cancelOrder();
    var index = self.saleOrders.findIndex(function(order){ return order.uid == self.saleOrder.uid;});
    if (index > -1) {
        var promotion = self.generatePromotion();
        self.promotions[index] = promotion;
        self.promotion = promotion;
        if (SunoGlobal.saleSetting.isApplyPromotion && self.saleOrder.saleTypeId != self.saleType.online) {
            var data = { format: 'json' };
            self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getActivePromotionUrl, 'GET', data)
            .then(function(body){
                self.promotions[index].isCallApi = body;
                self.promotion.isCallApi = body;
                if (self.promotion.isCallApi) {
                    //Lấy danh sách CTKM trên hóa đơn
                    var promotionData = { format: 'json', saleDate: saleOrder.saleDate.toJSON()};
                    self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getPromotionOnBillUrl, 'GET', promotionData)
                    .then(function(result){
                        if (result != null && result.response != null && result.response.length > 0) {
                            self.promotions[index].promotionOnBill = result.response;
                            self.promotion.promotionOnBill = result.response;
                        }
                    })
                    .catch(function(error){
                        console.log('SunoBasicSaleOrder.prototype.cancelOrder: getPromotionOnBillUrl', error);
                    });
                }
            })
            .catch(function(error){
                console.log('SunoBasicSaleOrder.prototype.cancelOrder: getActivePromotionUrl', error);
            });
        }
    }
};

/* 
    Description: Xóa đơn hàng. 
*/
SunoPromotion.prototype.deleteOrder = function(uid) {
    var self = this;
    var index = self.saleOrders.findIndex(function(order){ return order.uid == uid;});
    if (index > -1) {
        self.constructor.uber.deleteOrder(uid);
        if (self.promotions.length == 1) {
            var promotion = self.generatePromotion();
            self.promotions[0] = promotion;
            self.promotion = promotion;
            if (SunoGlobal.saleSetting.isApplyPromotion && self.saleOrder.saleTypeId != self.saleType.online) {
                var data = { format: 'json' };
                self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getActivePromotionUrl, 'GET', data)
                .then(function(body){
                    self.promotions[0].isCallApi = body;
                    self.promotion.isCallApi = body;
                    if (self.promotion.isCallApi) {
                        //Lấy danh sách CTKM trên hóa đơn
                        var promotionData = { format: 'json', saleDate: saleOrder.saleDate.toJSON()};
                        self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getPromotionOnBillUrl, 'GET', promotionData)
                        .then(function(result){
                            if (result != null && result.response != null && result.response.length > 0) {
                                self.promotions[0].promotionOnBill = result.response;
                                self.promotion.promotionOnBill = result.response;
                            }
                        })
                        .catch(function(error){
                            console.log('SunoBasicSaleOrder.prototype.cancelOrder: getPromotionOnBillUrl', error);
                        });
                    }
                })
                .catch(function(error){
                    console.log('SunoBasicSaleOrder.prototype.cancelOrder: getActivePromotionUrl', error);
                });
            }
        }
        else {
            self.promotions.splice(index, 1);
            self.promotion = self.promotions[index - 1];
        }
    }
};

/* 
    Description: Thêm mới hàng hóa vào đơn hàng.
*/
SunoPromotion.prototype.addItem = function(item) {
    var self = this;
    var addItemResult = self.constructor.uber.addItem(item);
    if (addItemResult.isSuccess) {
        if (self.promotion.isCallApi) { 
            var objItems = [{
                itemId: item.itemId,
                quantity: item.quantity,
                retailPrice: item.retailPrice
            }];
            var customerId = self.saleOrder.customer == null ? 0 : self.saleOrder.customer.customerId;
            self.getPromotionOnItem(objItems, self.storeId, customerId, self.saleOrder.saleDate)
            .then(function(body){
                if (body != null && body.response != null && body.response.length > 0) {
                    for (var i = 0; i < body.response.length; i++) {
                        var item = {
                            itemId: body.response[i].itemID,
                            quantity: body.response[i].quantity,
                            retailPrice: body.response[i].retailPrice,
                            promotions: body.response[i].promotions
                        };
                        self.promotion.promotionOnItem.push(item);
                    }
                }
                self.calculatePromotion();
                self.applyPromotion();
            })
            .catch(function(error){
                console.log('SunoPromotion.prototype.addItem: getPromotionOnItem', error);
                self.calculatePromotion();
                self.applyPromotion();
            });
        }
    }
    return addItemResult;
};

SunoPromotion.prototype.removeItem = function(item) {
    var self = this;
    self.constructor.uber.removeItem(item);
    if (SunoGlobal.saleSetting.isApplyPromotion && self.saleOrder.saleTypeId != self.saleType.online) {
        if (self.promotion.promotionOnItem.length > 0) {
            var promoOnItem = self.promotion.promotionOnItem.filter(function(p){ return p.itemId == item.itemId;});
            if (promoOnItem.length > 0) {
                for(var i = 0; i < promoOnItem.length; i++) {
                    var promo = promoOnItem[i];
                    var index = self.promotion.promotionOnItem.indexOf(promo);
                    if (index > -1) {
                        self.promotion.promotionOnItem.splice(index, 1);
                    }
                }
            }
        }
        if (self.saleOrder.orderDetails.length > 0) {
            self.calculatePromotion();
            self.applyPromotion();
        }
        else {
            self.cancelPromotion();
        }
    }
};

SunoPromotion.prototype.changeQuantityOnItem = function(item) {
    var self = this;
    var detail = self.saleOrder.orderDetails.find(function(d){ return d.itemId == item.itemId; });
    if (detail !== undefined) {
        self.constructor.uber.changeQuantityOnItem(item);
        if (SunoGlobal.saleSetting.isApplyPromotion && self.saleOrder.saleTypeId != self.saleType.online) {
            self.calculatePromotion();
            self.applyPromotion();
        }
    }
};

SunoPromotion.prototype.changeStore = function(storeId) {
    var self = this;
    self.storeId = storeId;
    if (SunoGlobal.saleSetting.isApplyPromotion 
        && self.saleOrder.saleTypeId != self.saleType.online 
        && self.saleOrder.orderDetails.length > 0 
        && self.promotion.isCallApi) {

        var items = [];
        for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
            var detail = self.saleOrder.orderDetails[i];
            items.push({
                itemId: detail.itemId,
                quantity: detail.quantity,
                retailPrice: detail.retailPrice
            });
        }
        var customerId = self.saleOrder.customer == null ? 0 : self.saleOrder.customer.customerId;
        self.getPromotionOnItem(items, self.storeId, customerId, self.saleOrder.saleDate)
        .then(function(body) {
            self.promotion.promotionOnItem = [];
            if (body != null && body.response != null && body.response.length > 0) {
                for (var i = 0; i < body.response.length; i++) {
                    var item = {
                        itemId: body.response[i].itemID,
                        quantity: body.response[i].quantity,
                        retailPrice: body.response[i].retailPrice,
                        promotions: body.response[i].promotions
                    };
                    self.promotion.promotionOnItem.push(item);
                }
                self.calculatePromotion();
                self.applyPromotion();
            }
        })
        .catch(function(error) {
            console.log('SunoPromotion.prototype.changeStore', error);
        });
    }
};

SunoBasicSaleOrder.prototype.addCustomer = function(customer) {
    var self = this;
    self.constructor.uber.addCustomer(customer);
    if (SunoGlobal.isApplyPromotion 
        && customer.type == self.customer.customerType.retail
        && self.saleOrder.saleTypeId != self.saleType.online 
        && self.saleOrder.orderDetails.length > 0 
        && self.promotion.isCallApi) {
            var items = [];
            for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
                var detail = self.saleOrder.orderDetails[i];
                items.push({
                    itemId: detail.itemId,
                    quantity: detail.quantity,
                    retailPrice: detail.retailPrice
                });
            }
            var customerId = self.saleOrder.customer == null ? 0 : self.saleOrder.customer.customerId;
            self.getPromotionOnItem(items, self.storeId, customerId, self.saleOrder.saleDate)
            .then(function(body) {
                self.promotion.promotionOnItem = [];
                if (body != null && body.response != null && body.response.length > 0) {
                    for (var i = 0; i < body.response.length; i++) {
                        var item = {
                            itemId: body.response[i].itemID,
                            quantity: body.response[i].quantity,
                            retailPrice: body.response[i].retailPrice,
                            promotions: body.response[i].promotions
                        };
                        self.promotion.promotionOnItem.push(item);
                    }
                    self.calculatePromotion();
                    self.applyPromotion();
                }
            })
            .catch(function(error) {
                console.log('SunoBasicSaleOrder.prototype.addCustomer', error);
            });
    }
    else {
        self.cancelPromotion();
        self.promotion.promoOnItem = [];
    }
};

SunoBasicSaleOrder.prototype.removeCustomer = function() {
    var self = this;
    self.constructor.uber.removeCustomer();
    if (SunoGlobal.isApplyPromotion 
        && self.saleOrder.saleTypeId != self.saleType.online 
        && self.saleOrder.orderDetails.length > 0 
        && self.promotion.isCallApi) {
            var items = [];
            for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
                var detail = self.saleOrder.orderDetails[i];
                items.push({
                    itemId: detail.itemId,
                    quantity: detail.quantity,
                    retailPrice: detail.retailPrice
                });
            }
            var customerId = 0;
            self.getPromotionOnItem(items, self.storeId, customerId, self.saleOrder.saleDate)
            .then(function(body) {
                self.promotion.promotionOnItem = [];
                if (body != null && body.response != null && body.response.length > 0) {
                    for (var i = 0; i < body.response.length; i++) {
                        var item = {
                            itemId: body.response[i].itemID,
                            quantity: body.response[i].quantity,
                            retailPrice: body.response[i].retailPrice,
                            promotions: body.response[i].promotions
                        };
                        self.promotion.promotionOnItem.push(item);
                    }
                    self.calculatePromotion();
                    self.applyPromotion();
                }
            })
            .catch(function(error) {
                console.log('SunoBasicSaleOrder.prototype.addCustomer', error);
            });
    }
    else {
        self.cancelPromotion();
        self.promotion.promoOnItem = [];
    }
};

SunoPromotion.prototype.getPromotionOnItem = function(items, storeId, customerId, saleDate) {
    var data = { storeId: storeId, customerId: customerId, saleDate: saleDate, items: items };
    return self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getPromotionOnItemUrl, 'POST', data);
};

/* 
    Description: Tính chương trình khuyến mãi tối ưu cho khách hàng.
*/
SunoPromotion.prototype.calculatePromotion = function() {
    var self = this;
    var maxDiscountOnBill = 0, maxDiscountOnItem = 0, customerId = self.saleOrder.customer == null ? 0 : self.saleOrder.customer.customerId;
    var getSubTotal = function(details) {
        var subTotal = 0;
        for (var i = 0; i < details.length; i++) {
            var detail = details[i];
            subTotal += detail.quantity * detail.retailPrice;
        }
        return subTotal;
    };
    var getMaxDiscount = function(promotions) {
        var result = 0;
        if (promotions.length > 0) {
            var discounts = promotions.map(function(p){ return p.discountValue; });
            result = Math.max.apply(null, discounts);
        }
        return result;
    };
    var calculatePromotionOnItem = function(promotions, orderDetails){
        var maxDiscount = getMaxDiscount(promotions);
        var promos = promotions.filter(function(p){ return p.discountValue == maxDiscount; });
        if (promos.length > 0) {
            for (var i = 0; i < promos.length; i++) {
                var promo = promos[i];
                promo.isSelected = true;
                var detail = orderDetails.find(function(d){return d.itemId == promo.itemId;});
                if (detail !== undefined) {
                    detail.promotionId = promo.promotionId;
                    detail.promotionOnItemSelected = promo;
                }
            }
        }
    };

    var calculatePromotionOnBill = function(promotions, saleOrder){
        var maxDiscount = getMaxDiscount(promotions);
        var promo = promotions.find(function(p){ return p.discountValue == maxDiscount; });
        if (promo !== undefined) { 
            promo.isSelected = true;
            saleOrder.promotionOnBillSelected = promo;
        }
    };
    //#region CTKM trên đơn hàng
    var subTotal = getSubTotal(self.saleOrder.orderDetails);
    //Lấy danh sách CTKM trên đơn hàng
    self.saleOrder.promotionOnBill = [];
    for (var i = 0; i < self.promotion.promotionOnBill.length; i++)  {
        var promoOnBill = self.promotion.promotionOnBill[i];
        if ((promoOnBill.storeIds.indexOf(0) > -1 || promoOnBill.storeIds.indexOf(self.storeId) > -1) 
            && (promoOnBill.customerIds.indexOf(0) > -1 || promoOnBill.customerIds.indexOf(customerId) > -1)
            && subTotal > 0) {
            var details = promoOnBill.detail.filter(function(d){
                return d.appliedAmount <= subTotal;
            });
            if (details.length > 0) {
                var appliedAmounts = details.map(function (d) { return d.appliedAmount; });
                var maxAppliedAmount = Math.max.apply(null, appliedAmounts);
                var detail = details.find(function (d) { return d.appliedAmount == maxAppliedAmount; });
                if (detail !== undefined) {
                    self.saleOrder.promotionOnBill.push({
                        promotionId: promoOnBill.promotionID,
                        promotionName: promoOnBill.promotionName,
                        promotionCode: promoOnBill.promotionCode,
                        promotionType: promoOnBill.promotionType,
                        isCodeRequired: promoOnBill.isCodeRequired,
                        isPercent: detail.isPercent,
                        discountPercent: detail.discountPercent,
                        discountPrice: detail.discountPrice,
                        discountValue: detail.isPercent ? Math.round(detail.discountPercent * subTotal / 100) : detail.discountPrice,
                        isSelected: false,
                        itemId: 0,
                        quantity: 0
                    });
                }
            }
        }
    }
    //#endregion

    //#region CTKM trên hàng hóa
    self.saleOrder.promotionOnItem = [];
    for (var i = 0; i < self.promotion.promotionOnItem.length; i++) {
        var promoOnItem = self.promotion.promotionOnItem[i];
        var promotions = promoOnItem.promotions.filter(function(p){
            return p.minQuantity <= promoOnItem.quantity;
        });
        if (promotions.length > 0) {
            promotions.forEach(function(p){
                self.saleOrder.promotionOnItem.push({
                    promotionId: p.promotionID,
                    promotionName: p.promotionName,
                    promotionCode: p.promotionCode,
                    promotionType: p.promotionType,
                    isCodeRequired: p.isCodeRequired,
                    isPercent: p.isPercent,
                    discountPercent: p.discountPercent,
                    discountPrice: p.discountPrice,
                    discountValue: p.discountValue,
                    isSelected: false,
                    itemId: promoOnItem.itemId,
                    quantity: promoOnItem.quantity
                });
            });
        }
    }
    //#endregion

    //#region optimize promotion
    if (self.saleOrder.promotionOnBill.length > 0 && self.saleOrder.promotionOnItem.length > 0) {
        self.saleOrder.isPromotion = true;
        var promosWithoutCode = self.saleOrder.promotionOnBill.filter(function(p){
            return p.isCodeRequired == false;
        });
        maxDiscountOnBill = getMaxDiscount(promosWithoutCode);
        maxDiscountOnItem = getMaxDiscount(self.saleOrder.promotionOnBill);
        if (maxDiscountOnBill >= maxDiscountOnItem) {
            self.saleOrder.promotionType = self.promotionType.onBill;
            calculatePromotionOnBill(promosWithoutCode, self.saleOrder);
        }
        else {
            self.saleOrder.promotionType = self.promotionType.onItem;
            calculatePromotionOnItem(self.saleOrder.promotionOnItem);
        }
    }
    else if (self.saleOrder.promotionOnBill.length > 0) {
        self.saleOrder.isPromotion = true;
        var promosWithoutCode = self.saleOrder.promotionOnBill.filter(function(p){
            return p.isCodeRequired == false;
        });
        if (promosWithoutCode.length > 0) {
            self.saleOrder.promotionType = self.promotionType.onBill;
            calculatePromotionOnBill(promosWithoutCode, self.saleOrder);
        }
        else {
            self.saleOrder.promotionType = self.promotionType.onCode;
            self.saleOrder.promotionOnBillSelected = null;
        }
    }
    else if (self.saleOrder.promotionOnItem.length > 0) {
        self.saleOrder.isPromotion = true;
        self.saleOrder.promotionType = self.promotionType.onItem;
        calculatePromotionOnItem(self.saleOrder.promotionOnItem);
    }
    else {
        self.saleOrder.isPromotion = false;
        self.saleOrder.promotionType = self.promotionType.None;
    }
    //#endregion
};

/* 
    Description: Hủy chương trình khuyến mãi trên đơn hàng.
*/
SunoPromotion.prototype.cancelPromotion = function() {
    var self = this;
    self.saleOrder.totalQuantity = 0;
    self.saleOrder.subTotal = 0;
    self.saleOrder.total = 0;
    self.saleOrder.tax = 0;
    for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
        var detail = self.saleOrder.orderDetails[i];
        detail.unitPrice = self.calculatePricingPolicy(detail, self.saleOrder.customer);
        detail.isDiscountPercent = false;
        detail.discount = 0;
        detail.discountPercent = 0;
        detail.sellPrice = detail.unitPrice;
        detail.subTotal = detail.quantity * detail.sellPrice;
        detail.promotionId = 0;
        detail.promotionOnItemSelected = null;
        
        self.saleOrder.totalQuantity += detail.quantity;
        self.saleOrder.subTotal += detail.subTotal;
        self.saleOrder.tax += detail.quantity * detail.tax;
    }
    self.saleOrder.totalQuantity = Math.round(self.saleOrder.totalQuantity * 1e12) / 1e12;
    self.saleOrder.isDiscountPercent = false;
    self.saleOrder.discount = 0;
    self.saleOrder.discountPercent = 0;
    self.saleOrder.total = self.saleOrder.subTotal + self.saleOrder.subFee - self.saleOrder.discount;
    self.saleOrder.paymentBalance = Math.max(self.saleOrder.total - self.saleOrder.amountPaid, 0);

    self.saleOrder.promotionId = 0;
    self.saleOrder.isPromotion = false;
    self.saleOrder.promotionOnBillSelected = null;
    self.saleOrder.promotionType = self.promotionType.None;
};

/* 
    Description: Thực hiện giảm giá chương trình khuyến mãi.
*/
SunoPromotion.prototype.applyPromotion = function() {
    var self = this;
    if (self.saleOrder.isPromotion) {
        if (self.saleOrder.promotionType == self.promotionType.onBill) { 
            if (self.saleOrder.promotionOnBillSelected != null){
                self.saleOrder.promotionId = self.saleOrder.promotionOnBillSelected.promotionId;
                self.saleOrder.discount = self.saleOrder.promotionOnBillSelected.discountValue;
                self.saleOrder.total = self.saleOrder.subTotal + self.saleOrder.subFee - self.saleOrder.discount;
                self.saleOrder.paymentBalance = Math.max(self.saleOrder.total - self.saleOrder.amountPaid, 0);
            }
        }
        else if (self.saleOrder.promotionType == self.promotionType.onItem) { 
            for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
                var detail = self.saleOrder.orderDetails[i];
                if (detail.promotionOnItemSelected != null) {
                    detail.promotionId = detail.promotionOnItemSelected.promotionId;
                    var discount = detail.promotionOnItemSelected.isPercent ? detail.promotionOnItemSelected.discountPercent : detail.promotionOnItemSelected.discountPrice;
                    self.calculatePriceOnItem(detail, detail.promotionOnItemSelected.isPercent, discount);
                }
                else {
                    detail.promotionId = 0;
                    detail.isDiscountPercent = false;
                    detail.discount = 0;
                    detail.discountPercent = 0;
                    detail.sellPrice = detail.unitPrice - detail.discount;
                }
            }
            self.calculateTotal();
        }
    } 
};

/* 
    Description: Áp dụng chương trình khuyến mãi nhập mã.
*/
SunoPromotion.prototype.applyPromotionCode = function(code, promotion) {
    var self = this;
    return new Promise(function(resolve, reject){
        if (self.saleOrder.isPromotion && promotion.isCodeRequired && code != '') {
            var data = { format: 'json', promotionCode: code };
            self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.promotion.getPromotionByCodeUrl, 'GET', data)
            .then(function(body){
                if (body != null && body.promotionId == promotion.promotionId) {
                    //Reset promotion
                    self.cancelPromotion();
    
                    //Apply promotion
                    self.saleOrder.isPromotion = true;
                    self.saleOrder.promotionOnBillSelected = promotion;
                    self.saleOrder.promotionType = self.promotionType.onBill;
                    self.applyPromotion();

                    resolve('Áp dụng thành công chương trình khuyến mãi [' + promotion.promotionName + '] cho đơn hàng.');
                }
                else {
                    reject('Mã khuyến mãi không hợp lệ.');
                }
            })
            .catch(function(error){
                console.log('SunoPromotion.prototype.applyPromotionCode', error);
                reject('Mã khuyến mãi không hợp lệ.');
            });
        }
        else {
            reject('Mã khuyến mãi không hợp lệ.');
        }
    });
};

/* 
    Description: Áp dụng chương trình khuyến mãi trên đơn hàng.
*/
SunoPromotion.prototype.applyPromotionOnBill = function(promotion) {
    var self = this;
    if (self.saleOrder.isPromotion) {
        self.cancelPromotion();

        self.saleOrder.isPromotion = true;
        self.saleOrder.promotionOnBillSelected = promotion;
        self.saleOrder.promotionType = self.promotionType.onBill;
        self.applyPromotion();
    }
};

/* 
    Description: Áp dụng chương trình khuyến mãi cho hàng hóa.
*/
SunoPromotion.prototype.applyPromotionOnItem = function(promotions) {
    var self = this;
    if (self.saleOrder.isPromotion) {
        self.cancelPromotion();
        for (var i = 0; i < promotions.length; i++) {
            var promo = promotions[i];
            var detail = orderDetails.find(function(d){return d.itemId == promo.itemId;});
            if (detail !== undefined) {
                detail.promotionId = promo.promotionId;
                detail.promotionOnItemSelected = promo;
            }
        }
        self.saleOrder.isPromotion = true;
        self.saleOrder.promotionType = self.promotionType.onItem;
        self.applyPromotion();
    }
};
