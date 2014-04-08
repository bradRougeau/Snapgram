dropTables = "DROP TABLE IF EXISTS Share, Photo, Follow, Feed, User;"

userTable = "CREATE TABLE User (\
                     `ID` INT NOT NULL AUTO_INCREMENT,\
                     `Username` VARCHAR(50) UNIQUE,\
                     `Password` VARCHAR(300),\
                     `FullName` VARCHAR(100),\
                     PRIMARY KEY (ID)\
                     );"

photoTable = "CREATE TABLE Photo (\
                `ID` INT NOT NULL AUTO_INCREMENT,\
                `Path` VARCHAR(300),\
                `owner_id` INT,\
                `Timestamp` VARCHAR(30),\
                PRIMARY KEY (ID)\
                );"


followTable = "CREATE TABLE Follow (\
                `ID` INT NOT NULL AUTO_INCREMENT,\
                `follower_id` INT,\
                `followee_id` INT,\
                PRIMARY KEY (ID)\
                );"

feedTable = "CREATE TABLE Feed (\
				`ID` INT NOT NULL AUTO_INCREMENT,\
                `user_id` INT,\
                `FeedList` VARCHAR(10000),\
                PRIMARY KEY (ID)\
            );"
			
shareTable = "CREATE TABLE Share (\
				`ID` INT NOT NULL AUTO_INCREMENT,\
				`Timestamp` VARCHAR(30),\
                `sharer_id` INT,\
                `photo_id` INT,\
                PRIMARY KEY (ID)\
			);"


mysql = require('mysql');
conn = mysql.createConnection({
							host: 'localhost',
							user: 's513_krdillma',
							password: '10083537',
							database: 's513_krdillma'                              });

conn.connect();

conn.query(dropTables, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Dropped stale tables');
           });

conn.query(userTable, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Created users table');
           });

conn.query(photoTable, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Created photo table');
           });

conn.query(followTable, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Created follow table');
           });

conn.query(feedTable, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Created feed table');
           });
		   
conn.query(shareTable, function(err, rows, fields) {
           if (err) throw err;
           
           console.log('Created share table');
           });

conn.end();
