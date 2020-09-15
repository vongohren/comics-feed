var Feed = require('../feed');

class Pondus extends Feed {
  constructor({
    name = 'pondus',
    itemDescription = 'Pondusstripe',
    tegneserieSideLink = 'http://www.klikk.no/pondus/',
    tegneserieLogo = '//login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png',
    stripUrl = 'https://www.folkebladet.no/kultur/pondus/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
  }
  extractImageSrc($) {
    return $($('.picture')[0]).find('img').attr('src')
  }
}

module.exports = Pondus;
