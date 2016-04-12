var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var Feed = require('feed');
var url = "http://www.dagbladet.no/tegneserie/lunch/"
var cronTime = process.env.CRON_TIME || '00 39 22 * * 1-7';
var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
var CronJob = require('cron').CronJob;
var job =  new CronJob({
	cronTime: cronTime,
	onTick: fetchLunch,
	start: true,
	timeZone: timeZone
});

var lunchUrl = "";

function fetchLunch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var image = $('img.tegneserie').attr('src')
      lunchUrl = image;
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

var app = express();

app.get('/lunch', function (req, res) {
  var feed = new Feed({
    title:          'Lunch feed',
    description:    'This is the norwegian lunch comic feed',
    link:           'http://lunchstriper.no/',
    image:          'http://lunchstriper.no/assets/graphics/logo.png',
    copyright:      'None',
    id: "01294149"
  });
  feed.addItem({
    title: "Lunch",
    link: lunchUrl,
    description: "Lunchstripe",
    date: new Date(),
  })




  res.set('Content-Type', 'text/xml');
  res.send(feed.render('rss-2.0'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
