require('dotenv').config()
var express = require('express');
const path = require('path');
var mongoose = require('mongoose');
var Slackbot = require('./slackbot');
var bodyParser = require('body-parser');
const logger = require('./utils/logger');
const comicsStorage = require('./comics');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

var comics = comicsStorage.available

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('landingpage'))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+"/../landingpage/index.html"));
});

app.get('/policy', function (req, res) {
    res.sendFile(path.join(__dirname+"/../landingpage/policy.html"));
});

app.get('/comics', function (req, res) {
    res.json(comics)
})

app.get('/slackurl', function (req, res) {
    res.send(process.env.SLACK_URL)
})

for(var comic of comics) {
  app.get(`/${comic.name}`, comic.routeFunction.bind(comic));
}

new Slackbot(app);

var port = process.env.PORT || 4000;

app.listen(port, function () {
  logger.log('info', 'Comics app listening on port '+port)
});
