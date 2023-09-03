var Lunch = new (require('./modules/tu/lunch'))({})
var Pondus = new (require('./modules/single-comics/pondus'))({})
var Wumo = new (require('./modules/single-comics/wumo'))({})
var Cyanideandhappines = new (require('./modules/single-comics/cyanideandhappines'))({})
// var Dilbert = new (require('./modules/single-comics/dilbert'))({}) DILBERT IS DEAD - https://www.dailycartoonist.com/index.php/2023/03/12/dilbert-1989-2023/
var Xkcd = new (require('./modules/single-comics/xkcd'))({})
var ShermansLagoon = new (require('./modules/single-comics/shermanslagoon'))({})
var Commitstrip = new (require('./modules/single-comics/commitstrip'))({})

const available = [ Lunch, Wumo, Cyanideandhappines, Xkcd, ShermansLagoon, Commitstrip, Pondus ];

for(var comic of available) {
  comic.fetch()
}

const defaultSubscription = [ Lunch, Wumo, Cyanideandhappines, Xkcd, Commitstrip ];

module.exports = {
    available: available,
    defaultSubscription: defaultSubscription
}
