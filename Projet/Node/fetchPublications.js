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

const latexToUnicode = {
  "{\\'e}": "é",
  "{\\`e}": "è",
  "{\\^e}": "ê",
  "{\\~n}": "ñ",
  "{\\`a}": "à",
  "{\\'a}": "á",
  "{\\^a}": "â",
  "{\\~a}": "ã",
  "{\\`i}": "ì",
  "{\\'i}": "í",
  "{\\^i}": "î",
  "{\\~i}": "ĩ",
  "{\\`o}": "ò",
  "{\\'o}": "ó",
  "{\\^o}": "ô",
  "{\\~o}": "õ",
  "{\\`u}": "ù",
  "{\\'u}": "ú",
  "{\\^u}": "û",
  "{\\~u}": "ũ",
  "{\\c{c}}": "ç"
};

function replaceLatexSpecialChars(bibtexEntry) {
  for (const [latexCode, unicodeChar] of Object.entries(latexToUnicode)) {
    const regex = new RegExp(latexCode.replace(/[{}]/g, '\\$&'), 'g');
    bibtexEntry = bibtexEntry.replace(regex, unicodeChar);
  }
  return bibtexEntry;
}

async function fetchPublicationsIrisa() {
  const url = 'https://api.archives-ouvertes.fr/search/?q=structId_i:490899&wt=bibtex&rows=10000';
  const response = await axios.get(url, { responseType: 'text' });
  const bibtexData = response.data;

  const parsedEntries = bibtexParse.entries(bibtexData);

  let nbr = 0;

  for (const entry of parsedEntries) {
    if (!entry.ADDRESS || entry.ADDRESS.trim() === '') {
      continue;
    }

    const authors = entry.AUTHOR.split(' and ').map(author => {
      const [lastName, firstName] = author.split(',').map(part => part.trim());
      return replaceLatexSpecialChars(`${firstName} ${lastName}`);
    });

    const publication = new Publication({
      title: replaceLatexSpecialChars(entry.TITLE),
      authors: authors,
      conference: entry.BOOKTITLE || entry.JOURNAL,
      year: entry.YEAR,
      location: replaceLatexSpecialChars(entry.ADDRESS),
      id: entry.HAL_ID,
      uri: entry.URL,
    });

    nbr++;
    await publication.save();
    console.log(`Saving publication number ${nbr}.`);
  }
}

fetchPublicationsIrisa().then(() => {
  console.log('Publications fetched and saved to MongoDB');
});