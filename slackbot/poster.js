const Team = require('./models/slack-teams');
const Entry = require('../models/comic-entry.js');
const WebClient = require('@slack/client').WebClient;
const IncomingWebhook = require('@slack/client').IncomingWebhook;
const comics = require('../comics');
const Agenda = require('./services/agenda');
const moment = require('moment');
const logger = require('../utils/logger');

const postToTeamWithId = (team_id, channel_id) => {
    const team_query = { team_id: team_id, "incoming_webhook.channel_id": channel_id }
    const promise = Team.find(team_query).exec();
    promise.then(function(teams) {
        let update = false;
        const team = teams[teams.length-1]
        logger.log('info', `Checking for posts every ${process.env.CHECK_INTERVAL} and sending to ${team.team_name}-${team.incoming_webhook.channel}`)
        const subscriptions = team.subscriptions;
        const webhook = team.incoming_webhook.url
        const tempSubs = [...subscriptions];
        while(tempSubs.length != 0) {
            const subscription = tempSubs.pop();
            fetchEntries(subscription).then((entry) => {
                if(!entry) {
                    throw `Entry was null with subscription name ${subscription.name}`
                }
                if(!subscription.lastUrlPublished) {
                    update = updateAndPost(subscription, entry, webhook, team);
                } else if(subscription.lastUrlPublished !== entry.url) {
                    const timeToPost = isTimeToPost(subscription)
                    if(timeToPost) {
                        update = updateAndPost(subscription, entry, webhook, team);
                    }
                }
                if(update && tempSubs.length == 0) {
                    var query = { team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id };
                    Team.update(query, { subscriptions: subscriptions }, (err, raw)=> {
                        if (err) logger.log('error' `Team subscription update error: ${err}`)
                    })
                }
            }).catch( error => {
                logger.log('error', error)
            })
        }
    });
}

const updateAndPost = (subscription, entry, webhook, team) => {
    logger.log('info', `Trying to post ${subscription.name} to ${team.team_name}-${team.incoming_webhook.channel}`)
    postWebhookToSlack(entry, webhook, team)
    subscription.lastUrlPublished = entry.url;
    subscription.datePublished = moment().format('x')
    return true;
}

const isTimeToPost = (subscription) => {
    const now = moment().tz(subscription.postTime.timeZone);
    const postTime = now.clone().hour(subscription.postTime.hour).minute(subscription.postTime.minute)
    const postInterval = postTime.clone().add(3, 'hour')
    const isBetween = now.isBetween(postTime, postInterval, null, '[]')
    logger.log('info', `${subscription.name} want to post. The time now is ${now} and postTime is ${postTime}. Is this within the intevall? ${isBetween} `)
    return isBetween
}

const fetchEntries = (subscription) => {
    return Entry.findOne({label:subscription.name}).sort('-date').exec();
}

const postWebhookToSlack = (entry, webhook, team) => {
    const hook = new IncomingWebhook(webhook);
    const comicAttachment = createAttachments(entry);
    hook.send({attachments: comicAttachment}, function(err, res) {
        if (err) {
            logger.log('error', err);
        } else {
            logger.log('info',`Successfully posted: ${entry.url} to ${team.team_name}-${team.incoming_webhook.channel}`);
        }
    });
}

const createAttachments = (entry) => {
    const comic = comics.available.find(comic=> {
            return comic.name === entry.label
    })
    const name = uppercaseFirst(comic.name)
    return [
            {
                "fallback": entry.url,
                "color": "#36a64f",
                "author_name": name,
                "author_link": comic.tegneserieSideLink,
                "author_icon": 'http:'+comic.tegneserieLogo,
                "title": `Dagens ${name}`,
                "title_link": comic.stripUrl,
                "image_url": entry.url,
                "footer": comic.mediator || '',
                "footer_icon": comic.mediatorLogo || ''
            }
        ]
}

const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    postToTeamWithId
}
