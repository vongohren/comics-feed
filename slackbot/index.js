const oauth = require('./oauth');
const path = require('path');
const interactiveHandler = require('./interactiveHandler');
const Team = require('./models/slack-teams');
const postToTeam = require('./poster').postToTeam;

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
            res.send('Your ngrok tunnel is up and running!');
        });
        this.app.post('/interactive', function(req, res) {
            const body = JSON.parse(req.body.payload)
            var promise = Team.where("team_id").equals(body.team.id).exec();
            //TODO: Skummelt med promisset, silent failing på alt inne i then
            promise.then(function(teams) {
                body.botToken = teams[0].bot.bot_access_token
                interactiveHandler(body, res)
            })
        })

        this.app.post('/comics', function(req, res) {
            postToTeam(req.body);
        })
    }
}

module.exports = Slackbot;
