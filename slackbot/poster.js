const Team = require('./models/slack-teams');
const Entry = require('../models/comic-entry.js');
const WebClient = require('@slack/client').WebClient;
const IncomingWebhook = require('@slack/client').IncomingWebhook;
const comics = require('../comics');
const Agenda = require('./utils/agenda');
const moment = require('moment');
const logger = require('../utils/logger');

const postToTeam = (body) => {
    const promise = Team.where("team_id").equals(body.team_id).exec();
    promise.then(function(teams) {
        const team = teams[teams.length-1]
        const subscriptions = team.subscriptions;
        const webhook = team.incoming_webhook.url
        for(const subscription of subscriptions) {
            fetchAndPost(subscription, webhook, team.incoming_webhook.channel_id)
        }
    });
}

const postToTeamWithId = (id) => {
    console.log("POSTING EVERY 30min")
    const promise = Team.where("team_id").equals(id).exec();
    promise.then(function(teams) {
        let update = false;
        const team = teams[teams.length-1]
        const subscriptions = team.subscriptions;
        const webhook = team.incoming_webhook.url
        const tempSubs = [...subscriptions];

        while(tempSubs.length != 0) {
            const subscription = tempSubs.pop();
            fetchEntries(subscription).then((entries) => {
                const entry = entries[0];
                if(
                    !subscription.lastPublished ||
                    (subscription.lastPublished !== entry.url && isTimeToPost(subscription))
                ) {
                    postWebhookToSlack(entry, webhook, team.incoming_webhook.channel_id)
                    subscription.lastPublished = entry.url;
                    update = true;
                }
                if(update && tempSubs.length == 0) {
                    var query = { team_id: id };
                    Team.update(query, { subscriptions: subscriptions }, (err, raw)=> {
                        if (err) logger.log('error' `Team subscription update error: ${err}`)
                    })
                }
            })
        }
    });
}

const isTimeToPost = (subscription) => {
    const now = moment();
    return now.hour() > subscription.postTime.hour && now.minute() > subscription.postTime.minute
}

const initAgendaForTeam = (id) => {
    const promise = Team.where("team_id").equals(id).exec();
    promise.then(function(teams) {
        Agenda.defineTeamPosting(id, postToTeamWithId.bind(this, id));
    });
}

const fetchEntries = (subscription) => {
    return Entry.find({label:subscription.name}).sort('-date').limit(1).exec();
}

const postWebhookToSlack = (entry, webhook, channel) => {
    const hook = new IncomingWebhook(webhook);
    const comicAttachment = createAttachments(entry);
    hook.send({attachments: comicAttachment}, function(err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent: '+entry.url);
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
                "author_icon": comic.tegneserieLogo,
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
    postToTeam,
    postToTeamWithId,
    initAgendaForTeam
}
