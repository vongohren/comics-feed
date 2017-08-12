var Lunch = new (require('./modules/dagbladet/lunch'))({ hour: 12 })
var Pondus = new (require('./modules/dagbladet/pondus'))({ hour: 10 })
var Nemi = new (require('./modules/dagbladet/nemi'))({ hour: 11 })
var Wumo = new (require('./modules/single-comics/wumo'))({ hour: 10 })
var Cyanideandhappines = new (require('./modules/single-comics/cyanideandhappines'))({ hour: 11, minute: 30 })
var Dilbert = new (require('./modules/single-comics/dilbert'))({ hour: 12, minute: 30 })
var Xkcd = new (require('./modules/single-comics/xkcd'))({ hour: 12, minute: 30 })

const available = [ Lunch, Pondus, Nemi, Wumo, Cyanideandhappines, Dilbert, Xkcd ];

for(var comic of available) {
  comic.fetch()
}

const defaultSubscription = [ Lunch, Pondus, Wumo, Cyanideandhappines, Xkcd ];

module.exports = {
    available: available,
    defaultSubscription: defaultSubscription
}
