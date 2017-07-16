const User = require('./user');
var Room = function(roomName, password, hostID){
  this.roomName = roomName;
  this.password = password;
  this.host = hostID;
  this.players = [];
  this.viewers = [];
};

Room.prototype.addPlayer = funnction(player){
  this.players.push(player);
};

module.exports = Room;
