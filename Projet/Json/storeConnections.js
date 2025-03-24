const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function geocodeLocation(location) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=555f30d6f40cd6f5f134ba992eda7809`);
    if (response.data.length > 0) {
      return { 
        lat: response.data[0].lat, 
        lon: response.data[0].lon,
        location: location
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding ${location}:`, error.message);
    return null;
  }
}

async function processPublications() {
  try {
    // Read the publications data
    const pubsPath = path.join('publications.json');
    const pubsData = JSON.parse(fs.readFileSync(pubsPath, 'utf-8'));
    
    // Create connections file path
    const connectionsPath = path.join('connections.json');
    
    // Check if connections file exists
    let existingConnections = {};
    if (fs.existsSync(connectionsPath)) {
      existingConnections = JSON.parse(fs.readFileSync(connectionsPath, 'utf-8'));
    }

    // Process each publication
    const irisaCoords = { lat: 48.11653156616513, lon: -1.6397623029868635 };
    const connections = [];
    
    for (const pub of pubsData) {
      if (pub.location && !existingConnections[pub.location]) {
        console.log(`Geocoding new location: ${pub.location}`);
        const coords = await geocodeLocation(pub.location);
        if (coords) {
          connections.push({
            from: irisaCoords,
            to: coords,
            location: pub.location
          });
          // Add to existing connections to avoid duplicates
          existingConnections[pub.location] = coords;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    // Save all connections (existing + new)
    const allConnections = Object.values(existingConnections).map(coord => ({
      from: irisaCoords,
      to: coord,
      location: coord.location
    }));

    fs.writeFileSync(connectionsPath, JSON.stringify(allConnections, null, 2));
    console.log(`Saved ${allConnections.length} connections to connections.json`);
    
  } catch (error) {
    console.error('Error processing publications:', error);
  }
}

processPublications().then(() => {
    console.log('Locations fetched and saved to JSON file');
});