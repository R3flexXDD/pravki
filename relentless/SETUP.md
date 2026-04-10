# Relentless CS:GO Cheat Website

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- express (web server)
- express-session (session management)
- bcryptjs (password hashing)
- better-sqlite3 (SQLite database)
- nodemon (development auto-reload)

### 2. Configure Payment Details
Edit `public/js/main.js` and update the payment configuration:
```javascript
const PAYMENT_CONFIG = {
    sbp: {
        phone: '+7 (XXX) XXX-XX-XX', // Your SBP phone number
    },
    p2p: {
        card: 'XXXX XXXX XXXX XXXX', // Your card number
    },
    crypto: {
        addresses: {
            btc: 'bc1q...', // Your BTC address
            eth: '0x...', // Your ETH address
            usdt: 'T...' // Your USDT (TRC20) address
        }
    }
};
```

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The site will be available at: http://localhost:3000

## Database

The application uses SQLite database (`relentless.db`) with the following tables:

### users
- id (PRIMARY KEY)
- name
- email (UNIQUE)
- password (hashed with bcrypt)
- created_at

### subscriptions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- plan (e.g., "External 1 Month")
- type (Internal/External)
- status (active/expired)
- started_at
- expires_at
- payment_method
- transaction_proof

### support_tickets
- id (PRIMARY KEY)
- user_id (FOREIGN KEY, nullable)
- name
- email
- message
- status (open/closed)
- created_at

Database is automatically created on first run.

## Features

- User registration and authentication with bcrypt
- SQLite database for persistent storage
- Two subscription types: External and Internal
- Multiple payment methods: SBP, P2P Card, Crypto (BTC, ETH, USDT)
- Payment verification system
- Support ticket system
- Automatic subscription expiration (checked every minute)

## Subscription Plans

### External
- 7 Days - $2.49
- 1 Month - $19.99
- 3 Months - $49.99
- 6 Months - $89.99

### Internal
- 7 Days - $6.23
- 1 Month - $39.98
- 3 Months - $99.98
- 6 Months - $179.98

## API Endpoints

### Authentication
- POST `/api/register` - Create new account
- POST `/api/login` - Login
- POST `/api/logout` - Logout
- GET `/api/user` - Get current user info

### Payment
- POST `/api/payment/verify` - Verify payment and activate subscription

### Support
- POST `/api/support` - Submit support ticket
- GET `/api/support/tickets` - Get user's tickets

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- Sessions expire after 24 hours
- All payment transactions are logged with proof
- Database uses prepared statements to prevent SQL injection
- Subscriptions automatically expire when time runs out
- Set `cookie.secure: true` in production with HTTPS

## Database Management

View database contents:
```bash
sqlite3 relentless.db
```

Common queries:
```sql
-- View all users
SELECT * FROM users;

-- View active subscriptions
SELECT u.email, s.plan, s.type, s.expires_at 
FROM subscriptions s 
JOIN users u ON s.user_id = u.id 
WHERE s.status = 'active';

-- View support tickets
SELECT * FROM support_tickets ORDER BY created_at DESC;
```
