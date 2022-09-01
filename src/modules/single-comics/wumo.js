var Feed = require('../feed');

class Wumo extends Feed {
  constructor({
    name = 'wumo',
    itemDescription = 'Wumostripe',
    tegneserieSideLink = 'http://wumo.com/wumo',
    tegneserieLogo = '//wumo.com/images/en_US/fb_wumo.png',
    stripUrl = 'http://wumo.com/wumo',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.baseUrl = 'http://wumo.com'
    this.language = 'norwegian'
  }

  extractImageSrc($, callback) {
    const url = this.baseUrl+$(".strip.wumo img").attr("src")
    callback(url);
  }
}

module.exports = Wumo;
