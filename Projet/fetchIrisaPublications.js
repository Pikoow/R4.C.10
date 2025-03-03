const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Publication = require('./models/Publication');

mongoose.connect('mongodb+srv://stanislasrolland05:Stan2005@r4c10.ravue.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

async function fetchAuthorPublications(pid) {
  const url = `https://dblp.org/search/publ/api?q=${pid}&h=1000`;
  const response = await axios.get(url);
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);

  const hits = result.result.hits[0].hit;
  for (const hit of hits) {
    const info = hit.info[0];
    const authors = info.authors[0].author.map(author => ({
      name: author._,
      pid: author.$.pid
    }));

    const publication = new Publication({
      title: info.title[0],
      authors: authors,
      venue: info.venue[0],
      pages: info.pages[0],
      year: parseInt(info.year[0]),
      type: info.type[0],
      access: info.access[0],
      key: info.key[0],
      doi: info.doi ? info.doi[0] : null,
      ee: info.ee ? info.ee[0] : null,
      url: info.url[0]
    });

    await publication.save();
  }
}

async function fetchIrisaPublications() {
  const publications = await Publication.find({ 'authors.isIrisaAffiliated': true });
  for (const publication of publications) {
    for (const author of publication.authors) {
      if (author.isIrisaAffiliated) {
        await fetchAuthorPublications(author.pid);
      }
    }
  }
}

fetchIrisaPublications().then(() => {
  console.log('IRISA publications fetched and saved to MongoDB');
});