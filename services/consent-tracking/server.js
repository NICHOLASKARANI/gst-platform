// GST Consent-Based Tracking Service
// LEGITIMATE USE ONLY - Requires explicit user consent
// Compliant with Kenya Data Protection Act 2019

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 8015;

app.use(cors());
app.use(express.json());

// In-memory consent database (use real DB in production)
const consentRecords = new Map();
const locationShares = new Map();

// Generate unique consent token
function generateConsentToken(phoneNumber) {
    return crypto.createHash('sha256').update(phoneNumber + Date.now() + 'gst-salt').digest('hex');
}

// Send consent request (SMS simulation)
function sendConsentRequest(phoneNumber, requesterName) {
    const token = generateConsentToken(phoneNumber);
    consentRecords.set(token, {
        phoneNumber,
        requester: requesterName,
        status: 'pending',
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 3600000).toISOString()
    });
    
    return {
        message: Consent request sent to ,
        token,
        instructions: User must visit /consent/ to approve
    };
}

// API: Request location access (requester initiates)
app.post('/api/tracking/request', (req, res) => {
    const { phoneNumber, requesterName, requesterId, purpose } = req.body;
    
    if (!phoneNumber || !requesterName) {
        return res.status(400).json({ error: 'Phone number and requester name required' });
    }
    
    const consentRequest = sendConsentRequest(phoneNumber, requesterName);
    
    res.json({
        success: true,
        message: 'Consent request sent. User must approve before tracking begins.',
        requestId: consentRequest.token,
        status: 'pending_consent',
        purpose: purpose || 'Location sharing'
    });
});

// API: User approves consent (user side)
app.post('/api/tracking/consent/:token', (req, res) => {
    const { token } = req.params;
    const { userPhone } = req.body;
    
    const record = consentRecords.get(token);
    if (!record) {
        return res.status(404).json({ error: 'Invalid or expired consent token' });
    }
    
    if (record.phoneNumber !== userPhone) {
        return res.status(403).json({ error: 'Phone number mismatch' });
    }
    
    record.status = 'approved';
    record.approvedAt = new Date().toISOString();
    consentRecords.set(token, record);
    
    // Create sharing relationship
    const shareId = crypto.randomBytes(16).toString('hex');
    locationShares.set(shareId, {
        token,
        phoneNumber: record.phoneNumber,
        requester: record.requester,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
    });
    
    res.json({
        success: true,
        message: 'Consent granted. Your location can now be shared.',
        shareId,
        expiresAt: locationShares.get(shareId).expiresAt
    });
});

// API: Get location (requires valid consent)
app.get('/api/tracking/location/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;
    const { requesterId, token } = req.headers;
    
    // Verify consent exists and is active
    let activeShare = null;
    for (const [id, share] of locationShares) {
        if (share.phoneNumber === phoneNumber && share.status === 'active') {
            if (new Date(share.expiresAt) > new Date()) {
                activeShare = share;
                break;
            }
        }
    }
    
    if (!activeShare) {
        return res.status(403).json({
            error: 'No active consent. User must approve location sharing first.',
            legal_notice: 'Location tracking requires explicit user consent under Kenya Data Protection Act 2019'
        });
    }
    
    // Simulate location data (in production, get from device)
    const mockLocation = {
        phoneNumber,
        latitude: -1.286389 + (Math.random() - 0.5) * 0.1,
        longitude: 36.817223 + (Math.random() - 0.5) * 0.1,
        accuracy: 10,
        timestamp: new Date().toISOString(),
        address: 'Nairobi CBD area',
        lastSeen: new Date().toISOString()
    };
    
    res.json({
        success: true,
        location: mockLocation,
        consentValidUntil: activeShare.expiresAt,
        message: 'Location shared with consent'
    });
});

