var express = require('express');
var Lunch = require('./modules/dagbladet/lunch')
var Pondus = require('./modules/dagbladet/pondus')
var Nemi = require('./modules/dagbladet/nemi')
var Wumo = require('./modules/heltnormalt/wumo')
var xkcd = require('./modules/single-comics/xkcd')
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

var comics = [
  new Pondus({ hour: 10 }),
  new Nemi({ hour: 11 }),
  new Wumo({ hour: 09 }),
  new Lunch({ hour: 12 })
]

xkcd.init(process.env.XKCD_HOUR || '09', process.env.XKCD_MIN || '30')

var app = express();
for(var comic of comics) {
  app.get(`/${comic.name}`, comic.routeFunction.bind(comic));
}

app.get('/xkcd', xkcd.routeFunction);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
