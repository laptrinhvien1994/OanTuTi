const express = require('express');
const router = require('./router');
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
app.set('view engine', 'ejs');




//Routing
app.get('/', function(req, res){
  res.render('index');
});

app.get('*', function(req,res){
  res.redirect('/');
});

app.get('/')

//Socket Connection

var sockets = [];

io.on('connection', function(socket){
  //console.log('Client is connecting');
  // socket.userID = socket.handshake.query.userID;
  // console.log(socket.userID);
  // sockets.push(socket.userID);
  socket.on('client-message-content', function(data){
    io.sockets.emit('server-message-content', data);
    socket.broadcast.emit('server-typing-stopped', { senderID: data.senderID });
  })
  .on('client-is-typing', function(data){
    socket.broadcast.emit('server-is-typing', data);
  })
  .on('client-typing-stopped', function(data){
    socket.broadcast.emit('server-typing-stopped', data);
  })
  .on('client-send-choice', function(){

  })
  .on('client-send-start-signal', function(){

  })

});

server.listen(9999, function(){
  console.log('Server was started');
});
