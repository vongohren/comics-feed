const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    lastUrlPublished: String,
    datePublished: { type: Number, default: 0 },
    postTime: {
        hour: { type: Number, default: 9 },
        minute: { type: Number, default: 0 }
    }
})
