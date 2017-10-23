var SC = function(){};
SC.prototype = SunoEarningPoint.prototype;

function SunoSaleOrderCafe(storeId) { 
    this.request = new SunoRequest();
    this.storeId = storeId;
};

SunoSaleOrderCafe.prototype = new SC();
SunoSaleOrderCafe.prototype.constructor = SunoSaleOrderCafe;
SunoSaleOrderCafe.uber = SunoEarningPoint.prototype;

SunoSaleOrderCafe.prototype.generateSaleOrder = function() {
    var self = this;
    var saleOrder = self.constructor.uber.generateSaleOrder();
    saleOrder.storeId = self.storeId;
    saleOrder.createdBy = saleOrder.cashier.userId;
    saleOrder.createdByName = saleOrder.cashier.displayName;
    saleOrder.revision = 1;
    saleOrder.logs = [];
    saleOrder.sharedWith = [];
    saleOrder.startTime = new Date();
    saleOrder.hasNotice = false;
    saleOrder.lastInputedIndex = -1;
    saleOrder.saleOrderUuid = saleOrder.uid;
    saleOrder.tableName = '';
    return saleOrder;
};

/*
    Description: Tạo cấu trúc hàng hóa trong đơn hàng. 
*/
SunoSaleOrderCafe.prototype.generateOrderDetail = function(item) {
    var self = this;
    var saleOrderDetail = self.constructor.uber.generateOrderDetail(item);
    saleOrderDetail.newOrderCount = 0;
    saleOrderDetail.detailID = SunoGlobal.generateGUID();
    return saleOrderDetail;
};

SunoSaleOrderCafe.prototype.addNewOrder = function(order) {
    var self = this;
    var existsOrder = self.saleOrders.find(function(o){ return o.uid == order.uid; });
    if (existsOrder === undefined) {
        self.saleOrders.push(order);
    }
};

SunoSaleOrderCafe.prototype.calculateOrder = function(order) {
    var self = this;
    var existsOrder = self.saleOrders.find(function(o){ return o.uid == order.uid; });
    if (existsOrder === undefined) {
        self.addNewOrder(order);
    }
    else {
        var saleOrder = Object.assign({}, self.saleOrder);
        self.saleOrder = order;
        if (SunoGlobal.saleSetting.isApplyPromotion && self.saleOrder.isPromotion) {
            self.calculatePromotion();
            self.applyPromotion();
        }
        self.calculateTotal();
        var selectedOrder = self.saleOrders.find(function(o){ return o.uid == saleOrder.uid;});
        if (selectedOrder !== undefined) self.saleOrder = selectedOrder;
    }
};