const axios = require('axios');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const Publication = require('./models/Publication');

mongoose.connect('mongodb+srv://stanislasrolland05:Stan2005@r4c10.ravue.mongodb.net/');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

async function fetchPublicationsIrisa() {
  const url = 'https://api.archives-ouvertes.fr/search/?q=structId_i:490899&wt=xml&rows=10';
  const response = await axios.get(url);
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);

  const docs = result.response.result[0].doc;

  for (const doc of docs) {
    const label = doc.str.find((str) => str.$.name === 'label_s')._;
    const uri = doc.str.find((str) => str.$.name === 'uri_s')._;
    const id = doc.str.find((str) => str.$.name === 'docid')._;

    const [authorsPart, ...rest] = label.split('. ');
    const authors = authorsPart.split(', ');
    const title = rest[0];

    const parts = rest[1].split(', ');

    const conference = parts[0];
    const date = parts[1];
    const location = parts.slice(2).join(', ');

    const publication = new Publication({
      title: title,
      authors: authors,
      conference: conference,
      date: date,
      location: location,
      id: id,
      uri: uri,
    });

    await publication.save();
  }
}

fetchPublicationsIrisa().then(() => {
  console.log('Publications fetched and saved to MongoDB');
});