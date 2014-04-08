var index = require("../routes/index")
var assert = require("assert")
var http = require("http")
var querystring = require("querystring")
var FormData = require('form-data')
var fs = require('fs')
var path = require('path')

var firstSessionID = '';
var secondSessionID = '';
var firstUserID = 0;
var secondUserID = 0;

var clearDatabase = function()
{

	var options = {
		host: "localhost",
		port: 8050,
		path: "/bulk/clear?password=zorodi",
		method: 'GET'
	}
	
	describe('Clearing database using bulk clear', function() {
	it('should return message indicating sucess', function(done){
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
				assert.equal(200, response.statusCode);
				assert.equal('DB cleared', fullData);
				done();
			});
		});

		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		})
		// complete the request
		request.end()
	});
	});
	
}

var createFirstUser = function()
{

	var options = {
		host: "localhost",
		port: 8050,
		path: "/users/new",
		method: 'GET',
		headers: {}
	}
	
	describe('Opening Registration Form', function(){
	it('should return the registration page', function(done){
	   var request = http.request(options)
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
					assert.equal(200, response.statusCode);
					var formData = fullData.split('<form ')[1].split('</form>')[0]
					assert.equal('method="post" action="/users/create"><p class="bodytext"><label>Full Name&nbsp</label><input type="text" name="fullName"></p><p class="bodytext"><label>Username&nbsp</label><input type="text" name="username"></p><p class="bodytext"><label>Password&nbsp</label><input type="password" name="password"></p><p><input type="submit" name="submit" value="Sign up"></p>', formData);
					done();
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		})
		// complete the request
		request.end()
	});
	});
	
	describe('Registering', function(){
	it('should return 302 and a session cookie', function(done){
		var post_data = querystring.stringify({
		  fullName: "Test User",
		  username: "testUser",
		  password: "testPass"
		});
		options.path = "/users/create";
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
			response.on('data', function() {
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				//Ugly code to get session cookie
				firstSessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
				//and the user ID
				firstUserID = response.headers['set-cookie'][0].split('id%22%3A')[1].split('%7D%7D')[0];
				
				assert.equal('/feed', response.headers['location']);
				assert.equal(302, response.statusCode);
				done();
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		})
		request.write(post_data);
		// complete the request
		request.end()
	});
	});
	
	describe('Logging out', function(){
	it('should return 302 and an empty session cookie', function(done){
		options.path = "/sessions/end";
		options.method = "GET";
		options.headers = {
							  'Cookie': 'sid=' + sessionID
						  }
		var logoutRequest = http.request(options)
	
		// set up an event listener to handle a response
		logoutRequest.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function() {
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				sessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
				//Ugly code to get session cookie
				
				assert.equal(sessionID, 's%3Aj%3A%7B%7D.lS7YENLR7UBnODB%2F4k%2BD88w6x%2BIXP8PcDrSNnZXragI');
				assert.equal('/sessions/new', response.headers['location']);
				assert.equal(302, response.statusCode);
				done();
			});
		});
		
		// set up an event listener to handle any error
		logoutRequest.on('error', function(e) {
			console.log("error");
		})
		// complete the request
		logoutRequest.end()
	});
	});
	
}

var createSecondUser = function()
{

	var options = {
		host: "localhost",
		port: 8050,
		path: "/users/create",
		method: 'POST'
	}
	
	sessionID = ''
	describe('Registering', function(){
	it('should return 302 and a session cookie', function(done){
		var post_data = querystring.stringify({
		  fullName: "Test User2",
		  username: "testUser2",
		  password: "testPass2"
		});
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
			response.on('data', function() {
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				//Ugly code to get session cookie
				secondSessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
				//and the user ID
				secondUserID = response.headers['set-cookie'][0].split('id%22%3A')[1].split('%7D%7D')[0];
				
				assert.equal('/feed', response.headers['location']);
				assert.equal(302, response.statusCode);
				done();
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		})
		request.write(post_data);
		// complete the request
		request.end()
	});
	});
		
	describe('Reading Feed', function(){
	it('should return 200 and no photos', function(done){
		fullData = ''
		options.path = "/feed";
		options.method = "GET";
		options.headers = {
							  'Cookie': 'sid=' + secondSessionID
						  }
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function(data) {
				fullData += data
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				var imageCount = (fullData.match(/thumbContainer/g) || []).length
				assert.equal(0, imageCount);
				assert.equal(200, response.statusCode);
				done();
					
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		});
		// complete the request
		request.end()
	});
	});	
	
}

