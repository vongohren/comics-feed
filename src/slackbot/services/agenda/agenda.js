const Agenda = require('agenda');
import logger from '../../../utils/logger';

class AgendaService {
    constructor() {
        this.ready = false;
        this.agenda = null;
        this.readyPromise = null;
        
        if (!process.env.MONGODB_URI) {
            logger.log('info', 'MONGODB_URI not found - Agenda job scheduler will not be available (this is normal in development)');
            return;
        }

        try {
            logger.log('info', `[Agenda.constructor] Initializing Agenda with MongoDB URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
            this.agenda = new Agenda({
                db: { 
                    address: process.env.MONGODB_URI, 
                    collection: 'agendaJobs',
                    options: {
                        useUnifiedTopology: true,
                        useNewUrlParser: true
                    }
                },
                processEvery: '1 minute'
            });
            
            // Create a promise that resolves when Agenda is ready
            this.readyPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Agenda initialization timeout after 10 seconds'));
                }, 10000);
                
                this.agenda.on('ready', () => {
                    clearTimeout(timeout);
                    this.ready = true;
                    this.agenda.start();
                    logger.log('info', '[Agenda.constructor] Agenda job scheduler initialized successfully and started');
                    resolve();
                });

                this.agenda.on('error', (e) => {
                    clearTimeout(timeout);
                    this.ready = false;
                    logger.log('error', `[Agenda.constructor] Agenda initialization failed with error: ${e.message}`)
                    logger.log('error', `[Agenda.constructor] Stack trace: ${e.stack}`)
                    reject(e);
                });
            });
        } catch (error) {
            logger.log('error', `[Agenda.constructor] Failed to initialize Agenda: ${error.message}`);
            logger.log('error', `[Agenda.constructor] Stack trace: ${error.stack}`);
            this.readyPromise = Promise.reject(error);
        }
    }

    async waitUntilReady() {
        if (!this.readyPromise) {
            logger.log('warn', '[Agenda.waitUntilReady] No MongoDB URI configured, Agenda not available');
            return false;
        }
        try {
            await this.readyPromise;
            return true;
        } catch (error) {
            logger.log('error', `[Agenda.waitUntilReady] Failed to wait for Agenda: ${error.message}`);
            return false;
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

    async defineTeamPosting(channel_id, team_id, func) {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, skipping team posting definition');
            return;
        }
        
        if (!this.ready) {
            logger.log('warn', `[defineTeamPosting] Agenda not ready yet, waiting...`);
            await this.waitUntilReady();
        }
        
        const jobId = `${team_id}-${channel_id}`
        this.agenda.define(jobId, function(job, done) {
            func(job.attrs.data.channel_id, job.attrs.data.team_id)
            done()
        })
        this.agenda.every(process.env.CHECK_INTERVAL, jobId, {team_id: team_id, channel_id: channel_id});
    }

    async initAgendaForTeam(team, agendaFunction) {
        if (!this.agenda) {
            logger.log('warn', 'Agenda not available, skipping team initialization');
            return;
        }
        const team_id = team.team_id;
        const channel_id = team.channel_id || team.incoming_webhook.channel_id;
        await this.defineTeamPosting(channel_id, team_id, agendaFunction);
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
      if (!this.agenda) {
          logger.log('warn', 'Agenda not available, cannot enable team');
          return false;
      }
      
      try {
        await this.defineTeamPosting(channel_id, team_id, agendaFunction);
        return true;
      } catch (error) {
        logger.log('error', `[enableAgendaForTeam] Error enabling team: ${error.message}`);
        return false;
      }
    }

    async defineCleanupJob(cleanupFunction) {
      if (!this.agenda) {
        logger.log('warn', 'Agenda not available, skipping cleanup job definition');
        return;
      }
      
      if (!this.ready) {
        logger.log('warn', `[defineCleanupJob] Agenda not ready yet, waiting...`);
        await this.waitUntilReady();
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
