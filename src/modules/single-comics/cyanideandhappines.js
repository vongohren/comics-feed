var Feed = require('../feed');

class CyanideAndHappiness extends Feed {
  constructor({
    name = 'cyanideandhappiness',
    itemDescription = 'CyanideAndHappinessstripe',
    tegneserieSideLink = 'http://explosm.net/',
    tegneserieLogo = '//userlogos.org/files/logos/Rog/explosm_net_02.png',
    stripUrl = 'http://explosm.net/comics/latest/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  extractImageSrc($) {
    return 'http:'+$("#main-comic").attr("src")
  }
}

module.exports = CyanideAndHappiness;
