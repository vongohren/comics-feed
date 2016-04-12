var request = require('request');
var cheerio = require('cheerio');
var url = "http://www.dagbladet.no/tegneserie/lunch/"
var cronTime = process.env.CRON_TIME || '00 58 20 * * 1-7';
var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
var CronJob = require('cron').CronJob;
var job =  new CronJob({
	cronTime: cronTime,
	onTick: fetchLunch,
	start: true,
	timeZone: timeZone
});

function fetchLunch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var image = $('img.tegneserie').attr('src')
      console.log(image);
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}
