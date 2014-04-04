
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

var app = express();
app.use(express.bodyParser({keepExtensions: true, uploadDir: './photos'}));
app.lock = {}

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

    models.Photo = db.define("Photo", { 
        Path: String,
        Timestamp : Date
    }, {
      hooks: {
        afterCreate: function (next){
		  var photo_id = this.id;
          models.Follow.find({followee_id: this.owner_id}, function(err, rows) {
			if (err) throw err;
            rows.forEach(function(row){
              // add photos to all follower's feeds
              row.getFollower(function (err, follower){
				if (err) throw err;
				//Need to queue up function to load and update feed, as otherwise each feed update will overwrite itself in bulk uploading
				if (app.lock[follower.id] == undefined || app.lock[follower.id].length == 0)
				{
					app.lock[follower.id] = [ function() {
						follower.getFeed(function (err, feed){
							if (err) throw err;
							feed[0].addToFeed(photo_id, "Photo");
						});
					} ];
					app.lock[follower.id][0]();
				}
				else
				{
					app.lock[follower.id].push(function() {
						follower.getFeed(function (err, feed){
							if (err) throw err;
						});
					});
				}
                
				})
            })
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
