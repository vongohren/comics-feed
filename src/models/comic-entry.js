import mongoose from 'mongoose';

export default mongoose.model('entry', {
  url: String,
  date: { type: Date, default: Date.now },
  label: String,
  metadata: {
    explanationUrl: String,
    xkcdTitle: String,
    sentence: String
  }
});
