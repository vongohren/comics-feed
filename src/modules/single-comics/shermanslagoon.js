import Feed from '../feed';


class ShermansLagoonstripe extends Feed {
  constructor({
    name = 'shermanslagoon',
    itemDescription = 'ShermansLagoonstripe',
    tegneserieSideLink = 'https://www.gocomics.com/shermanslagoon',
    tegneserieLogo = '//api.kingdigital.com/img/features/1442/logos/website.png',
    stripUrl = 'https://www.gocomics.com/shermanslagoon',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }

  extractImageSrc($, callback) {
    // Look for the strip image specifically - it has "isStrip" in the class
    let url = $('img[class*="isStrip"]').first().attr("src");
    
    // Fallback: Look for Comic_comic__image class (more general)
    if (!url) {
      url = $('img[class*="Comic_comic__image"]').first().attr("src");
    }
    
    // Fallback: Old selector for backwards compatibility
    if (!url) {
      url = $('picture.item-comic-image img').attr("src");
    }
    
    callback(url);
  }
}

export default ShermansLagoonstripe;
