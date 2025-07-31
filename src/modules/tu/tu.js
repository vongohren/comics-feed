import Feed from '../feed';

class TU extends Feed {
  constructor(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.mediator = 'Teknisk Ukeblad';
    this.mediatorLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Teknisk_Ukeblad_logo.svg/400px-Teknisk_Ukeblad_logo.svg.png',
    this.mediatorUrl = 'https://www.tu.no/tegneserier/lunch'
  }

  extractImageSrc($, callback) {
    const images = $('div').find('img')
    const imgArray = images.toArray()
    const matchingImages = imgArray.filter(img => {
      return $(img).attr('src').includes('api/widgets/comics')
    })
    const imgSrc = $(matchingImages[0]).attr('src')
    callback(imgSrc)
  }
}

export default TU;
