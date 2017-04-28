const Team = require('./models/slack-teams');
const Entry = require('../models/comic-entry.js');
const WebClient = require('@slack/client').WebClient;
const IncomingWebhook = require('@slack/client').IncomingWebhook;
const comics = require('../comics');

const postToTeam = (body) => {
    const promise = Team.where("team_id").equals(body.team_id).exec();
    promise.then(function(teams) {
        const subscriptions = teams[0].subscriptions;
        const webhook = teams[0].incoming_webhook.url
        for(const subscription of subscriptions) {
            fetchAndPost(subscription, webhook, teams[0].incoming_webhook.channel_id)
        }
    });
}

const postToAllSubscribers = () => {
    const promise = Team.find({}).exec();
    promise.then(function(teams) {

    });
}

const fetchAndPost = (subscription, token, channel) => {
    const entries = Entry.find({label:subscription.name}).sort('-date').limit(1).exec();
    entries.then(entries => {
        postWebhookToSlack(entries[0], token, channel)
    })
}

const postWebhookToSlack = (entry, webhook, channel) => {
    const hook = new IncomingWebhook(webhook);
    const comicAttachment = createAttachments(entry);
    hook.send({attachments: comicAttachment}, function(err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent: ');
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
    postToAllSubscribers
}
