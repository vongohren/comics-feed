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

    _stop() {
        this.agenda.stop(function() {
          console.log("Exiting process to handle proper stop of jobs")
          process.exit(0);
        });
    }

    defineTeamPosting(team_id, channel_id, func) {
        const jobId = `${team_id}-${channel_id}`
        this.agenda.define(jobId, function(job, done) {
            func(job.attrs.data.team_id, job.attrs.data.channel_id)
            done()
        })
        this.agenda.every(process.env.CHECK_INTERVAL, jobId, {team_id: team_id, channel_id: channel_id});
    }
}

const agenda = new Agenda()

function graceful() {
  agenda._stop();
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);

module.exports = agenda;
