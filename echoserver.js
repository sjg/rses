// **********************************************************
// Simple TCP Pass Through Server - Node.js
// http://github.com/sjg/
// Coded by Steven Gray - 2012 
// Released under the MIT licence: http://opensource.org/licenses/mit-license
// Use how you want, just give me a h/t ;)
// **********************************************************

var util = require('util'), net = require('net'), fs = require('fs');

var iplist = [];

function update_accept_iplist() {
  util.log("Updating Accept IP List.");
  bufferString = fs.readFileSync('./iplist', "utf8");
  
  //Split the UTF8 Buffer into the Array
  iplist = bufferString.split('\n')
           .filter(function(ip) { return ip.length });
}

function ip_allowed(ip) {
  for (i in iplist) {
    if (iplist[i] == ip) {
      return true;
    }
  }
  return false;
}

function deny(response, msg) {
  response.end(msg + "\r\n");
}

fs.watch('./iplist', function(event) { if(event == "change") { update_accept_iplist(); }});

//Create the Servers
var outServer = net.createServer(function(outStream) {
  outStream.on('data', function(data) {
    util.puts(data);
  });

  var inServer = net.createServer(function(inStream) {
  	console.log('Client connected from: ' + inStream.remoteAddress);
    var current_ip = inStream.remoteAddress;
    if (!ip_allowed(current_ip)) {
    	var message = "IP " + current_ip + " is not allowed to send to this port"
    	deny(inStream, message);
    	util.log(message);
    	return;
    }
  	
  	//If IP Passes Tests then allow client to send data
    inStream.pipe(outStream, {end: false});
  });
  
  inServer.listen(3000, 'localhost');
});

outServer.listen(3001, 'localhost');
update_accept_iplist();
