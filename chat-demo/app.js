const express = require('express');
const router = require('./router');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
//Create an instance of Server and set up express app.
const server = require('http').Server(app);
const io = require('socket.io')(server);


//Set up middlewares
app.use(bodyParser.json());
app.use('/resources', express.static('resources'));
//route for API.
app.use('/api',router);

//Khi có kết nối từ Server là server node kia  hoặc từ client
//kết nối client vào room.

var sendRequest = function(hostname, url, method, callback){
  var options = {
    hostname: hostname,
    method: method,
    path: url
  }
  var req = https.request(options, callback);
  req.on('error', function(e){
    console.log(e);
  });
}

//Lắng nghe sự kiện connection từ các clients.
io.on('connection', function(socket){

  //Lấy pageID là tên room được gửi từ server node kia và User
  var pageID = socket.handshake.query.pageID;

  //Thêm socket vào room
  socket.join(pageID);
  //Thêm thuộc tính accessToken vào cho socket.
  socket.accessToken = null;
  if(socket.handshake.query.accessToken){
    io.of(pageID).accessToken = socket.handshake.query.accessToken;
  }

  //Gửi tín hiệu xuống server node kia để server node bên kia gửi thread conversation lên server.
  socket.emit('sv-nodesv-is-connected');

  //Lắng nghe tín hiệu từ phía server node.
  socket.on('clt-send-conversation', function(data){
    var threadID = data.threadId;
    //Nếu có accessToken rồi thì đi lấy nội dung của conversation
    if(io.of(pageID).accessToken){
      var queryStr = threadID + '...';
      //Gọi API của Facebook để lấy nội dung của conversation.
      sendRequest('https://facebook.com', queryStr, 'GET', function(res){
        //Nhận xong thì gửi xuống cho User.
        res.on('data', function(chunk){
          //Gửi dữ liệu xuống cho User
          io.to(pageID).emit('sv-send-conversation', chunk);
          //Ngắt kết nối socket.
          socket.disconnection(true);
        });
      });
    }
    //Nếu ko có accessToken thì lấy accessToken từ User
    else{
      var data = { threadID: threadID };
      //Lưu trữ threadID
      io.to(pageID).emit('sv-request-accesstoken', data);
    }

    //Hoặc là gửi thẳng xuống User xử lý, User tự đi request lấy conversation.
    io.to(pageID).emit('sv-send-threadID', data);
  });

  //Lắng nghe tín hiệu khi User gửi accessToken.
  socket.on('clt-send-accesstoken', function(data){
    //Lấy được accessToken mới thì gọi lại để lấy conversation
    io.to(pageID).accessToken = data.accessToken;
    var threadID = data.threadID;
    var queryStr = threadID + '...';
    sendRequest('https://facebook.com', queryStr, 'GET', function(res){
      //Nhận xong thì gửi xuống cho User.
      res.on('data', function(chunk){
        io.to(pageID).emit('sv-send-conversation', chunk);
      });
    });
  });


});

server.listen(9999, function(){
  console.log('Server is listening on PORT 9999');
});
