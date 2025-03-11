const axios = require('axios');
const bibtexParse = require('bibtex-parse');
const mongoose = require('mongoose');
const Publication = require('./models/Publication');

mongoose.connect('mongodb+srv://stanislasrolland05:Stan2005@r4c10.ravue.mongodb.net/');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

async function fetchPublicationsIrisa() {
  const url = 'https://api.archives-ouvertes.fr/search/?q=structId_i:490899&wt=bibtex&rows=10';
  const response = await axios.get(url);
  const bibtexData = response.data;

  const parsedEntries = bibtexParse.entries(bibtexData);

  for (const entry of parsedEntries) {    
    const publication = new Publication({
      title: entry.TITLE,
      authors: entry.AUTHOR.split(' and ').map(author => author.trim()),
      conference: entry.BOOKTITLE || entry.JOURNAL,
      date: entry.YEAR,
      location: entry.ADDRESS,
      id: entry.HAL_ID,
      uri: entry.URL,
      type: entry.entryType,
    });

    await publication.save();
  }
}

fetchPublicationsIrisa().then(() => {
  console.log('Publications fetched and saved to MongoDB');
});