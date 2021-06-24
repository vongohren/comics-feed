var Lunch = new (require('./modules/tu/lunch'))({})
var Pondus = new (require('./modules/single-comics/pondus'))({})
var Nemi = new (require('./modules/dagbladet/nemi'))({})
var Wumo = new (require('./modules/single-comics/wumo'))({})
var Cyanideandhappines = new (require('./modules/single-comics/cyanideandhappines'))({})
var Dilbert = new (require('./modules/single-comics/dilbert'))({})
var Xkcd = new (require('./modules/single-comics/xkcd'))({})
var ShermansLagoon = new (require('./modules/single-comics/shermanslagoon'))({})
var Commitstrip = new (require('./modules/single-comics/commitstrip'))({})

const available = [ Lunch, Nemi, Wumo, Cyanideandhappines, Dilbert, Xkcd, ShermansLagoon, Commitstrip, Pondus ];

for(var comic of available) {
  comic.fetch()
}

const defaultSubscription = [ Lunch, Wumo, Cyanideandhappines, Xkcd, Commitstrip ];

module.exports = {
    available: available,
    defaultSubscription: defaultSubscription
}
