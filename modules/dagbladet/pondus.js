var name = 'pondus'
var itemDescription = 'Pondusstripe'
var tegneserieLink = 'http://www.klikk.no/pondus/'
var tegneserieLogo = 'https://login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png'
var url = 'http://www.dagbladet.no/tegneserie/pondus/'
var feed = require('feed');
var Entry = require('../../models/comic-entry.js');
var request = require('request');
var cheerio = require('cheerio');


exports.init = function(hour, minute) {
  setupCronjob(hour, minute);
  fetch();
}

function setupCronjob(hour, minute) {
  var cronTime = process.env.CRON_TIME || '00 '+minute+' '+hour+' * * 1-7';
  var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
  var CronJob = require('cron').CronJob;
  var job =  new CronJob({
    cronTime: cronTime,
    onTick: fetch,
    start: true,
    timeZone: timeZone
  });
}

function fetch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var imageSrc = $('img.tegneserie').attr('src')
      request(imageSrc, function (error, res, body) {
        if (!error) {
          var promise = Entry.where("url").equals(res.request.href).exec();
          promise.then(function(entries) {
            if(entries.length == 0 ) {
              var newEntry = new Entry({url:res.request.href, label:name})
              newEntry.save(function (err, userObj) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('saved successfully:', userObj);
                }
              });
            }
          })
        }
      })
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

function capitalizeFirstLetter(string) {
  return (string.charAt(0).toUpperCase() + string.slice(1))
}

exports.routeFunction = function (req, res) {
  var title = capitalizeFirstLetter(name);
  var description = itemDescription;
  var comicFeed = new feed({
    title:          title,
    description:    'This is the norwegian '+name+' comic feed',
    link:           tegneserieLink,
    image:          tegneserieLogo,
    copyright:      'None',
    id:             'https://comic-feed.herokuapp.com/'+name,
    feed:           'https://comic-feed.herokuapp.com/'+name
  });
  var lastThreePromise = Entry.find({'label':name}).sort('-date').limit(3).exec()
  lastThreePromise.then(function(objs) {
    var title = capitalizeFirstLetter(name);

    for(var entry of objs) {
      comicFeed.addItem({
        title: title,
        link: entry.url,
        description: description,
        date: entry.date,
      })
    }
    res.set('Content-Type', 'text/xml');
    res.send(comicFeed.render('rss-2.0'));
  });
};
