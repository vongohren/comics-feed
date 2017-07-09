const oauth = require('./oauth');
const path = require('path');
const interactiveHandler = require('./interactiveHandler');
const Team = require('./models/slack-teams');
const postToTeam = require('./poster').postToTeam;
const initAgendaForTeam = require('./poster').initAgendaForTeam;
const Agenda = require('./utils/agenda');

class Slackbot {
    constructor(app) {
      this.app = app
      this.initializeRoutes();
      this.clientId = process.env.SLACK_CLIENT_ID;
      this.clientSecret = process.env.SLACK_CLIENT_SECRET;
    }

    initializeRoutes() {
        this.app.get('/auth', oauth.bind(this));
        this.app.get('/hello', function (req, res) {
            res.send("HELLO THANKS FOR ADDING RODOLPHE");
        });
        this.app.get('/slack', function (req, res) {
            res.sendFile(path.join(__dirname+"/slack.html"));
        });
        this.app.post('/command', function(req, res) {
            const promise = Team.where("team_id").equals(req.body.team_id).exec();
            promise.then(function(teams) {
                const team = teams[teams.length-1]
                const subscriptions = team.subscriptions;
                for(const subscription of subscriptions) {
                        subscription.lastPublished = null
                }
                var query = { team_id: team.team_id };
                Team.update(query, { subscriptions: subscriptions }, (err, raw) => {
                    if (err) logger.log('error' `Team subscription update error: ${err}`)
                    console.log('The raw response from Mongo was ', raw);
                })
            });
            res.send('Cleared subscription posting');
        });
        this.app.post('/interactive', function(req, res) {
            const body = JSON.parse(req.body.payload)
            var promise = Team.where("team_id").equals(body.team.id).exec();
            //TODO: Skummelt med promisset, silent failing på alt inne i then
            promise.then(function(teams) {
                body.team = teams[teams.length-1]
                interactiveHandler(body, res)
            })
        })

        this.app.post('/cron', function(req, res) {
            initAgendaForTeam(req.body.team_id)
        })



        this.app.post('/comics', function(req, res) {
            postToTeam(req.body);
        })
    }
}

module.exports = Slackbot;
