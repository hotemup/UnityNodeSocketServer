var io = require('socket.io').listen(3004);

io.sockets.on('connection', function (socket) {
 console.log("New connection"); 
 io.sockets.emit('this', { will: 'be received by everyone'});

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function () {
    	console.log("User disconnected");
	io.sockets.emit('user disconnected');
  });
});
