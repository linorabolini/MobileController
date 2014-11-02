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

  socket.on('register as server', function(name) {

    var clientRoom = 'clients:' + name;
    
    // close other sockets in the clients room
    var room = findClientsSocket(clientRoom);
    room.forEach(function(client) {
        client.disconnect();
    });

    // create the room
    Server(socket, name);
  });

  socket.on('register as client', function(name) {
    Client(socket, name);
  });
});

http.listen(3000, function() {
  debug('listening on *:3000');
});

function Server(socket, name) {
  var serverRoom = 'server:' + name;
  debug('server registered: ' + serverRoom);

  socket.join(serverRoom);

  // disconnection
  socket.on('disconnect', function() {
    debug('server disconnected');
  });

  socket.emit('registered as server');
}

function Client(socket, name) {
  debug('a client registered');

  var clientRoom = 'clients:' + name;
  var serverRoom = 'server:' + name;

  socket.join(clientRoom);

  socket.broadcast.to(serverRoom).emit('client connection', { id: socket.id });

  // message
  socket.on('message', function(msg) {
    msg.id = socket.id;
    socket.broadcast.to(serverRoom).emit('message', msg);
  });

  // disconnection
  socket.on('disconnect', function() {
    debug('user disconnected');
  });

  socket.emit('registered as client');
}

function debug() {
  var i;
  console.log('\n===== DEBUG ======');
  for (i in arguments) {
    console.log(arguments[i]);
  }
}

function findClientsSocket(roomId, namespace) {
    var res = []
    , ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}
