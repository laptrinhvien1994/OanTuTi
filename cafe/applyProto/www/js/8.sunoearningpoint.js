//SunoEarningPoint prototype is inherited from SunoBasicSaleOrder prototype.
var EP = function(){};
EP.prototype = SunoPromotion.prototype;

function SunoEarningPoint(storeId) { 
    this.request = new SunoRequest();
    this.storeId = storeId;
 };
SunoEarningPoint.prototype = new EP();
SunoEarningPoint.prototype.constructor = SunoEarningPoint;
SunoEarningPoint.uber = SunoPromotion.prototype;
SunoEarningPoint.prototype.earningPointStatus = {
    exchanged: 1,
    notExchangabled: 0
};

SunoEarningPoint.prototype.earningPointConfig = {
    convertPoint: 0,
    convertMoney: 0,
    exchangeMoney: 0,
    exchangePoint: 0,
    isApplyEarningPoint: SunoGlobal.saleSetting.isApplyEarningPoint
};

SunoEarningPoint.prototype.getEarningPointConfig = function() {
    var self = this;
    var data = { format: 'json' };
    self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.earningPoint.getConfigUrl, 'GET', data).then(function(body){
        if (body != null) {
            self.earningPointConfig.convertMoney = body.convertMoney;
            self.earningPointConfig.convertPoint = body.convertPoint;
            if (body.groupConfig != null && body.groupConfig.length > 0) {
                self.earningPointConfig.exchangeMoney = body.groupConfig[0].exchangeMoney;
                self.earningPointConfig.exchangePoint = body.groupConfig[0].exchangePoint;
            }
            else {
                self.earningPointConfig.exchangeMoney = 0;
                self.earningPointConfig.exchangePoint = 0;
            }
        }
        resolve(self.earningPointConfig);
    }).catch(function(error){
        reject(error);
    });
};

SunoEarningPoint.prototype.initOrder = function() {
    var self = this;
    self.saleOrders = [];
    if (self.earningPointConfig.isApplyEarningPoint) {
        self.getEarningPointConfig().then(function(response){
            self.earningPointConfig = response;
            //self.createNewOrder();
        }).catch(function(error){
            //self.createNewOrder();
        });
    }
    else {
        //self.createNewOrder();
    }
};

SunoEarningPoint.prototype.generateSaleOrder = function() {
    var self = this;
    var saleOrder = self.constructor.uber.generateSaleOrder();
    saleOrder.convertPoint = 0;
    saleOrder.convertMoney = 0;
    saleOrder.exchangedMoney = 0;
    saleOrder.exchangedPoint = 0;
    saleOrder.earningPointStatus = self.earningPointStatus.notExchangabled;
    return saleOrder;
};

