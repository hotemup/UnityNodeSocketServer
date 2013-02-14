var net = require('net')
, crypto = require('crypto')
, $ = require('mongous').Mongous;
var secret = 'keyboard cat'; //the secret key used by the authentication sever.. Should match up with app.js

var HOST = '0.0.0.0';
var PORT = 3004;
var users = [];
net.createServer(function(sock) {
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
	sock.isAuthenticated=false;
	users.push(sock);
	sock.on('data', function(data) {
                //check for end of stream value
	if(data.toString().indexOf("<policy-file-request/>")!=-1)
	{
		sock.write('<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="3000-3010"/> </cross-domain-policy>');
		sock.write('/n');
		console.log("Sent crossdomain.xml");
	}
	if(data.length==1 && data[0]==0)
	{
		if(sock.data!=null)
		{
			data=concat(sock.data, data);
			sock.data=null;
		}
		//slice off the end of transmission
		data=data.slice(0, data.length-1);
		//security settings for unity web player
		$("Session.sessions").find({"_id" :parseSignedCookie(data.toString(), secret)}, function(r) {
			if(r.documents[0]!=null)
			{
				console.log("User was successfully authenticated");
				sock.isAuthenticated=true;
			}
			else//auth failed, close the connection
			{
				console.log("Invalid authentication - evil hacker detected");
				sock.destroy()
			}
		});	
	}
	else if(data.length==1 && data[0]==1 && sock.isAuthenticated) //generic data handler for everything else
	{
		console.log("Something else");
		//do something
	}
	else if(data.length==1 && data[0]==2)//ping back the client
	{
		console.log("Got a ping");
		sock.write("a");
	}
	else //stil in mid transition
	{
		if(sock.data!=null) //append the new data to already existing data
		{
			sock.data=concat(sock.data,data);
		}
		else
		{
			sock.data=data;
		}
	}
	});
	sock.on('close', function(data) {
		users.splice(users.indexOf(sock), 1);
		console.log(users+"left\n");
		console.log('Closed: ' + sock.remoteAddress + ':' +sock.remotePort);
	});

}).listen(PORT, HOST);


concat = function (buf1, buf2)
{
	var tmp = [];
	tmp[0]=buf1;;
	tmp[1]=buf2;;
	return Buffer.concat(tmp);
}
parseSignedCookie = function(str, secret){
  return 0 == str.indexOf('s:')
    ? unsign(str.slice(2), secret)
    : str;
};
unsign = function(val, secret){
  var str = val.slice(0, val.lastIndexOf('.'));
  return sign(str, secret) == val
    ? str
    : false;
};
sign = function(val, secret){
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/=+$/, '');
};

console.log('Server listening on ' +HOST + ':' + PORT);

