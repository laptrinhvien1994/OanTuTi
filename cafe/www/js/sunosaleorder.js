function SunoSaleOrder (storeId) {
    this.request = new SunoRequest();
    this.storeId = storeId;
};
SunoSaleOrder.prototype.customer = new SunoCustomer();
SunoSaleOrder.prototype.saleType = { retail: 1, wholeSale: 2, online: 3, return : 4 };
SunoSaleOrder.prototype.saleStatus = { draft: 1, complete: 2 };
SunoSaleOrder.prototype.saleOnlineStatus = { draft: 1, confirm: 2, onDelivery: 3, complete: 4, cancel: 5 };
SunoSaleOrder.prototype.paymentMethod = { cash: 1, card: 2, transfer: 3 };
SunoSaleOrder.prototype.saleOrder = null;
SunoSaleOrder.prototype.saleOrderUid = '';
SunoSaleOrder.prototype.saleOrders = [];

/* 
    Description: Khởi tạo đơn hàng.
*/
SunoSaleOrder.prototype.initOrder = function() {
    var self = this;
    self.saleOrders = [];
    self.createNewOrder();
};

/* 
    Description: Tạo mới đơn hàng.
*/
SunoSaleOrder.prototype.createNewOrder = function() {
    var self = this;
    self.saleOrderUid = SunoGlobal.generateGUID();
    var saleOrder = {
        uid: self.saleOrderUid,
        saleOrderId: 0,
        saleDate: new Date(),
        code: '',
        totalQuantity: 0,
        subTotal: 0,
        discount: 0,
        discountPercent: 0,
        isDiscountPercent: false,
        tax: 0,
        subFee: 0,
        subFeeName: '',
        total: 0,
        amountPaid: 0,
        balance: 0,
        comment: '',
        saleTypeId: self.saleType.retail, //Bán lẻ: 1 - Bản sỉ: 2 - Online: 3 - Xuất trả: 4
        status: self.saleStatus.complete,
        orderDetails: [],
        receiptVouchers: [],
        customer: null,
        seller: { userId: SunoGlobal.userProfile.userId, displayName: SunoGlobal.userProfile.fullName },
        cashier: { userId: SunoGlobal.userProfile.userId, displayName: SunoGlobal.userProfile.fullName }
    };
    self.saleOrders.push(saleOrder);
    self.saleOrder = saleOrder;
};

/* 
    Description: Chọn đơn hàng. 
*/
SunoSaleOrder.prototype.selectOrder = function(uid) {
    var self = this;
    var saleOrder = self.saleOrders.find(function(order){ return order.uid == uid; });
    if (saleOrder !== undefined) self.saleOrder = saleOrder 
    else self.saleOrder = null;
};

/*
    Description: Hủy đơn hàng hiện tại. 
    Return: Reset đơn hàng hiện tại về mặc định.
*/
SunoSaleOrder.prototype.cancelOrder = function() {
    var self = this;
    self.saleOrder.saleDate = new Date();
    self.saleOrder.code = '';
    self.saleOrder.totalQuantity = 0;
    self.saleOrder.subTotal = 0;
    self.saleOrder.discount = 0;
    self.saleOrder.discountPercent = 0;
    self.saleOrder.isDiscountPercent = false;
    self.saleOrder.tax = 0;
    self.saleOrder.subFee = 0;
    self.saleOrder.subFeeName = '';
    self.saleOrder.total = 0;
    self.saleOrder.amountPaid = 0;
    self.saleOrder.balance = 0;
    self.saleOrder.comment = '';
    self.saleOrder.orderDetails = [];
    self.saleOrder.receiptVouchers = [];
    self.saleOrder.customer = null;
    self.saleOrder.seller = { userId: SunoGlobal.userProfile.userId, displayName: SunoGlobal.userProfile.fullName };
    self.saleOrder.cashier = { userId: SunoGlobal.userProfile.userId, displayName: SunoGlobal.userProfile.fullName };
};

