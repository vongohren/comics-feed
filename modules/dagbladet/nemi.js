var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');
var fetchUtil = require('../../utils/fetch');
var cronjob = require('../../utils/cronjob');

var name = 'nemi'
var itemDescription = 'Nemistripe'
var tegneserieLink = 'https://www.facebook.com/Nemino-207588812589578/'
var tegneserieLogo = 'http://vignette3.wikia.nocookie.net/cartoonfatness/images/3/3e/Blog_yk_4915575_7599245_tr_logo.png/revision/latest?cb=20140520195208'
var url = 'http://www.dagbladet.no/tegneserie/nemi/'

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
