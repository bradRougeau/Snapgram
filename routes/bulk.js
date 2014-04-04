var path = require('path');
var fs = require('fs');
var imagemagick = require('imagemagick');
var gm = require('gm').subClass({ imageMagick: true });
/*
 * bulk data operations
 */

exports.clear = function(req, res){
	if (req.query.password == "zorodi")
	{
		var finished = 0;
		userClear = "DELETE FROM User"
		photoClear = "DELETE FROM Photo"
		followClear = "DELETE FROM Follow"
		feedClear = "DELETE FROM Feed"
		shareClear = "DELETE FROM Share"

		mysql = require('mysql');
		conn = mysql.createConnection({
			host: 'web2.cpsc.ucalgary.ca',
			user: 's513_bjrougea',
			password: '10013253',
			database: 's513_bjrougea'
		});

		conn.connect();

		conn.query(userClear, function(err, rows, fields) {
			finished++;
		   if (err) throw err;
		   if (finished == 5)
		   {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('DB cleared');
		   }
		});
		
		conn.query(photoClear, function(err, rows, fields) {
			finished++;
		   if (err) throw err;
		   if (finished == 5)
		   {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('DB cleared');
		   }
		});
		
		conn.query(followClear, function(err, rows, fields) {
			finished++;
		   if (err) throw err;
		   if (finished == 5)
		   {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('DB cleared');
		   }
		});
		
		conn.query(feedClear, function(err, rows, fields) {
			finished++;
		   if (err) throw err;
		   if (finished == 5)
		   {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('DB cleared');
		   }
		});
		
		conn.query(shareClear, function(err, rows, fields) {
			finished++;
		   if (err) throw err;
		   if (finished == 5)
		   {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('DB cleared');
		   }
		});

		conn.end();
	}
	else
	{
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Incorrect password, no action taken');
	}
};

exports.users = function(req, res){
	if (req.query.password == "zorodi")
	{
		var crypto = require('crypto');
		numberOfUsers = req.body.length
		numUsersDone = 0
		var followerDict = {};
		for (var i = 0; i < req.body.length; i++)
		{
			followerDict[req.body[i].id] = req.body[i].follows
			password = crypto.createHash('sha256').update(req.body[i].password).digest('hex');
			req.models.User.create([
			{
				id: req.body[i].id,
				FullName: "Bulk User",
				Username: req.body[i].name,
				Password: password
			}
			], function (err, items) {
				if (err) throw err;
				userID = items[0]['id']
				followers = followerDict[userID]
				for (var j = 0; j < followers.length; j++)
				{
					req.models.Follow.create([
					{
						follower_id: userID,
						followee_id: followers[j]
					}
					], function (err, items) {
						if (err) throw err;
						if (j == followers.length-1)
						{
							numUsersDone++;
							if (numUsersDone == numberOfUsers-1)
							{
								res.writeHead(200, {'Content-Type': 'text/plain'});
								res.end('Added users');
							}
						}
					});
				}
				if (followers.length == 0)
				{
					numUsersDone++;
					if (numUsersDone == numberOfUsers)
					{
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.end('Added users');
					}
				}
			});
		}
		if (req.body.length == 0)
		{
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Added users');
		}
	}
	else
	{
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Incorrect password, no action taken');
	}
};

exports.photos = function(req, res){
	if (req.query.password == "zorodi")
	{
		var loadedPhotos = 0;
		var photos = req.body
		
		for (var i = 0; i < photos.length; i++)
		{
			req.models.Photo.create([
			{
				id: photos[i].id+1,
				owner_id: photos[i].user_id,
				Path: photos[i].path,
				Timestamp: photos[i].timestamp
			}
			], function (err, items) {
				var extension = items[0].Path.split(".")[1];
				var newPath = path.normalize(__dirname + "/../photos/" + items[0].id + "." + extension)
				var thumbPath = path.normalize(__dirname + "/../photos/thumbnail/" + items[0].id + "." + extension)
				fs.createReadStream(items[0].Path).pipe(fs.createWriteStream(newPath));
				gm(items[0].Path).resize(400).write(thumbPath, function(err) {
					loadedPhotos++
					if (err) throw err;
					if (loadedPhotos == photos.length)
					{
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.end('Added photos');
					}
				});
			});
		}
		if (photos.length == 0)
		{
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Added photos');
		}
	}
	else
	{
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Incorrect password, no action taken');
	}
};
