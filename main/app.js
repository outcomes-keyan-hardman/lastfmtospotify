//Import dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Import controllers
var lfm2sController = require('./controller/lfm2sController');
var homeController = require('./controller/homeController');

//Environment variables
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var prodMode = process.env.MODE == "PROD";
var mongoUri = process.env.MONGODB_URI;
var spotifyCallback = process.env.SPOTIFY_CALLBACK;
var port = process.env.PORT || 8888;

var spotifyRedirectUri = prodMode ? spotifyCallback : 'http://localhost:8888/callback';

if (clientId == null || clientSecret == null || mongoUri == null) {
    throw new Error('Must define spotify CLIENT_ID, CLIENT_SECRET & MONGO_URI in environment vars');
}

var app = express()
    .use(express.static(__dirname + '/public'))
    .use(cookieParser())
    .use(bodyParser());

lfm2sController.init(app, mongoUri);
homeController.init(app, spotifyRedirectUri, clientId, clientSecret);

console.log('Started');
app.listen(port);
