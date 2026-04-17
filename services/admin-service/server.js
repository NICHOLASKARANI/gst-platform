// GST Admin Service - Enterprise Management System
// Transaction monitoring, user management, platform oversight

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 8017;

app.use(cors());
app.use(express.json());

// Admin credentials (in production, store in database)
const ADMIN_CREDENTIALS = {
    username: 'admin@gst.africa',
    passwordHash: bcrypt.hashSync('Admin@GST2026!', 10),
    role: 'super_admin',
    name: 'Nicholas Karani',
    permissions: ['all']
};

// Mock transaction database (in production, use real database)
let transactions = [];
let users = [];
let serviceLogs = [];

// Generate mock transactions
for (let i = 0; i < 50; i++) {
    const methods = ['mpesa', 'stripe', 'bank_transfer'];
    const statuses = ['completed', 'pending', 'failed'];
    const plans = ['Pro', 'Enterprise', 'Government'];
    
    transactions.push({
        id: i + 1,
        transactionId: 'TXN-' + Date.now() + i + Math.random().toString(36).substr(2, 8),
        userId: 1000 + i,
        userName: ['John Mwangi', 'Sarah Wanjiku', 'James Otieno', 'Mary Achieng', 'Peter Omondi'][Math.floor(Math.random() * 5)],
        userEmail: user@example.com,
        amount: [77, 5000, 50000][Math.floor(Math.random() * 3)],
        currency: 'USD',
        paymentMethod: methods[Math.floor(Math.random() * 3)],
        status: statuses[Math.floor(Math.random() * 3)],
        plan: plans[Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
        phoneNumber: 2547,
        mpesaReceipt: Math.random() > 0.5 ? RCT : null
    });
}

// Mock users
for (let i = 0; i < 100; i++) {
    const tiers = ['free', 'pro', 'enterprise'];
    users.push({
        id: 1000 + i,
        name: User ,
        email: user@gst.africa,
        phone: 2547,
        subscriptionTier: tiers[Math.floor(Math.random() * 3)],
        subscriptionExpires: new Date(Date.now() + Math.random() * 365 * 24 * 3600000).toISOString(),
        registeredAt: new Date(Date.now() - Math.random() * 180 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
        totalSpent: Math.floor(Math.random() * 10000),
        apiCalls: Math.floor(Math.random() * 100000)
    });
}

// Authentication middleware
function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gst-admin-secret-key');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username !== ADMIN_CREDENTIALS.username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { username: ADMIN_CREDENTIALS.username, role: 'admin', name: ADMIN_CREDENTIALS.name },
            process.env.JWT_SECRET || 'gst-admin-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            admin: {
                name: ADMIN_CREDENTIALS.name,
                role: ADMIN_CREDENTIALS.role,
                permissions: ADMIN_CREDENTIALS.permissions
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

app.get('/api/admin/transactions', authenticateAdmin, (req, res) => {
    const { status, method, startDate, endDate, limit = 100 } = req.query;
    
    let filtered = [...transactions];
    
    if (status) filtered = filtered.filter(t => t.status === status);
    if (method) filtered = filtered.filter(t => t.paymentMethod === method);
    if (startDate) filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(endDate));
    
    filtered = filtered.slice(0, parseInt(limit));
    
    const stats = {
        total: transactions.length,
        totalRevenue: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        mpesaTotal: transactions.filter(t => t.paymentMethod === 'mpesa' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
        stripeTotal: transactions.filter(t => t.paymentMethod === 'stripe' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
    };
    
    res.json({ success: true, transactions: filtered, stats });
});

app.get('/api/admin/transactions/:id', authenticateAdmin, (req, res) => {
    const transaction = transactions.find(t => t.id === parseInt(req.params.id));
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true, transaction });
});

// ============================================
// USER MANAGEMENT
// ============================================

app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    const { tier, limit = 100 } = req.query;
    
    let filtered = [...users];
    if (tier) filtered = filtered.filter(u => u.subscriptionTier === tier);
    
    const stats = {
        total: users.length,
        free: users.filter(u => u.subscriptionTier === 'free').length,
        pro: users.filter(u => u.subscriptionTier === 'pro').length,
        enterprise: users.filter(u => u.subscriptionTier === 'enterprise').length,
        totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
        averageApiCalls: Math.floor(users.reduce((sum, u) => sum + u.apiCalls, 0) / users.length)
    };
    
    res.json({ success: true, users: filtered.slice(0, parseInt(limit)), stats });
});

