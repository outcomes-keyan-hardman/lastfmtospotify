var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

// Get the spotify client_id and client_secret from environment vars.
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
if (client_id == null || client_secret == null) {
    throw new Error('Must define spotify CLIENT_ID and CLIENT_SECRET in environment vars');
}

var local_redirect = 'http://localhost:8888/callback'; // Your redirect uri
var heroku_redirect = 'https://lastfmtospotify.herokuapp.com/callback/'

var port = process.env.PORT || 8888;
port == 8888 ? redirect_uri = local_redirect : redirect_uri = heroku_redirect

var stateKey = 'spotify_auth_state';
var app = express();
app.use(bodyParser());

app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function (req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {

        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                res.redirect('/#/lastfmToSpotify/' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function (req, res) {

    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.post('/store_songs', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/lastFmToSpotify", function (err, db) {
        if (!err) {
            var collection = db.collection('track_popularity');
            var data = {username: req.body.username, popularities: req.body.popularities, time: req.body.time};

            collection.insert(data);

            res.send(200);
        }
    });
});

app.get('/get_average_popularities', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/lastFmToSpotify", function (err, db) {
        if (!err) {
            var data = db.collection('track_popularity').find();
            console.log(data)
        }
    });

});

generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

console.log('Starting on http://localhost:' + port);
app.listen(port);
