var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var feed = require('feed');
var url = "http://www.dagbladet.no/tegneserie/lunch/"
var cronTime = process.env.CRON_TIME || '00 00 07 * * 1-7';
var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
var CronJob = require('cron').CronJob;
var job =  new CronJob({
	cronTime: cronTime,
	onTick: fetchLunch,
	start: true,
	timeZone: timeZone
});
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
var Url = mongoose.model('Url', {
  value: String,
  date: { type: Date, default: Date.now }
});


var lunchUrl = "";

fetchLunch();

function fetchLunch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var imageSrc = $('img.tegneserie').attr('src')
      request(imageSrc, function (error, res, body) {
        if (!error) {
          var promise = Url.where("value").equals(res.request.href).exec();
          promise.then(function(entries) {
            if(entries.length == 0 ) {
              console.log("INSIDE IF")
              var newEntry = new Url({value:res.request.href})
              newEntry.save(function (err, userObj) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('saved successfully:', userObj);
                }
              });
            }
          })
        }
      })
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

var app = express();

app.get('/lunch', function (req, res) {
  var lunchFeed = new feed({
    title:          'Lunch feed',
    description:    'This is the norwegian lunch comic feed',
    link:           'http://lunchstriper.no/',
    image:          'http://lunchstriper.no/assets/graphics/logo.png',
    copyright:      'None',
    id:             'https://comic-feed.herokuapp.com/lunch',
    feed:           'https://comic-feed.herokuapp.com/lunch'
  });
  var lastThreePromise = Url.find({}).sort('-date').limit(3).exec()
  lastThreePromise.then(function(objs) {
    for(var entry of objs) {
      lunchFeed.addItem({
        title: "Lunch",
        link: entry.value,
        description: "Lunchstripe",
        date: entry.date,
      })
    }
    res.set('Content-Type', 'text/xml');
    res.send(lunchFeed.render('rss-2.0'));
  });
});
var port = process.env.PORT;

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
