'use strict';
var request = require('request');
var FB = require('fb');
var kue = require('kue'), 
  queue = kue.createQueue({
    prefix: 'q',
    redis: {
      port: 6379,
      host: 'localhost'
    }
  });



exports.verify = function(req, res) {
  if (req.query['hub.verify_token'] === 'fmapp!@#3') {
      res.send(req.query['hub.challenge'])
   } else{ 
     res.send('Error, wrong token')
   }
};

exports.receiver = function(req, res) {
  if(req.body.field == 'conversations'){
      request.get(req.app.locals.endpoint.pageToken + req.body.value.page_id, {
        'auth': {
          'user': 'nodeapp',
          'pass': '551bfe7d22621ee722e14ad5e8f05264'
        }
      }, function(err,res,body){
        body = JSON.parse( body );
        // Tạo queue query FB sau khi nhận tín hiệu từ webhook
        var q = queue.create('conversations', {
            title : 'get conversation for page ' + body.page_name,
            page_id : req.body.value.page_id,
            page_token : body.page_token,
            thread_key : req.body.value.thread_key
         }).priority('normal').attempts(5).save();
      })
  }
  res.sendStatus(200)
};


var io = require('socket.io-client');
// Thực hiện task conversations
queue.process('get_conversations', (job, done) => { 
  FB.setAccessToken(job.data.page_token);
  FB.api(job.data.thread_key, {fields: 'messages.limit(1){message,from}'}, function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log(res.messages.data);

    //Tạo kết nối socket với Server node kia.
    var url = 'url của server node bên kia';
    var pID = res.messages.prop //pageID để kết nối đến.
    var socket = io(url, { query : { pageID : pID } });

    //Lắng nghe sự kiện kết nối thành công với Server node bên kia để gửi conversation.
    socket.on('sv-nodesv-is-connected', function(){
      var data = { messageID : 'Lấy dữ liệu msgID bỏ vào đây' } //Dữ liệu gửi cho Server node bên kia.
      socket.emit('clt-send-messageID', data);
      socket.disconnect();
    });
  });
  done();
});