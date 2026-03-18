import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'GST API Gateway',
        version: '1.0.0',
        services: {
            satellites: 'http://localhost:8001',
            weather: 'http://localhost:8002',
            location: 'http://localhost:8003'
        }
    });
});

app.use('/api/satellites', createProxyMiddleware({ 
    target: 'http://localhost:8001', 
    changeOrigin: true
}));

app.use('/api/weather', createProxyMiddleware({ 
    target: 'http://localhost:8002', 
    changeOrigin: true
}));

app.use('/api/location', createProxyMiddleware({ 
    target: 'http://localhost:8003', 
    changeOrigin: true
}));

app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log("🚪 API Gateway running on http://localhost:");
    console.log("📡 Proxying to:");
    console.log('   - Satellite Engine: http://localhost:8001');
    console.log('   - Weather AI: http://localhost:8002');
    console.log('   - Location Service: http://localhost:8003');
});

