var Entry = require('../models/comic-entry.js');
var request = require('request');
const logger = require('./logger');

exports.fetchAndSaveImage = function (url, name, optionals) {
  request(url, function (error, res, body) {
      if (!error) {
          var promise = Entry.where("url").equals(res.request.href).exec();
          promise.then(function(entries) {
            if(entries.length == 0 ) {
              var newEntry = new Entry({url:res.request.href, label:name})
              newEntry.save(function (err, userObj) {
                if (err) {
                  logger.log('error', "FetchAndSaveImage failed with: " + error)
                } else {
                  if (optionals && optionals.callback) {
                    optionals.callback(res.request.href);
                  }
                  logger.log('info',userObj.label+ ' was saved successfully with url: '+ userObj.url);
                }
              });
            }
          })
      } else {
          logger.log('error', 'Request to url '+url+' failed')
          logger.log('error', error)
      }
  })
}
