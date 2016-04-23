var Entry = mongoose.model('Entry', {
  url: String,
  date: { type: Date, default: Date.now },
	label: String
});
