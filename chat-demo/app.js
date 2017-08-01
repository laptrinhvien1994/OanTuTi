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

//Khi có kết nối từ Server làm server node kia  hoặc từ client  gửi lên
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
  var pageID = socket.handshake.query.pageID;
  socket.join(pageID);
  //Gửi tín hiệu xuống server node kia để server node bên kia gửi thread conversation lên server.
  socket.emit('sv-client-is-connected');

  //Lắng nghe tín hiệu từ phía các clients.
  socket.on('clt-send-conversation', function(data){
    //Khi nhận được thread conversation
    var threadID = data.threadId;
    var queryStr = threadID + '...';
    //Gọi API của Facebook để lấy nội dung của conversation.
    sendRequest('https://facebook.com', queryStr, 'GET', function(res){
      //Nhận xong thì gửi xuống cho user.
      res.on('data', function(chunk){
        io.to(pageID).emit('sv-send-conversation', chunk);
      });
    });
  });
});

server.listen(9999, function(){
  console.log('Server is listening on PORT 9999');
});
