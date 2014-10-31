'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

io.on('connection', function(socket){
  console.log('a user connected');

  // answer handshake
  socket.emit('connection');


  // create servers
  //============================================

  socket.on('register as server', function(msg){
    console.log('a server registered');
    socket.join('servers');

    // disconnection
    socket.on('disconnect', function () {
      console.log('server disconnected');
    });
  });
  //============================================




  // create clients
  //============================================

  socket.on('register as client', function(msg){
    console.log('a client registered');
    socket.join('clients');

    // message
    socket.on('message', function(msg){
      socket.broadcast.to('servers').emit('message', msg);
    });

    // disconnection
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
  //============================================

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

