var Feed = require('../feed');

class Pondus extends Feed {
  constructor({
    name = 'pondus',
    itemDescription = 'Pondusstripe',
    tegneserieSideLink = 'http://www.klikk.no/pondus/',
    tegneserieLogo = '//login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png',
    stripUrl = 'https://www.folkebladet.no/kultur/pondus/',
    hour = '10',
    minute = '00',
    author = 'Frode Øverli',
    authorUrl = 'https://no.wikipedia.org/wiki/Frode_%C3%98verli',
    mediator = 'Folkebladet',
    mediatorLogo = 'https://media.snl.no/media/133653/standard_folkebladet_logo.jpg',
    mediatorUrl = 'https://www.folkebladet.no/kultur/pondus/'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
    this.author = author
    this.authorUrl = authorUrl
    this.mediator = mediator;
    this.mediatorLogo = mediatorLogo
    this.mediatorUrl = mediatorUrl
  }
  extractImageSrc($) {
    return $($('.picture')[0]).find('img').attr('src')
  }
}

module.exports = Pondus;
