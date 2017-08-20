const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export const SubscriptionSchema = new Schema({
    name: String,
    lastUrlPublished: String,
    datePublished: { type: Number, default: 0 },
    postTime: {
        hour: { type: Number, default: 9 },
        minute: { type: Number, default: 0 },
        timeZone: { type: String, default: "Europe/Oslo"}
    }
})

export const model = mongoose.model('Subscriptions', SubscriptionSchema);
