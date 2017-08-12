var mongoose = require('mongoose');

module.exports = mongoose.model('entry', {
  url: String,
  date: { type: Date, default: Date.now },
  label: String,
  metadata: {
    explanationUrl: String
  }
});
