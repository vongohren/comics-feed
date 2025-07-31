import Lunch from './modules/tu/lunch'
import Pondus from './modules/single-comics/pondus'
import Wumo from './modules/single-comics/wumo'
import Cyanideandhappines from './modules/single-comics/cyanideandhappines'
// var Dilbert = new (require('./modules/single-comics/dilbert'))({}) DILBERT IS DEAD - https://www.dailycartoonist.com/index.php/2023/03/12/dilbert-1989-2023/
import Xkcd from './modules/single-comics/xkcd'
import ShermansLagoon from './modules/single-comics/shermanslagoon'
// var Commitstrip = new (require('./modules/single-comics/commitstrip'))({}) COMMITSTRIP IS INACTIVE - https://www.commitstrip.com/en/
import LarsonsGaleVerden from './modules/single-comics/larsonsgaleverden'

const lunchInstance = new Lunch({})
const pondusInstance = new Pondus({})
const wumoInstance = new Wumo({})
const cyanideandhappinesInstance = new Cyanideandhappines({})
const xkcdInstance = new Xkcd({})
const shermansLagoonInstance = new ShermansLagoon({})
const larsonsGaleVerdenInstance = new LarsonsGaleVerden({})

export const available = [ lunchInstance, wumoInstance, cyanideandhappinesInstance, xkcdInstance, shermansLagoonInstance, pondusInstance, larsonsGaleVerdenInstance ];

for(var comic of available) {
  comic.fetch()
}

export const defaultSubscription = [ lunchInstance, wumoInstance, cyanideandhappinesInstance, xkcdInstance, pondusInstance, larsonsGaleVerdenInstance ];

export default {
    available: available,
    defaultSubscription: defaultSubscription
}