/*
    Description: Xóa đơn hàng.
*/
SunoSaleOrder.prototype.deleteOrder = function(uid) {
    var self = this;
    if (self.saleOrders.length > 0) {
        if (self.saleOrders.length == 1){
            self.selectOrder(uid);
            self.cancelOrder();
        }
        else {
            var index = self.saleOrders.findIndex(function(order){ return order.uid == uid; });
            if (index > -1) {
                self.saleOrders.splice(index, 1);
                self.saleOrder = self.saleOrders[index -1];
            }
        }
    }
};

/*
    Description: Kiểm tra ràng buộc đơn hàng.
    Return: 'string' (ok: hợp lệ, !ok: thông báo lỗi.)
*/
SunoSaleOrder.prototype.validateOrder = function(order) {
    var self = this;
    if (!order || !order.orderDetails || order.total < 0) return 'Hóa đơn bán hàng không hợp lệ.';
    if (order.orderDetails.length == 0) {
        return 'Chọn ít nhất 1 hàng hóa cần bán trước khi lưu.';
    }

    //Kiểm tra số lượng hàng hóa.
    var arrInvalidQuantity = order.orderDetails.filter(function(detail){ return detail.quantity == 0 && detail.isSerial == false; });
    if (arrInvalidQuantity.length > 0) {
        return 'Nhập số lượng cho hàng hóa [' + arrInvalidQuantity.map(function(order){ return order.itemName;}).join(', ') + '] trước khi lưu.';
    }

    //Kiểm tra serial.
    var arrInvalidQuantitySerial = order.orderDetails.filter(function(detail){ return detail.quantity == 0 && detail.isSerial == true; });
    if (arrInvalidQuantitySerial.length > 0) {
        return 'Chọn serial/imei cho hàng hóa [' + arrInvalidQuantitySerial.map(function(order){ return order.itemName;}).join(', ') + '] trước khi lưu.';
    }

    if(order.saleType == self.saleType.retail && order.saleStatus <= self.saleStatus.complete) {
        var existsUntrackedSale = order.orderDetails.filter(function (detail) {
            return detail.qtyAvailable < detail.quantity && detail.isUntrackedItemSale === false && detail.isInventoryTracked === true;
        });
        if (existsUntrackedSale.length > 0) {
            return 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + existsUntrackedSale.map(function (d) { return d.itemName; }).join(',') + '] và thử lại.';
        }
    }

    //Kiểm tra cấu hình bán nợ.
    if (!SunoGlobal.saleSetting.isAllowDebtPayment && order.amountPaid < order.total) {
        return 'Hệ thống được cấu hình không cho phép bán nợ. Xin vui lòng thanh toán đủ mỗi lần bán.';
    }

    //Kiểm tra khách hàng khi bán nợ.
    if (SunoGlobal.saleSetting.isAllowDebtPayment && order.amountPaid < order.total && order.customer == null) {
        return 'Vui lòng thêm thông tin khách hàng khi bán nợ.';
    }
    
    return 'ok';
};

/*
    Description: Calculate sale order model.
    Return: orderModel
*/
SunoSaleOrder.prototype.prepareOrder = function(order) {
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
            payments: []
        }
    };
    for (var i = 0; i < order.orderDetails.length; i++) {
        var item = order.orderDetails[i];
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
    Description: Lưu đơn hàng.
    Return: function promise.
*/
SunoSaleOrder.prototype.saveOrder = function(order) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var validMessage = self.validateOrder(order);
        if (validMessage == 'ok') {
            var data = self.prepareOrder(order);
            self.request.makeRestful(SunoGlobal.sunoService.domain + SunoGlobal.sunoService.saleOrder.completeOrderUrl, 'POST', data).then(function(body) {
                resolve(body);
            }).catch(function(error){
                reject(error);
            });
        }
        else {
            reject(validMessage);
        }
    });
};

/*
    Description: Tính tổng tiền hàng.
*/
SunoSaleOrder.prototype.calculateTotal = function() {
    var self = this;
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
    self.saleOrder.paymentBalance = Math.max(self.saleOrder.total - self.saleOrder.amountPaid, 0);
};

