var Feed = require('../feed');
import logger from '../../utils/logger';
import request from 'request';
import cheerio from 'cheerio';
import fetchAndSaveImage from '../../utils/fetch';


class LarsonsGaleVerden extends Feed {
  constructor({
    name = 'larsonsgaleverden',
    itemDescription = 'LarsonsGaleVerden',
    tegneserieSideLink = 'https://www.thefarside.com/',
    tegneserieLogo = 'https://storage.googleapis.com/publically_hosted_images/Screenshot%202024-02-16%20at%2020.40.06.png',
    stripUrl = 'https://www.thefarside.com/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  async fetch() {
    try{
      const pageBody = await this.getPageBody(this.stripUrl)
      const $ = cheerio.load(pageBody);

      const contents = $(".card-body")
      const imagesWithDescription = []
      contents.each((i, content) => {
        const img = $(content).find('img')
        const src = img.attr('data-src')
        const description = $(content).find('figcaption').text().trim()
        imagesWithDescription.push({
          src,
          description
        })
      })
      const selectionNr = Math.floor(Math.random() * imagesWithDescription.length)
      const selection = imagesWithDescription[selectionNr]

      const saved = await fetchAndSaveImage(selection.src, this.name, {
        sentence: selection.description
      })
    } catch(err) {
      logger.log('error', 'Larsons gale verden encountered and error with: '+this.stripUrl+' - '+err)
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
}


module.exports = LarsonsGaleVerden;
