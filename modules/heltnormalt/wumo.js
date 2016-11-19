var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');
var fetchUtil = require('../../utils/fetch');
var cronjob = require('../../utils/cronjob');

var name = 'wumo'
var itemDescription = 'Wumostripe'
var tegneserieLink = 'http://wumo.com/wumo'
var tegneserieLogo = 'http://wumo.com/images/en_US/m_header_wumo.png'
var url = 'http://heltnormalt.no/wumo'

exports.init = function(hour, minute) {
  cronjob(hour, minute, fetch);
  fetch();
}

function fetch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var imageSrc = $(".strip.wumo img").attr("src")
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
