var Lunch = new (require('./modules/dagbladet/lunch'))({})
var Pondus = new (require('./modules/dagbladet/pondus'))({})
var Nemi = new (require('./modules/dagbladet/nemi'))({})
var Wumo = new (require('./modules/single-comics/wumo'))({})
var Cyanideandhappines = new (require('./modules/single-comics/cyanideandhappines'))({})
var Dilbert = new (require('./modules/single-comics/dilbert'))({})
var Xkcd = new (require('./modules/single-comics/xkcd'))({})

const available = [ Lunch, Pondus, Nemi, Wumo, Cyanideandhappines, Dilbert, Xkcd ];

for(var comic of available) {
  comic.fetch()
}

const defaultSubscription = [ Lunch, Pondus, Wumo, Cyanideandhappines, Xkcd ];

module.exports = {
    available: available,
    defaultSubscription: defaultSubscription
}