app.get('/api/admin/users/:userId', authenticateAdmin, (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.userId));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const userTransactions = transactions.filter(t => t.userId === user.id);
    res.json({ success: true, user, transactions: userTransactions });
});

app.put('/api/admin/users/:userId/subscription', authenticateAdmin, (req, res) => {
    const { tier, duration } = req.body;
    const user = users.find(u => u.id === parseInt(req.params.userId));
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    user.subscriptionTier = tier;
    if (duration) {
        user.subscriptionExpires = new Date(Date.now() + duration * 24 * 3600000).toISOString();
    }
    
    res.json({ success: true, user });
});

// ============================================
// DASHBOARD STATISTICS
// ============================================

app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todayTransactions = transactions.filter(t => new Date(t.timestamp) >= today);
    const monthTransactions = transactions.filter(t => new Date(t.timestamp) >= thisMonth);
    
    const dailyRevenue = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(day => {
        const dayTotal = transactions
            .filter(t => t.status === 'completed' && t.timestamp.startsWith(day))
            .reduce((sum, t) => sum + t.amount, 0);
        dailyRevenue[day] = dayTotal;
    });
    
    const stats = {
        today: {
            revenue: todayTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
            transactions: todayTransactions.length,
            newUsers: Math.floor(Math.random() * 50)
        },
        thisMonth: {
            revenue: monthTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
            transactions: monthTransactions.length,
            newUsers: Math.floor(Math.random() * 500)
        },
        total: {
            revenue: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
            transactions: transactions.length,
            users: users.length
        },
        dailyRevenue,
        paymentMethods: {
            mpesa: transactions.filter(t => t.paymentMethod === 'mpesa' && t.status === 'completed').length,
            stripe: transactions.filter(t => t.paymentMethod === 'stripe' && t.status === 'completed').length,
            bankTransfer: transactions.filter(t => t.paymentMethod === 'bank_transfer' && t.status === 'completed').length
        },
        topUsers: [...users].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)
    };
    
    res.json({ success: true, stats });
});

// ============================================
// SYSTEM LOGS
// ============================================

app.get('/api/admin/logs', authenticateAdmin, (req, res) => {
    const { level, limit = 100 } = req.query;
    
    let filtered = [...serviceLogs];
    if (level) filtered = filtered.filter(l => l.level === level);
    
    res.json({ success: true, logs: filtered.slice(0, parseInt(limit)) });
});

app.post('/api/admin/logs', authenticateAdmin, (req, res) => {
    const { level, message, service } = req.body;
    serviceLogs.unshift({
        id: serviceLogs.length + 1,
        timestamp: new Date().toISOString(),
        level,
        message,
        service,
        admin: req.admin.username
    });
    res.json({ success: true });
});

// ============================================
// SERVICE STATUS
// ============================================

app.get('/api/admin/services', authenticateAdmin, (req, res) => {
    const services = [
        { name: 'Auth Service', port: 8005, status: 'healthy', uptime: '99.99%' },
        { name: 'Payment Service', port: 8006, status: 'healthy', uptime: '99.95%' },
        { name: 'Quantum Service', port: 8008, status: 'healthy', uptime: '99.98%' },
        { name: 'Prediction Engine', port: 8011, status: 'healthy', uptime: '99.97%' },
        { name: 'Space Weather', port: 8012, status: 'healthy', uptime: '99.99%' },
        { name: 'Moon Tracking', port: 8013, status: 'healthy', uptime: '100%' },
        { name: 'Satellite Intel', port: 8014, status: 'healthy', uptime: '99.96%' },
        { name: 'Consent Tracking', port: 8015, status: 'healthy', uptime: '99.99%' },
        { name: 'Advanced Satellite', port: 8016, status: 'healthy', uptime: '99.99%' }
    ];
    
    res.json({ success: true, services });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'admin-service' });
});

app.listen(PORT, () => {
    console.log('?? Admin Service running on port ' + PORT);
    console.log('   - Transaction monitoring: Active');
    console.log('   - User management: Active');
    console.log('   - Analytics dashboard: Active');
    console.log('   - System logs: Active');
});
