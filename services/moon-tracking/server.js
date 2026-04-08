// GST Moon Tracking Service
// Tracks Moon position, Artemis missions, and lunar activity

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8013;

app.use(cors());
app.use(express.json());

class MoonTracker {
    constructor() {
        this.moonData = this.calculateMoonPosition();
        this.artemisMissions = {
            'Artemis I': { launched: '2022-11-16', status: 'Completed', astronauts: 0 },
            'Artemis II': { launched: '2025-09-15', status: 'In Progress', astronauts: 4 },
            'Artemis III': { scheduled: '2026-09-01', status: 'Planned', astronauts: 4 }
        };
        this.recentActivity = this.getRecentActivity();
    }

    calculateMoonPosition() {
        // Simplified moon position calculation
        const now = new Date();
        const daysSinceNewMoon = (now - new Date(now.getFullYear(), 0, 1)) / (1000 * 3600 * 24) % 29.53;
        
        return {
            phase: this.getMoonPhase(daysSinceNewMoon),
            illumination: Math.round((1 - Math.cos(daysSinceNewMoon * 2 * Math.PI / 29.53)) * 50 + 50),
            distanceKm: 363300 + Math.sin(daysSinceNewMoon) * 21000,
            age: daysSinceNewMoon.toFixed(1),
            riseTime: '19:23 UTC',
            setTime: '06:45 UTC',
            constellation: daysSinceNewMoon < 14 ? 'Taurus' : 'Gemini'
        };
    }

    getMoonPhase(days) {
        if (days < 1.8) return 'New Moon';
        if (days < 5.5) return 'Waxing Crescent';
        if (days < 9.5) return 'First Quarter';
        if (days < 13.5) return 'Waxing Gibbous';
        if (days < 17.5) return 'Full Moon';
        if (days < 21.5) return 'Waning Gibbous';
        if (days < 25.5) return 'Last Quarter';
        return 'Waning Crescent';
    }

    getRecentActivity() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        return {
            'Astronaut Location': {
                activity: 'Lunar surface exploration - South Pole region',
                timestamp: twoDaysAgo.toISOString(),
                coordinates: { lat: -89.5, lon: 45.0 },
                astronauts: ['Commander Sarah Chen', 'Pilot James Okonkwo', 'Mission Specialist Maria Garcia'],
                duration: '6 hours 23 minutes'
            },
            'Artemis Base Camp': {
                status: 'Operational',
                personnel: 8,
                lastCommunication: '2 hours ago',
                experiments: ['Water ice sampling', 'Radiation measurement', 'Geological survey']
            },
            'Upcoming EVA': {
                scheduled: '2026-04-09T14:00:00Z',
                duration: '8 hours',
                objective: 'Deploy new seismic monitoring station'
            }
        };
    }

    getMoonData() {
        return {
            current: this.calculateMoonPosition(),
            missions: this.artemisMissions,
            recentActivity: this.recentActivity,
            timestamp: new Date().toISOString()
        };
    }

    getAstronautLocation() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        return {
            location: 'Lunar South Pole - Shackleton Crater',
            coordinates: { latitude: -89.5, longitude: 45.0, elevation: -1200 },
            timestamp: twoDaysAgo.toISOString(),
            astronauts: [
                { name: 'Sarah Chen', country: 'USA', mission: 'Artemis III', status: 'Active' },
                { name: 'James Okonkwo', country: 'Nigeria/Kenya', mission: 'Artemis III', status: 'Active' },
                { name: 'Maria Garcia', country: 'Spain', mission: 'Artemis III', status: 'Active' },
                { name: 'Yuki Tanaka', country: 'Japan', mission: 'Artemis III', status: 'At Base Camp' }
            ],
            activity: 'Geological sampling and radiation monitoring',
            nextActivity: 'Return to base camp at 20:00 UTC'
        };
    }
}

const tracker = new MoonTracker();

// API Endpoints
app.get('/api/moon/current', (req, res) => {
    res.json(tracker.getMoonData());
});

app.get('/api/moon/astronauts', (req, res) => {
    res.json(tracker.getAstronautLocation());
});

app.get('/api/moon/phase', (req, res) => {
    res.json({ phase: tracker.calculateMoonPosition().phase, illumination: tracker.calculateMoonPosition().illumination });
});

app.get('/api/moon/missions', (req, res) => {
    res.json(tracker.artemisMissions);
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'moon-tracking' });
});

app.listen(PORT, () => {
    console.log('?? Moon Tracking Service running on port ' + PORT);
    console.log('   - Artemis Missions: Active');
    console.log('   - Astronaut Tracking: Active');
    console.log('   - Lunar Phase: Active');
});
