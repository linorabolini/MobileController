'use strict';

var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  debug('a user connected');
  socket.emit('connection');

  socket.on('register as server', function() {
    Server(socket);
  });

  socket.on('register as client', function() {
    Client(socket);
  });
});

http.listen(3000, function() {
  debug('listening on *:3000');
});

function Server(socket) {
  debug('a server registered');
  socket.join('servers');

  // disconnection
  socket.on('disconnect', function() {
    debug('server disconnected');
  });
}

function Client(socket) {
  debug('a client registered');
  socket.join('clients');

  socket.broadcast.to('servers').emit('client connection', { id: socket.id });

  // message
  socket.on('message', function(msg) {
    msg.id = socket.id;
    socket.broadcast.to('servers').emit('message', msg);
  });

  // disconnection
  socket.on('disconnect', function() {
    debug('user disconnected');
  });
}

function debug() {
  var i;
  console.log('\n===== DEBUG ======\n');
  for (i in arguments) {
    console.log(arguments[i]);
  }
}
