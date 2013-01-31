var net = require('net');

var HOST = '0.0.0.0';
var PORT = 3004;
var users = [];
net.createServer(function(sock) {
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
	users.push(sock);
	if(users.length>1)
	{
		sock.write("start\n");
	}		
	sock.on('data', function(data) {
		users[0].write(sock.remoteAddress+'\n');	
	});
	sock.on('close', function(data) {
		users.splice(users.indexOf(sock), 1);
		console.log(users+'\n');
		console.log('Closed: ' + sock.remoteAddress + ':' +sock.remotePort);
	});

}).listen(PORT, HOST);

console.log('Server listening on ' +HOST + ':' + PORT);

