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
- nodemon (development auto-reload)

No external database required - uses JSON files for storage.

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

The application uses JSON files for data storage in the `./database/` directory:

### users.json
- User accounts with hashed passwords
- Fields: id, name, email, password, created_at

### subscriptions.json
- Active and expired subscriptions
- Fields: id, user_id, plan, type, status, started_at, expires_at, payment_method, transaction_proof

### tickets.json
- Support tickets from users
- Fields: id, user_id, name, email, message, status, created_at

Database files are automatically created on first run. No external database software required.

## Features

- User registration and authentication with bcrypt
- JSON file-based database (no external dependencies)
- Works on any Node.js version 10+
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
- Subscriptions automatically expire when time runs out
- Set `cookie.secure: true` in production with HTTPS
- JSON files are stored in `./database/` directory
- Add `database/` to `.gitignore` to protect user data

## Database Management

View database contents:
```bash
# View users
cat database/users.json

# View subscriptions
cat database/subscriptions.json

# View support tickets
cat database/tickets.json
```

Or use any JSON viewer/editor.
