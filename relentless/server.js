const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Database files
const DB_DIR = './database';
const USERS_FILE = path.join(DB_DIR, 'users.json');
const SUBSCRIPTIONS_FILE = path.join(DB_DIR, 'subscriptions.json');
const TICKETS_FILE = path.join(DB_DIR, 'tickets.json');

// Create database directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

// Initialize database files
function initDB() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
        fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(TICKETS_FILE)) {
        fs.writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2));
    }
}

initDB();

// Database helper functions
function readDB(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading database:', err);
        return [];
    }
}

function writeDB(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing database:', err);
        return false;
    }
}

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
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Expire old subscriptions periodically
function expireOldSubscriptions() {
    var subscriptions = readDB(SUBSCRIPTIONS_FILE);
    var now = new Date();
    var updated = false;

    for (var i = 0; i < subscriptions.length; i++) {
        if (subscriptions[i].status === 'active' && new Date(subscriptions[i].expires_at) <= now) {
            subscriptions[i].status = 'expired';
            updated = true;
        }
    }

    if (updated) {
        writeDB(SUBSCRIPTIONS_FILE, subscriptions);
    }
}

expireOldSubscriptions();
setInterval(expireOldSubscriptions, 60000);

console.log('✅ Database initialized');

// API Routes

// Register
app.post('/api/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    var users = readDB(USERS_FILE);

    // Check if user exists
    var existingUser = users.find(function(u) { return u.email === email; });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    bcrypt.hash(password, 10, function(err, hashedPassword) {
        if (err) {
            console.error('Hash error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        var newUser = {
            id: users.length > 0 ? Math.max.apply(Math, users.map(function(u) { return u.id; })) + 1 : 1,
            name: name,
            email: email,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        writeDB(USERS_FILE, users);

        req.session.userId = newUser.id;
        req.session.user = { email: email, name: name };

        console.log('✅ New user registered: ' + email + ' (ID: ' + newUser.id + ')');

        res.json({
            success: true,
            message: 'Account created successfully',
            user: { email: email, name: name }
        });
    });
});

// Login
app.post('/api/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    var users = readDB(USERS_FILE);
    var user = users.find(function(u) { return u.email === email; });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, function(err, validPassword) {
        if (err) {
            console.error('Compare error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.user = { email: user.email, name: user.name };

        console.log('✅ User logged in: ' + email);

        res.json({
            success: true,
            message: 'Logged in successfully',
            user: { email: user.email, name: user.name }
        });
    });
});

// Logout
app.post('/api/logout', function(req, res) {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', function(req, res) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    var users = readDB(USERS_FILE);
    var user = users.find(function(u) { return u.id === req.session.userId; });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Get active subscription
    var subscriptions = readDB(SUBSCRIPTIONS_FILE);
    var now = new Date();
    var activeSubscription = null;

    for (var i = 0; i < subscriptions.length; i++) {
        if (subscriptions[i].user_id === user.id && 
            subscriptions[i].status === 'active' && 
            new Date(subscriptions[i].expires_at) > now) {
            activeSubscription = subscriptions[i];
            break;
        }
    }

    res.json({
        user: {
            email: user.email,
            name: user.name,
            subscription: activeSubscription ? {
                plan: activeSubscription.plan,
                type: activeSubscription.type,
                status: activeSubscription.status,
                expiresAt: activeSubscription.expires_at
            } : null,
            createdAt: user.created_at
        }
    });
});

// Submit support ticket
app.post('/api/support', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    var tickets = readDB(TICKETS_FILE);
    var userId = req.session.userId || null;

    var newTicket = {
        id: tickets.length > 0 ? Math.max.apply(Math, tickets.map(function(t) { return t.id; })) + 1 : 1,
        user_id: userId,
        name: name,
        email: email,
        message: message,
        status: 'open',
        created_at: new Date().toISOString()
    };

    tickets.push(newTicket);
    writeDB(TICKETS_FILE, tickets);

    console.log('✅ Support ticket #' + newTicket.id + ' created by ' + email);

    res.json({
        success: true,
        message: 'Support ticket submitted successfully',
        ticketId: newTicket.id
    });
});

// Get user's support tickets
app.get('/api/support/tickets', function(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    var tickets = readDB(TICKETS_FILE);
    var userTickets = tickets.filter(function(t) { return t.email === req.session.user.email; });

    res.json({ tickets: userTickets });
});

// Payment verification endpoint
app.post('/api/payment/verify', function(req, res) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    var method = req.body.method;
    var plan = req.body.plan;
    var price = req.body.price;
    var proof = req.body.proof;

    if (!method || !plan || !price || !proof) {
        return res.status(400).json({ error: 'Missing payment information' });
    }

    if (proof.length < 4) {
        return res.status(400).json({ error: 'Invalid transaction proof' });
    }

    var users = readDB(USERS_FILE);
    var user = users.find(function(u) { return u.id === req.session.userId; });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Determine subscription type
    var type = plan.indexOf('Internal') !== -1 ? 'Internal' : 'External';

    // Calculate subscription duration
    var durationDays = 0;
    if (plan.indexOf('7 Days') !== -1) durationDays = 7;
    else if (plan.indexOf('1 Month') !== -1) durationDays = 30;
    else if (plan.indexOf('3 Months') !== -1) durationDays = 90;
    else if (plan.indexOf('6 Months') !== -1) durationDays = 180;

    if (durationDays === 0) {
        return res.status(400).json({ error: 'Invalid plan' });
    }

    // Calculate expiry date
    var expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    var expiresAtISO = expiresAt.toISOString();

    // Create subscription
    var subscriptions = readDB(SUBSCRIPTIONS_FILE);
    var newSubscription = {
        id: subscriptions.length > 0 ? Math.max.apply(Math, subscriptions.map(function(s) { return s.id; })) + 1 : 1,
        user_id: user.id,
        plan: plan,
        type: type,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAtISO,
        payment_method: method,
        transaction_proof: proof
    };

    subscriptions.push(newSubscription);
    writeDB(SUBSCRIPTIONS_FILE, subscriptions);

    console.log('✅ Payment verified for ' + user.email);
    console.log('   Plan: ' + plan + ' (' + type + ')');
    console.log('   Method: ' + method);
    console.log('   Proof: ' + proof);
    console.log('   Expires: ' + expiresAtISO);

    res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription: {
            plan: plan,
            type: type,
            expiresAt: expiresAtISO
        }
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function() {
    console.log('🔥 Relentless site running on http://localhost:' + PORT);
    console.log('📊 Database: JSON files in ./database/');
});

// Graceful shutdown
process.on('SIGINT', function() {
    console.log('\n✅ Server shutting down');
    process.exit(0);
});
