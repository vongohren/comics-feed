var Dagbladet = require('./dagbladet');

class Pondus extends Dagbladet {
  constructor({
    name = 'pondus',
    itemDescription = 'Pondusstripe',
    tegneserieSideLink = 'http://www.klikk.no/pondus/',
    tegneserieLogo = 'https://login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png',
    stripUrl = 'http://www.dagbladet.no/tegneserie/pondus/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
  }
}

module.exports = Pondus;
