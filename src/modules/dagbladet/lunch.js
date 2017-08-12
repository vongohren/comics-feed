var Dagbladet = require('./dagbladet');

class Lunch extends Dagbladet {
  constructor({
    name = 'lunch',
    itemDescription = 'Lunchstripe',
    tegneserieSideLink = 'http://lunchstriper.no/',
    tegneserieLogo = '//lunchstriper.no/assets/graphics/logo.png',
    stripUrl = 'http://www.dagbladet.no/tegneserie/lunch/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
  }
}

module.exports = Lunch;
