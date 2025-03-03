const axios = require('axios');
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

async function checkIrisaAffiliation(pid) {
  const url = `https://dblp.org/pid/${pid}.html`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const affiliation = $('span[itemprop="name"]').text();
  console.log(affiliation.includes('IRISA'));
  return affiliation.includes('IRISA');
}

async function updateAuthorsAffiliation() {
  const publications = await Publication.find();
  for (const publication of publications) {
    for (const author of publication.authors) {
      author.isIrisaAffiliated = await checkIrisaAffiliation(author.pid);
    }
    await publication.save();
  }
}

updateAuthorsAffiliation().then(() => {
  console.log('Authors affiliation updated');
});