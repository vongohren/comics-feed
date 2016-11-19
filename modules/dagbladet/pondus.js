var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');
var fetchUtil = require('../../utils/fetch');
var Entry = require('../../models/comic-entry.js');
var cronjob = require('../../utils/cronjob');

var name = 'pondus'
var itemDescription = 'Pondusstripe'
var tegneserieLink = 'http://www.klikk.no/pondus/'
var tegneserieLogo = 'https://login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png'
var url = 'http://www.dagbladet.no/tegneserie/pondus/'


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
