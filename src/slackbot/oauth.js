import request from 'request-promise';
import { Teams } from './repository';
import logger from '../utils/logger';
import comics from '../comics';
import { WebClient } from '@slack/client';
import path from 'path';
import { showDirectOrChannel } from './utils'

export default async function(req, res) {
    if(req.query.error === 'access_denied') {
      res.redirect('/');
      return;
    } else if (!req.query.code) {
      logger.log('error', "Looks like we're not getting oauth code")
      res.status(500);
      res.send({"Error": "Looks like we're not getting code. Info sent to web owner"});
    } else {
      try {
        const opt = {
            url: 'https://slack.com/api/oauth.access',
            qs: {
                code: req.query.code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri:`https://${req.get('host')}${req.url.split('?')[0]}`
            },
            method: 'GET',
        }
        const data = await request(opt)
        const team = JSON.parse(data)
        console.log(team)
        const channel_id = team.incoming_webhook.channel_id
        console.log(channel_id)
        if(channel_id.startsWith('G') || channel_id.startsWith('D')) {
          team.directmessage = true
        } else {
          team.directmessage = false
        }
        saveTeam(team);
        postStartSubscription(team);
        res.redirect('/?added=true#slack');
      } catch (err) {
        logger.log('error', "Oauth call to slack failed: " + err)
        res.redirect('/?failed=true');
      }
    }
}

const postStartSubscription = (team) => {
    var token = team.bot.bot_access_token;
    const channel_id = team.incoming_webhook.channel_id
    const channel_id_text = !team.directmessage ? `<#${channel_id}>` : showDirectOrChannel(team.incoming_webhook.channel)
    var text =`Hello there 👋 I, Rodolphe, will be sending comic strips, when they are published, to ${channel_id_text} \nThis subscription can be controlled through my command: /subscriptions 🚀 \nThe following list is the default list:`;
    var web = new WebClient(token);
    web.chat.postMessage(team.user_id, text , {attachments: createMessageAttachments(team), 'as_user': true}, function(err, res) {
        if (err) {
          logger.log('error', "Post start failed: " + err)
        } else {
          logger.log('info', `Message sent to team: ${team.team_name} and user ${team.user_id}`)
        }
    });
}

const createMessageAttachments = (team) => {
  const actionValue = JSON.stringify({"value": "subscribe", "channel":team.incoming_webhook.channel_id})
  return [
  		{
        "color": "#2AB27B",
        "fields": comics.defaultSubscription.map(comic=> {
            return {
              title: `${comic.name.upperCaseFirstLetter()} - (${comic.language.upperCaseFirstLetter()})`,
              value: comic.tegneserieSideLink,
            }
        }),
  		},
          {
              "title": "Activate subscription",
              "fallback": "Shame... buttons aren't supported in this environment",
              "callback_id": "start",
              "color": "#2AB27B",
              "attachment_type": "default",
              "actions": [
                  {
                      "name": "start",
                      "text": "Go",
                      "style": "primary",
                      "type": "button",
                      "value": actionValue
                  }
              ]
          }
      ]
}

const isItAnExistingTeamEntry = (team) => {
    return new Promise((resolve, reject) => {
        const promise = Teams.where("team_id").equals(team.team_id).exec();
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
        const newTeam = new Teams({
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
            }),
            directmessage: team.directmessage
        })
        newTeam.save(function (err, teamObj) {
          if (err) {
            logger.log('error', "Saving new team failed with: " + error)
          } else {
            logger.log('info',`${teamObj.team_name} with ${teamObj.incoming_webhook.channel} is a new team i am posting to, and was saved successfully`);
          }
        });
    } else {
        const query = {team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id }
        Teams.update(query, {incoming_webhook: team.incoming_webhook}, (err, raw)=> {
            if (err) logger.log('error' `Team subscription update error: ${err}`)
            logger.log('info',`${team.team_name} with ${team.incoming_webhook.channel} was update with new incomming webhook ${team.incoming_webhook.channel}`);
        })
    }

}
