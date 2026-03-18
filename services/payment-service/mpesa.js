const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8006;

app.use(cors());
app.use(express.json());

// Mock M-Pesa endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount } = req.body;
        
        // Mock response
        res.json({
            success: true,
            message: 'STK push sent successfully',
            CheckoutRequestID: 'mock-' + Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mpesa/status/:id', (req, res) => {
    res.json({
        status: 'COMPLETED',
        CheckoutRequestID: req.params.id
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'mpesa-service' });
});

app.listen(PORT, () => {
    console.log(?? M-Pesa service running on port );
});
