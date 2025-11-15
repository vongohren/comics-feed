const Agenda = require('agenda');
import logger from '../../../utils/logger';

class AgendaService {
    constructor() {
        this.ready = false;
        this.agenda = null;
        
        if (!process.env.MONGODB_URI) {
            logger.log('info', 'MONGODB_URI not found - Agenda job scheduler will not be available (this is normal in development)');
            return;
        }

        try {
            this.agenda = new Agenda({db: { address: process.env.MONGODB_URI, collection: 'agendaJobs', processEvery: '1 minute' }});
            
            this.agenda.on('ready', () => {
                this.ready = true;
                this.agenda.start();
                logger.log('info', 'Agenda job scheduler initialized successfully');
            });

            this.agenda.on('error', (e) => {
                this.ready = false;
                logger.log('error', `Agenda initialization failed with error: ${e}`)
            });
        } catch (error) {
            logger.log('error', `Failed to initialize Agenda: ${error.message}`);
        }
    }

    isReady() {
        return this.ready && this.agenda !== null;
    }

    _stop() {
        if (!this.agenda) {
            logger.log('info', 'Agenda not initialized, nothing to stop');
            return;
        }
        this.agenda.stop(function() {
          console.log("Exiting process to handle proper stop of jobs")
          process.exit(0);
        });
    }

    defineTeamPosting(channel_id, team_id, func) {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, skipping team posting definition');
            return;
        }
        const jobId = `${team_id}-${channel_id}`
        this.agenda.define(jobId, function(job, done) {
            func(job.attrs.data.channel_id, job.attrs.data.team_id)
            done()
        })
        this.agenda.every(process.env.CHECK_INTERVAL, jobId, {team_id: team_id, channel_id: channel_id});
    }

    initAgendaForTeam(team, agendaFunction) {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, skipping team initialization');
            return;
        }
        const team_id = team.team_id;
        const channel_id = team.channel_id || team.incoming_webhook.channel_id;
        this.defineTeamPosting(channel_id, team_id, agendaFunction);
    }

    async disableAgendaForTeam(team_id, channel_id) {
      return new Promise((resolve, reject) => {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, cannot disable team');
            resolve(0);
            return;
        }
        const jobId = `${team_id}-${channel_id}`
        this.agenda.cancel({name: jobId}, function(err, numRemoved) {
          if(err) reject(err)
          resolve(numRemoved)
        });
      })
    }

    async enableAgendaForTeam(channel_id, team_id, agendaFunction) {
      return new Promise((resolve, reject) => {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, cannot enable team');
            resolve(false);
            return;
        }
        this.defineTeamPosting(channel_id, team_id, agendaFunction);
        resolve(true)
      })
    }

    defineCleanupJob(cleanupFunction) {
      if (!this.agenda) {
        logger.log('warn', 'Agenda not available, skipping cleanup job definition');
        return;
      }
      
      this.agenda.define('cleanup-striked-teams', async (job, done) => {
        try {
          await cleanupFunction();
          logger.log('info', 'Cleanup job completed successfully');
        } catch (error) {
          logger.log('error', `Cleanup job failed: ${error}`);
        }
        done();
      });
      
      // Run daily at 3 AM
      this.agenda.every('0 3 * * *', 'cleanup-striked-teams');
      logger.log('info', 'Scheduled daily cleanup job at 3 AM');
    }
}

const agenda = new AgendaService()

function graceful() {
  agenda._stop();
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);

export default agenda;
