const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Publication = require('./models/Publication');

mongoose.connect('mongodb+srv://stanislasrolland05:Stan2005@r4c10.ravue.mongodb.net/');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

async function fetchPublications() {
  const url = 'https://dblp.org/search/publ/api?q=Laurent%20d%27Orazio&h=1000';
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

    const irisaMembers = [];

    for (const author of authors) {
      const name = author.name;
      const url = `https://dblp.org/search/author/api?q=${name}&h=1000`;
      const response = await axios.get(url);
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      const hits = result.result.hits[0].hit.info.notes[0].note;
      if (hits.includes("IRISA") || hits.includes("irisa") || hits.includes("Irisa")) {
        irisaMembers.push({name:author.name, pid:author.pid});
      }
    }

    console.log(irisaMembers);

    const id = hit.$.id;
    const pages = info.pages ? info.pages[0] : info.volume ? info.volume[0] : null;

    if (info.type == "Conference and Workshop Papers" || info.type == "Journal Articles") {
      const publication = new Publication({
        iddblp: id,
        title: info.title ? info.title[0] : null,
        authors: authors,
        venue: info.venue ? info.venue[0] : null,
        pages: pages,
        year: info.year ? parseInt(info.year[0]) : null,
        type: info.type ? info.type[0] : null,
        doi: info.doi ? info.doi[0] : null,
        ee: info.ee ? info.ee[0] : null,
        url: info.url ? info.url[0] : null,
      });

      await publication.save();
    }
  }
}

fetchPublications().then(() => {
  console.log('Publications fetched and saved to MongoDB');
});