const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

let spaceObjects = [];
let disasters = [];
let emergencyZones = [];
let launches = [];

// Mock data for when APIs fail
const mockSatellites = [
    { name: 'ISS (ZARYA)', noradId: 25544, type: 'Space Station' },
    { name: 'Hubble Space Telescope', noradId: 20580, type: 'Telescope' },
    { name: 'GPS BIIF-2', noradId: 36590, type: 'Navigation' },
    { name: 'Starlink-1000', noradId: 50000, type: 'Communications' },
    { name: 'Tiangong', noradId: 48274, type: 'Space Station' },
    { name: 'GOES-16', noradId: 41866, type: 'Weather' },
    { name: 'Landsat 8', noradId: 39084, type: 'Earth Observation' },
    { name: 'NOAA-20', noradId: 43013, type: 'Weather' },
    { name: 'Sentinel-2A', noradId: 40697, type: 'Earth Observation' },
    { name: 'Meteor-M2', noradId: 40069, type: 'Weather' }
];

async function fetchSpaceObjects() {
    try {
        console.log('Fetching space objects...');
        const satResponse = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', { timeout: 30000 });
        const lines = satResponse.data.split('\n');
        spaceObjects = [];
        
        for (let i = 0; i < lines.length && i < 500; i += 3) {
            if (i + 2 < lines.length && lines[i].trim()) {
                spaceObjects.push({
                    name: lines[i].trim().substring(0, 50),
                    noradId: parseInt(lines[i+1].substring(2, 7)) || 0,
                    type: getSatelliteType(lines[i].trim()),
                    lastUpdate: new Date().toISOString()
                });
            }
        }
        console.log('Tracked ' + spaceObjects.length + ' space objects');
    } catch (error) {
        console.log('Using mock satellite data due to API timeout');
        spaceObjects = mockSatellites;
        console.log('Tracked ' + spaceObjects.length + ' mock space objects');
    }
    
    io.emit('space-update', { count: spaceObjects.length, objects: spaceObjects.slice(0, 100), timestamp: new Date().toISOString() });
}

function getSatelliteType(name) {
    const n = name.toLowerCase();
    if (n.includes('iss')) return 'Space Station';
    if (n.includes('gps')) return 'Navigation';
    if (n.includes('starlink')) return 'Communications';
    if (n.includes('hubble')) return 'Telescope';
    if (n.includes('tiangong')) return 'Space Station';
    if (n.includes('weather')) return 'Weather';
    if (n.includes('earth') || n.includes('landsat') || n.includes('sentinel')) return 'Earth Observation';
    return 'Satellite';
}

async function fetchDisasters() {
    try {
        console.log('Fetching disaster data...');
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events', { timeout: 15000 });
        disasters = (response.data.events || []).slice(0, 30).map(event => ({
            id: event.id,
            title: event.title,
            type: event.categories?.[0]?.title || 'Natural Disaster',
            coordinates: event.geometries?.[0]?.coordinates || [0, 0],
            date: event.geometries?.[0]?.date || new Date().toISOString()
        }));
        console.log('Tracked ' + disasters.length + ' active disasters');
    } catch (error) {
        console.log('Using mock disaster data');
        disasters = [
            { id: 'mock1', title: 'Wildfire - California, USA', type: 'Wildfire', date: new Date().toISOString() },
            { id: 'mock2', title: 'Flooding - Bangladesh', type: 'Flood', date: new Date().toISOString() },
            { id: 'mock3', title: 'Earthquake - Japan', type: 'Earthquake', date: new Date().toISOString() }
        ];
    }
    io.emit('disaster-update', { count: disasters.length, disasters: disasters });
}

function updateEmergencyZones() {
    emergencyZones = [];
    disasters.forEach(d => {
        if (d.coordinates && d.coordinates.length >= 2) {
            let radius = 50;
            if (d.type === 'Wildfire') radius = 100;
            if (d.type === 'Flood') radius = 150;
            if (d.type === 'Earthquake') radius = 200;
            emergencyZones.push({
                id: d.id,
                latitude: d.coordinates[1],
                longitude: d.coordinates[0],
                radius: radius,
                threat: d.type,
                evacuationRecommended: radius > 100
            });
        }
    });
    // Add mock zones if none
    if (emergencyZones.length === 0) {
        emergencyZones = [
            { id: 'zone1', latitude: 37.7749, longitude: -122.4194, radius: 100, threat: 'Wildfire', evacuationRecommended: true },
            { id: 'zone2', latitude: 23.6850, longitude: 90.3563, radius: 150, threat: 'Flood', evacuationRecommended: true }
        ];
    }
    io.emit('emergency-update', { zones: emergencyZones });
}

async function fetchLaunches() {
    try {
        const response = await axios.get('https://api.spacexdata.com/v5/launches/upcoming', { timeout: 10000 });
        launches = (response.data || []).slice(0, 10).map(l => ({ mission: l.name, date: l.date_utc, provider: 'SpaceX' }));
    } catch (error) {
        launches = [
            { mission: 'Falcon 9 - Starlink Group', date: new Date(Date.now() + 86400000).toISOString(), provider: 'SpaceX' },
            { mission: 'Artemis II - Lunar Flyby', date: new Date(Date.now() + 604800000).toISOString(), provider: 'NASA' }
        ];
    }
    io.emit('launch-update', { launches: launches });
}

app.get('/api/space/objects', (req, res) => res.json({ count: spaceObjects.length, objects: spaceObjects.slice(0, 100) }));
app.get('/api/space/disasters', (req, res) => res.json({ disasters: disasters }));
app.get('/api/space/emergency-zones', (req, res) => res.json({ zones: emergencyZones }));
app.get('/api/space/visible', (req, res) => res.json({ visibleCount: Math.min(50, spaceObjects.length), objects: spaceObjects.slice(0, 20) }));
app.get('/health', (req, res) => res.json({ status: 'healthy', objectsTracked: spaceObjects.length, disasters: disasters.length }));

cron.schedule('*/30 * * * *', fetchSpaceObjects);
cron.schedule('*/15 * * * *', fetchDisasters);
cron.schedule('*/5 * * * *', updateEmergencyZones);
cron.schedule('*/60 * * * *', fetchLaunches);

fetchSpaceObjects();
fetchDisasters();
updateEmergencyZones();
fetchLaunches();

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('initial-data', { objects: spaceObjects.slice(0, 100), disasters: disasters, zones: emergencyZones, launches: launches });
    socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 8008;
server.listen(PORT, () => console.log('Advanced Tracker running on port ' + PORT));
