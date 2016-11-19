var Entry = require('../models/comic-entry.js');
var request = require('request');

exports.fetchAndSaveImage = function (url, name, optionals) {
  request(url, function (error, res, body) {
    if (!error) {
      var promise = Entry.where("url").equals(res.request.href).exec();
      promise.then(function(entries) {
        if(entries.length == 0 ) {
          var newEntry = new Entry({url:res.request.href, label:name})
          newEntry.save(function (err, userObj) {
            if (err) {
              console.log(err);
            } else {
              if (optionals && optionals.callback) {
                optionals.callback(res.request.href);
              }
              console.log('saved successfully:', userObj);
            }
          });
        }
      })
    }
  })
}
