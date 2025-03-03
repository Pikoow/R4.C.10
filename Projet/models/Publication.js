const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
  title: String,
  authors: [{
    name: String,
    pid: String,
    isIrisaAffiliated: Boolean
  }],
  venue: String,
  pages: String,
  year: Number,
  type: String,
  access: String,
  key: String,
  doi: String,
  ee: String,
  url: String
});

module.exports = mongoose.model('Publication', PublicationSchema);