var followFirstUser = function() 
{
	var options = {
		host: "localhost",
		port: 8050,
		method: 'GET'
	}

	describe('Following first user', function(){
	it("should return a 302 redirect to that user's stream", function(done){
		options.path = "/users/" + firstUserID + "/follow";
		options.headers = { 'Cookie' : 'sid=' + secondSessionID }
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function(data) {
				fullData += data
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				assert.equal(302, response.statusCode);
				assert.equal('/users/' + firstUserID, response.headers['location']);
				done();
					
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		});
		request.end()
	});
	});

}	


var loginAsFirstUser = function()
{
	var options = {
		host: "localhost",
		port: 8050,
		method: 'POST'
	}

	describe('Logging in', function(){
	it('should return 302 and a new session cookie', function(done){
		var post_data = querystring.stringify({
		  username: "testUser",
		  password: "testPass"
		});
		options.path = "/sessions/create";
		options.headers = {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': post_data.length,
							'Cookie': 'sid=' + sessionID
						  }
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function() {
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				//Ugly code to get session cookie
				firstSessionID = response.headers['set-cookie'][0].split('sid=')[1].split(';')[0];
				
				assert.equal('/feed', response.headers['location']);
				assert.equal(302, response.statusCode);
				done();
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		})
		request.write(post_data);
		// complete the request
		request.end()
	});
	});
}

var uploadPhoto = function()
{
	var options = {
		host: "localhost",
		port: 8050,
		path: '/photos/create',
		method: 'POST'
	}

	describe('Uploading Photo', function(){
	it('should return 302 with redirect location being feed', function(done){
		var form = new FormData();
		form.append("image", fs.createReadStream(path.join(__dirname, "image.png")));
		options.headers = form.getHeaders()
		options.headers['Cookie'] = 'sid=' + firstSessionID
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function(data) {
				fullData += data
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				assert.equal(302, response.statusCode);
				assert.equal('/feed', response.headers['location']);
				done();
					
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		});
		form.pipe(request);
	});
	});
}

var checkFirstUserFeed = function()
{
	var options = {
		host: "localhost",
		port: 8050,
		path: '/feed',
		method: 'GET'
	}

	describe('Reading Feed', function(){
	it('should return 200 and one photo', function(done){
		fullData = ''
		options.path = "/feed";
		options.method = "GET";
		options.headers = {
							  'Cookie': 'sid=' + firstSessionID
						  }
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function(data) {
				fullData += data
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				var imageCount = (fullData.match(/thumbContainer/g) || []).length
				assert.equal(1, imageCount);
				assert.equal(200, response.statusCode);
				done();
					
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		});
		// complete the request
		request.end()
	});
	});

}

var checkSecondUserFeed = function()
{
	var options = {
		host: "localhost",
		port: 8050,
		path: '/feed',
		method: 'GET'
	}

	describe('Reading Feed', function(){
	it('should return 200 and one photo', function(done){
		fullData = ''
		options.path = "/feed";
		options.method = "GET";
		options.headers = {
							  'Cookie': 'sid=' + secondSessionID
						  }
		var request = http.request(options)
	
		// set up an event listener to handle a response
		request.on('response', function(response) {
			// we are expecting utf8 encoded data
			response.setEncoding('utf8')
			// set up an event listener to be called when each
			// chunk of data arrives
			response.on('data', function(data) {
				fullData += data
			})
			// set up an event listener to be called when response
			// is complete
			response.on('end', function() {
				var imageCount = (fullData.match(/thumbContainer/g) || []).length
				assert.equal(1, imageCount);
				assert.equal(200, response.statusCode);
				done();
					
			});
		});
		
		// set up an event listener to handle any error
		request.on('error', function(e) {
			console.log("error");
		});
		// complete the request
		request.end()
	});
	});

}

clearDatabase();
createFirstUser();
createSecondUser()
followFirstUser();
loginAsFirstUser();
uploadPhoto();
checkFirstUserFeed();
checkSecondUserFeed();