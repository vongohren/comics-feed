import request from 'request';
import cheerio from 'cheerio';
import zlib from 'zlib';
import cronjob from '../utils/cronjob';
import generateFeed from '../utils/generateFeed';
import fetchAndSaveImage from '../utils/fetch';
import logger from '../utils/logger';
import urlHandler from '../utils/urlHandler';

const { httpsCheckerAndAttacher } = urlHandler;


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
    const options = {
      url: this.stripUrl,
      encoding: null, // Get raw buffer so we can decompress manually
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };
    
    request(options, (error, response, body) => {
      if (!error) {
        // Handle decompression based on Content-Encoding header
        const encoding = response.headers['content-encoding'];
        let decompressedBody;
        
        try {
          if (encoding === 'gzip') {
            decompressedBody = zlib.gunzipSync(body).toString('utf-8');
          } else if (encoding === 'deflate') {
            decompressedBody = zlib.inflateSync(body).toString('utf-8');
          } else {
            // Not compressed, convert buffer to string
            decompressedBody = body.toString('utf-8');
          }
          
          var $ = cheerio.load(decompressedBody);
          this.extractImageSrc($, (imageSrc) => {
            imageSrc = httpsCheckerAndAttacher(imageSrc);
            if(imageSrc) {
              fetchAndSaveImage(imageSrc, this.name);
            } else {
              logger.log('error', `Image source was not a valid object. Strip: ${this.stripUrl} ImageSource: ${imageSrc}`)
            }
          });
        } catch (decompressError) {
          logger.log('error', `[${this.name}] Failed to decompress response: ${decompressError}`);
        }
      } else {
        logger.log('error', "We've encountered an fetch error with strip: "+this.stripUrl+" ---- "+ error)
      }
    });
  }
  
  extractImageSrc($, callback) {
    const url = $('.strip-container img').attr('src')
    callback(url);
  }

  routeFunction(req, res) {
    const obj = generateFeed(this.name, this.itemDescription, this.tegneserieSideLink, this.tegneserieLogo)
    obj.then(function(feed){
      res.set('Content-Type', 'text/xml');
      res.send(feed);
    })
  };
}

export default Feed;
