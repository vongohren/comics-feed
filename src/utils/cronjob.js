export default function (hour, minute, tickFunction) {
  var cronTime = process.env.CRON_TIME || '0 * * * *';
  var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
  var CronJob = require('cron').CronJob;
  var job =  new CronJob({
    cronTime: cronTime,
    onTick: tickFunction,
    start: true,
    timeZone: timeZone
  });
}
