import mongoose from 'mongoose';
import { SubscriptionSchema } from './subscriptions'

export default mongoose.model('slackteams', {
    access_token: String,
    scope: String,
    team_name: String,
    team_id: String,
    user_id: String,
    active: { type: Boolean, default: false },
    directmessage: { type: Boolean, default: false },
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
    subscriptions: [SubscriptionSchema],
    strike: { type: Number, default: 0}
});
