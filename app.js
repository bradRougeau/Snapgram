
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
		user: 's513_bjrougea',
		password: '10013253',
		database: 's513_bjrougea',
		connectionLimit: 1
		});

var app = express();
app.use(express.bodyParser({keepExtensions: true, uploadDir: './photos'}));
app.lock = []

app.use(orm.express("mysql://s513_bjrougea:10013253@web2.cpsc.ucalgary.ca/s513_bjrougea", {
  define: function (db, models, next) {
	db.settings.set('instance.cache', false);
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
		  var owner_id = this.owner_id;
		  pool.getConnection(function(err, connection)
		  {
				var query = "Insert into Feed (user_id, object_id, type) Select follower_id, ?, ? from Follow where followee_id = ?;"
				connection.query(query, [photo_id, "Photo", owner_id], function(err, results) {
					connection.release();
					if (err) throw err;
		  });
		});
		}
	  }
  });

    models.Follow = db.define("Follow", {
        //No fields, both fields are relationships defined below
    });
    models.Feed = db.define("Feed", { 
        user_id: Number,
		object_id: Number,
		type: String
    });
	models.Share = db.define("Share", {
        Timestamp: Date
    }, {
      hooks: {
        afterCreate: function (next){
		  var share_id = this.id;
		  var sharer_id = this.sharer_id;
          pool.getConnection(function(err, connection)
		  {
			var query = "Insert into Feed (user_id, object_id, type) Select follower_id, ?, ? from Follow where followee_id = ?;"
			connection.query(query, [share_id, "Share", sharer_id], function(err, results) {
				connection.release();
				if (err) throw err;
			});
		  });
		}
	}
  });
    models.Photo.hasOne("owner", models.User);
    models.Follow.hasOne("follower", models.User);
    models.Follow.hasOne("followee", models.User);
	models.Share.hasOne("sharer", models.User);
	models.Share.hasOne("photo", models.Photo);
    next();
  }
}));

                  
                  
// all environments
app.set('port', process.env.PORT || 8051);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
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
app.post('/bulk/streams', bulk.photos);

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
app.get('/', function(req, res) { res.redirect('/feed'); });

// initialize server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
