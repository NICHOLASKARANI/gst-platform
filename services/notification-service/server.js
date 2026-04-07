// GST Notification Service
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8009;

app.use(cors());
app.use(express.json());

// Store active connections
const clients = new Map();
let notificationId = 0;

// WebSocket Server
const wss = new WebSocket.Server({ port: 8010 });

wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);
    console.log(Client  connected);
    
    ws.on('message', (message) => {
        console.log(Received: );
    });
    
    ws.on('close', () => {
        clients.delete(clientId);
        console.log(Client  disconnected);
    });
    
    // Send welcome notification
    ws.send(JSON.stringify({
        id: notificationId++,
        type: 'info',
        title: 'Connected to GST Notification Service',
        message: 'You will receive real-time alerts',
        timestamp: new Date().toISOString()
    }));
});

// Broadcast notification to all clients
function broadcastNotification(notification) {
    notification.id = notificationId++;
    notification.timestamp = new Date().toISOString();
    
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
        }
    });
}

// API Endpoints
app.post('/api/notifications/send', (req, res) => {
    try {
        const { type, title, message, target } = req.body;
        broadcastNotification({ type, title, message, target });
        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notifications/history', (req, res) => {
    res.json({ notifications: [] });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'notification-service', connections: clients.size });
});

app.listen(PORT, () => {
    console.log('?? Notification Service running on port ' + PORT);
    console.log('   WebSocket: ws://localhost:8010');
});
