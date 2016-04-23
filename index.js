var express = require('express');

var lunch = require('./modules/dagbladet/lunch')
var pondus = require('./modules/dagbladet/pondus')
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

lunch.init(process.env.LUNCH_HOUR || '11', process.env.LUNCH_MIN || '00')
pondus.init(process.env.PONDUS_HOUR || '10', process.env.PONDUS_MIN || '00')

var app = express();
app.get('/lunch', lunch.routeFunction);
app.get('/pondus', pondus.routeFunction);
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
