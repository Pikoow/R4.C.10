const fs = require('fs');
const axios = require('axios');
const bibtexParse = require('bibtex-parse');

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

  const publications = [];

  for (const entry of parsedEntries) {
    if (!entry.ADDRESS || entry.ADDRESS.trim() === '') {
      continue;
    }

    const authors = entry.AUTHOR.split(' and ').map(author => {
      const [lastName, firstName] = author.split(',').map(part => part.trim());
      return replaceLatexSpecialChars(`${firstName} ${lastName}`);
    });

    publications.push({
      title: replaceLatexSpecialChars(entry.TITLE),
      authors: authors,
      conference: entry.BOOKTITLE || entry.JOURNAL,
      year: entry.YEAR,
      location: replaceLatexSpecialChars(entry.ADDRESS),
      id: entry.HAL_ID,
      uri: entry.URL,
    });
  }

  fs.writeFileSync('publications.json', JSON.stringify(publications, null, 2));
  console.log('Publications saved to publications.json');
}

fetchPublicationsIrisa().then(() => {
  console.log('Publications fetched and saved to JSON file');
});