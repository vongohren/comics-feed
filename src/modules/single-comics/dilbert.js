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

  extractImageSrc($) {
    return $($('.comic-item-container')[0]).find('img').attr('src')
  }
}

module.exports = Dilbert;
