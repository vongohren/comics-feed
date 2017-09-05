var Feed = require('../feed');

class CyanideAndHappiness extends Feed {
  constructor({
    name = 'shermanslagoon',
    itemDescription = 'ShermansLagoonstripe',
    tegneserieSideLink = 'http://shermanslagoon.com/',
    tegneserieLogo = '//shermanslagoon.com/wp-content/themes/sherman3/img/logo.png',
    stripUrl = 'http://shermanslagoon.com/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  extractImageSrc($) {
    return $("#comicpanel img").attr("src")
  }
}

module.exports = CyanideAndHappiness;
