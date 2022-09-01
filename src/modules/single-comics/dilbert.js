var Feed = require('../feed');

class Dilbert extends Feed {
  constructor({
    name = 'dilbert',
    itemDescription = 'Dilbertstripe',
    tegneserieSideLink = 'http://dilbert.com/',
    tegneserieLogo = '//comic-feed.herokuapp.com/img/dilbert-logo.png',
    stripUrl = 'http://dilbert.com/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  extractImageSrc($, callback) {
    const url = $($('.comic-item-container')[0]).find('img').attr('src')
    callback(url);
  }
}

module.exports = Dilbert;
