/** Run this on your local machine after installing mysql to get the same
 database and user we'll use on the live server (before trying to set up the
 database schema)
 */
mysql = require('mysql');
conn = mysql.createConnection({
                              host: 'web2.cpsc.ucalgary.ca',
                              user: 'root',
                              password: ''
                              });

conn.connect();

conn.query('GRANT CREATE ON *.* TO `root`@`web2.cpsc.ucalgary.ca`', function(err, results) {
           if (err) throw err;
           
           console.log('Gave root permission to create databases');
           });

conn.query('CREATE DATABASE `s513_krdillma`', function(err, results) {
           if (err) throw err;
           
           console.log('Created database');
           });

conn.query("GRANT USAGE ON *.* TO `s513_krdillma`@`web2.cpsc.ucalgary.ca` IDENTIFIED BY '10083537'", function(err, results) {
           if (err) throw err;
           
           console.log('Created user');
           });

conn.query('GRANT ALL PRIVILEGES ON `s513_krdillma`.* to `s513_krdillma`@`web2.cpsc.ucalgary.ca`', function(err, results) {
           if (err) throw err;
           
           console.log('Gave user privileges to database');
           });

conn.end();