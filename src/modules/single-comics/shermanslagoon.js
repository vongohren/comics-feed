var Feed = require('../feed');


class ShermansLagoonstripe extends Feed {
  constructor({
    name = 'shermanslagoon',
    itemDescription = 'ShermansLagoonstripe',
    tegneserieSideLink = 'https://comicskingdom.com/sherman-s-lagoon',
    tegneserieLogo = '//api.kingdigital.com/img/features/1442/logos/website.png',
    stripUrl = 'https://comicskingdom.com/sherman-s-lagoon',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'english'
  }


  extractImageSrc($) {
    return $("meta[property='og:image']").attr("content")
  }
}


module.exports = ShermansLagoonstripe;
