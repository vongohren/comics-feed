var name = 'pondus'
var itemDescription = 'Pondusstripe'
var tegneserieLink = 'https://www.facebook.com/Nemino-207588812589578/'
var tegneserieLogo = 'http://vignette3.wikia.nocookie.net/cartoonfatness/images/3/3e/Blog_yk_4915575_7599245_tr_logo.png/revision/latest?cb=20140520195208'
var url = 'http://www.dagbladet.no/tegneserie/nemi/'
var feed = require('feed');
var Entry = require('../../models/comic-entry.js');
var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');


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
  const obj = generateFeed(name, itemDescription, tegneserieLink, tegneserieLogo)
  obj.then(function(feed){
    res.set('Content-Type', 'text/xml');
    res.send(feed);
  })
};
