//SunoSaleOrder prototype is inherited from SunoEarningPoint prototype.
var S = function(){};
S.prototype = SunoEarningPoint.prototype;

function SunoSaleOrder(storeId) { 
    this.request = new SunoRequest();
    this.storeId = storeId;
};

//#region Prototype
SunoSaleOrder.prototype = new S();
SunoSaleOrder.prototype.constructor = SunoSaleOrder;
SunoSaleOrder.uber = SunoEarningPoint.prototype;

//#endregion