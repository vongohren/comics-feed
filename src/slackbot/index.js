const oauth = require('./oauth');
import { initAgendaForAllTeams, toggleAgendaForTeam } from './services/agenda'
import { interactiveHandler, subscriptionHandler, whoHandler } from './services/slack/handlers'


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
        this.app.post('/switch', function(req, res) {
          toggleAgendaForTeam(req, res)
        })
        this.app.post('/subscriptions', function(req, res) {
          const body = JSON.parse(req.body.payload)
          subscriptionHandler(body, res)
        })
        this.app.post('/who', function(req, res) {
          whoHandler(res)
        })
    }
}

module.exports = Slackbot;
