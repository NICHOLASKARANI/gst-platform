// GST Space Weather Monitor
// Tracks solar activity, geomagnetic storms, and aurora forecasts

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8012;

app.use(cors());
app.use(express.json());

class SpaceWeatherMonitor {
    constructor() {
        this.currentData = this.generateInitialData();
        this.updateInterval = setInterval(() => this.update(), 60000); // Update every minute
    }

    generateInitialData() {
        return {
            solarWind: { speed: 380 + Math.random() * 100, density: 5 + Math.random() * 10 },
            sunspots: { count: Math.floor(50 + Math.random() * 100), region: 'AR' + Math.floor(3000 + Math.random() * 500) },
            geomagnetic: { kp: (2 + Math.random() * 7).toFixed(1), storm: Math.random() > 0.8 ? 'G1 Minor' : 'None' },
            aurora: { visibility: Math.random() > 0.7, latitude: 60 + Math.random() * 20 },
            satellites: { total: 1247, active: 1198, decaying: 12 },
            lastUpdate: new Date().toISOString()
        };
    }

    update() {
        this.currentData = this.generateInitialData();
        this.currentData.lastUpdate = new Date().toISOString();
    }

    getData() {
        return this.currentData;
    }
}

const monitor = new SpaceWeatherMonitor();

app.get('/api/space-weather', (req, res) => {
    res.json(monitor.getData());
});

app.get('/api/space-weather/aurora', (req, res) => {
    const data = monitor.getData();
    res.json({
        visible: data.aurora.visibility,
        bestLatitude: data.aurora.latitude,
        forecast: data.aurora.visibility ? 'Visible tonight in high latitudes' : 'Low activity expected'
    });
});

app.get('/api/space-weather/solar-flares', (req, res) => {
    const flares = [
        { class: 'M5.2', time: '2 hours ago', region: 'AR3842' },
        { class: 'C3.1', time: '5 hours ago', region: 'AR3840' }
    ];
    res.json({ flares, nextPrediction: 'Moderate activity expected' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'space-weather' });
});

app.listen(PORT, () => {
    console.log('?? Space Weather Monitor running on port ' + PORT);
});
