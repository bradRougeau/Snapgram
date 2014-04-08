var http = require('http'),
 querystring = require('querystring')
 
var jsonUsers = JSON.stringify([{id: 1, name: 'steve', follows: [], password: '1234'}, {'id': 5, 'name': 'darren', follows: [1,3,4], password: '5678'}]);

 var options = {
   host: 'localhost',
   port: 8050,
   path: '/bulk/users?password=zorodi',
   method: 'POST',
   headers: {
        'Content-Type': "application/json; charset=utf-8",
        'Content-Length': Buffer.byteLength(jsonUsers)
	}
 }

 // setup the request
 console.log('sending request: ' + options.host + options.path)
 var request = http.request(options, function (res) {
	res.on('data', function(chunk) {
		console.log(chunk.toString());
	});
 });
 request.write(jsonUsers);

 // complete the request
 request.end()
 
 var jsonPhotos = JSON.stringify([{id: 20, user_id: 1, path: '/photos/Canada.png', timestamp: 1234}, {id: 21, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 22, user_id: 1, path: '/photos/Canada.png', timestamp: 1234}, {id: 23, user_id: 1, path: '/photos/Canada.png', timestamp: 1234}, {id: 24, user_id: 1, path: '/photos/Canada.png', timestamp: 1234}, {id: 25, user_id: 1, path: '/photos/Canada.png', timestamp: 1234}, {id: 26, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 27, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 28, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 29, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 30, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 31, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 32, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 33, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 34, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 35, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 36, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 37, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 38, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 39, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 40, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 41, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 42, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 43, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 44, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 45, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 46, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 47, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 48, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 49, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 50, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 51, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 52, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 53, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}, {id: 54, user_id: 1, path: '/photos/Chile.png', timestamp: 5678}]);

 var options2 = {
   host: 'localhost',
   port: 8050,
   path: '/bulk/photos?password=zorodi',
   method: 'POST',
   headers: {
        'Content-Type': "application/json; charset=utf-8",
        'Content-Length': Buffer.byteLength(jsonPhotos)
	}
 }

 // setup the request
 console.log('sending request: ' + options2.host + options2.path)
 var request2 = http.request(options2, function (res) {
	res.on('data', function(chunk) {
		console.log(chunk.toString());
	});
 });
 request2.write(jsonPhotos);

 // complete the request
 request2.end()