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
            logger.log('info', `[Agenda.constructor] Initializing Agenda with MongoDB URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
            this.agenda = new Agenda({db: { address: process.env.MONGODB_URI, collection: 'agendaJobs', processEvery: '1 minute' }});
            
            this.agenda.on('ready', () => {
                this.ready = true;
                this.agenda.start();
                logger.log('info', '[Agenda.constructor] Agenda job scheduler initialized successfully and started');
            });

            this.agenda.on('error', (e) => {
                this.ready = false;
                logger.log('error', `[Agenda.constructor] Agenda initialization failed with error: ${e.message}`)
                logger.log('error', `[Agenda.constructor] Stack trace: ${e.stack}`)
            });
        } catch (error) {
            logger.log('error', `[Agenda.constructor] Failed to initialize Agenda: ${error.message}`);
            logger.log('error', `[Agenda.constructor] Stack trace: ${error.stack}`);
        }
    }

    isReady() {
        return this.ready && this.agenda !== null;
    }

    getStatus() {
        return {
            hasAgenda: this.agenda !== null,
            isReady: this.ready,
            canOperate: this.isReady()
        };
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
        const status = this.getStatus();
        logger.log('info', `[Agenda.disableAgendaForTeam] Agenda status: ${JSON.stringify(status)}`);
        
        if (!this.agenda) {
            logger.log('warn', '[Agenda.disableAgendaForTeam] Agenda not available, cannot disable team');
            resolve(0);
            return;
        }
        
        if (!this.ready) {
            logger.log('warn', `[Agenda.disableAgendaForTeam] Agenda not ready for team ${team_id}, channel ${channel_id}`);
            resolve(0);
            return;
        }
        
        const jobId = `${team_id}-${channel_id}`;
        logger.log('info', `[Agenda.disableAgendaForTeam] Attempting to cancel job ${jobId}...`);
        
        // Add a 5-second timeout for the cancel operation
        const timeoutId = setTimeout(() => {
          logger.log('error', `[Agenda.disableAgendaForTeam] MongoDB operation timeout for job ${jobId} - this usually indicates a MongoDB connection issue`);
          reject(new Error(`Timeout cancelling agenda job ${jobId}`));
        }, 5000);
        
        this.agenda.cancel({name: jobId}, function(err, numRemoved) {
          clearTimeout(timeoutId);
          
          if(err) {
            logger.log('error', `[Agenda.disableAgendaForTeam] Error cancelling job ${jobId}: ${err.message}`);
            reject(err);
          } else {
            logger.log('info', `[Agenda.disableAgendaForTeam] Successfully cancelled ${numRemoved} job(s) for ${jobId}`);
            resolve(numRemoved);
          }
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
