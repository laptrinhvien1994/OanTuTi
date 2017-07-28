


//Page ID dùng để xác định Room.
var pageID = null;
var socket = io.connect('http://localhost:9999',{ query : "pageID="+ pageID });





socket.on('sv-send-msg', function(data){

});


//Sau khi gửi data lên facebook API thì thực hiện emit dữ liệu lên server.
socket.emit('clt-send-msg', data);



//Dùng để gửi tin nhắn.
//recipientID : ID người nhận.
//msgContent : Nội dung tin nhắn.
var sendMsg = function(recipientID, msgContent){

  //Người gửi.
  var recipient = {
    id : recipientID
  };

  var payloadObj = new Object();

  var detectResult = detectAttachmentService(msgContent);
  //Nếu là gửi text
  if(!detectResult){
    payloadObj.text = msgContent;
  }
  //Nếu là gửi attachment
  else {
    payloadObj.attachment = msgContent;
  }
  //Gọi Facebook API để gửi tin nhắn.
  FB.api('')
}

var signalEnum = {
  typingOn: 0,
  typingOff: 1,
  markSeen: 2
};

var msgContentType = {
  text: 1,
  attachment: 2
}

//Xác định định dạng của chuỗi tin nhắn cần gửi.
//text : chuỗi cần xác định định dạng.
var detectAttachmentService = function(text){
  var isHyperLink = detectHyperLink(text);
  if(isHyperLink) return true;
  //Thêm các detect khác vào đây
  return false;
}

//Đùng để xác định chuỗi tin nhắn cần gửi có chứa link hay không.
var detectHyperLink = function(text){
  var pattern = /(https?:\/\/[^\s]+)/g;
  var result = text.match(pattern);
  if(result == null) return false;
  return true;
}




var sendSignal = function(){

}
