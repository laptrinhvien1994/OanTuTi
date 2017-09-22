var connect = require('connect');
var serveStatic = require('serve-static');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var streamify = require('gulp-streamify');
var ngAnnotate = require('gulp-ng-annotate');
var ejs = require("gulp-ejs");

var destFolder = './static/',
    destFile = 'bundle.js';

    gulp.src([
      './lib/ionic/js/ionic.bundle.min.js',
      './lib/ionic/js/ionic-angular.min.js',
      './cordova.js',
      './js/jquery-2.2.3.min.js',
      './js/app.js',
      './js/factory.js',
      './js/controllers.js',
      './js/LoginController.js',
      './js/PosController.js',
      './js/printer.js',
      './js/encoder.js',
	  './js/hotkeys.min.js',
      './lib/AngularJS-Toaster/toaster.min.js',
      './lib/ion-datetime-picker/release/ion-datetime-picker.min.js',
      './lib/socket.io-client/socket.io.js',
      './lib/angular-socket-io/socket.js',
    ])
  .pipe(ngAnnotate())
  .pipe(concat(destFile))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest(destFolder));


  var randomNum = new Date().getTime();
  gulp.src('./index.html')
  .pipe(ejs({
    rev: randomNum
  }))
  .pipe(gulp.dest('.'));

var winston = require('winston');
//winston.remove(winston.transports.Console);
winston.level = 'debug';
 var logger = new (winston.Logger)({
   exitOnError: false,
   transports: [
     new (winston.transports.File)({
       name: 'debug-file',
       filename: './log/debug.log',
       level: 'debug'
     }),
     new (winston.transports.File)({
       name: 'error-file',
       filename: './log/error.log',
       level: 'error'
     })
   ],
   exceptionHandlers: [
       new winston.transports.File({ filename: './log/exceptions.log' })
     ]
 });

 var devLogger = new (winston.Logger)({
     exitOnError: false,
     transports: [
         new (winston.transports.File)({
             name: 'debug',
             filename: './log/dev.log',
             level: 'debug'
         })
     ]
 })
 
 var devLog = function (logData) {
     devLogger.log('debug', logData);
 }

var port = 8181;
var DEBUG = true;
var CACHE_TIME_OUT = 104400000;
var AUTH_URL = 'localhost:6985';
var https = require('http');
var querystring = require('querystring');
var cache = require('memory-cache');
var _ = require('underscore');
var uuid = require('uuid');

//initialize db
var MongoClient = require('mongodb').MongoClient
var db;
var io;

