var TU = require('./tu');

class Lunch extends TU {
  constructor({
    name = 'lunch',
    itemDescription = 'Lunchstripe',
    tegneserieSideLink = 'http://lunchstriper.no/',
    tegneserieLogo = '//lunchstriper.no/assets/graphics/logo.png',
    stripUrl = 'https://www.tu.no/tegneserier/lunch',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
  }
}

module.exports = Lunch;
