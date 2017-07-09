const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    lastPublished: String,
    postTime: {
        hour: { type: Number, default: 9 },
        minute: { type: Number, default: 0 }
    }
})
