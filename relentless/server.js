const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new Database('relentless.db');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        payment_method TEXT,
        transaction_proof TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);

console.log('✅ Database initialized');

// Prepared statements
const stmts = {
    createUser: db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)'),
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
    
    createSubscription: db.prepare(`
        INSERT INTO subscriptions (user_id, plan, type, expires_at, payment_method, transaction_proof)
        VALUES (?, ?, ?, ?, ?, ?)
    `),
    getActiveSubscription: db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')
        ORDER BY expires_at DESC LIMIT 1
    `),
    expireOldSubscriptions: db.prepare(`
        UPDATE subscriptions 
        SET status = 'expired' 
        WHERE status = 'active' AND expires_at <= datetime('now')
    `),
    
    createTicket: db.prepare(`
        INSERT INTO support_tickets (user_id, name, email, message)
        VALUES (?, ?, ?, ?)
    `),
    getUserTickets: db.prepare(`
        SELECT * FROM support_tickets 
        WHERE email = ? 
        ORDER BY created_at DESC
    `)
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'relentless-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Expire old subscriptions on startup and periodically
stmts.expireOldSubscriptions.run();
setInterval(() => {
    stmts.expireOldSubscriptions.run();
}, 60000); // Check every minute

// API Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = stmts.getUserByEmail.get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = stmts.createUser.run(name, email, hashedPassword);
        const userId = result.lastInsertRowid;

        req.session.userId = userId;
        req.session.user = { email, name };
        
        console.log(`✅ New user registered: ${email} (ID: ${userId})`);
        
        res.json({ 
            success: true, 
            message: 'Account created successfully',
            user: { email, name }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = stmts.getUserByEmail.get(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.user = { email: user.email, name: user.name };
        
        console.log(`✅ User logged in: ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Logged in successfully',
            user: { email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const user = stmts.getUserById.get(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const subscription = stmts.getActiveSubscription.get(user.id);

        res.json({ 
            user: { 
                email: user.email, 
                name: user.name,
                subscription: subscription ? {
                    plan: subscription.plan,
                    type: subscription.type,
                    status: subscription.status,
                    expiresAt: subscription.expires_at
                } : null,
                createdAt: user.created_at
            } 
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit support ticket
app.post('/api/support', (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const userId = req.session.userId || null;
        const result = stmts.createTicket.run(userId, name, email, message);
        const ticketId = result.lastInsertRowid;

        console.log(`✅ Support ticket #${ticketId} created by ${email}`);

        res.json({ 
            success: true, 
            message: 'Support ticket submitted successfully',
            ticketId 
        });
    } catch (error) {
        console.error('Support ticket error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's support tickets
app.get('/api/support/tickets', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const tickets = stmts.getUserTickets.all(req.session.user.email);
        res.json({ tickets });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Payment verification endpoint
app.post('/api/payment/verify', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const { method, plan, price, proof } = req.body;

        if (!method || !plan || !price || !proof) {
            return res.status(400).json({ error: 'Missing payment information' });
        }

        // Validate proof
        if (proof.length < 4) {
            return res.status(400).json({ error: 'Invalid transaction proof' });
        }

        // Find user
        const user = stmts.getUserById.get(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Determine subscription type (Internal or External)
        const type = plan.includes('Internal') ? 'Internal' : 'External';

        // Calculate subscription duration
        let durationDays = 0;
        if (plan.includes('7 Days')) durationDays = 7;
        else if (plan.includes('1 Month')) durationDays = 30;
        else if (plan.includes('3 Months')) durationDays = 90;
        else if (plan.includes('6 Months')) durationDays = 180;

        if (durationDays === 0) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        const expiresAtISO = expiresAt.toISOString();

        // Create subscription
        stmts.createSubscription.run(
            user.id,
            plan,
            type,
            expiresAtISO,
            method,
            proof
        );

        console.log(`✅ Payment verified for ${user.email}`);
        console.log(`   Plan: ${plan} (${type})`);
        console.log(`   Method: ${method}`);
        console.log(`   Proof: ${proof}`);
        console.log(`   Expires: ${expiresAtISO}`);

        res.json({ 
            success: true, 
            message: 'Payment verified and subscription activated',
            subscription: {
                plan: plan,
                type: type,
                expiresAt: expiresAtISO
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🔥 Relentless site running on http://localhost:${PORT}`);
    console.log(`📊 Database: relentless.db`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('\n✅ Database closed');
    process.exit(0);
});
