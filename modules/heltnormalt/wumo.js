var Feed = require('../feed');

class Wumo extends Feed {
  constructor({
    name = 'wumo',
    itemDescription = 'Wumostripe',
    tegneserieSideLink = 'http://wumo.com/wumo',
    tegneserieLogo = 'http://wumo.com/images/en_US/m_header_wumo.png',
    stripUrl = 'http://heltnormalt.no/wumo',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }

  extractImageSrc($) {
    console.log("EXTRACTING WUMO")
    return $(".strip.wumo img").attr("src")
  }
}

module.exports = Wumo;
