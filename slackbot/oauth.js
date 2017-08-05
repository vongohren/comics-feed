const request = require('request');
const Team = require('./models/slack-teams');
const logger = require('../utils/logger');
const comics = require('../comics');
const WebClient = require('@slack/client').WebClient;
const path = require('path');

module.exports = function(req, res) {
    if (!req.query.code) {
        logger.log('error', "Looks like we're not getting oauth code")
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
    } else {
        request({
            url: 'https://slack.com/api/oauth.access',
            qs: {
                code: req.query.code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri:`https://${req.get('host')}${req.url.split('?')[0]}`
            },
            method: 'GET',
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                const team = JSON.parse(body)
                saveTeam(team);
                postStartSubscription(team);
                res.redirect('/?added=true#slack');
            }
        })
    }
}

const postStartSubscription = (team) => {
    var token = team.bot.bot_access_token;
    var text = `Hello there, I will be publishing comic strips daily to <#${team.incoming_webhook.channel_id}>`
    var web = new WebClient(token);
    web.chat.postMessage(team.user_id, text , {attachments: createMessageAttachments(team), 'as_user': true}, function(err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent: ', res);
        }
    });
}

const createMessageAttachments = (team) => {
    return [
    		{
    			"title":"Defualt subscription list",
                "fields": comics.defaultSubscription.map(comic=> {
                    return {title: uppercaseFirst(comic.name), value: comic.tegneserieSideLink}
                }),
    		},
            {
                "title": "Activate subscription",
                "fallback": "Shame... buttons aren't supported in this environment",
                "callback_id": "subscription",
                "color": "#2AB27B",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "subscription",
                        "text": "Go",
                        "style": "primary",
                        "type": "button",
                        "value": "subscribe"
                    }
                ]
            }
        ]
}


const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const isItAnExistingTeamEntry = (team) => {
    return new Promise((resolve, reject) => {
        const promise = Team.where("team_id").equals(team.team_id).exec();
        promise.then(function(teams) {
            if(teams.length > 0 ){
                resolve({ team: true, channel: doesChannelExist(teams, team.incoming_webhook.channel_id)})
            } else (
                resolve({ team: false, channel: false })
            )
        });
    })
}

const doesChannelExist = (teams, channel_id) => {
    return teams.find(team=>{
        return team.incoming_webhook.channel_id === channel_id
    }) ? true : false

}

const saveTeam = async (team) => {
    const exists = await isItAnExistingTeamEntry(team);
    if(!exists.team || (exists.team && !exists.channel)) {
        const newTeam = new Team({
            access_token: team.access_token,
            scope: team.scope,
            team_name: team.team_name,
            team_id: team.team_id,
            user_id: team.user_id,
            incoming_webhook: {
                url: team.incoming_webhook.url,
                channel: team.incoming_webhook.channel,
                channel_id: team.incoming_webhook.channel_id,
                configuration_url: team.incoming_webhook.configuration_url,
            },
            bot: {
                bot_user_id:team.bot.bot_user_id,
                bot_access_token:team.bot.bot_access_token
            },
            subscriptions: comics.defaultSubscription.map(comic => {
                return {name: comic.name, lastUrlPublished:''}
            })
        })
        newTeam.save(function (err, teamObj) {
          if (err) {
            logger.log('error', "Saving new team failed with: " + error)
          } else {
            logger.log('info',teamObj.team_name+ ' was saved successfully');
          }
        });
    } else {
        const query = {team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id }
        Team.update(query, {incoming_webhook: team.incoming_webhook}, (err, raw)=> {
            if (err) logger.log('error' `Team subscription update error: ${err}`)
            console.log(raw)
        })
    }

}