// Connection URL 
// var url = 'mongodb://172.16.1.3:27017/cafe?maxPoolSize=100';
var url = 'mongodb://192.168.1.11:27017,192.168.1.6:27017,192.168.1.8:27017/cafe?replicaSet=rs0&maxPoolSize=100';
// Use connect method to connect to the Server 
MongoClient.connect(url, function (err, database) {
    db = database;
    //initialize socket
    io = require('socket.io').listen(connect().use(serveStatic(__dirname)).listen(port));

    io.sockets.on('connection', function (socket) {
        if (socket.handshake.query.room) {
            logDebug(socket.handshake.query.room);
            socket.join(socket.handshake.query.room);
        }
        socket.on('initShift', function (clientData) {
            //console.log('initShift', data);
            if (!clientData) return;
            doAuth(clientData, function (data) {
                try
                {
                    logDebug('initShift:');
                    // dirDebug(data);
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    // logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                       //io.sockets.emit('exception', data);  
                       socket.emit('exception', {errorCode: 'invalidStore', data: data});
                       logDebug('exception...' + data);
                    }
                    else
                    {
                        //update(id, data);
                        //debugger;
                        initShift(id, data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });

        socket.on('updateOrder', function (data) {
            //debugger;
            if (!data) return;
            doAuth(data, function(data){
                try
                {
                    logDebug('updateOrder');
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                       logDebug('exception...' + data);
                       //io.sockets.emit('exception', data);  
                       socket.emit('exception', {errorCode: 'invalidStore', data: data});
                    }
                    else
                    {
                        //update(id, data);
                        updateOrder(id, data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });
        socket.on('moveOrder', function (data) {
            if (!data) return;
            doAuth(data, function(data){
                try
                {
                    logDebug('updateOrder');
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                       logDebug('exception...' + data);
                       //io.sockets.emit('exception', data);  
                       socket.emit('exception', {errorCode: 'invalidStore', data: data});
                    }
                    else
                    {
                        moveOrder(id, data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });

        socket.on('reconnectServer', function (data) {
            if (!data) return;
            doAuth(data, function (data) {
                try
                {
                    var id = '';
                    if (id == '' || id == '_' || id == 'undefined_undefined') {
                        socket.emit('exception', { errorCode: 'invalidStore', data: data });
                    }
                    else {
                        syncOfflineOrder(id, data);
                    }
                }
                catch (exception) {
                    data.ipAddress = socket.handshake.address;
                }
            })
        });

        socket.on('completeOrder', function (data) {
            //debugger;
            if (!data) return;
            doAuth(data, function(data){
                try
                {
                    logDebug('completeOrder:');
                    // dirDebug(data);
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                        logDebug('exception...' + JSON.stringify(data));
                        //io.sockets.emit('exception', data);  
                        socket.emit('exception', {errorCode: 'invalidStore', data: data});
                    }
                    else
                    {
                        completeOrder(id, data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });
        socket.on('completeShift', function (data) {
            if (!data) return;
            doAuth(data, function(data){
                try
                {
                    logDebug('completeShift:');
                    // dirDebug(data);
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                       logDebug('exception...' + JSON.stringify(data));
                       //io.sockets.emit('exception', data);  
                       socket.emit('exception', {errorCode: 'invalidStore', data: data});
                    }
                    else
                    {
                        completeShift(id,data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });
        socket.on('printHelper', function (data) {
            if (!data) return;
            doAuth(data, function(data){
                try
                {
                    logDebug('printHelper:');
                    // dirDebug(data);
                    var id = '';
                    id = data.companyId + '_' + data.storeId;
                    logDebug(id);
                    if (id == '' || id == '_' || id == 'undefined_undefined')
                    {
                       logDebug('exception...' + JSON.stringify(data));
                       //io.sockets.emit('exception', data);  
                       socket.emit('exception', {errorCode: 'invalidStore', data: data});
                    }
                    else
                    {
                        printHelper(id,data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });


        var initShift = function (id, data) {
            var shiftIdReq = data.shiftId;
            var shiftIdCur = null;
            var collection = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            var serverLog = db.collection('serverLog');
            var broadcastType = 0; //0: cho tất cả các client, 1: cho client đã gửi lên, 2: cho các client khác trừ client đã gửi lên.
            var msg = [];
            collection.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {
                if (err) logError(err);
                history.find({ companyId: data.companyId, storeId: data.storeId, shiftId: data.shiftId }).toArray(function (errHis, docHis) {
                    if (errHis) logError(errHis);
                    serverLog.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (errLog, docsLog) {
                        if (errLog) logError(errLog);
                        //Giai đoạn 1: Chuẩn bị data
                        //Nếu trong collection tableOrder không có documents nào thuộc companyId và storeId (Trường hợp Init shift lần đầu tiên).
                        if (docs == null || docs == undefined || docs == [] || docs.length == 0) {
                            shiftIdCur = uuid.v4();
                            data.shiftId = shiftIdCur;
                            data.startDate = new Date();
                            collection.insert(data, function (err, doc) { if (err) logDebug('Error:' + err); else { logDebug('Result:'); dirDebug(doc); }});
                            history.insert(data, function (err, doc) { if (err) logDebug('Error:' + err); else { logDebug('Result:'); dirDebug(doc); } });
                            var companyLog = { companyId: data.companyId, storeId: data.storeId, logs: []};
                            serverLog.insert(companyLog, function (err, doc) { if (err) logDebug('Error' + err); else { logDebug('Result:'); dirDebug(doc); } });
                        }
                        else
                        {
                            //Gán shiftId hiện tại là shiftId trong collection tableOrder.
                            shiftIdCur = docs[0].shiftId;
                            //Nếu shiftId của Client trùng với ShiftId hiện tại.
                            if (data.tables && data.tables.length > 0 && shiftIdReq == shiftIdCur) {
                                if (!docs[0].tables || docs[0].tables.length == 0) docs[0].tables = [];
                                if (!docHis || !docHis[0] || !docHis[0].tables || docHis[0].tables.length == 0) docHis = [{ tables: [] }];

                                //Lặp qua từng bàn trong ds bàn mà Client gửi lên.
                                for (var i = 0; i < data.tables.length; i++) {
                                    //Nếu trong bàn đó không có đơn hàng thì chuyển qua bàn khác
                                    if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;

                                    //Lặp qua từng hóa đơn trong bàn đó.
                                    for (var j = 0; j < data.tables[i].tableOrder.length; j++) {
                                        var t = _.findWhere(docs[0].tables, { tableUuid: data.tables[i].tableUuid });
                                        var tHis = _.findWhere(docHis[0].tables, { tableUuid: data.tables[i].tableUuid });

                                        //Nếu bàn mà Client gửi lên có trong ds bàn trên Server.
                                        if (t) {
                                            var order = _.find(t.tableOrder, function (tb) { return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid });

                                            //Nếu đơn hàng Client gửi lên đang tồn tại trong ds đơn hàng trên Server thì cập nhật lại đơn hàng đó trên Server.
                                            //Việc cập nhật là merge dữ liệu giữa Client và Server không phải overwrite.
                                            if (order) {
                                                if (order.saleOrder.revision == data.tables[i].tableOrder[j].saleOrder.revision && data.tables[i].tableOrder[j].logs.length == 0) {
                                                    //Order client đã được đồng bộ và phía client gửi lên không có thay đổi gì.
                                                    //Do nothing.
                                                }
                                                else if (order.saleOrder.revision == data.tables[i].tableOrder[j].saleOrder.revision && data.tables[i].tableOrder[j].logs.length > 0) {
                                                    //Order client đã được đồng bộ và phía client gửi lên có sự thay đổi.

                                                    //Cập nhật dữ liệu cho server.
                                                    order.saleOrder.orderDetails = data.tables[i].tableOrder[j].saleOrder.orderDetails;
                                                    data.tables[i].tableOrder[j].saleOrder.logs.forEach(function (log) {
                                                        order.saleOrder.logs.push(log);
                                                        log.status = true;
                                                    });

                                                    //Update revision
                                                    order.saleOrder.revision++;

                                                    //Broadcast cho toàn bộ client về dữ liệu mới cập nhật.
                                                    broadcastType = 0;
                                                }
                                                else if (order.saleOrder.revision > data.tables[i].tableOrder[j].saleOrder.revision && data.tables[i].tableOrder[j].logs.length == 0) {
                                                    //Order client đã cũ nhưng phía client gửi lên không có sự thay đổi gì.
                                                    //Update lại cho chính client đó.
                                                    broadcastType = 1;
                                                }
                                                else if (order.saleOrder.revision > data.tables[i].tableOrder[j].saleOrder.revision && data.tables[i].tableOrder[j].logs.length > 0) {
                                                    //Order client đã cũ nhưng phía client gửi lên có sự thay đổi -> Xảy ra conflict.
                                                    //Merge dữ liệu của client và server
                                                    //B1: Merge log giữa client và server có distinct -> cập nhật lại log cho server.
                                                    var orderClient = data.tables[i].tableOrder[j].saleOrder.logs.filter(function (item) {
                                                        return order.saleOrder.logs.findIndex(function (i) {
                                                            return i.itemID == item.itemID && i.timestamp == item.timestamp && i.deviceID == item.deviceID;
                                                        }) < 0;
                                                    });
                                                    order.saleOrder.logs = order.saleOrder.logs.concat(orderClient);

                                                    //B2: Tính toán lại số lượng dựa trên logs
                                                    var groupLog = groupBy(order.saleOrder.logs);

                                                    //B3: Cập nhật lại số lượng item
                                                    groupLog.forEach(function (log) {
                                                        var index = order.saleOrder.orderDetails.findIndex(function (d) {
                                                            return d.itemId == log.itemID;
                                                        });
                                                        if (log.totalQuantity > 0 && index < 0) {
                                                            //Nếu số lượng trong log > 0 và item chưa có trong ds order của server thì thêm vào danh sách details
                                                            var itemDetail = data.tables[i].tableOrder[j].saleOrder.orderDetails.find(function (d) { return d.itemId == log.itemID });
                                                            order.saleOrder.orderDetails.push(itemDetail);
                                                        }
                                                        else if (log.totalQuantity > 0 && index >= 0) {
                                                            //Nếu số lượng trong log > 0 và item đã có trong ds order của server thì cập nhật lại số lượng
                                                            var itemDetail = order.saleOrder.orderDetails.find(function (d) { return d.itemId == log.itemID });
                                                            itemDetail.quantity = log.totalQuantity;
                                                        }
                                                        else if (log.totalQuantity < 0 && index >= 0) {
                                                            //Nếu số lượng trong log < 0 và item đã có trong ds order của server thì xóa item đó đi khỏi danh sách details
                                                            var itemDetailIndex = order.saleOrder.orderDetails.findIndex(function (d) { return d.itemId == log.itemID });
                                                            order.saleOrder.orderDetails.splice(itemDetailIndex, 1);
                                                        }
                                                        else if (log.totalQuantity < 0 && index < 0) {
                                                            //Nếu số lượng trong log < 0 và item chưa có trong ds order của server thì ko thực hiện gì cả.
                                                        }
                                                    });

                                                    //B4: Cập nhật status cho mỗi dòng log là đã cập nhật.
                                                    order.saleOrder.logs.forEach(function (log) {
                                                        if (!log.status) log.status = true;
                                                    });

                                                    //Update revision.
                                                    order.saleOrder.revision++;
                                                    //Broadcast lại cho toàn bộ các client.
                                                    broadcastType = 0;
                                                    //Thông báo cho client đã bị conflict.
                                                    msg.push(order.tableName);
                                                }
                                                //t.tableOrder[t.tableOrder.indexOf(order)] = data.tables[i].tableOrder[j];

                                            }
                                                //Nếu order chưa tồn tại thì kiểm tra trong collection tableOrderHistory
                                                //- Có thì đơn hàng Client gửi lên không hợp lệ (Trường hợp đăng nhập cùng 1 tài khoản trên 2 thiết bị, thoát 1 thiết bị nhưng vẫn còn lưu ở DB Local)
                                                //- Không thì đưa đơn hàng vào ds đơn hàng trên Server.
                                            else if(!order) {
                                                var orderHis = null;
                                                if (tHis) orderHis = _.find(tHis.tableOrder, function (tbHis) { return tbHis.saleOrder && tbHis.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid });
                                                if (!orderHis) {
                                                    //Kiểm tra trong logs xem có chuyển bàn hay đã ghép HD gì hay chưa?
                                                    var log = docsLog[0].logs.find(function (log) { return log.tableID == data.tables[i].tableUuid && log.orderID == data.tables[i].saleOrder[j].saleOrderUuid });
                                                    if (log) {
                                                        var t = docs[0].tables.find(function (t) { return t.tableUuid == log.toTableID; });
                                                        if (t) {
                                                            var curOrder = t.tableOrder.find(function (order) { return order.saleOrder.saleOrderUuid == log.orderID; });
                                                            if (curOrder) {
                                                                //Kiểm tra log và push đơn hàng vào cho phù hợp.
                                                                for (var x = 0; x < data.tables[i].saleOrder[j].saleOrder.logs.length; x++) {
                                                                    if (log.timestamp > data.tables[i].saleOrder[j].saleOrder.logs[x].timestamp) {
                                                                        var item = curOrder.saleOrder.find(function (i) { return i.itemId == data.tables[i].saleOrder[j].saleOrder.logs[x].itemID });
                                                                        if(item){
                                                                            item.quantity += data.tables[i].saleOrder[j].saleOrder.logs[x].action == "BB" ? data.tables[i].saleOrder[j].saleOrder.logs[x].quantity :
                                                                                data.tables[i].saleOrder[j].saleOrder.logs[x].action == "H" ? -data.tables[i].saleOrder[j].saleOrder.logs[x].quantity : 0;
                                                                        }
                                                                        else {
                                                                            var detail = data.tables[i].sale[j].saleOrder[j].orderDetails.find(function (i) { return i.itemId == log.itemID });
                                                                            detail.quantity = log.quantity;
                                                                            curOrder.saleOrder.orderDetails.push(detail);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //Tạo đơn hàng mới với dữ liệu của order push lên.
                                                        //Thông báo cho client.
                                                    }
                                                    else {
                                                        //Thêm vào collection tableOrder.
                                                        t.tableOrder.push(data.tables[i].tableOrder[j]);
                                                        logDebug('order is inserted');
                                                    }
                                                }
                                                else {
                                                    logDebug('order is completed or moved or deleted');
                                                }
                                            }
                                        } 
                                        //Nếu bàn mà Client gửi lên chưa tồn tại trong danh sách bàn và đơn hàng trên Server thì thêm bàn đó vào ds. Trường hợp Init gửi tất cả bàn lên Server.
                                        else {
                                            docs[0].tables.push(data.tables[i]);
                                        }
                                    }
                                }

                                //Sau khi đã xử lý xong ds bàn và đơn hàng Client gửi lên thì cập nhật lại vào Collection TableOrder trên Server.
                                collection.update({ companyId: data.companyId, storeId: data.storeId }, { $set: { tables: docs[0].tables } }, { w: 1 }, function (err, result) {
                                    if (err) logDebug('Error:' + err);
                                });
                                //Gán lại data sẽ trả về cho Client bằng data trên Server sau xử lý.
                                data = docs[0];
                            }
                                //Nếu shift mà Client gửi lên không trùng với shift hiện tại. Trường hợp Init hoặc lấy shiftId từ DB Local
                            else {
                                //Gán lại data sẽ trả về cho Client bằng data hiện tại trên Server.
                                data = docs[0];
                            }
                        }
                        //Giai đoạn 2: Trả data phù hợp về cho Client
                        //Chưa có shift nào 
                        if (shiftIdReq == '' || shiftIdReq == undefined || shiftIdReq == null) {
                            data.shiftId = shiftIdCur;
                            io.to(id).emit('initShift', data);
                        }
                        else {
                            //Thông tin shift không match. Trường hợp Client gửi lên shift cũ trong DB Local sau khi shift đó đã kết thúc.
                            if (shiftIdReq != shiftIdCur) {
                                socket.emit('exception', { errorCode: 'invalidShift', data: data });
                            }
                                //Cập nhật thông tin shift
                            else {
                                io.to(id).emit('initShift', data);
                            }
                        }
                    });
                });
            });
        };

        var groupBy = function (arrLog) {
            var result = arrLog.reduce(function (arr, item) {
                var index = arr.findIndex(function (i) { return i.itemID == item.itemID });
                if (index == -1) {
                    //Chưa có
                    var quantity = item.action == "BB" ? item.quantity : -item.quantity;
                    var logs = [{
                        action: item.action,
                        timestamp: item.timestamp,
                        quantity: item.quantity,
                        deviceID: item.deviceID,
                    }]
                    arr.push({
                        itemID: item.itemID,
                        itemName: item.itemName,
                        totalQuantity: quantity,
                        logs: logs
                    });
                }
                else {
                    //Có
                    var indexLog = arr[index].logs.findIndex(function (i) { return i.timestamp == item.timestamp });
                    //Distinct value
                    if (indexLog == -1) {
                        arr[index].logs.push({
                            action: item.action,
                            timestamp: item.timestamp,
                            quantity: item.quantity,
                            deviceID: item.deviceID
                        });
                        //Cập nhật lại total
                        var quantity = item.action == "BB" ? item.quantity : -item.quantity;
                        arr[index].totalQuantity += quantity;
                    }
                }
                return arr;
            }, []);
            return result;
        };

        var time = 0;
        var findOrder = function(serverLog, tables, tableID, orderID){
            var log = serverLog.find(function (l) { return l.tableID == tableID && orderID == tableID });
            if (log) {
                var t = tables.find(function (t) { return t.tableUuid == log.toTableUuid });
                if (t) {
                    var order = t.tableOrder.find(function (order) { order.saleOrder.saleOrderUuid == orderID });
                    if (order) {
                        return {
                            tableID: tableID,
                            orderID: orderID
                        }
                    }
                    else {
                        if (time < 5) {
                            time++;
                            return findOrder(serverLog, tables, t.tableUuid, orderID);
                        }
                        else {
                            time = 0;
                            return null;
                        }
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }


        var updateOrder = function (id, data) {
            debugger;
            var shiftIdCur = null;
            var shiftIdReq = data.shiftId;
            var collection = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            collection.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {         
                if (err) logError(err);
                if (docs && docs.length > 0) {
                    shiftIdCur = docs[0].shiftId;
                    if (shiftIdReq == shiftIdCur) {
                        debugger;
                        //Giai đoạn 1: Cập nhật lại data trên DB Mongo
                        //Lặp qua từng bàn trong ds bàn mà Client gửi lên.
                        for (var i = 0; i < data.tables.length; i++) {

                            //Nếu trong bàn đó không có đơn hàng thì chuyển qua bàn khác
                            if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;

                            //Lặp qua từng hóa đơn trong bàn đó.
                            for (var j = 0; j < data.tables[i].tableOrder.length; j++) {
                                var t = _.findWhere(docs[0].tables, { tableUuid: data.tables[i].tableUuid });
                                var order = _.find(t.tableOrder, function (tb) { return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid });

                                //Nếu đơn hàng Client gửi lên đang tồn tại trong ds đơn hàng trên Server thì cập nhật lại đơn hàng đó trên Server.
                                debugger;
                                if (order) {
                                    //t.tableOrder[t.tableOrder.indexOf(order)] = data.tables[i].tableOrder[j];
                                    //Điều chỉnh data cho phù hợp
                                    //Luôn giữ log chỉ tính toán và cập nhật lại số lượng.
                                    //B1: Merge log giữa client và server có distinct -> cập nhật lại log cho server.
                                    var orderClient = data.tables[i].tableOrder[j].saleOrder.logs.filter(function (item) {
                                        return order.saleOrder.logs.findIndex(function (i) {
                                            return i.itemID == item.itemID && i.timestamp == item.timestamp && i.deviceID == item.deviceID;
                                        }) < 0;
                                    });
                                    var arr = order.saleOrder.logs.concat(orderClient);
                                    order.saleOrder.logs = arr;

                                    //B2: Tính toán lại số lượng dựa trên logs
                                    var groupLog = groupBy(order.saleOrder.logs);

                                    //B3: Cập nhật lại số lượng item
                                    groupLog.forEach(function (log) {
                                        debugger;
                                        var index = order.saleOrder.orderDetails.findIndex(function (d) {
                                            return d.itemId == log.itemID;
                                        });
                                        if (log.totalQuantity > 0 && index < 0) {
                                            //Nếu số lượng trong log > 0 và item chưa có trong ds order của server thì thêm vào danh sách details
                                            var itemDetail = data.tables[i].tableOrder[j].saleOrder.orderDetails.find(function (d) {return d.itemId == log.itemID });
                                            order.saleOrder.orderDetails.push(itemDetail);
                                        }
                                        else if (log.totalQuantity > 0 && index >= 0) {
                                            //Nếu số lượng trong log > 0 và item đã có trong ds order của server thì cập nhật lại số lượng
                                            var itemDetail = order.saleOrder.orderDetails.find(function (d) { return d.itemId == log.itemID });
                                            itemDetail.quantity = log.totalQuantity;
                                        }
                                        else if (log.totalQuantity <= 0 && index >= 0) {
                                            //Nếu số lượng trong log <= 0 và item đã có trong ds order của server thì xóa item đó đi khỏi danh sách details
                                            var itemDetailIndex = order.saleOrder.orderDetails.findIndex(function (d) { return d.itemId == log.itemID });
                                            order.saleOrder.orderDetails.splice(itemDetailIndex, 1);
                                        }
                                        else if (log.totalQuantity <= 0 && index < 0) {
                                            //Nếu số lượng trong log <= 0 và item chưa có trong ds order của server thì ko thực hiện gì cả.
                                        }
                                    });

                                    //B4: Cập nhật status cho mỗi dòng log là đã cập nhật.
                                    order.saleOrder.logs.forEach(function (log) {
                                        if (!log.status) log.status = true;
                                    });
                                } else {
                                    data.tables[i].tableOrder[j].saleOrder.logs.forEach(function (log) {
                                        log.status = true;
                                    });
                                    t.tableOrder.push(data.tables[i].tableOrder[j]);
                                }
                            }
                        }
                        //Sau khi đã xử lý xong ds bàn và đơn hàng Client gửi lên thì cập nhật lại vào Collection TableOrder trên Server.
                        collection.update({ companyId: data.companyId, storeId: data.storeId }, { $set: { tables: docs[0].tables } }, { w: 1 }, function (err, result) { if (err) logDebug('Error:' + err); });
                        //Giai đoạn 2: Trả về cho tất cả các client trừ client gửi lên.
                        //io.to(id).emit('broadcastOrders', data);
                        //socket.broadcast.to(id).emit('updateOrder', data);
                        //Trả về cho tất cả client
                        io.to(id).emit('updateOrder', data);
                    }
                    //Không khớp shiftId thì trả về exception
                    else {
                        io.to(id).emit('exception', { errorCode: 'invalidShift', data: docs[0] });
                    } 
                }            
            });
        }
        

        var syncOfflineOrder = function (id, data) {
            initShift(id, data);
        }

        var completeOrder = function (id, data) {
            //debugger;
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            var errorLog = db.collection('errorLog');
            var completed = [];
            var responseData = clone(data);
            // Find some documents 
            tableOrder.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {
                //debugger;
                if (err) { logError(err); return; }
                if (docs && docs.length > 0) {
                    shiftIdCur = docs[0].shiftId;
                    //Nếu khớp shiftId thì cập nhật danh sách bàn và orders lại trên server.
                    if (shiftIdCur == shiftIdReq) {
                        if (data.tables && data.tables.length > 0) {
                            if (!docs[0].tables || docs[0].tables.length == 0) docs[0].tables = [];

                            //Lặp qua từng bàn mà client gửi lên.
                            for (var i = 0; i < data.tables.length; i++) {
                                if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;

                                //Lặp qua từng order của bàn đó.
                                for (var j = 0; j < data.tables[i].tableOrder.length; j++) {
                                    var t = _.findWhere(docs[0].tables, { tableUuid: data.tables[i].tableUuid });
                                    var order = _.find(t.tableOrder, function (tb) { return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid });

                                    //Nếu có order đó đang tồn tại trên ds orders của server. Trường hợp ko tồn tại là dưới client thanh toán khi chưa báo bếp.
                                    if (order) {
                                        logDebug('completed order');
                                        //Xóa order đó ra khỏi ds orders trên server.
                                        t.tableOrder.splice(t.tableOrder.indexOf(order), 1);
                                        //Lấy thông tin cho history
                                        var tbs = _.find(completed, function (tb) { return tb && tb.tableUuid == data.tables[i].tableUuid });
                                        if (!tbs) {
                                            tbs = {
                                                tableUuid: data.tables[i].tableUuid,
                                                tableId: data.tables[i].tableId,
                                                tableIdInZone: data.tables[i].tableIdInZone,
                                                tableName: data.tables[i].tableName,
                                                tableZone: data.tables[i].tableZone,
                                                tableStatus: data.tables[i].tableStatus,
                                                tableOrder: []
                                            };
                                            completed.push(tbs);
                                        }
                                        tbs.tableOrder.push(order);
                                    }
                                }
                            }
                            //Xử lý xong hết thì cập nhật lại
                            tableOrder.update({ companyId: data.companyId, storeId: data.storeId }, { $set: { tables: docs[0].tables } }, { w: 1 }, function (err, result) {
                                if (err) logDebug('Error:' + err);
                            });
                            data = docs[0];
                        }
                        else {
                            data = docs[0];
                        }
                    }
                }

                //Nếu shift ko khớp thì gửi về exception cho client. 
                //Trường hợp client treo máy nhưng ko tắt browser (vd: Sleep) dẫn đến không reload được và sau đó submit order lên server.
                if (shiftIdCur != shiftIdReq) {
                    socket.emit('exception', { errorCode: 'invalidShift', data: docs[0] });
                }
                else {
                    //Gửi về cho tất cả các clients trong room khác ngoài client đã gửi lên.
                    socket.broadcast.to(id).emit('completeOrder', responseData);
                    //Cập nhật thông tin history
                    if (completed.length > 0) {
                        history.find({ companyId: data.companyId, storeId: data.storeId, shiftId: shiftIdCur }).toArray(function (err, docs) {
                            if (err) logError(err);
                            if (!docs || docs.length == 0 || !docs[0]) {
                                docs = [];
                                docs[0] = data;
                                docs[0].tables = [];
                                history.insert(docs[0], function (err, doc) {
                                    if (err) logDebug('Error:' + err);
                                });
                            };
                            if (!docs[0].tables) docs[0].tables = [];
                            for (var i = 0; i < completed.length; i++) {
                                var tb = _.find(docs[0].tables, function (tb) { return tb.tableUuid == completed[i].tableUuid });
                                if (tb) {
                                    for (var r = 0; r < completed[i].tableOrder.length; r++) {
                                        tb.tableOrder.push(completed[i].tableOrder[r]);
                                    }
                                }
                                else {
                                    docs[0].tables.push(completed[i]);
                                }
                            }
                            history.update({
                                companyId: data.companyId, storeId: data.storeId,
                                shiftId: shiftIdCur
                            }, { $set: { tables: docs[0].tables } }, { w: 1 }, function (err, result) {
                                if (err) logDebug('Error:' + err);
                            });
                        });
                    }
                }          
            });
        };

        var moveOrder = function (id, data){
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            var errorLog = db.collection('errorLog');
            var completed = [];
            var responseData = clone(data);
            // Find some documents 
            tableOrder.find({companyId: data.companyId, storeId : data.storeId}).toArray(function(err, docs) {
             if (err) 
			 {
				 logError(err);
				 return;
			 }
             if (docs && docs.length > 0)
             {
                 shiftIdCur = docs[0].shiftId; 
                 if (data.tables && data.tables.length > 0 && shiftIdReq == shiftIdCur) 
                 {
                    // Tim order xoa order o ban cu
                     if (!docs[0].tables || docs[0].tables.length == 0) docs[0].tables = [];
                    var t = _.findWhere(docs[0].tables, {tableUuid : data.fromTableUuid});
                    //Kiểm tra xem bàn nguồn (fromTableuuid) có tồn tại trên server hay ko?
                    if (t) 
                    {
                        var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.fromSaleOrderUuid});
                        dirDebug(order);
                        //Nếu order nguồn (fromSaleOrderUuid) có tồn tại trên ds orders của server thì xóa order đó ra khỏi danh sách
                        if (order)
                        {
                            logDebug('completed order');
                            t.tableOrder.splice(t.tableOrder.indexOf(order),1);
                            //Lấy thông tin cho history
                            var tbs = _.find(completed, function(tb){return tb && tb.tableUuid == data.tables[0].tableUuid});
                            if (!tbs) 
                            {
                                tbs =  {tableUuid: data.tables[0].tableUuid,
                                        tableId: data.tables[0].tableId,
                                        tableIdInZone: data.tables[0].tableIdInZone,
                                        tableName: data.tables[0].tableName,
                                        tableZone: data.tables[0].tableZone,
                                        tableStatus: data.tables[0].tableStatus,
                                        tableOrder: []};
                                completed.push(tbs);
                            }
                            tbs.tableOrder.push(order);
                        }
                    }

                     tableOrder.update({companyId: data.companyId, storeId : data.storeId}, {$set:{tables:docs[0].tables}}, {w:1}, function(err, result) {
                         if (err) logDebug('Error:' + err);
                     });

                     // Cap nhat order cho ban moi
                     logDebug('compare');
                     if (!docs[0].tables || docs[0].tables.length == 0) docs[0].tables = [];
                     for(var i = 0; i < data.tables.length; i++)
                     {
                        logDebug('tableOrder[' + i + ']:');
                        dirDebug(data.tables[i].tableOrder);
                        if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;
                        logDebug('tableOrder[' + i + '].length:', data.tables[i].tableOrder.length);
                        for (var j = 0; j < data.tables[i].tableOrder.length; j++) 
                        {
                            //Tìm bàn trên trong danh sách bàn trên server trùng với bàn mà client gửi lên.
                            var t = _.findWhere(docs[0].tables, {tableUuid : data.tables[i].tableUuid});
                            logDebug('t:');
                            dirDebug(t);
                            if (t) 
                            {
                                //Tìm order trên trong ds order trên server trùng với ds orders mà client gửi lên của bàn đó
                                var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid});
                                logDebug('order:');
                                dirDebug(order);
                                //Cập nhật hoặc thêm vào ds order của bàn đó
                                if (order)
                                {
                                    t.tableOrder[t.tableOrder.indexOf(order)] = data.tables[i].tableOrder[j]; 
                                    logDebug('order is updated');
                                }
                                else
                                {
                                    t.tableOrder.push(data.tables[i].tableOrder[j]);
                                    logDebug('order is inserted');
                                }
                            }
                            else
                            {
                                docs[0].tables.push(data.tables[i]);
                                logDebug('tableOrder is inserted');
                            }
                        }
                     }
                     //Cập nhật lại dữ liệu sau khi xử lý xong.
                     tableOrder.update({companyId: data.companyId, storeId : data.storeId}, {$set:{tables:docs[0].tables}}, {w:1}, function(err, result) {
                         if (err) logDebug('Error:' + err);
                     });
                     data = docs[0];
                 }
                 else
                 {
                     data = docs[0];
                 }
             }

            logDebug('shiftIdReq :' + shiftIdReq + ' shiftIdCur : ' + shiftIdCur + ' result = ' + (shiftIdReq == shiftIdCur));
            //Thông tin shift không match
            if (!shiftIdReq || !shiftIdCur || shiftIdReq != shiftIdCur)
            {
              logDebug('exception, request shiftId ' + shiftIdReq + ' does not match with current ' + shiftIdCur + ' tableOrder: ' + data);
              //io.to(id).emit('exception', data);
              socket.emit('exception', {errorCode: 'invalidShift', data: data});
            }
            //Cập nhật thông tin shift
            else
            {
               logDebug('broadcastOrders' + JSON.stringify(data));
               //io.to(id).emit('broadcastOrders', data);
               socket.broadcast.to(id).emit('moveOrder', responseData);
            }
            //Cập nhật thông tin history
            logDebug('completed length:' + completed.length);
            dirDebug(completed);
            if (completed.length > 0)
            {
                history.find({companyId: data.companyId, storeId : data.storeId, shiftId: shiftIdCur}).toArray(function(err, docs){ 
                        if (err) logError(err); 
                        if (!docs || docs.length == 0 || !docs[0]) {
                            docs = []; 
                            docs[0] = data; 
                            docs[0].tables = [];
                            history.insert(docs[0], function(err,doc){
                                if (err) logDebug('Error:' + err);});
                        };
                        if (!docs[0].tables) docs[0].tables = [];
                        logDebug('hisDocs');
                        dirDebug(docs[0]);
                        for(var i = 0; i < completed.length; i++)
                        {
                            var tb = _.find(docs[0].tables, function(tb){return tb.tableUuid == completed[i].tableUuid});
                            if (tb)
                            {
                                logDebug('history updated');
                                tb.tableOrder.push(completed[i].tableOrder);
                            }
                            else
                            {
                                logDebug('history inserted');
                                docs[0].tables.push(completed[i]);
                            }
                        }
                        logDebug('hisDocs updated');
                        dirDebug(docs[0]);
                        history.update({companyId: data.companyId, storeId : data.storeId, 
                                        shiftId: shiftIdCur}, {$set:{tables:docs[0].tables}}, {w:1}, function(err, result) {
                                if (err) logDebug('Error:' + err);
                            });
                    });
                }
            });
        };

        var completeShift = function (id, data) {
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            // Find some documents 
            tableOrder.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {
             if (docs && docs.length > 0)
             {
                shiftIdCur = docs[0].shiftId; 
                if (shiftIdReq == shiftIdCur)
                {
                    //Xóa shift khỏi danh sách shift hiện tại trên server.
                    tableOrder.remove({companyId: data.companyId, storeId : data.storeId}, function(err, result) {
                     if (err) logDebug('Error:' + err);
                    });
                    var now = new Date();
                    //Cập nhật shift vào history để kiểm tra lại khi cần.
                    history.update({ companyId: data.companyId, storeId: data.storeId, shiftId: shiftIdCur }, { $set: { finishDate: now } }, { w: 1 }, function (err, result) {
                     if (err) logDebug('Error:' + err);
                    });
                }
                else
                {
                    logDebug('exception');    
                }
             }
             else
             {
                 logDebug('exception');
             }
            logDebug('shiftIdReq :' + shiftIdReq + ' shiftIdCur : ' + shiftIdCur + ' result = ' + (shiftIdReq == shiftIdCur));
            //Thông tin shift không match
            if (!shiftIdReq || !shiftIdCur || shiftIdReq != shiftIdCur)
            {
              logDebug('exception, request shiftId ' + shiftIdReq + ' does not match with current ' + shiftIdCur + ' tableOrder: ' + data);
              //io.to(id).emit('exception', data); 
              socket.emit('exception', {errorCode: 'invalidShift', data: data});
            }
            //Cập nhật thông tin shift
            else
            {
                logDebug('completeShift' + JSON.stringify(data));
               //io.to(id).emit('broadcastOrders', data); 
               io.to(id).emit('completeShift', data);
            }
            });
        };

        var printHelper = function (id, data){
            socket.broadcast.to(id).emit('printHelper', data);
        };
        
        var doAuth = function (data, callback) {
            if (!data || !data.clientId) 
            {
                socket.emit('exception', {errorCode: 'unauthorizedClientId', data: data});
                return;
            }
            var userSession = cache.get(data.clientId);
            if (!userSession)
            {
                performRequest(AUTH_URL,'/api/provider/GetUserSession', 'GET', {clientId: data.clientId, format:'json'}, 
                    function (res) {
                    if (!res) return;
                    if (data.companyId && res.userSession && res.userSession.companyId == data.companyId)
                    {
                        cache.put(data.clientId, res.userSession, CACHE_TIME_OUT);
                        callback(data);
                    }
                    else
                    {
                        logDebug('unauthorized clientId' + data.clientId);
                    }
                  },
                    function (error) {
                      console.log(error);
                      logDebug(error);
                      socket.emit('exception', { errorCode: 'badRequest', data: data });
                  }
                );
            }
            else
            {
                if (data.companyId && userSession.companyId == data.companyId) callback(data);
            }
        };
            
        var performRequest = function (host, endpoint, method, data, success, error) {
          var dataString = JSON.stringify(data);
          var headers = {};

          if (method == 'GET') {
            endpoint += '?' + querystring.stringify(data);
          }
          else {
            headers = {
              'Content-Type': 'application/json',
              'Content-Length': dataString.length
            };
          }
          var options = {
            //host: host,
            port: 6985,
            path: endpoint,
            method: method,
            headers: headers
          };
          var req = https.request(options, function (res) {
              res.setEncoding('utf-8');
                var responseString = '';

                res.on('data', function (data) {
                  responseString += data;
                });

                res.on('end', function () {
                    try
                    {
                      logDebug(responseString);
                      var responseObject = JSON.parse(responseString);
                      success(responseObject);
                    }
                    catch(ex)
                    {
                        error(ex);
                    }
                });
          });

          req.write(dataString);
          req.end();
        }
    });


    var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    var logError = function(data, err){
        var error = {
                         companyId: data.companyId, 
                         storeId: data.storeId, 
                         clientId: data.clientId, 
                         ipAddress: data.ipAddress, 
                         errorTime: new Date(),
                         errorMessage: err.message,
                         sourceData: JSON.stringify(data)
                        };
            var errorLog = db.collection('errorLog');
            errorLog.insert(error, function(err){
				logger.error(err);
			});
        };
        
    var logDebug = function(data)
    {
        if (DEBUG) logger.log('debug',data); 
    };

    var dirDebug = function(data)
    {
        if (DEBUG) logger.log('debug',data);
    };
    
    db.createCollection('tableOrder', function(err, collection) { 
        if (err) logError(err);
    });
    db.createCollection('tableOrderHistory', function(err, history) { 
        if (err) logError(err);
    });
    db.createCollection('serverLog', function (err, history) {
        if (err) logError(err);
    });
    db.createCollection('errorLog', function(err, errorLog) { 
        if (err) logError(err);
    });
    
    //Clear cache
    cache.clear();
    
    logger.log('debug',"Connected correctly to server");
    logger.log('debug',"Listening on port " + port);
	logger.log('debug','Suno Cafe started.')
});