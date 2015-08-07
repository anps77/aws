var express = require("express");
var app = express();
var cons = require('consolidate');

app.use(express.static(__dirname + '/static'));

app.engine('swig', cons.swig);
app.set('view engine', 'swig');
app.set('views', __dirname + '/views');

app.get('/Coursera-WebGL-Assignments/A3', function(req, res) {
    res.render('A3', {
	title: "WebGL Exercise 3"
    });
});

app.listen(80);

