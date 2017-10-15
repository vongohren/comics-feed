require('./utils/stringPrototype')
const oauth = require('./oauth');
import { initAgendaForAllTeams } from './services/agenda'
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
      this.initializeAgendaForAllTeams();
    }

    initializeAgendaForAllTeams() {
      initAgendaForAllTeams();
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
        this.app.get('/clear', async (req, res)=> {
          var striked = await clearStrikedOutTeams()
          res.json(striked)
        })
    }
}

module.exports = Slackbot;
