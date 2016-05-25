var MongoClient = require('mongodb').MongoClient;

module.exports = {
    init: function (app, mongoUri) {
        app.post('/store_songs', function (req, res) {
            MongoClient.connect(mongoUri, function (err, db) {
                if (!err) {
                    var collection = db.collection('track_popularity_averages');

                    var response = collection.find().toArray();
                    response.then(function (data) {
                        var count = data[0].count;
                        var mappedData = data[0].popularities.map(function (popularity) {
                            return popularity * count;
                        });
                        console.log(mappedData);

                        var mappedDataAgainForRealThisTime = mappedData.map(function (popularity, i) {
                            return (popularity + parseInt(req.body.popularities[i])) / (count + 1);
                        });

                        var dataToSend = {popularities: mappedDataAgainForRealThisTime, count: count + 1};

                        collection.update({"_id": data[0]._id}, dataToSend);

                        res.send(200);
                    });
                }
            });
        });

        app.get('/get_average_popularities', function (req, res) {
            MongoClient.connect(mongoUri, function (err, db) {
                if (!err) {
                    var response = db.collection('track_popularity_averages').find().toArray();
                    response.then(function (data) {
                        res.send(data[0]);
                    })
                }
            });

        });
    }
};

