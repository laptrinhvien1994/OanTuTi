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
  console.log('Oantuti');
  res.render('index');
});

app.get('*', function(req,res){
  res.redirect('index');
});

//Socket Connection
io.on('connection', function(socket){
  console.log('Client is connecting');
});

server.listen(9999, function(){
  console.log('Server was started');
});
