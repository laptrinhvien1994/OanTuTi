const util = require('util');
const User = require('./user');

var Player = function(team){
  this.team = team;
}

util.inhrerits(Player, User);

module.exports = Player;