/*
    Description: Tính giảm giá trên đơn hàng.
*/
SunoSaleOrder.prototype.calculateDiscount = function(isDiscountPercent, discount) {
    var self = this;
    self.saleOrder.isDiscountPercent = isDiscountPercent;
    if (self.saleOrder.isDiscountPercent) {
        self.saleOrder.discountPercent = Math.min(discount, 100);
        self.saleOrder.discount = Math.round(self.saleOrder.subTotal * self.saleOrder.discountPercent / 100);
    }
    else {
        self.saleOrder.discount = Math.min(discount, self.saleOrder.subTotal);
        self.saleOrder.discountPercent = Math.round(self.saleOrder.discount * 100 / self.saleOrder.subTotal);
    }
};

/*
    Description: Thực hiện giảm giá trên đơn hàng.
*/
SunoSaleOrder.prototype.changeDiscount = function(isDiscountPercent, discount) {
    var self = this;
    self.calculateDiscount(isDiscountPercent, discount);
    self.calculateTotal();
};

/*
    Description: Tính giảm giá trên hàng hóa.
*/
SunoSaleOrder.prototype.calculatePriceOnItem = function(detail, isDiscountPercent, discount) {
    detail.isDiscountPercent = isDiscountPercent;
    if (detail.isDiscountPercent) {
        detail.discountPercent = Math.min(discount, 100);
        detail.discount = Math.round(detail.unitPrice * detail.discountPercent / 100);
    }
    else {
        detail.discount = Math.min(discount, detail.unitPrice);
        detail.discountPercent = Math.round(detail.discount * 100 / detail.unitPrice);
    }
    detail.sellPrice = detail.unitPrice - detail.discount;
};

/*
    Description: Thêm hàng hóa vào đơn hàng.
    Params: - item: productItem
*/
SunoSaleOrder.prototype.addItem = function(item) {
    var self = this;
    var result = Object.assign({}, SunoGlobal.result);
    if (!isValidUntrackedItemSale(item)) {
        result.isSuccess = false;
        result.description = 'Hệ thống được cấu hình yêu cầu nhập kho cho hàng đã hết trước khi bán. Xin vui lòng nhập kho cho [' + item.itemName + '] và thử lại.';
    }
    else {
        var detail = self.saleOrder.orderDetails.find(function(d){ return d.itemId == item.itemId; });
        if (detail === undefined) {
            var quantity = item.isSerial ? item.serials.length : 1;
            var unitPrice = calculatePricingPolicy(item, self.saleOrder.customer);
            detail = {
                itemId: item.itemId,
                itemName: item.itemName,
                barcode: item.barcode,
                qtyAvailable: item.qtyAvailable,
                quantity: quantity,
                minQuantity: item.minQuantity,
                maxQuantity: item.maxQuantity,
                unitPrice: unitPrice,
                retailPrice: item.retailPrice,
                wholeSalePrice: item.wholeSalePrice,
                vipPrice: item.vipPrice,
                isDiscountPercent: false,
                discount: 0,
                discountPercent: 0,
                sellPrice: unitPrice,
                subTotal: quantity * unitPrice,
                isInventoryTracked: item.isInventoryTracked,
                isUntrackedItemSale: item.isUntrackedItemSale,
                isSerial: item.isSerial,
                serials: item.isSerial ? item.serials : [],
                isTaxable: item.isTaxable,
                tax: item.tax,
                vat: 0,
                unitName: item.unitName,
                productType: item.productType,
                productId: item.productId
            };
            self.saleOrder.orderDetails.unshift(detail);
        }
        else { 
            var unitPrice = calculatePricingPolicy(item, self.saleOrder.customer);
            detail.quantity = item.isSerial ? item.serials.length : (detail.quantity + 1);
            detail.unitPrice = unitPrice;
            var discount = detail.isDiscountPercent ? detail.discountPercent : detail.discount;
            self.calculatePriceOnItem(detail, detail.isDiscountPercent, discount);
            detail.subTotal = detail.quantity * detail.sellPrice;
        }

        //Tính lại giảm giá cho đơn hàng.
        var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
        self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

        //Tính lại tiền hàng cho đơn hàng.
        self.calculateTotal();

        result.isSuccess = true;
        result.description = '';
        result.data = detail;
    }
    return result;
};

