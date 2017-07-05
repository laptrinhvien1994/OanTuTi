const express = require('express');
const app = express();
//Create an instance of Server
const server = require('http').Server(app);
const io = require('socket.io')(server);

//Set up
app.set('view engine', 'ejs');
app.use('/resources', express.static('resources'));

//Routing
app.get('/', function(req, res){
  res.render('index');
});

app.get('*', function(req,res){
  res.redirect('/');
});

//Socket Connection

var sockets = [];

io.on('connection', function(socket){
  console.log('Client is connecting');
  //console.log('socket', socket.handshake.query.userID);
  // socket
  // .on('', function(data){
  //
  // })
  // .on('', function(data){
  //
  // })
  // .on('', function(data){
  //
  // })
  // .on('', function(data){
  //
  // })
  // .emit('',)
  // .emit('',)
  // .emit('',)
  // .emit('',)
  // .emit('',)
  // .emit('',);

});

server.listen(9999, function(){
  console.log('Server was started');
});
