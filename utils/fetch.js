var Entry = require('../models/comic-entry.js');
var request = require('request');

exports.fetchAndSaveImage = function (url, optionals) {
  request(url, function (error, res, body) {
    if (!error) {
      var promise = Entry.where("url").equals(res.request.href).exec();
      promise.then(function(entries) {
        if(entries.length == 0 ) {

          console.log("TRYING TO SAVE "+url)
          var newEntry = new Entry({url:res.request.href, label:name})
          console.log("PAST ENTRY")
          newEntry.save(function (err, userObj) {
            console.log("SAVED")
            if (err) {
              console.log(err);
            } else {
              if (optionals.callback) {
                optionals.callback(url);
              }
              console.log('saved successfully:', userObj);
            }
          });
        }
      })
    }
  })
}
