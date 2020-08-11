var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs290_irizarra',
  password: 'password',
  database: 'cs290_irizarra'
});

module.exports.pool = pool;
