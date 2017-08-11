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
  //Đi query lấy messages
  //Reference https://developers.facebook.com/docs/graph-api/reference/v2.10/message
  FB.api(job.data.thread_key, {fields: 'messages.limit(1){message,from,created_time}'}, function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log(res.messages.data);

    var pID = job.data.page_id; //pageID để kết nối đến.
    //Nếu tin nhắn này được gửi từ customer của Page thì gửi xuống cho Server node bên kia.
    if(res.messages.data[0].from.id != pID){
      //Tạo kết nối socket với Server node kia.
      var url = 'url của server node bên kia';
      var socket = io(url, { query : { pageID : pID } });

      //Lắng nghe sự kiện kết nối thành công với Server node bên kia để gửi messages.
      socket.on('sv-nodesv-is-connected', function(){
        //Tạo model gửi thông tin cho Server node bên kia.
        // model = {
        //   messages: [{
        //     msgID: number,
        //     msgContent: string,
        //     senderID: number
        //     senderName: string,
        //     senderEmail: string,
        //     createdTime: dateTime
        //   }];
        //   paging: {
        //     cursors:{
        //       before: string,
        //       after: string
        //     },
        //     next: string
        //   },
        //   conversationID: string
        // }
        var messages = [];
        res.messages.data.forEach(function(d){
          messages.push({
            msgID: d.id,
            msgContent: d.message,
            senderID: d.from.id,
            senderName: d.from.name,
            senderEmail: d.from.email,
            createdTime: d.created_time
          });
        });
        var data = {
          messages: messages,
          paging: res.messages.paging,
          conversationID: res.messages.id
        }
        socket.emit('clt-send-message-content', data);
        socket.disconnect();
      });
    }
  });
  done();
});
