var express = require("express");
var app = express();
var cons = require('consolidate');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json({ limit: "2000kb" }));
app.engine('swig', cons.swig);
app.set('view engine', 'swig');
app.set('views', __dirname + '/views');

function getEntryName(path) {
    var prefix = '/Coursera-WebGL-Assignments/A3/library/';
    if(path.length <= prefix.length || path.substring(0, prefix.length) != prefix) {
        throw new Error("Bad path");
    }
    return path.substring(prefix.length);
}

mongoClient.connect('mongodb://localhost:27017/webgl-ex3', function(err, db) {
    if(err) throw err;

    app.get('/Coursera-WebGL-Assignments/A3', function(req, res) {
        res.render('A3', {
            title: "WebGL Exercise 3"
        });
    });

    // TODO: transactions
    app.put('/Coursera-WebGL-Assignments/A3/library/*', function(req, response) {
        var entry = getEntryName(req.path);
        db.collection('models').findOne(
            { name: entry },
            { fields: { name: 1 } },
            function(err, res) {
                if(err) throw err;

                if(res) {
                    response.send("Library entry with this name already exists", 403);
                    return;
                }

                db.collection('models').insertOne(
                    {
                        name : entry,
                        date : new Date(),
                        body : req.body
                    },
                    null,
                    function(err, res) {
                        if(err) throw err;

                        response.sendStatus(200);
                    }
                );
            }
        );
    });

    app.get('/Coursera-WebGL-Assignments/A3/library/', function(req, response) {
        var data = {};
        db.collection('models').find({}, { fields: { name: 1, date: 1 } }).each(function(err, item) {
            if(err) throw err;

            if(item != null) {
                data[item.name] = {
                    date: item.date
                };
            } else {
                response.send(data, 200);
            }
        });
    });

    app.get('/Coursera-WebGL-Assignments/A3/library/*', function(req, response) {
        var entry = getEntryName(req.path);
        db.collection('models').findOne(
            { name: entry },
            { fields: { body: 1 } },
            function(err, res) {
                if(err) throw err;

                if(!res) {
                    response.sendStatus(404);
                    return;
                }

                response.send(res.body, 200);
            }
        );
    });

    app.listen(80);
});
