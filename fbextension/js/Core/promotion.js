app.factory('promotion', ['promotionService', 'settingsGlobal', '$http',
    function (promotionService, settingsGlobal, $http) {
        var setting = settingsGlobal.getSetting();
        var storeIds = PosimGlobal.getGrantedStores(setting);
        
        function promotion(storeId, saleDate, saleType) {
            this.items = [];
            this.bills = [];
            this.allBills = [];
            this.allItems = [];
            this.subTotal = 0;
            this.optimal = 0;
            this.isPromotion = false;
            this.storeId = storeId;
            this.customerId = 0;
            this.saleDate = saleDate;
            this.saleType = saleType; //3: WebOrder
            this.isCallService = false;
        };

        promotion.prototype = {
            init: function (myCallback) {
                /*
                if (setting.saleSettings.ApplyPromotion == undefined || setting.saleSettings.ApplyPromotion == false || this.saleType == 3) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                } else {
                    var scope = this;
                    var request = new Object({ saleDate: this.saleDate });
                    var callback = function (data) {
                        if (null != data && data.response.length > 0) {
                            scope.allBills = data.response;
                        }
                        if (myCallback != null && typeof myCallback === 'function') {
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    }
                    promotionService.getBillApplying(request, callback, error);
                }
                */
                if (!this.isCallService) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                }
                else {
                    var scope = this;
                    var request = new Object({ saleDate: this.saleDate });
                    var callback = function (data) {
                        if (null != data && data.response.length > 0) {
                            scope.allBills = data.response;
                        }
                        if (myCallback != null && typeof myCallback === 'function') {
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    }
                    promotionService.getBillApplying(request, callback, error);
                }
            },
            //1. addItem
            addItem: function (itemObj, subTotal, callback) {
                if (this.customerId != null) {
                    if (itemObj.length > 0) {
                        this.callList(itemObj, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                    } else {
                        this.callSingle(itemObj, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                    }
                }
                else {
                    this.items = [];
                    this.bills = [];
                    if (callback != null && typeof callback === "function") {
                        callback();
                    }
                }
            },
            //2. editItemQuantity
            changeQuantity: function (itemObj, changeType, subTotal, callback) {
                // changetype = 0: tru, changeType = 1: cong
                //find item on the array
                var storeId = this.storeId;
                var findItem = [];
                var items = this.allItems.filter(function (i) {
                    return i.itemID == itemObj.itemID;
                });
                if (items.length > 0) {
                    findItem = items[0];
                    findItem.quantity = itemObj.quantity;
                    this.subTotal = subTotal;
                }
                if (this.customerId != null) {
                    this.callSingle(itemObj, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                }
                else {
                    this.optimalCalculating();
                }
            },
            //3. removeItem (itemObj, subtotal, callback)  
            removeItem: function (itemObj, subTotal, callback) {
                var isExistItemID = this.allItems.filter(function (o) {return o.itemID == itemObj.itemID });
                if (isExistItemID.length > 0) {
                    this.allItems.splice(this.allItems.indexOf(isExistItemID[0]), 1);
                }
                this.subTotal = subTotal;
                this.optimalCalculating();
                if (callback != null && typeof callback === "function") {
                    callback();
                }
            },
            //4. addCustomer
            addCustomer: function (itemList, subTotal, customer, callback) {
                this.customerId = getCustomerId(customer);
                if (this.customerId != null && itemList.length > 0) {
                    this.callList(itemList, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                }
                else {
                    this.isPromotion = false;
                    this.items = [];
                    this.bills = [];
                    if (callback != null && typeof callback === "function") {
                        callback();
                    }
                }
            },
            //5. removeCustomer
            removeCustomer: function (itemList, subTotal, callback) {
                this.customerId = 0;
                if (itemList.length > 0) {
                    this.callList(itemList, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                }
            },
            //6. ChangeStore
            changeStore: function (itemList, subTotal, storeId, callback) {
                this.storeId = storeId;
                if (itemList.length > 0) {
                    this.callList(itemList, subTotal, this.customerId, this.storeId, this.saleDate, callback);
                }
            },
            //7.ChangeDate
            changeDate: function (itemList, subTotal, saleDate, callback) {
                this.saleDate = saleDate;
                var scope = this;
                this.canclePromotion(function () {
                    if (itemList.length > 0) {
                        scope.callList(itemList, subTotal, scope.customerId, scope.storeId, scope.saleDate, callback);
                    }
                });
                
            },
            // Do All Action
            callSingle: function (itemObj, subTotal, customerId, storeId, saleDate, myCallback) {
                /*
                if (setting.saleSettings.ApplyPromotion == undefined || setting.saleSettings.ApplyPromotion == false || this.saleType == 3) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                }
                else {
                    this.subTotal = subTotal;
                    var request = new Object({
                        items: [itemObj],
                        customerId: customerId,
                        storeId: storeId,
                        saleDate: saleDate
                    });
                    var scope = this;
                    var callback = function (response) {
                        data = response.response;
                        if (null != data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                var item = new Object({
                                    itemID: data[i].itemID,
                                    quantity: data[i].quantity,
                                    retailPrice: data[i].retailPrice,
                                    promotions: data[i].promotions
                                });
                                scope.allItems.push(item);
                            }
                        }
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    };
                    var existItem = this.allItems.filter(function (o) { return o.itemID == itemObj.itemID });
                    if (existItem.length == 0) {
                        promotionService.getApplying(request, callback, error);
                    } else {
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    }
                }
                */
                if (!this.isCallService) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                }
                else {
                    this.subTotal = subTotal;
                    var request = new Object({
                        items: [itemObj],
                        customerId: customerId,
                        storeId: storeId,
                        saleDate: saleDate
                    });
                    var scope = this;
                    var callback = function (response) {
                        data = response.response;
                        if (null != data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                var item = new Object({
                                    itemID: data[i].itemID,
                                    quantity: data[i].quantity,
                                    retailPrice: data[i].retailPrice,
                                    promotions: data[i].promotions
                                });
                                scope.allItems.push(item);
                            }
                        }
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    };
                    var existItem = this.allItems.filter(function (o) { return o.itemID == itemObj.itemID });
                    if (existItem.length == 0) {
                        promotionService.getApplying(request, callback, error);
                    } else {
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    }
                }
            },
            callList: function (itemList, subTotal, customerId, storeId, saleDate, myCallback) {
                /*
                if (setting.saleSettings.ApplyPromotion == undefined || setting.saleSettings.ApplyPromotion == false || this.saleType == 3) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                } else {
                //Reset AllItem
                this.subTotal = subTotal;
                this.allItems = [];
                    var request = new Object({
                        items: itemList,
                        customerId: customerId,
                        storeId: storeId,
                        saleDate: saleDate
                    });                   
                    var scope = this;
                    var callback = function (response) {
                        data = response.response;
                        if (null != data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                var item = new Object({
                                    itemID: data[i].itemID,
                                    quantity: data[i].quantity,
                                    retailPrice: data[i].retailPrice,
                                    promotions: data[i].promotions
                                });
                                scope.allItems.push(item);
                            }
                            scope.subTotal = subTotal;
                        }
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    }
                    promotionService.getApplying(request, callback, error);
                }
                */
                if (!this.isCallService) {
                    if (myCallback != null && typeof myCallback === 'function') {
                        myCallback();
                    }
                }
                else {
                    //Reset AllItem
                    this.subTotal = subTotal;
                    this.allItems = [];
                    var request = new Object({
                        items: itemList,
                        customerId: customerId,
                        storeId: storeId,
                        saleDate: saleDate
                    });
                    var scope = this;
                    var callback = function (response) {
                        data = response.response;
                        if (null != data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                var item = new Object({
                                    itemID: data[i].itemID,
                                    quantity: data[i].quantity,
                                    retailPrice: data[i].retailPrice,
                                    promotions: data[i].promotions
                                });
                                scope.allItems.push(item);
                            }
                            scope.subTotal = subTotal;
                        }
                        if (myCallback != null && typeof myCallback === "function") {
                            scope.optimalCalculating();
                            myCallback();
                        }
                    };
                    var error = function (ex) {
                        console.log(ex);
                    }
                    promotionService.getApplying(request, callback, error);
                }
            },
            //OptimalCalculating
            optimalCalculating: function () {
                var discountBill = 0;
                var discountItem = 0;
                var subTotal = this.subTotal;

                //LOC CHUONG TRINH BILL
                var items = this.allBills;
                this.bills = [];
                for (var i = 0; i < items.length ; i++) {
                    var item = items[i];
                    if (item.storeIds.indexOf(this.storeId) > -1 || item.storeIds.indexOf(0) > -1) {
                        if (item.customerIds.indexOf(this.customerId) > -1 || item.customerIds.indexOf(0) > -1) {
                            var details = item.detail.filter(function (d) {
                                return d.appliedAmount <= subTotal && subTotal > 0;
                            });
                            if (details.length > 0) {
                                var appliedAmounts = details.map(function (d) { return d.appliedAmount; });
                                var maxAppliedAmount = Math.max.apply(null, appliedAmounts);
                                var detailValue = details.filter(function (d) { return d.appliedAmount == maxAppliedAmount; });
                                item.discountPercent = detailValue[0].discountPercent;
                                item.discountPrice = detailValue[0].discountPrice;
                                item.isPercent = detailValue[0].isPercent;
                                item.discountValue = detailValue[0].isPercent ? Math.round(detailValue[0].discountPercent * subTotal / 100) : detailValue[0].discountPrice;
                                item.isSelected = false;
                                this.bills.push(item);
                            }
                        }
                    }
                }
                if (this.bills.length > 0) {
                    var availableBills = this.bills.filter(function (d) { return d.isCodeRequired == false; });
                    if (availableBills.length > 0) {
                        var discountValue = availableBills.map(function (d) { return d.discountValue; });
                        var maxDiscountValue = Math.max.apply(null, discountValue);
                        var optimalBills = this.bills.filter(function (d) { return d.discountValue == maxDiscountValue; });
                        this.bills.maxDiscount = maxDiscountValue;
                        optimalBills[0].isSelected = true;
                    } else {
                        this.bills.maxDiscount = 0;
                    }
                }

                //LOC CHUONG TRINH ITEM
                var itemList = this.allItems;
                var totalDiscount = 0;
                this.items = [];
                for (var i = 0; i < itemList.length ; i++) {
                    var item = itemList[i];
                    var promotion = item.promotions.filter(function (d) {
                        d.isSelected = false;
                        return d.minQuantity <= item.quantity;
                    });

                    if (promotion.length > 0) {
                        var discountValues = promotion.map(function (d) { return d.discountValue; });
                        var maxDiscountValue = Math.max.apply(null, discountValues);
                        var optimalItemPromo = promotion.filter(function (d) { return d.discountValue == maxDiscountValue; });
                        var optimalDiscount = 0;
                        if (optimalItemPromo.length > 0) {
                            optimalItemPromo[0].isSelected = true;
                            var optimalDiscount = optimalItemPromo[0].discountValue * item.quantity;
                        }
                        totalDiscount += optimalDiscount;

                        var pushItem = new Object({
                            itemID: item.itemID,
                            quantity: item.quantity,
                            retailPrice: item.retailPrice,
                            promotions: promotion
                        });
                        this.items.push(pushItem);
                    }
                }
                this.items.maxDiscount = totalDiscount;

                //tinh Optimal
                this.optimal = 0;
                var notOnlyCode = this.bills.filter(function (o) { return o.isCodeRequired == false });
                if (this.bills.length > 0 && this.items.length > 0) {
                    if (this.bills.maxDiscount >= this.items.maxDiscount) {
                        if (notOnlyCode.length > 0) this.optimal = 2;
                        else this.optimal = 1;
                    } else {
                        this.optimal = 1;
                    }
                } else if (this.bills.length > 0) {
                    if (notOnlyCode.length > 0) this.optimal = 2;
                    else this.optimal = 3;
                } else if (this.items.length > 0) {
                    this.optimal = 1;
                }

                if (this.bills.length > 0 || this.items.length > 0) {
                    this.isPromotion = true;
                } else {
                    this.isPromotion = false;
                }

                if (setting.saleSettings.ApplyPromotion == undefined || setting.saleSettings.ApplyPromotion == false || this.saleType == 3) {
                    this.items = [];
                    this.bills = [];
                    this.allItems = [];
                    this.isPromotion = false;
                    this.customerId = 0;
                }
            },
            canclePromotion: function (callback) {
                this.init(callback);
                this.items = [];
                this.bills = [];
                this.allItems = [];
                this.isPromotion = false;
                this.customerId = 0;
            },
        };

        //Private 
        var getDiscount = function (promotionObj, money) {
            var result = promotionObj.discountPrice;
            if (promotionObj.isPercent) {
                var discount = (money * promotionObj.discountPercent) / 100;
                result = Math.round(discount);
            }
            return result;
        }
        var getCustomerId = function (customerObj) {
            if (null == customerObj) {
                return 0;
            } else if (customerObj.type === undefined || customerObj.type == 0) {
                return customerObj.customerId
            }
            return null;
        }

        return promotion;
}]);