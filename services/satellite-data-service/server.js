const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Store satellite data
let satellites = [];
let lastUpdate = null;

// Fetch TLE data from CelesTrak
async function fetchSatelliteData() {
    try {
        console.log('??? Fetching satellite data...');
        const response = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');
        const tleData = response.data;
        
        // Parse TLE data
        const lines = tleData.split('\n');
        satellites = [];
        
        for (let i = 0; i < lines.length; i += 3) {
            if (i + 2 < lines.length) {
                satellites.push({
                    name: lines[i].trim(),
                    line1: lines[i + 1].trim(),
                    line2: lines[i + 2].trim(),
                    noradId: parseInt(lines[i + 1].substring(2, 7)),
                    lastUpdate: new Date().toISOString()
                });
            }
        }
        
        lastUpdate = new Date().toISOString();
        console.log(? Fetched  satellites);
        
        // Broadcast to all connected clients
        io.emit('satellite-update', { 
            count: satellites.length, 
            satellites: satellites.slice(0, 100), // Send first 100
            lastUpdate 
        });
        
    } catch (error) {
        console.error('Error fetching satellite data:', error.message);
    }
}

// Update every 6 hours
cron.schedule('0 */6 * * *', fetchSatelliteData);

// Initial fetch
fetchSatelliteData();

// API endpoints
app.get('/api/satellites', (req, res) => {
    res.json({
        count: satellites.length,
        lastUpdate,
        satellites: satellites.slice(0, 100)
    });
});

app.get('/api/satellites/:noradId', (req, res) => {
    const satellite = satellites.find(s => s.noradId === parseInt(req.params.noradId));
    if (satellite) {
        res.json(satellite);
    } else {
        res.status(404).json({ error: 'Satellite not found' });
    }
});

app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const results = satellites.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.noradId.toString().includes(query)
    ).slice(0, 50);
    
    res.json({
        count: results.length,
        results
    });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send current data to new client
    socket.emit('satellite-update', { 
        count: satellites.length, 
        satellites: satellites.slice(0, 100),
        lastUpdate 
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 8004;
server.listen(PORT, () => {
    console.log(?? Satellite data service running on port );
});
