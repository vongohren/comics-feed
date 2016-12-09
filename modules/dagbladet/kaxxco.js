var Feed = require('../feed');

class Kaxxco extends Feed {
  constructor({
    name = 'kaxxco',
    itemDescription = 'Kaxxcostripe',
    tegneserieSideLink = 'http://www.kaxxco.com/',
    tegneserieLogo = 'http://media.dunkedcdn.com/assets/prod/54754/p1atmba0cvst417h334jnd9v1c9.png',
    stripUrl = 'http://www.dagbladet.no/tegneserie/gjesteserie/kaxxco/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }
}

module.exports = Pondus;
