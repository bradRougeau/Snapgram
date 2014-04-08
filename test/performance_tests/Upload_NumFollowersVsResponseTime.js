var FormData = require("form-data");
var http = require("http");
var path = require("path");
var fs = require("fs");
var querystring = require("querystring");
var sessionID = ''
var startTime = 0

var uploadPhoto = function(numFollowers, data)
{
	var options = {
		host: "localhost",
		port: 8053,
		path: "/photos/create",
		method: 'POST'
	}

	var form = new FormData();
	form.append("image", fs.createReadStream(path.normalize(__dirname + "/../image.png")));
	options.headers = form.getHeaders()
	options.headers['Cookie'] = 'sid=' + sessionID
	var request = http.request(options)

	// set up an event listener to handle a response
	request.on('response', function(response) {
		// we are expecting utf8 encoded data
		response.setEncoding('utf8')
		// set up an event listener to be called when each
		// chunk of data arrives
		response.on('data', function(data) {
		})
		// set up an event listener to be called when response
		// is complete
		response.on('end', function() {
			console.log(numFollowers + ',' + (new Date() - startTime))
			if (numFollowers < 99)
			{
				makeRequest(numFollowers+1, data)
			}
		});
	});
	
	// set up an event listener to handle any error
	request.on('error', function(e) {
		console.log("error");
	});
	form.pipe(request);
}

var login = function(numFollowers, userInfo, data)
{
	var options = {
		host: "localhost",
		port: 8053,
		path: "/sessions/create",
		method: 'POST'
	}
	var post_data = querystring.stringify({
	  username: userInfo['name'],
	  password: userInfo['password']
	});
	options.method = "POST";
	options.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': post_data.length
					 }
	var request = http.request(options)

	// set up an event listener to handle a response
	request.on('response', function(response) {
		// we are expecting utf8 encoded data
		response.setEncoding('utf8')
		// set up an event listener to be called when each
		// chunk of data arrives
		response.on('data', function(data) {
		})
		// set up an event listener to be called when response
		// is complete
		response.on('end', function() {
			//Ugly code to get session cookie
			startTime = new Date();
			sessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
			uploadPhoto(numFollowers, data);
			//and the user ID
			/**firstUserID = response.headers['set-cookie'][0].split('id%22%3A')[1].split('%7D%7D')[0];*/
		});
	});
	
	// set up an event listener to handle any error
	request.on('error', function(e) {
		console.log("error");
	})
	request.write(post_data);
	// complete the request
	request.end()
}

var makeRequest = function(numFollowers, data)
{
	login(numFollowers, data[numFollowers], data);
}

var createUsers = function()
{
	fs.readFile('users.json', 'utf8', function (err, data) {
	  if (err) {
		console.log('Error: ' + err);
		return;
	  }
	 
	  data = JSON.parse(data);
	  jsonUsers = JSON.stringify(data);
	
		var options = {
		   host: 'localhost',
		   port: 8053,
		   path: '/bulk/users?password=zorodi',
		   method: 'POST',
		   headers: {
				'Content-Type': "application/json; charset=utf-8",
				'Content-Length': Buffer.byteLength(jsonUsers)
			}
		}
		var request = http.request(options);
		request.on('response', function(response) {
			response.on('data', function(data) {
			})
			response.on('end', function(chunk) {
				makeRequest(0, data);
				console.log('here');
			});
		 });

		 // complete the request
		 request.end(jsonUsers);
	 });
}

var clearDatabase = function()
{
	var options = {
		host: "localhost",
		port: 8053,
		path: "/bulk/clear?password=zorodi",
		method: 'GET'
	}
	var request = http.request(options);
	var fullData = '';

	// set up an event listener to handle a response
	request.on('response', function(response) {
		// we are expecting utf8 encoded data
		response.setEncoding('utf8')
		// set up an event listener to be called when each
		// chunk of data arrives
		response.on('data', function(data) {
			fullData += data;
		})
		// set up an event listener to be called when response
		// is complete
		response.on('end', function() {
			createUsers();
		});
	});

	// set up an event listener to handle any error
	request.on('error', function(e) {
		console.log("error");
	})
	// complete the request
	request.end()
}

clearDatabase();