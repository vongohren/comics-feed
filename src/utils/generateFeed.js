import Entry from '../models/comic-entry.js';
const Feed = require('feed');
const Promise = require('bluebird');
import logger from './logger';

function getObjs (name) {
    return Entry.find({'label':name}).sort('-date').limit(3).exec()
}

function capitalizeFirstLetter(string) {
  return (string.charAt(0).toUpperCase() + string.slice(1))
}

export default Promise.coroutine(function*(name, itemDescription, tegneserieLink, tegneserieLogo){
    var itemTitle = capitalizeFirstLetter(name);

    var comicFeed = new Feed({
        title:          itemTitle,
        description:    'This is '+name+' comic feed',
        link:           tegneserieLink,
        image:          tegneserieLogo,
        copyright:      'None',
        id:             'https://comic-feed.herokuapp.com/'+name,
        feed:           'https://comic-feed.herokuapp.com/'+name
    });

    try {
        const objs = yield getObjs(name);
        for(var entry of objs) {
            comicFeed.addItem({
                title: itemTitle,
                link: entry.url,
                description: itemDescription,
                date: entry.date,
            })
        }
    } catch (e) {
        logger.log('error', 'Generate feed got an error')
        logger.log('error', e)
    }

    return comicFeed.render('rss-2.0');
})
