var TU = require('./tu');

class Lunch extends TU {
  constructor({
    name = 'lunch',
    itemDescription = 'Lunchstripe',
    author = "Børge Lund",
    authorUrl = "https://lunchstriper.no/om-lunch/",
    tegneserieSideLink = 'http://lunchstriper.no/',
    tegneserieLogo = '//lunchstriper.no/assets/graphics/logo.png',
    slackPlaceHolder = 'https://comics.vongohren.me/img/lunch-placeholder.jpg',
    stripUrl = 'https://www.tu.no/tegneserier/lunch',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.author = author;
    this.authorUrl = authorUrl;
    this.slackPlaceHolder = slackPlaceHolder;
    this.language = 'norwegian'
  }
}

module.exports = Lunch;
