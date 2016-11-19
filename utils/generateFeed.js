var Entry = require('../models/comic-entry.js');
var Promise = require('bluebird');
var feed = require('feed');

function getObjs (name) {
  return Entry.find({'label':name}).sort('-date').limit(3).exec()
}

function capitalizeFirstLetter(string) {
  return (string.charAt(0).toUpperCase() + string.slice(1))
}

module.exports = Promise.coroutine(function*(name, itemDescription, tegneserieLink, tegneserieLogo){
  var itemTitle = capitalizeFirstLetter(name);

  var comicFeed = new feed({
    title:          itemTitle,
    description:    'This is the norwegian '+name+' comic feed',
    link:           tegneserieLink,
    image:          tegneserieLogo,
    copyright:      'None',
    id:             'https://comic-feed.herokuapp.com/'+name,
    feed:           'https://comic-feed.herokuapp.com/'+name
  });

  const objs = yield getObjs(name);
  for(var entry of objs) {
    comicFeed.addItem({
      title: itemTitle,
      link: entry.url,
      description: itemDescription,
      date: entry.date,
    })
  }
  
  return comicFeed.render('rss-2.0');
})
