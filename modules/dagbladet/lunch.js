var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');
var fetchUtil = require('../../utils/fetch');
var cronjob = require('../../utils/cronjob');

var name = 'lunch'
var itemDescription = 'Lunchstripe'
var tegneserieLink = 'http://lunchstriper.no/'
var tegneserieLogo = 'http://lunchstriper.no/assets/graphics/logo.png'
var url = 'http://www.dagbladet.no/tegneserie/lunch/'

exports.init = function(hour, minute) {
  cronjob(hour, minute, fetch);
  fetch();
}

function fetch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var imageSrc = $('img.tegneserie').attr('src')
      fetchUtil.fetchAndSaveImage(imageSrc, name);
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

exports.routeFunction = function (req, res) {
  const obj = generateFeed(name, itemDescription, tegneserieLink, tegneserieLogo)
  obj.then(function(feed){
    res.set('Content-Type', 'text/xml');
    res.send(feed);
  })
};
