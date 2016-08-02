// Dependencies
var mongoose        = require('mongoose');
var Point            = require('./model.js');

// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/points', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = Point.find({});
        query.exec(function(err, points){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all points
            res.json(points);
        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new points in the db
    app.post('/points', function(req, res){

        // Creates a new Point based on the Mongoose schema and the post body
        var newPoint = new Point(req.body);

        // New Point is saved in the db.
        newPoint.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new point
            res.json(req.body);
        });
    });
};  