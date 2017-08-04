const oauth = require('./oauth');
const path = require('path');
const interactiveHandler = require('./interactiveHandler');
const Team = require('./models/slack-teams');
const logger = require('../utils/logger');
const initAgendaForTeam = require('./poster').initAgendaForTeam;

class Slackbot {
    constructor(app) {
      this.app = app
      this.initializeRoutes();
      this.clientId = process.env.SLACK_CLIENT_ID;
      this.clientSecret = process.env.SLACK_CLIENT_SECRET;
      this.initAgendaForAllTeams();
    }

    initAgendaForAllTeams() {
        Team.find({}, function(err, teams) {
          if(teams.length < 1) logger.log('info', 'No teams to init agenda posting for')
          teams.forEach(function(team) {
            if(team.active) initAgendaForTeam(team)
          });
        });
    }

    initializeRoutes() {
        this.app.get('/auth', oauth.bind(this));
        this.app.get('/hello', function (req, res) {
            res.send("HELLO THANKS FOR ADDING RODOLPHE");
        });
        this.app.post('/interactive', function(req, res) {
            const body = JSON.parse(req.body.payload)
            const text = body.original_message.text
            const channel_id = text.slice(text.indexOf('#')+1,text.indexOf('>'))
            const query = {team_id: body.team.id, "incoming_webhook.channel_id": channel_id }
            var promise = Team.findOneAndUpdate(query, {active:true}).exec()
            //TODO: Skummelt med promisset, silent failing på alt inne i then
            promise.then(function(team) {
                body.team = team
                interactiveHandler(body, res)
            })
        })
    }
}

module.exports = Slackbot;
