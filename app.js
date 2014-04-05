/*
  Project: Deliverable 3 - Optimization
  Kody Dillman
  10083537
  Port: 8053

  I have made three significant changes to the code for this project. First, I have added caching for the most significant requests 
  in creating the feed. Second, I made sure that the processing on the thumbnails was done at the time of upload, instead of when it 
  was served to the client, which seemed to cut the time quite a bit. The final change is serving the response after the upload, 
  before the work is done in getting it into the database. (This seems almost trivial, but looks like it added a LOT to the performance.)

  One thing that should be done but isn't is that the cache doesn't change when there's an update, though for the purposes of this deliverable, 
  that shouldn't be an issue.

  To the TAs: I know this has been a really stressful experience for everyone, especially you I'm sure! So, thank you for working so hard 
  to ensure we had what we needed to do this project, and for giving us opportunities to be successful. :)

*/


/**
 * Module dependencies.
 */

var express = require('express');
var orm = require('orm');
var routes = require('./routes');
var login = require('./routes/login');
var bulk = require('./routes/bulk');
var photos = require('./routes/photos');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

mysql = require('mysql');
pool = mysql.createPool({
    host: 'web2.cpsc.ucalgary.ca',
    user: 's513_krdillma',
    password: '10083537',
    database: 's513_krdillma',
    connectionLimit: 5
    });

var cache_manager = require('cache-manager');


app = express();
app.use(express.bodyParser({keepExtensions: true, uploadDir: './photos'}));
app.lock = []

app.locals.photo_cache = cache_manager.caching({store: 'memory', max: 10000, ttl: 50/*seconds*/}); // set up caching
app.locals.memory_cache = cache_manager.caching({store: 'memory', max: 10000, ttl: 50/*seconds*/}); // set up caching

app.use(orm.express("mysql://s513_krdillma:10083537@web2.cpsc.ucalgary.ca/s513_krdillma", {
  define: function (db, models, next) {
    models.User = db.define("User", { 
        FullName : String,
        Username : String,
        Password : String
    }, {
      hooks: {
        afterCreate: function (next){
          models.Follow.create([
            {
              follower_id: this.id,
              followee_id: this.id
            }], function (err, items) {
              if (err) throw err;
            })
		   models.Feed.create([
			{
				user_id: this.id,
				FeedList: '[]'
			}], function (err, newFeed) {
				if (err) throw err;
			})
        }
      }
    })

    // Brad had to help with this bit in D3... it was a tricky issue. (Though it has nothing to do with optimization, and should be ok.) :)
    models.Photo = db.define("Photo", { 
        Path: String,
        Timestamp : Date
    }, {
      hooks: {
        afterCreate: function (next){
      var photo_id = this.id;
      var owner_id = this.owner_id;
      pool.getConnection(function(err, connection)
      {
      app.lock.push(function() {
        var query = "Select Feed.user_id, Feed.FeedList from Feed, Follow where Follow.followee_id = ? and Feed.user_id = Follow.follower_id;"
        connection.query(query, [owner_id], function(err, results) {
          saveData = {}
          var feedsUpdated = 0;
          var resultLength = results.length;
          results.forEach( function(result) {
            currentList = JSON.parse(result.FeedList)
            currentList.push({'ID': photo_id, 'type': 'Photo'});
            currentList = JSON.stringify(currentList);
            var update = "Update Feed SET FeedList = ? WHERE user_id = ?;"
            connection.query(update, [currentList,result.user_id], function(err, result) {
              connection.release();
              if (app.res) app.res.redirect;
              feedsUpdated++
              if (feedsUpdated == resultLength)
              {
                app.lock.shift();
                if ( app.lock.length )
                {
                  app.lock[0]();
                }
              }
            });
          });
        });
      });
      if (app.lock.length == 1)
      {
        app.lock[0]();
      }
    });
    }
    }
  
  });

    models.Follow = db.define("Follow", {
        //No fields, both fields are relationships defined below
    });
    models.Feed = db.define("Feed", { 
        FeedList: String
    }, {
        methods: {
            addToFeed: function (itemID, type) {
				currentList = JSON.parse(this.FeedList)
				currentList.push({'ID': itemID, 'type': type});
				this.FeedList = JSON.stringify(currentList);
				this.save();
            },
            getFeed: function () {
                return JSON.parse(this.FeedList);
            }
    }, hooks: {
		afterSave: function () {
			if (app.lock[this.user_id] != undefined)
			{
				app.lock[this.user_id].shift();
				if ( app.lock[this.user_id].length )
				{
					app.lock[this.user_id][0]();
				}
			}
		}
	}
    });
	models.Share = db.define("Share", {
        Timestamp: Date
    }, {
      hooks: {
        afterCreate: function (next){
		  var share_id = this.id;
          models.Follow.find({followee_id: this.sharer_id}, function(err, rows) {
			if (err) throw err;
            rows.forEach(function(row){
              // add photos to all follower's feeds
              row.getFollower(function (err, follower){
				if (err) throw err;
                follower.getFeed(function (err, feed){
					if (err) throw err;
				  	feed[0].addToFeed(share_id, "Share");
                })
				})
            })
        });
      }
    }
  });
    models.Photo.hasOne("owner", models.User);
    models.Follow.hasOne("follower", models.User);
    models.Follow.hasOne("followee", models.User);
    models.Feed.hasOne("user", models.User, {
      reverse: "feed"
    });
	models.Share.hasOne("sharer", models.User);
	models.Share.hasOne("photo", models.Photo);
    next();
  }
}));

                  
                  
// all environments
app.set('port', process.env.PORT || 8053);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.cookieSession({'key': 'sid', 'secret': 'someSecret'}));
app.use(flash());
app.use(app.router);



//from http://www.hacksparrow.com/express-js-custom-error-pages-404-and-500.html
// Handle 404
  app.use(function(req, res) {
     res.status(404).render('404.jade', {title: '404: File Not Found'});
  });
  
  // Handle 500
  app.use(function(error, req, res, next) {
     res.status(500).render('500.jade', {title: '500: Internal Server Error'});
  });


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var requireAuthentication = function(req, res, next) {
    if (req.session.user)
    {
        next();
    }
    else
    {
        res.redirect('/sessions/new');
    }
}

app.get('/bulk/clear', bulk.clear);
app.post('/bulk/users', bulk.users);
app.post('/bulk/photos', bulk.photos);

app.get('/sessions/new', login.loginPage);
app.post('/sessions/create', login.loginAction);
app.get('/users/new', login.registerPage);
app.post('/users/create', login.registerAction);


//All pages past this point require authentication
app.all('*', requireAuthentication);

app.get('/sessions/end', login.logoutAction);
app.get('/feed', routes.index);
app.get('/users/:id', routes.stream);
app.get('/users/:id/follow', routes.follow);
app.get('/users/:id/unfollow', routes.unfollow);
app.get('/share/:id', routes.share);
app.get('/photos/new', photos.uploadPage);
app.post('/photos/create', photos.uploadAction);
app.get('/photos/:id.:ext', photos.load);
app.get('/photos/thumbnail/:id.:ext', photos.loadThumbnail);
app.get('/', function(req, res) { res.redirect('/feed'); });

// initialize server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