/*
    Description: Calculate sale order model.
    Return: orderModel
*/
SunoEarningPoint.prototype.prepareOrder = function(order) {
    var self = this;
    var balance = 0;
    var request = {
        saleOrder: {
            storeId: self.storeId,
            saleOrderId: order.saleOrderId,
            saleOrderCode: order.code,
            saleOrderDate: order.saleDate,
            saleTypeId: order.saleTypeId,
            status: order.status,
            totalQuantity: order.totalQuantity,
            subTotal: order.subTotal,
            discount: order.discount,
            subFee: order.subFee,
            subFeeName: order.subFeeName,
            total: order.total,
            amountPaid: order.amountPaid,
            paymentBalance: Math.max(order.total - order.amountPaid, 0),
            tax: order.tax,
            comment: order.comment,
            saleUser: order.seller.userId,
            cashier: order.cashier.userId, 
            customer: order.customer,
            orderDetails: [],
            payments: [],
            convertPoint: order.convertPoint,
            convertMoney: order.convertMoney,
            exchangedMoney: order.exchangedMoney,
            exchangedPoint: order.exchangedPoint,
            earningPointStatus: order.earningPointStatus
        }
    };
    for (var i = 0; i < order.details.length; i++) {
        var item = order.details[i];
        var orderDetail = {
            saleOrderDetailId: 0,
            productItemId: item.itemId,
            itemName: item.itemName,
            barcode: item.barcode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sellPrice: item.sellPrice,
            discount: item.isDiscountPercent ? item.discountPercent : item.discount,
            discountIsPercent: item.isDiscountPercent,
            subTotal: item.subTotal,
            isInventoryTracked: item.isInventoryTracked,
            isUntrackedItemSale: item.isUntrackedItemSale,
            isSerial: item.isSerial,
            serials: item.serials,
            isTaxable: item.isTaxable,
            tax: item.tax,
            vat: 0,
            productType: item.productType,
            unit: item.unitName
        };
        request.saleOrder.orderDetails.push(orderDetail);
    }

    //Payments
    if (order.amountPaid <= 0 || !order.receiptVouchers || order.receiptVouchers.length == 0) {
        balance = order.total;
        request.saleOrder.payments.push({
            voucherId: 0,
            code: '',
            receivedDate: order.saleDate,
            status: 3,
            paymentMethodId: self.paymentMethod.cash,
            amount: 0,
            balance: order.total,
            description: ''
        });
    }
    else {
        var totalAmount = 0;
        for (var i = 0; i < order.receiptVouchers.length; i++) {
            var receipt = order.receiptVouchers[i];
            var payment = {
                voucherId: 0,
                code: '',
                receivedDate: order.saleDate,
                status: 3,
                paymentMethodId: receipt.paymentMethod,
                amount: receipt.amount,
                balance: 0,
                description: receipt.comment
            };
            order.payments.push(payment);
            totalAmount += receipt.amount;
        }
        balance = order.total - totalAmount;
    }
    request.saleOrder.paymentBalance = Math.max(balance, 0);
    return request;
};

/*
    Description: Tính tổng tiền hàng.
*/
SunoEarningPoint.prototype.calculateTotal = function() {
    var self = this;
    var totalWithoutFee = 0;
    self.saleOrder.totalQuantity = 0;
    self.saleOrder.subTotal = 0;
    self.saleOrder.total = 0;
    for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
        var detail = self.saleOrder.orderDetails[i];
        self.saleOrder.totalQuantity += detail.quantity;
        detail.subTotal = detail.quantity * detail.sellPrice;
        self.saleOrder.subTotal += detail.subTotal;
        self.saleOrder.tax += detail.quantity * detail.tax;
    }
    self.saleOrder.totalQuantity = Math.round(self.saleOrder.totalQuantity * 1e12) / 1e12;
    self.saleOrder.discount = self.saleOrder.isDiscountPercent ? Math.round(self.saleOrder.subTotal * self.saleOrder.discountPercent / 100) : Math.min(self.saleOrder.discount, self.saleOrder.subTotal);
    self.saleOrder.total = self.saleOrder.subTotal + self.saleOrder.subFee - self.saleOrder.discount;
    if (self.earningPointConfig.isApplyEarningPoint && self.saleOrder.customer != null && self.saleOrder.exchangedPoint > 0) {
        self.saleOrder.earningPointStatus = self.earningPointStatus.exchanged;
        self.saleOrder.exchangedMoney = self.calculateEarningMoney(self.saleOrder.exchangedPoint);
        self.saleOrder.total = self.saleOrder.total - self.saleOrder.exchangedMoney;
        totalWithoutFee = Math.max(self.saleOrder.total - self.saleOrder.subFee, 0);
        self.saleOrder.convertPoint = self.calculateEarningPoint(totalWithoutFee);
    }
    self.saleOrder.paymentBalance = Math.max(self.saleOrder.total - self.saleOrder.amountPaid, 0);
};

/* 
    Description: Tính điểm quy đổi từ tiền hàng.
    Params: - totalMoney: Tổng tiền hàng sau khi trừ phụ phí (phí vận chuyển).
*/
SunoEarningPoint.prototype.calculateEarningPoint = function(totalMoney) {
    var self = this;
    var result = 0;
    if (self.earningPointConfig.isApplyEarningPoint && self.earningPointConfig.convertPoint > 0 && self.earningPointConfig.convertMoney > 0 && self.saleOrder.customer != null && totalMoney > 0) {
        result = Math.floor(totalMoney * self.earningPointConfig.convertPoint / self.earningPointConfig.convertMoney);
    }
    return result;
};

