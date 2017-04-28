const mongoose = require('mongoose');
const Subscriptions = require('./subscriptions');

module.exports = mongoose.model('slackteams', {
    access_token: String,
    scope: String,
    team_name: String,
    team_id: String,
    user_id: String,
    incoming_webhook: {
        url: String,
        channel: String,
        channel_id: String,
        configuration_url: String,
    },
    bot: {
        bot_user_id: String,
        bot_access_token: String
    },
    subscriptions: [Subscriptions]
});
