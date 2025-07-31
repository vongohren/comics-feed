import request from 'request';
import cheerio from 'cheerio';
import generateFeed from '../../utils/generateFeed';
import fetchAndSaveImage from '../../utils/fetch';
import xml2js from 'xml2js';
import logger from '../../utils/logger';
import Feed from '../feed';

class Xkcd extends Feed {
  constructor({
    name = 'xkcd',
    itemDescription = 'Xkcdstripe',
    tegneserieSideLink = 'https://www.xkcd.com/',
    tegneserieLogo = '//www.xkcd.com/s/0b7742.png',
    stripUrl = 'https://www.xkcd.com/',
    hour = '10',
    minute = '00',
    author = 'Randall Munroe',
    authorUrl = 'https://en.wikipedia.org/wiki/Randall_Munroe'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.baseUrl = 'https://www.xkcd.com/'
    this.language = 'english'
    this.bareUrl = 'https://xkcd.com'
    this.rssUrl =  this.bareUrl+'/rss.xml'
    this.author = author
    this.authorUrl = authorUrl
  }

  testUrl (url, xmlJson) {
    if(!url.includes(this.bareUrl)) {
      const newUrl = xmlJson.rss.channel[0].item[1].link[0];
      return this.testUrl(newUrl, xmlJson);
    } else {
      return url;
    }
  }

  parseAndTestUrl (xmlJson) {
    let testUrl = xmlJson.rss.channel[0].item[0].link[0];
    const properUrl = this.testUrl(testUrl, xmlJson);
    return properUrl;
  }

  async fetch() {
    let logUrl = ''
    try{
      const xmlBody = await this.getRssFeed(this.rssUrl)
      const xmlJson = await this.parseRssFeed(xmlBody)
      const url = this.parseAndTestUrl(xmlJson);
      logUrl=url
      const xkcdDocument = cheerio.load(xmlJson.rss.channel[0].item[0].description[0])
      const title = xkcdDocument("img").attr("title")
      const pageBody = await this.getPageBody(url)
      const $ = cheerio.load(pageBody);
      const imageSrc = "http://"+$('#comic img').attr('src').substring(2);
      const comicId = url.split("/")[3];
      const explanationUrl = "http://www.explainxkcd.com/wiki/index.php/"+comicId;
      const saved = await fetchAndSaveImage(imageSrc, this.name, {
        explanationUrl: explanationUrl,
        xkcdTitle: title
      })
    } catch(err) {
      logger.log('error', 'XKCD encountered and error with: '+logUrl+' - '+err)
    }
  }

  getPageBody(url) {
    return new Promise((resolve, reject) => {
      request(url, function (error, response, body) {
        if(error) reject(error)
        else resolve(body)
      })
    })
  }

  getRssFeed(rssUrl) {
    return new Promise((resolve, reject) => {
      request(rssUrl, function (error, response, xmlBody) {
        if(error) reject(error)
        else resolve(xmlBody)
      })
    })
  }

  parseRssFeed(xmlBody) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlBody, function (err, result) {
        if(err) reject(err)
        else resolve(result)
      })
    })
  }
}

export default Xkcd;
