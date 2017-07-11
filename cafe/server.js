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
winston.remove(winston.transports.Console);
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
var DEBUG = false;
var CACHE_TIME_OUT = 104400000;
var AUTH_URL = 'auth.hugate.demo';
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
            debugger;
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
                        update(id, data);
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
            debugger;
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
                        update(id, data);
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
            debugger;
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
                        console.log(data);
                        move(id, data);
                    }
                }
                catch(ex)
                {
                    data.ipAddress = socket.handshake.address;
                    logError(data, ex);
                }
            });
        });
        socket.on('completeOrder', function (data) {
            debugger;
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
                        complete(id, data);
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
            debugger;
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
            collection.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {
                if (err) logError(err);
                history.find({ companyId: data.companyId, storeId: data.storeId, shiftId: data.shiftId }).toArray(function (errHis, docHis) {
                    if (errHis) logError(errHis);
                    //Giai đoạn 1: Chuẩn bị data
                    //Nếu trong collection tableOrder không có documents nào thuộc companyId và storeId (Trường hợp Init shift lần đầu tiên).
                    if (docs == null || docs == undefined || docs == [] || docs.length == 0) {
                        shiftIdCur = uuid.v4();
                        data.shiftId = shiftIdCur;
                        data.startDate = new Date();
                        responseData.actionType = 1; //Loại là Init
                        //Kết ca -> broadcastOrder -> tables = undefined -> clear shift and table -> reload -> vào trường hợp này.
                        responseData.tables = []; //Trả về dữ liệu rỗng vì không cần phải trả gì xuống Client. (Trước đó đã reload ở dòng 812 PosController)
                        //data lúc này là sơ đồ bàn rỗng.
                        collection.insert(data, function (err, doc) { if (err) logDebug('Error:' + err); else { logDebug('Result:'); dirDebug(doc); }});
                        history.insert(data, function (err, doc) { if (err) logDebug('Error:' + err); else { logDebug('Result:'); dirDebug(doc); } });
                    }
                    //Trường hợp Init Shift các lần sau
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
                                        if (order) {
                                            t.tableOrder[t.tableOrder.indexOf(order)] = data.tables[i].tableOrder[j];
                                            //Thêm hóa đơn đó và data trả về cho Client
                                            var order = clone(data.tables[i].tableOrder[j]);
                                            table.tableOrder.push(order);
                                        }
                                            //Nếu order chưa tồn tại thì kiểm tra trong collection tableOrderHistory
                                            //- Có thì đơn hàng Client gửi lên không hợp lệ (Trường hợp đăng nhập cùng 1 tài khoản trên 2 thiết bị, thoát 1 thiết bị nhưng vẫn còn lưu ở DB Local)
                                            //- Không thì đưa đơn hàng vào ds đơn hàng trên Server.
                                        else {
                                            var orderHis = null;
                                            if (tHis) orderHis = _.find(tHis.tableOrder, function (tbHis) { return tbHis.saleOrder && tbHis.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid });
                                            if (!orderHis) {
                                                //Thêm vào collection.
                                                t.tableOrder.push(data.tables[i].tableOrder[j]);
                                                logDebug('order is inserted');
                                            }
                                            else {
                                                logDebug('order is completed or moved or deleted');
                                            }
                                        }
                                    }
                                    //Nếu bàn mà Client gửi lên chưa tồn tại trong danh sách bàn và đơn hàng trên Server thì thêm bàn đó vào ds. Trường hợp Init gửi tất cả bàn lên Server.
                                    else {
                                        docs[0].tables.push(data.tables[i]);
                                        logDebug('tableOrder is inserted');
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
                });
            });
        };



        var update = function (id, data) {
            debugger;
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            //var responseData = clone(data);
            var collection = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            // Find some documents
            collection.find({ companyId: data.companyId, storeId: data.storeId }).toArray(function (err, docs) {
                if (err) logError(err);
                history.find({ companyId: data.companyId, storeId: data.storeId, shiftId: data.shiftId }).toArray(function (errHis, docHis) {
                    if (errHis) logError(errHis);
                    debugger;
                    //Giai đoạn 1: Chuẩn bị data
                    //Nếu trong collection tableOrder không có documents nào thuộc companyId và storeId (Trường hợp Init shift lần đầu tiên).
                    if (docs == null || docs == undefined || docs == [] || docs.length == 0)
                    {
                        //Tạo mới shiftId.
                        shiftIdCur = uuid.v4();
                        data.shiftId =  shiftIdCur;
                        data.startDate = new Date();
                        //responseData.actionType = 1; //Loại là Init
                        //Kết ca -> broadcastOrder -> tables = undefined -> clear shift and table -> reload -> vào trường hợp này.
                        //responseData.tables = []; //Trả về dữ liệu rỗng vì không cần phải trả gì xuống Client. (Trước đó đã reload ở dòng 812 PosController)
                        collection.insert(data, function(err,doc){
                            if (err) logDebug('Error:' + err);
                            else {logDebug('Result:');dirDebug(doc);}
                        });
                        history.insert(data, function(err,doc){
                            if (err) logDebug('Error:' + err);
                            else {logDebug('Result:');dirDebug(doc);}
                        });
                    }
                    // Nếu trong collection tableOrder đã có (Trường hợp đã được 1 máy Init shift trước đó).
                    else
                    {
                        logDebug('Exist:');
                        dirDebug(docs);
						logDebug('docHis:');
						dirDebug(docHis);
                        //Gán shiftId hiện tại là shiftId trong collection tableOrder.
						shiftIdCur = docs[0].shiftId;
                        //Nếu data Client gửi lên có dữ liệu và shiftId của Client trùng với ShiftId hiện tại. Trường hợp sau khi đã Init.
                        if (data.tables && data.tables.length > 0 && shiftIdReq == shiftIdCur)
                        {
                            logDebug('compare');
                             if (!docs[0].tables || docs[0].tables.length == 0 ) docs[0].tables = [];
                             if (!docHis || !docHis[0] || !docHis[0].tables || docHis[0].tables.length == 0) docHis = [{ tables: [] }];
                             //Lặp qua từng bàn trong ds bàn mà Client gửi lên.
                             for(var i = 0; i < data.tables.length; i++)
                             {
                                logDebug('tableOrder[' + i + ']:');
                                dirDebug(data.tables[i].tableOrder);
                                //Nếu trong bàn đó không có đơn hàng thì chuyển qua bàn khác
                                if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;
                                logDebug('tableOrder[' + i + '].length:', data.tables[i].tableOrder.length);
                                //Thêm bàn đó vào data trả về cho Client
                                var table = clone(data.tables[i]);
                                table.tableOrder = [];
                                //responseData.tables.push(table);

                                //Lặp qua từng hóa đơn trong bàn đó.
                                for (var j = 0; j < data.tables[i].tableOrder.length; j++)
                                {
                                    var t = _.findWhere(docs[0].tables, {tableUuid : data.tables[i].tableUuid});
                                    var tHis = _.findWhere(docHis[0].tables, {tableUuid : data.tables[i].tableUuid});
                                    logDebug('t:');
                                    dirDebug(t);
                                    //Nếu bàn mà Client gửi lên có trong ds bàn và đơn hàng trên Server. Trường hợp khác Init.
                                    if (t)
                                    {
                                        var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid});
                                        logDebug('order:');
                                        dirDebug(order);
                                        //Nếu đơn hàng Client gửi lên đang tồn tại trong ds đơn hàng trên Server thì cập nhật lại đơn hàng đó trên Server.
                                        if (order)
                                        {
                                            t.tableOrder[t.tableOrder.indexOf(order)] = data.tables[i].tableOrder[j];
                                            //Thêm hóa đơn đó và data trả về cho Client
                                            //var order = clone(data.tables[i].tableOrder[j]);
                                            //table.tableOrder.push(order);
                                            logDebug('order is updated');
                                        }
                                        //Nếu order chưa tồn tại thì kiểm tra trong collection tableOrderHistory
                                        //- Có thì đơn hàng Client gửi lên không hợp lệ (Trường hợp đăng nhập cùng 1 tài khoản trên 2 thiết bị, thoát 1 thiết bị nhưng vẫn còn lưu ở DB Local)
                                        //- Không thì đưa đơn hàng vào ds đơn hàng trên Server.
                                        else
                                        {
                                            var orderHis = null;
											logDebug('saleOrderUuId:');
											logDebug(data.tables[i].tableOrder[j].saleOrder.saleOrderUuid);
											logDebug('tHis:');
											dirDebug(tHis.tableOrder);
                                            if (tHis) orderHis = _.find(tHis.tableOrder, function(tbHis){return tbHis.saleOrder && tbHis.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid});
                                            logDebug('orderHis:');
                                            dirDebug(orderHis);
                                            if (!orderHis)
                                            {
                                                //Thêm vào collection.
                                                t.tableOrder.push(data.tables[i].tableOrder[j]);
                                                //Thêm vào dữ liệu trả về.
                                                //var order = clone(data.tables[i].tableOrder[j]);
                                                //table.tableOrder.push(order);
                                                logDebug('order is inserted');
                                            }
                                            else
                                            {
                                                //var order = clone(data.tables[i].tableOrder[j]);
                                                logDebug('order is completed or moved or deleted');
                                            }
                                        }
                                    }
                                    //Nếu bàn mà Client gửi lên chưa tồn tại trong danh sách bàn và đơn hàng trên Server thì thêm bàn đó vào ds. Trường hợp Init gửi tất cả bàn lên Server.
                                    else
                                    {
                                        docs[0].tables.push(data.tables[i]);
                                        logDebug('tableOrder is inserted');
                                    }
                                }
                             }

                             //Sau khi đã xử lý xong ds bàn và đơn hàng Client gửi lên thì cập nhật lại vào Collection TableOrder trên Server.
                             collection.update({companyId: data.companyId, storeId : data.storeId}, {$set:{tables:docs[0].tables}}, {w:1}, function(err, result) {
                                 if (err) logDebug('Error:' + err);
                             });
                             //Gán lại data sẽ trả về cho Client bằng data trên Server sau xử lý.
                             data = docs[0];
                        }
                        //Nếu shift mà Client gửi lên không trùng với shift hiện tại. Trường hợp Init hoặc lấy shiftId từ DB Local
                        else
                        {
                            //Gán lại data sẽ trả về cho Client bằng data hiện tại trên Server.
                            data = docs[0];
                        }
                    }
                    //Giai đoạn 2: Trả data phù hợp về cho Client
                    logDebug('shiftIdReq :' + shiftIdReq + ' shiftIdCur : ' + shiftIdCur + ' result = ' + (shiftIdReq == shiftIdCur));
                    //Chưa có shift nào
                    if (shiftIdReq == '' || shiftIdReq == undefined || shiftIdReq == null)
                    {
                        data.shiftId = shiftIdCur;
                        // logDebug('broadcastOrders' + JSON.stringify(data));
                        io.to(id).emit('broadcastOrders', data);
                        logDebug('sent broadcastOrders (server data)');
                    }
                    else
                    {
                        //Thông tin shift không match. Trường hợp Client gửi lên shift cũ trong DB Local sau khi shift đó đã kết thúc.
                        if (shiftIdReq != shiftIdCur)
                        {
                          logDebug('exception, request shiftId ' + shiftIdReq + ' does not match with current ' + shiftIdCur + ' tableOrder: ' + data);
                          //io.to(id).emit('exception', data);
                          //socket.emit('exception', data);
                          socket.emit('exception', {errorCode: 'invalidShift', data: data});
                          logDebug('sent exception');
                        }
                        //Cập nhật thông tin shift
                        else
                        {
                            debugger;
                           // logDebug('broadcastOrders' + JSON.stringify(data));
                           io.to(id).emit('broadcastOrders', data);
                           logDebug('sent broadcastOrders');
                        }
                    }
                });
            });
        };

        var move = function (id, data){
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            var errorLog = db.collection('errorLog');
            var completed = [];
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
                    if (!docs[0].tables || docs[0].tables.length == 0 ) docs[0].tables = [];
                    var t = _.findWhere(docs[0].tables, {tableUuid : data.fromTableUuid});

                    if (t)
                    {
                        var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.fromSaleOrderUuid});
                        dirDebug(order);
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
                     if (!docs[0].tables || docs[0].tables.length == 0 ) docs[0].tables = [];
                     for(var i = 0; i < data.tables.length; i++)
                     {
                        logDebug('tableOrder[' + i + ']:');
                        dirDebug(data.tables[i].tableOrder);
                        if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;
                        logDebug('tableOrder[' + i + '].length:',data.tables[i].tableOrder.length);
                        for (var j = 0; j < data.tables[i].tableOrder.length; j++)
                        {
                            var t = _.findWhere(docs[0].tables, {tableUuid : data.tables[i].tableUuid});
                            logDebug('t:');
                            dirDebug(t);
                            if (t)
                            {
                                var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid});
                                logDebug('order:');
                                dirDebug(order);
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
               io.to(id).emit('broadcastOrders', data);
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

        var complete = function (id, data){
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            var errorLog = db.collection('errorLog');
            var completed = [];
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
                     if (!docs[0].tables || docs[0].tables.length == 0 ) docs[0].tables = [];
                     for(var i = 0; i < data.tables.length; i++)
                     {
                        dirDebug(data.tables[i].tableOrder);//history
                        if (!data.tables[i].tableOrder || data.tables[i].tableOrder.length == 0) continue;
                        for (var j = 0; j < data.tables[i].tableOrder.length; j++)
                        {
                            var t = _.findWhere(docs[0].tables, {tableUuid : data.tables[i].tableUuid});
                            if (t)
                            {
                                var order = _.find(t.tableOrder, function(tb){return tb.saleOrder && tb.saleOrder.saleOrderUuid == data.tables[i].tableOrder[j].saleOrder.saleOrderUuid});
                                dirDebug(order);
                                if (order)
                                {
                                    logDebug('completed order');
                                    t.tableOrder.splice(t.tableOrder.indexOf(order),1);
                                    //Lấy thông tin cho history
                                    var tbs = _.find(completed, function(tb){return tb && tb.tableUuid == data.tables[i].tableUuid});
                                    if (!tbs)
                                    {
                                        tbs =  {tableUuid: data.tables[i].tableUuid,
                                                tableId: data.tables[i].tableId,
                                                tableIdInZone: data.tables[i].tableIdInZone,
                                                tableName: data.tables[i].tableName,
                                                tableZone: data.tables[i].tableZone,
                                                tableStatus: data.tables[i].tableStatus,
                                                tableOrder: []};
                                        completed.push(tbs);
                                    }
                                    tbs.tableOrder.push(order);
                                }
                            }
                        }
                     }
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
               io.to(id).emit('broadcastOrders', data);
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
											for (var r = 0; r < completed[i].tableOrder.length; r++)
											{
												tb.tableOrder.push(completed[i].tableOrder[r]);
											}
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

        var completeShift = function (id, data){
            var shiftIdReq = data.shiftId;
            var shiftIdCur;
            var tableOrder = db.collection('tableOrder');
            var history = db.collection('tableOrderHistory');
            // Find some documents
            tableOrder.find({companyId: data.companyId, storeId : data.storeId}).toArray(function(err, docs) {
             if (docs && docs.length > 0)
             {
                shiftIdCur = docs[0].shiftId;
                if (shiftIdReq == shiftIdCur)
                {
                    tableOrder.remove({companyId: data.companyId, storeId : data.storeId}, function(err, result) {
                     if (err) logDebug('Error:' + err);
                    });
                    var now = new Date();
                    history.update({companyId: data.companyId, storeId : data.storeId, shiftId : shiftIdCur}, {$set:{finishDate:now }}, {w:1}, function(err, result) {
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
               logDebug('broadcastOrders' + JSON.stringify(data));
               io.to(id).emit('broadcastOrders', data);
            }
            });
        };

        var printHelper = function (id, data){
            socket.broadcast.to(id).emit('printHelper', data);
        };

        var doAuth = function(data, callback){
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
            host: host,
            path: endpoint,
            method: method,
            headers: headers
          };

          var req = https.request(options, function(res) {
              res.setEncoding('utf-8');

                var responseString = '';

                res.on('data', function(data) {
                  responseString += data;
                });

                res.on('end', function() {
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
    db.createCollection('errorLog', function(err, errorLog) {
        if (err) logError(err);
    });

    //Clear cache
    cache.clear();

    logger.log('debug',"Connected correctly to server");
    logger.log('debug',"Listening on port " + port);
	logger.log('debug','Suno Cafe started.')
});
