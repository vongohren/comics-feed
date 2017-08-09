const oauth = require('./oauth');
const interactiveHandler = require('./interactiveHandler');
import { Team } from './repository'
import { initAgendaForAllTeams } from './services/agenda'
import { postToChannelWithTeamId } from './services/posting'

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
            const text = body.original_message.text
            console.log(text)
            const channel_id = text.slice(text.indexOf('#')+1,text.indexOf('>'))
            console.log(channel_id)
            console.log(body)
            const query = {team_id: body.team.id, "incoming_webhook.channel_id": channel_id }
            postToChannelWithTeamId(channel_id, body.team.id)
            // var promise = Team.findOneAndUpdate(query, {active:true}).exec()
            // //TODO: Skummelt med promisset, silent failing på alt inne i then
            // promise.then(function(team) {
            //     body.team = team
            //     const test = body.team.test.test
            //     interactiveHandler(body, res)
            // })
        })
    }
}

module.exports = Slackbot;
