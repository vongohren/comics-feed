var Feed = require('../feed');
var moment = require('moment');

class Pondus extends Feed {
  constructor({
    name = 'pondus',
    itemDescription = 'Pondusstripe',
    tegneserieSideLink = 'http://www.klikk.no/pondus/',
    tegneserieLogo = '//login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png',
    stripUrl = 'https://www.vg.no/tegneserier',
    hour = '10',
    minute = '00',
    author = 'Frode Øverli',
    authorUrl = 'https://no.wikipedia.org/wiki/Frode_%C3%98verli',
    mediator = 'VG',
    mediatorLogo = 'https://www.vg.no/vgc/hyperion/img/logo.png',
    mediatorUrl = 'https://www.vg.no/tegneserier'
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
    const today = moment().format('YYYY-MM-DD')
    const url = `https://www.vg.no/tegneserier/api/images/pondus/${today}`;
    return url;
  }
}

module.exports = Pondus;
