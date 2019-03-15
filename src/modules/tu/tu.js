var Feed = require('../feed');

class Dagbladet extends Feed {
  constructor(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.mediator = 'Teknisk Ukeblad';
    this.mediatorLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Teknisk_Ukeblad_logo.svg/400px-Teknisk_Ukeblad_logo.svg.png'
  }

  extractImageSrc($) {
    const list = $('.feed-comics figure');
    const length = list.length;
    const lastObject = list[length-1];
    const imgSrc = $(lastObject).find('.image-container img').attr('src');
    return `https://www.tu.no${imgSrc}`
  }
}

module.exports = Dagbladet;
