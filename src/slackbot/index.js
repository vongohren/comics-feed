import './utils/stringPrototype'
import oauth from './oauth';
import { initAgendaForAllTeams, initCleanupJob } from './services/agenda'
import {
  interactiveHandler,
  subscriptionHandler,
  whoHandler,
  suggestHandler,
  supportHandler
} from './services/slack/handlers'
import { clearStrikedOutTeams } from './services/team'

class Slackbot {
    constructor(app) {
      this.app = app
      this.initializeRoutes();
      this.clientId = process.env.SLACK_CLIENT_ID;
      this.clientSecret = process.env.SLACK_CLIENT_SECRET;
      // Don't await in constructor - initialize async
      this.initializeAgendaForAllTeams().catch(err => {
        console.error('Failed to initialize Agenda:', err);
      });
    }

    async initializeAgendaForAllTeams() {
      try {
        await initAgendaForAllTeams();
        await initCleanupJob();
      } catch (error) {
        console.error('Error during Agenda initialization:', error);
      }
    }

    initializeRoutes() {
        this.app.get('/auth', oauth.bind(this));
        this.app.post('/interactive', function(req, res) {
          const body = JSON.parse(req.body.payload)
          interactiveHandler(body, res)
        })
        this.app.post('/subscriptions', function(req, res) {
          subscriptionHandler(req.body, res)
        })
        this.app.post('/who', function(req, res) {
          whoHandler(res)
        })
        this.app.post('/suggest', function(req, res) {
          suggestHandler(req.body, res)
        })
        this.app.post('/support', function(req, res) {
          supportHandler(req.body, res)
        })
        //This is triggerd by zapier once a day!
        this.app.get('/clear', async (req, res)=> {
          try {
            // Set a timeout of 8 seconds (leaving 2 seconds buffer for curl's 10s timeout)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Operation timed out after 8 seconds')), 8000)
            );
            
            const clearPromise = clearStrikedOutTeams();
            
            const striked = await Promise.race([clearPromise, timeoutPromise]);
            
            res.status(200).json(striked);
          } catch (error) {
            console.error('Error in /clear endpoint:', error);
            res.status(500).json({ 
              error: error.message, 
              removed: 0,
              success: false 
            });
          }
        })
    }
}

module.exports = Slackbot;
