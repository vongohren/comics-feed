var express = require('express');
var Lunch = require('./modules/dagbladet/lunch')
var Pondus = require('./modules/dagbladet/pondus')
var Nemi = require('./modules/dagbladet/nemi')
var Kaxxco = require('./modules/dagbladet/kaxxco')
var Wumo = require('./modules/wumo/wumo')
var xkcd = require('./modules/single-comics/xkcd')
var Cyanideandhappines = require('./modules/single-comics/cyanideandhappines')
var Dilbert = require('./modules/single-comics/dilbert')
var mongoose = require('mongoose');
const logger = require('./utils/logger');
mongoose.connect(process.env.MONGODB_URI);

var comics = [
  new Pondus({ hour: 10 }),
  new Nemi({ hour: 11 }),
  new Wumo({ hour: 09 }),
  new Lunch({ hour: 12 }),
  new Cyanideandhappines({ hour: 11, minute: 30 }),
  new Dilbert({ hour: 12, minute: 30 })
]

xkcd.init(process.env.XKCD_HOUR || '09', process.env.XKCD_MIN || '30')

var app = express();
for(var comic of comics) {
  app.get(`/${comic.name}`, comic.routeFunction.bind(comic));
}

app.get('/xkcd', xkcd.routeFunction);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  logger.log('info', 'Comics app listening on port '+port)
});
