import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        service: 'GST Location Service',
        status: 'operational',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', service: 'location-service' });
});

app.post('/api/location/update', (req, res) => {
    console.log('Location update received:', req.body);
    res.json({ success: true, message: 'Location updated', data: req.body });
});

app.get('/api/location/:userId', (req, res) => {
    res.json({
        userId: req.params.userId,
        location: {
            lat: -1.286389,
            lng: 36.817223,
            accuracy: 10,
            timestamp: new Date().toISOString()
        }
    });
});

app.listen(port, () => {
    console.log("📍 Location service running on http://localhost:");
});

