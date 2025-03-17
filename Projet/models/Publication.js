const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  conference: String,
  date: String,
  location: String,
  pages: String,
  id: String,
  uri: String,
});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;