/* 
    Description: Tính tiền quy đổi từ điểm.
    Params: - point: Điểm cần quy đổi.
*/
SunoEarningPoint.prototype.calculateEarningMoney = function(point) {
    var self = this;
    var result = 0;
    if (self.earningPointConfig.isApplyEarningPoint && self.earningPointConfig.exchangePoint > 0 && self.earningPointConfig.exchangeMoney > 0 && self.earningPointConfig.customer != null && point > 0) {
        result = Math.round(point * self.earningPointConfig.exchangeMoney / self.earningPointConfig.exchangePoint);
    }
    return result;
};

/*
    Description: Thêm khách hàng vào đơn hàng.
*/
SunoEarningPoint.prototype.addCustomer = function(customer) {
    var self = this;
    var _updateDiscountAndTotal = function() {
        for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
            var detail = self.saleOrder.orderDetails[i];
            detail.unitPrice = calculatePricingPolicy(detail, self.saleOrder.customer);
        }
    
        //Tính lại giảm giá cho đơn hàng.
        var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
        self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);
    
        //Tính lại tiền hàng cho đơn hàng.
        self.calculateTotal();
    };

    self.saleOrder.customer = customer;

    if (self.earningPointConfig.isApplyEarningPoint 
        && self.earningPointConfig.convertPoint > 0 
        && self.earningPointConfig.convertMoney > 0) {
        self.customer.getCustomerPoint(self.saleOrder.customer.customerId).then(function(point) {
            self.saleOrder.customer.remainPoint = point;
            self.saleOrder.convertMoney = self.earningPointConfig.convertMoney;
            _updateDiscountAndTotal();
        }).catch(function(error){
            console.log('addCustomer', error);
            _updateDiscountAndTotal();
        });
    }
    else {
        _updateDiscountAndTotal();
    }
};

/*
    Description: Xóa khách hàng khỏi đơn hàng.
*/
SunoEarningPoint.prototype.removeCustomer = function() {
    var self = this;
    self.saleOrder.customer = null;
    //Reset earning point
    self.saleOrder.earningPointStatus = self.earningPointStatus.notExchangabled;
    self.saleOrder.convertPoint = 0;
    self.saleOrder.convertMoney = 0;
    self.saleOrder.exchangedPoint = 0;
    self.saleOrder.exchangedMoney = 0;

    for (var i = 0; i < self.saleOrder.orderDetails.length; i++) {
        var detail = self.saleOrder.orderDetails[i];
        detail.unitPrice = calculatePricingPolicy(detail, self.saleOrder.customer);
    }

    //Tính lại giảm giá cho đơn hàng.
    var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
    self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

    //Tính lại tiền hàng cho đơn hàng.
    self.calculateTotal();
};

/*
    Description: Thực hiên đổi điểm thành tiền hàng.
*/
SunoEarningPoint.prototype.exchangeEarningPoint = function(point) { 
    var self = this;
    var result = Object.assign({}, SunoGlobal.result);
    if (point <= self.saleOrder.customer.remainPoint) {
        self.saleOrder.exchangedPoint = point;
        self.calculateTotal();
        result.isSuccess = true;
        result.description = '';
    }
    else { 
        result.isSuccess = false;
        result.description = 'Điểm tích lũy của khách hàng [' + self.saleOrder.customer.customerName + '] còn ' + self.saleOrder.customer.remainPoint + ' điểm, không đủ để thực hiện đổi điểm.';
    }
    return result;
};

/*
    Description: Tính toán điểm quy đổi tối đa cho đơn hàng.
*/
SunoEarningPoint.prototype.getMaxEarningPoint = function(point) { 
    var self = this;
    var result = 0, totalWithoutFee = self.saleOrder.subTotal - self.saleOrder.discount;
    var exchangedMoney = self.calculateEarningMoney(point);
    if (exchangedMoney <= totalWithoutFee) {
        result = point;
    }
    else {
        result = self.calculateEarningPoint(totalWithoutFee);
    }
    return result;
};
