var Feed = require('../feed');

class Dagbladet extends Feed {
  constructor(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.mediator = 'Dagbladet';
    this.mediatorLogo = 'http://i.imgur.com/2tvk2Io.jpg'
  }
}

module.exports = Dagbladet;
