var Feed = require('../feed');


class ShermansLagoonstripe extends Feed {
  constructor({
    name = 'shermanslagoon',
    itemDescription = 'ShermansLagoonstripe',
    tegneserieSideLink = 'https://www.gocomics.com/shermanslagoon',
    tegneserieLogo = '//api.kingdigital.com/img/features/1442/logos/website.png',
    stripUrl = 'https://www.gocomics.com/shermanslagoon',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  extractImageSrc($, callback) {
    const url = $('.gc-deck--cta-0 img').attr("src")
    callback(url);
  }
}


module.exports = ShermansLagoonstripe;
