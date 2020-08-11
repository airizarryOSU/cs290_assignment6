var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create(
  {defaultLayout: 'main',
    helpers: {
      dateSub: function(aString) {
        if(typeof aString.toISOString === 'function'){
          var strDate = aString.toISOString().substr(0, 10);
          return strDate ;
        } else{
          return aString;
        }
      },
      isOne: function(oneVal){
        return (oneVal == '1');
      },
      isZero: function(zeroVal){
        return (zeroVal == '0');
      }
    }
  }
);

app.use(express.static('public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = Object.values(rows);
    context.fields =  fields;
    //console.log(context.results);
    res.render('home.handlebars', context);
  });
});

app.get('/popup',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.singleRow = rows;
    //context.fields =  fields;
    console.log(rows);
    res.render('update.handlebars', context);
  });
});

app.get('/insert',function(req,res,next){
  mysql.pool.query("INSERT INTO workouts (name, date, reps, weight, lbs) VALUES (?, ?, ?, ?, ?)",
  [req.query.name, req.query.date, req.query.reps, req.query.weight, req.query.unit], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.render('home.handlebars')
  });
});

app.get('/update',function(req,res,next){
  mysql.pool.query("UPDATE workouts SET name=?, date=?, reps=?, weight=?, lbs=? WHERE id=?",
  [req.query.name, req.query.date, req.query.reps, req.query.weight, req.query.unit, req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.render('home.handlebars')
  });
});

app.get('/delete',function(req,res,next){
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.render('home.handlebars')
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight DOUBLE,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home.handlebars',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404.handlebars');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500.handlebars');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
