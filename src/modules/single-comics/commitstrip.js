var Feed = require('../feed');
import request from 'request';
import cheerio from 'cheerio';
import fetchAndSaveImage from '../../utils/fetch';
import logger from '../../utils/logger';

class Commitstrip extends Feed {
  constructor({
    name = 'commitstrip',
    itemDescription = 'Commitstripstripe',
    tegneserieSideLink = 'http://www.commitstrip.com/en/',
    tegneserieLogo = '//jf-blog.fr/wp-content/uploads/2015/09/commitstrip.png',
    stripUrl = 'http://www.commitstrip.com/en/',
    hour = '11',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  fetch() {
    request(this.stripUrl, (error, response, body) => {
      if (!error) {
        var $ = cheerio.load(body);
        var imagePage = $($('.excerpts').children()[0]).find('a').attr('href');
        request(imagePage, (error, response, body) => {
          if (!error) {
            var _$ = cheerio.load(body);
            var imageSrc = this.extractImageSrc(_$);
            if(imageSrc) {
              fetchAndSaveImage(imageSrc, this.name);
            } else {
              logger.log('error', `Image source was not a valid object. Strip: ${this.stripUrl} ImageSource: ${imageSrc}`)
            }
          } else {
            logger.log('error', "We’ve encountered an fetch error with strip: "+this.stripUrl+" ---- "+ error)
          }
        })
      } else {
        logger.log('error', "We’ve encountered an fetch error with strip: "+this.stripUrl+" ---- "+ error)
      }
    });
  }

  extractImageSrc($) {
    return $($('.entry-content').find('img')[0]).attr('src')
  }
}

module.exports = Commitstrip  ;
