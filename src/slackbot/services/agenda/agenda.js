const Agenda = require('agenda');
const logger = require('../../../utils/logger');

class AgendaService {
    constructor() {
        this.agenda = new Agenda({db: { address: process.env.MONGODB_URI  , collection: 'agendaJobs', processEvery: '1 minute' }});
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

    defineTeamPosting(channel_id, team_id, func) {
        const jobId = `${team_id}-${channel_id}`
        this.agenda.define(jobId, function(job, done) {
            func(job.attrs.data.channel_id, job.attrs.data.team_id)
            done()
        })
        this.agenda.every(process.env.CHECK_INTERVAL, jobId, {team_id: team_id, channel_id: channel_id});
    }

    initAgendaForTeam(team, agendaFunction) {
        const team_id = team.team_id;
        const channel_id = team.channel_id || team.incoming_webhook.channel_id;
        this.defineTeamPosting(channel_id, team_id, agendaFunction);
    }

    async disableAgendaForTeam(team) {
      return new Promise((resolve, reject) => {
        const team_id = team.team_id;
        const channel_id = team.channel_id || team.incoming_webhook.channel_id;
        const jobId = `${team_id}-${channel_id}`
        this.agenda.cancel({name: jobId}, function(err, numRemoved) {
          if(err) reject(err)
          resolve(numRemoved)
        });
      })
    }

    async enableAgendaForTeam(channel_id, team_id, agendaFunction) {
      return new Promise((resolve, reject) => {
        this.defineTeamPosting(channel_id, team_id, agendaFunction);
        resolve(true)
      })
    }
}

const agenda = new AgendaService()

function graceful() {
  agenda._stop();
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);

export default agenda;
