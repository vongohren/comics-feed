var Feed = require('../feed');
const defaultName = 'dilbert'

class Dilbert extends Feed {
  constructor({
    name = defaultName,
    itemDescription = 'Dilbertstripe',
    tegneserieSideLink = 'http://dilbert.com/',
    tegneserieLogo = 'http://dilbert.com/assets/dilbert-logo-4152bd0c31f7de7443b4bc90abd818da.png',
    stripUrl = 'http://dilbert.com/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }

  extractImageSrc($) {
    return $($('.comic-item-container')[0]).find('img').attr('src')
  }
}

module.exports = Dilbert;
