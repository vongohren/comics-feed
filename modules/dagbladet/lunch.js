var Feed = require('../feed');

class Lunch extends Feed {
  constructor({
    name = 'lunch',
    itemDescription = 'Lunchstripe',
    tegneserieSideLink = 'http://lunchstriper.no/',
    tegneserieLogo = 'http://lunchstriper.no/assets/graphics/logo.png',
    stripUrl = 'http://www.dagbladet.no/tegneserie/lunch/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }
}

module.exports = Lunch;