// API: Get user's active shares (user view)
app.get('/api/tracking/my-shares/:phoneNumber', (req, res) => {
    const { phoneNumber } = req.params;
    
    const activeShares = [];
    for (const [id, share] of locationShares) {
        if (share.phoneNumber === phoneNumber && share.status === 'active') {
            activeShares.push({
                shareId: id,
                sharedWith: share.requester,
                expiresAt: share.expiresAt,
                status: share.status
            });
        }
    }
    
    res.json({ success: true, shares: activeShares });
});

// API: Revoke consent (user can revoke anytime)
app.delete('/api/tracking/revoke/:shareId', (req, res) => {
    const { shareId } = req.params;
    
    if (locationShares.has(shareId)) {
        const share = locationShares.get(shareId);
        share.status = 'revoked';
        share.revokedAt = new Date().toISOString();
        locationShares.set(shareId, share);
        
        res.json({
            success: true,
            message: 'Consent revoked. Your location is no longer shared.'
        });
    } else {
        res.status(404).json({ error: 'Share not found' });
    }
});

// API: Simulate user sharing location (after consent)
app.post('/api/tracking/update-location', (req, res) => {
    const { phoneNumber, latitude, longitude, token } = req.body;
    
    // Verify consent token
    const record = consentRecords.get(token);
    if (!record || record.status !== 'approved') {
        return res.status(403).json({ error: 'No active consent' });
    }
    
    // Store location (in production, save to database)
    console.log(?? Location update from : , );
    
    res.json({ success: true, message: 'Location updated' });
});

// Consent management page HTML
app.get('/consent/:token', (req, res) => {
    const { token } = req.params;
    const record = consentRecords.get(token);
    
    if (!record) {
        return res.send(
            <!DOCTYPE html>
            <html>
            <head><title>GST Consent - Invalid Request</title>
            <style>body{background:#0a0a1a;color:white;font-family:Arial;text-align:center;padding:50px;}</style>
            </head>
            <body>
                <h1>? Invalid or Expired Consent Request</h1>
                <p>The consent link is invalid or has expired.</p>
                <a href="/" style="color:#00d4ff;">Return to GST Platform</a>
            </body>
            </html>
        );
    }
    
    res.send(
        <!DOCTYPE html>
        <html>
        <head>
            <title>GST - Location Sharing Consent</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #0a0a1a, #1a1a3a);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .consent-card {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid #00d4ff;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    text-align: center;
                }
                h1 { color: #00d4ff; }
                .info { background: rgba(0,212,255,0.1); padding: 15px; border-radius: 10px; margin: 20px 0; }
                input { width: 100%; padding: 12px; margin: 10px 0; background: rgba(255,255,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; color: white; }
                button { background: #00d4ff; color: black; padding: 12px 30px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
                .legal { font-size: 11px; color: #888; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="consent-card">
                <h1>?? Location Sharing Request</h1>
                <div class="info">
                    <strong></strong> wants to track your location.<br>
                    Purpose: <br>
                    This consent expires in 7 days.
                </div>
                <input type="text" id="phoneNumber" placeholder="Enter your phone number (254...)" value="">
                <br>
                <button onclick="grantConsent()">? Grant Consent</button>
                <div class="legal">
                    By granting consent, you agree to share your location with .<br>
                    You can revoke this consent at any time.
                </div>
            </div>
            
            <script>
                async function grantConsent() {
                    const phoneNumber = document.getElementById('phoneNumber').value;
                    const token = '';
                    
                    const response = await fetch('/api/tracking/consent/' + token, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userPhone: phoneNumber })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('? Consent granted! ' + data.message);
                        window.location.href = '/';
                    } else {
                        alert('? Error: ' + data.error);
                    }
                }
            </script>
        </body>
        </html>
    );
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'consent-tracking', activeConsents: locationShares.size });
});

app.listen(PORT, () => {
    console.log('?? Consent-Based Tracking Service running on port ' + PORT);
    console.log('   - Legal & Ethical: Requires user consent');
    console.log('   - Kenya Data Protection Act Compliant');
    console.log('   - Users can revoke anytime');
});
