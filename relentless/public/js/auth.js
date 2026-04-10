// Authentication API functions
const API = {
    async register(name, email, password) {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return response.json();
    },

    async login(email, password) {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    async logout() {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        return response.json();
    },

    async getCurrentUser() {
        const response = await fetch('/api/user');
        if (response.ok) {
            return response.json();
        }
        return null;
    },

    async submitSupport(name, email, message) {
        const response = await fetch('/api/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        return response.json();
    },

    async getTickets() {
        const response = await fetch('/api/support/tickets');
        return response.json();
    },

    async verifyPayment(paymentData) {
        const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        return response.json();
    }
};

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Check if user is logged in on page load
async function checkAuth() {
    const user = await API.getCurrentUser();
    if (user && user.user) {
        updateUIForLoggedInUser(user.user);
    }
}

function updateUIForLoggedInUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (loginBtn && registerBtn) {
        loginBtn.innerHTML = `<span>${user.name}</span>`;
        loginBtn.onclick = () => {
            openAccountSection(user);
        };
        
        registerBtn.innerHTML = '<span>Logout</span>';
        registerBtn.onclick = async () => {
            await API.logout();
            showNotification('Logged out successfully');
            setTimeout(() => location.reload(), 1000);
        };
    }
}

// Open account section
function openAccountSection(user) {
    // Hide all sections
    document.querySelector('.hero').style.display = 'none';
    document.getElementById('featuresSection').classList.add('section-hidden');
    document.getElementById('pricesSection').classList.add('section-hidden');
    document.getElementById('supportSection').classList.add('section-hidden');
    
    // Show account section
    const accountSection = document.getElementById('accountSection');
    accountSection.classList.remove('section-hidden');
    
    // Update account information
    document.getElementById('accountName').textContent = user.name;
    document.getElementById('accountEmail').textContent = user.email;
    
    // Update member since date
    const memberSince = document.getElementById('accountMemberSince');
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        memberSince.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else {
        memberSince.textContent = 'Recently';
    }
    
    // Update subscription status
    const statusBadge = document.getElementById('accountStatusBadge');
    const subscriptionDetails = document.getElementById('accountSubscriptionDetails');
    const manageBtn = document.getElementById('accountManageSubscriptionBtn');
    
    if (user.subscription) {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge status-active';
        subscriptionDetails.innerHTML = `
            <p><strong>Plan:</strong> ${user.subscription.plan}</p>
            <p><strong>Expires:</strong> ${new Date(user.subscription.expiresAt).toLocaleDateString()}</p>
        `;
        manageBtn.textContent = 'Renew Subscription';
    } else {
        statusBadge.textContent = 'No Active Subscription';
        statusBadge.className = 'status-badge status-inactive';
        subscriptionDetails.innerHTML = '<p>Get started with a subscription to access all features</p>';
        manageBtn.textContent = 'Get Subscription';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open profile modal
function openProfileModal(user) {
    const profileModal = document.getElementById('profileModal');
    
    // Update profile information
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    
    // Update member since date
    const memberSince = document.getElementById('memberSince');
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        memberSince.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else {
        memberSince.textContent = 'Recently';
    }
    
    // Update subscription status
    const statusBadge = document.getElementById('statusBadge');
    const subscriptionDetails = document.getElementById('subscriptionDetails');
    const manageBtn = document.getElementById('manageSubscriptionBtn');
    
    if (user.subscription) {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge status-active';
        subscriptionDetails.innerHTML = `
            <p><strong>Plan:</strong> ${user.subscription.plan}</p>
            <p><strong>Expires:</strong> ${new Date(user.subscription.expiresAt).toLocaleDateString()}</p>
        `;
        manageBtn.textContent = 'Renew Subscription';
    } else {
        statusBadge.textContent = 'No Active Subscription';
        statusBadge.className = 'status-badge status-inactive';
        subscriptionDetails.innerHTML = '<p>Get started with a subscription to access all features</p>';
        manageBtn.textContent = 'Get Subscription';
    }
    
    // Show modal
    profileModal.classList.add('show');
}

// Initialize auth check
checkAuth();