/*
    Description: Xóa hàng hóa khỏi đơn hàng.
*/
SunoSaleOrder.prototype.removeItem = function(item) {
    var self = this;
    var index = self.saleOrder.orderDetails.findIndex(function(d){ return d.itemId == item.itemId; });
    if (index > -1) {
        self.saleOrder.orderDetails.splice(index, 1);

        //Tính lại giảm giá cho đơn hàng.
        var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
        self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

        //Tính lại tiền hàng cho đơn hàng.
        self.calculateTotal();
    }
};

/*
    Description: Thay đổi số lượng của hàng hóa trên đơn hàng.
*/
SunoSaleOrder.prototype.changeQuantityOnItem = function(item) {
    var self = this;
    var detail = self.saleOrder.orderDetails.find(function(d){ return d.itemId == item.itemId; });
    if (detail !== undefined) {
        detail.quantity = item.quantity;
        detail.subTotal = detail.quantity * detail.sellPrice;

        //Tính lại giảm giá cho đơn hàng.
        var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
        self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

        //Tính lại tiền hàng cho đơn hàng.
        self.calculateTotal();
    }
};

/*
    Description: Thay đổi giá mới hoặc giảm giá của hàng hóa trên đơn hàng.
*/
SunoSaleOrder.prototype.changePriceOnItem = function(item) {
    var self = this;
    var detail = self.saleOrder.orderDetails.find(function(d){ return d.itemId == item.itemId; });
    if (detail !== undefined) {
        if (detail.unitPrice <= item.unitPrice) {
            //Apply giá mới cho hàng hóa.
            detail.unitPrice = item.unitPrice;
            detail.isDiscountPercent = false;
            detail.discount = 0;
            detail.discountPercent = 0;
        }
        else {
            //Thực hiện giảm giá.
            var discountPrice = detail.unitPrice - item.unitPrice;
            detail.discount = discountPrice;
            detail.discountPercent = Math.round(discountPrice / detail.unitPrice * 100);
            detail.unitPrice = item.unitPrice;
        }

        //Tính lại giảm giá cho đơn hàng.
        var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
        self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

        //Tính lại tiền hàng cho đơn hàng.
        self.calculateTotal();
    }
};

/*
    Description: Thay đổi cửa hàng khi bán đơn hàng.
*/
SunoSaleOrder.prototype.changeStore = function(storeId) {
    var self = this;
    self.storeId = storeId;
    //Tính lại giảm giá cho đơn hàng.
    var discount = self.saleOrder.isDiscountPercent ? self.saleOrder.discountPercent : self.saleOrder.discount;
    self.calculateDiscount(self.saleOrder.isDiscountPercent, discount);

    //Tính lại tiền hàng cho đơn hàng.
    self.calculateTotal();
};

/*
    Description: Thêm khách hàng vào đơn hàng.
*/
SunoSaleOrder.prototype.addCustomer = function(customer) {
    var self = this;
    self.saleOrder.customer = customer;
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
    Description: Xóa khách hàng khỏi đơn hàng.
*/
SunoSaleOrder.prototype.removeCustomer = function() {
    var self = this;
    self.saleOrder.customer = null;
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
    Description: Thêm mới phiếu thu
*/
SunoSaleOrder.prototype.addReceiptVoucher = function(voucher) {
    
};

/*--Private Function--*/
var isValidUntrackedItemSale = function (item) {
    var result = true;
    if ((item.qtyAvailable <= 0 || item.qtyAvailable < item.quantity + 1) && item.isInventoryTracked == true && item.isUntrackedItemSale == false) {
        result = false;
    }
    return result;
};

var calculatePricingPolicy = function (item, customer) {
    var self = this;
    var result = item.retailPrice;
    if (customer !== null && customer !== undefined && SunoGlobal.saleSetting.isApplyCustomerPricingPolicy) {
        switch(customer.type) {
            case self.customer.customerType.wholeSale : 
                result = item.wholeSalePrice;
                break;
            case self.customer.customerType.vip : 
                result = item.vipPrice;
                break;
            default: 
                result = item.retailPrice;
                break;
        };
    }
    return result;
};
