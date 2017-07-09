const AgendaUtil = require('agenda');
const logger = require('../../utils/logger');

class Agenda {
    constructor() {
        this.agenda = new AgendaUtil({db: { address: process.env.MONGODB_URI  , collection: 'agendaJobs', processEvery: '1 minute' }});
        this.ready = false;
        this.agenda.on('ready', () => {
            this.ready = true;
            this.agenda.start();
        });

        this.agenda.on('error', (e) => {
            this.ready = false;
            logger.log('error', `Agenda initialization failed with error: ${e}`)
        });
    }

    isReady() {
        return this.ready
    }

    defineTeamPosting(id, func) {
        this.agenda.define(id, function(job, done) {
            func()
            done()
        })
        this.agenda.every('10 seconds', id);
    }
}

module.exports = new Agenda();
