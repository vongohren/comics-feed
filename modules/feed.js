var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../utils/generateFeed');
var cronjob = require('../utils/cronjob');
var generateFeed = require('../utils/generateFeed');
var fetchUtil = require('../utils/fetch');


class Feed {
  constructor(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute) {
    this.name = name;
    this.itemDescription = itemDescription;
    this.tegneserieSideLink = tegneserieSideLink;
    this.tegneserieLogo = tegneserieLogo;
    this.stripUrl = stripUrl;
    cronjob(hour, minute, this.fetch);
    this.fetch();
  }

  fetch() {
    request(this.stripUrl, (error, response, body) => {
      if (!error) {
        var $ = cheerio.load(body);
        var imageSrc = this.extractImageSrc($);

        if(imageSrc) {
          fetchUtil.fetchAndSaveImage(imageSrc, this.name);
        } else {
          console.log(`Image source was not a valid object. Strip: ${this.stripUrl} ImageSource: ${imageSrc}`)
        }

      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
  }

  extractImageSrc($) {
    return $('img.tegneserie').attr('src')
  }

  routeFunction(req, res) {
    const obj = generateFeed(this.name, this.itemDescription, this.tegneserieSideLink, this.tegneserieLogo)
    obj.then(function(feed){
      res.set('Content-Type', 'text/xml');
      res.send(feed);
    })
  };
}

module.exports = Feed;
