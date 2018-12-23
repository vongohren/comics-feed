import request from 'request';
import cheerio from 'cheerio';
import cronjob from '../utils/cronjob';
import generateFeed from '../utils/generateFeed';
import fetchAndSaveImage from '../utils/fetch';
import logger from '../utils/logger';
import { httpsCheckerAndAttacher } from '../utils/urlHandler';


class Feed {
  constructor(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute) {
    this.name = name;
    this.itemDescription = itemDescription;
    this.tegneserieSideLink = tegneserieSideLink;
    this.tegneserieLogo = tegneserieLogo;
    this.stripUrl = stripUrl;
    cronjob(hour, minute, this.fetch.bind(this))
  }

  fetch() {
    request(this.stripUrl, (error, response, body) => {
      if (!error) {
        var $ = cheerio.load(body);
        var imageSrc = this.extractImageSrc($);
        imageSrc = httpsCheckerAndAttacher(imageSrc);

        if(imageSrc) {
          fetchAndSaveImage(imageSrc, this.name);
        } else {
          logger.log('error', `Image source was not a valid object. Strip: ${this.stripUrl} ImageSource: ${imageSrc}`)
        }

      } else {
        logger.log('error', "We’ve encountered an fetch error with strip: "+this.stripUrl+" ---- "+ error)
      }
    });
  }

  extractImageSrc($) {
    return $('.strip-container img').attr('src')
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
