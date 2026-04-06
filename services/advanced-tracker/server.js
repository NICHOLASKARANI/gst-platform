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

async function fetchSpaceObjects() {
    try {
        console.log('Fetching space objects...');
        const satResponse = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', { timeout: 10000 });
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
        io.emit('space-update', { count: spaceObjects.length, objects: spaceObjects.slice(0, 100), timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Error fetching space objects:', error.message);
    }
}

function getSatelliteType(name) {
    const n = name.toLowerCase();
    if (n.includes('iss')) return 'Space Station';
    if (n.includes('gps')) return 'Navigation';
    if (n.includes('starlink')) return 'Communications';
    if (n.includes('hubble')) return 'Telescope';
    if (n.includes('tiangong')) return 'Space Station';
    if (n.includes('weather')) return 'Weather';
    if (n.includes('earth')) return 'Earth Observation';
    return 'Satellite';
}

async function fetchDisasters() {
    try {
        console.log('Fetching disaster data...');
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events', { timeout: 10000 });
        disasters = (response.data.events || []).slice(0, 30).map(event => ({
            id: event.id,
            title: event.title,
            type: event.categories?.[0]?.title || 'Natural Disaster',
            coordinates: event.geometries?.[0]?.coordinates || [0, 0],
            date: event.geometries?.[0]?.date || new Date().toISOString()
        }));
        console.log('Tracked ' + disasters.length + ' active disasters');
        io.emit('disaster-update', { count: disasters.length, disasters: disasters });
    } catch (error) {
        console.error('Error fetching disasters:', error.message);
    }
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
    io.emit('emergency-update', { zones: emergencyZones });
}

async function fetchLaunches() {
    try {
        const response = await axios.get('https://api.spacexdata.com/v5/launches/upcoming', { timeout: 10000 });
        launches = (response.data || []).slice(0, 10).map(l => ({ mission: l.name, date: l.date_utc, provider: 'SpaceX' }));
        io.emit('launch-update', { launches: launches });
    } catch (error) {
        console.error('Error fetching launches:', error.message);
    }
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
