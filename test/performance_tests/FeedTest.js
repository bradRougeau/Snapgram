var http = require('http')
var querystring = require('querystring')
var path = require('path')

var sessionID = ''
var photosLoaded = {};
var startTime;

var requestPhoto = function(photoPath, requestNum, totalRequests, numPhotos)
{
	var options = {
		host: "localhost",
		port: 8053,
		path: photoPath,
		method: 'GET',
		headers: {'Cookie': 'sid=' + sessionID}
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
			photosLoaded[requestNum]++;
			console.log(photoPath);
			console.log('Request Number: ' + requestNum + " took " + (new Date() - startTime));
				
		});
	});
	
	// set up an event listener to handle any error
	request.on('error', function(e) {
		console.log("error");
	});
	// complete the request
	request.end()
}

var createRequest = function(requestNum, totalRequests)
{
	fullData = '';
	var options = {
		host: "localhost",
		port: 8053,
		path: "/feed",
		method: 'GET',
		headers: {'Cookie': 'sid=' + sessionID}
	}
	var request = http.request(options)

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
			var splitData = fullData.split('<img src="')
			var counter = 0;
			photosLoaded[requestNum] = 0;
			for (var i = 1; i < splitData.length; i++)
			{
				requestPhoto(splitData[i].split('"')[0], requestNum, totalRequests, splitData.length - 1);
				console.log(counter);
				counter++;
			}	
		});
	});
	
	// set up an event listener to handle any error
	request.on('error', function(e) {
		console.log("error");
	});
	// complete the request
	request.end()
}

var createRequests = function(totalRequests)
{
	requestsCompleted = 0;
	startTime = new Date();
	for (var i = 0; i < totalRequests; i++)
	{
		createRequest(i, totalRequests)
	}

}

var login = function()
{
	var options = {
		host: "localhost",
		port: 8053,
		path: "/sessions/create",
		method: 'POST'
	}
	var post_data = querystring.stringify({
	  username: "john",
	  password: "5678"
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
			sessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
			createRequests(1);
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

var createPhotos = function()
{
	var jsonPhotos = JSON.stringify([{id: 20, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 21, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 22, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 23, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 24, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 25, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 26, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 27, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 28, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 29, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 30, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 31, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 32, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 33, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 34, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 35, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 36, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 37, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 38, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 39, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 40, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 41, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 42, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 43, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 44, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 45, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 46, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 47, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 48, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 49, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 50, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 51, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 52, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 53, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 54, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 55, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 56, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 57, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 5678}, 
		{id: 58, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 59, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234},
		{id: 60, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 61, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 62, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 63, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 64, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 65, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 66, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 67, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 68, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 69, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 70, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 71, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 72, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 73, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 74, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 75, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 76, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 77, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 78, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 79, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}, 
		{id: 80, user_id: 1, path: path.normalize(__dirname + '/../image.png'), timestamp: 1234}]);
	
	var options = {
	   host: 'localhost',
	   port: 8053,
	   path: '/bulk/photos?password=zorodi',
	   method: 'POST',
	   headers: {
			'Content-Type': "application/json; charset=utf-8",
			'Content-Length': Buffer.byteLength(jsonPhotos)
		}
	}
	var request = http.request(options);
	request.on('response', function(response) {
		response.on('data', function(data) {
		})
		response.on('end', function(chunk) {
			login();
		});
	 });
	 request.write(jsonPhotos);

	 // complete the request
	 request.end()
}

var createUsers = function()
{
	var jsonUsers = JSON.stringify([{'id': 1, 'name': 'john', follows: [], password: '5678'}]);
	
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
			createPhotos();
		});
	 });
	 request.write(jsonUsers);

	 // complete the request
	 request.end()
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