const express = require('express');
const mongoose = require('mongoose');
const Publication = require('./models/Publication');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://stanislasrolland05:Stan2005@r4c10.ravue.mongodb.net/');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/cesium/Build/Cesium')));

app.get('/api/publications', async (req, res) => {
  try {
    const publications = await Publication.find();
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

app.get('/save-publications', async (req, res) => {
  try {
    const publications = await Publication.find();
    fs.writeFileSync(path.join(__dirname, 'public', 'publications.json'), JSON.stringify(publications));
    res.send('Publications saved to publications.json');
  } catch (error) {
    console.error('Error saving publications:', error);
    res.status(500).json({ error: 'Failed to save publications' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});