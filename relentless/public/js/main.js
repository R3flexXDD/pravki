// Get elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const paymentModal = document.getElementById('paymentModal');
const profileModal = document.getElementById('profileModal');
const closeBtns = document.querySelectorAll('.close');
const pricesBtn = document.getElementById('pricesBtn');
const pricesBtnNav = document.getElementById('pricesBtnNav');
const pricesBtnInternal = document.getElementById('pricesBtnInternal');
const featuresBtnNav = document.getElementById('featuresBtnNav');
const supportBtn = document.getElementById('supportBtn');
const pricesSection = document.getElementById('pricesSection');
const pricesInternalSection = document.getElementById('pricesInternalSection');
const featuresSection = document.getElementById('featuresSection');
const supportSection = document.getElementById('supportSection');
const accountSection = document.getElementById('accountSection');
const heroSection = document.querySelector('.hero');

// Open modals with animation
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('show');
});

registerBtn.addEventListener('click', () => {
    registerModal.classList.add('show');
});

// Account section actions
document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        API.logout().then(() => {
            showNotification('Logged out successfully');
            setTimeout(() => location.reload(), 1000);
        });
    }
    
    if (e.target.id === 'accountLogoutBtn' || e.target.closest('#accountLogoutBtn')) {
        API.logout().then(() => {
            showNotification('Logged out successfully');
            setTimeout(() => location.reload(), 1000);
        });
    }
    
    if (e.target.id === 'manageSubscriptionBtn' || e.target.closest('#manageSubscriptionBtn')) {
        profileModal.classList.remove('show');
        setTimeout(() => {
            profileModal.style.display = 'none';
            heroSection.style.display = 'none';
            featuresSection.classList.add('section-hidden');
            supportSection.classList.add('section-hidden');
            accountSection.classList.add('section-hidden');
            pricesInternalSection.classList.add('section-hidden');
            pricesSection.classList.remove('section-hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }
    
    if (e.target.id === 'accountManageSubscriptionBtn' || e.target.closest('#accountManageSubscriptionBtn')) {
        heroSection.style.display = 'none';
        featuresSection.classList.add('section-hidden');
        supportSection.classList.add('section-hidden');
        accountSection.classList.add('section-hidden');
        pricesInternalSection.classList.add('section-hidden');
        pricesSection.classList.remove('section-hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.target.id === 'viewPricingBtn' || e.target.closest('#viewPricingBtn')) {
        heroSection.style.display = 'none';
        featuresSection.classList.add('section-hidden');
        supportSection.classList.add('section-hidden');
        accountSection.classList.add('section-hidden');
        pricesInternalSection.classList.add('section-hidden');
        pricesSection.classList.remove('section-hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.target.id === 'contactSupportBtn' || e.target.closest('#contactSupportBtn')) {
        heroSection.style.display = 'none';
        featuresSection.classList.add('section-hidden');
        pricesSection.classList.add('section-hidden');
        pricesInternalSection.classList.add('section-hidden');
        accountSection.classList.add('section-hidden');
        supportSection.classList.remove('section-hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Handle purchase buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-select')) {
        const plan = e.target.getAttribute('data-plan');
        const price = e.target.getAttribute('data-price');
        
        document.getElementById('selectedPlan').textContent = plan;
        document.getElementById('selectedPrice').textContent = price;
        
        paymentModal.classList.add('show');
    }
});

// Payment configuration
const PAYMENT_CONFIG = {
    sbp: {
        title: 'SBP Payment',
        phone: '+7 (XXX) XXX-XX-XX', // Replace with real number
        instructions: 'Transfer to this phone number via SBP'
    },
    p2p: {
        title: 'P2P Card Payment',
        card: 'XXXX XXXX XXXX XXXX', // Replace with real card
        instructions: 'Transfer to this card number'
    },
    crypto: {
        title: 'Crypto Payment',
        addresses: {
            btc: 'bc1qXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with real BTC address
            eth: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with real ETH address
            usdt: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' // Replace with real USDT address
        },
        instructions: 'Send crypto to one of these addresses'
    }
};

let currentPaymentData = null;

// Handle payment methods
document.addEventListener('click', (e) => {
    const paymentBtn = e.target.closest('.payment-btn');
    if (paymentBtn) {
        const method = paymentBtn.getAttribute('data-method');
        if (method) {
            showPaymentDetails(method);
        }
    }
});

function showPaymentDetails(method) {
    const config = PAYMENT_CONFIG[method];
    const modal = document.getElementById('paymentDetailsModal');
    const title = document.getElementById('paymentMethodTitle');
    const instructions = document.getElementById('paymentInstructions');
    
    title.textContent = config.title;
    
    let html = `<p>${config.instructions}</p>`;
    
    if (method === 'sbp') {
        html += `
            <div class="payment-detail-item">
                <h4>SBP Phone</h4>
                <div class="payment-detail-value" onclick="copyToClipboard('${config.phone}')">
                    <span>${config.phone}</span>
                    <span style="font-size: 0.8rem;">📋</span>
                </div>
                <p class="copy-hint">Click to copy</p>
            </div>
        `;
    } else if (method === 'p2p') {
        html += `
            <div class="payment-detail-item">
                <h4>Card Number</h4>
                <div class="payment-detail-value" onclick="copyToClipboard('${config.card}')">
                    <span>${config.card}</span>
                    <span style="font-size: 0.8rem;">📋</span>
                </div>
                <p class="copy-hint">Click to copy</p>
            </div>
        `;
    } else if (method === 'crypto') {
        html += `
            <div class="payment-detail-item">
                <h4>BTC</h4>
                <div class="payment-detail-value" onclick="copyToClipboard('${config.addresses.btc}')">
                    <span style="font-size: 0.85rem;">${config.addresses.btc}</span>
                    <span style="font-size: 0.8rem;">📋</span>
                </div>
            </div>
            <div class="payment-detail-item">
                <h4>ETH</h4>
                <div class="payment-detail-value" onclick="copyToClipboard('${config.addresses.eth}')">
                    <span style="font-size: 0.85rem;">${config.addresses.eth}</span>
                    <span style="font-size: 0.8rem;">📋</span>
                </div>
            </div>
            <div class="payment-detail-item">
                <h4>USDT</h4>
                <div class="payment-detail-value" onclick="copyToClipboard('${config.addresses.usdt}')">
                    <span style="font-size: 0.85rem;">${config.addresses.usdt}</span>
                    <span style="font-size: 0.8rem;">📋</span>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="payment-warning">
            <strong>Amount:</strong> ${document.getElementById('selectedPrice').textContent}
        </div>
    `;
    
    instructions.innerHTML = html;
    
    currentPaymentData = {
        method: method,
        plan: document.getElementById('selectedPlan').textContent,
        price: document.getElementById('selectedPrice').textContent
    };
    
    document.getElementById('paymentModal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('paymentModal').style.display = 'none';
        modal.classList.add('show');
    }, 300);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

// Verify payment
document.addEventListener('click', async (e) => {
    if (e.target.id === 'verifyPaymentBtn' || e.target.closest('#verifyPaymentBtn')) {
        const proofInput = document.getElementById('paymentProof');
        const proof = proofInput.value.trim();
        
        if (!proof) {
            showNotification('Please enter transaction ID or last 4 digits', 'error');
            return;
        }
        
        if (!currentPaymentData) {
            showNotification('Payment data not found', 'error');
            return;
        }
        
        const btn = document.getElementById('verifyPaymentBtn');
        btn.textContent = 'Verifying...';
        btn.disabled = true;
        
        try {
            const result = await API.verifyPayment({
                method: currentPaymentData.method,
                plan: currentPaymentData.plan,
                price: currentPaymentData.price,
                proof: proof
            });
            
            if (result.success) {
                showNotification('Payment verified! Subscription activated.', 'success');
                proofInput.value = '';
                document.getElementById('paymentDetailsModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('paymentDetailsModal').style.display = 'none';
                    location.reload();
                }, 2000);
            } else {
                showNotification(result.error || 'Payment verification failed', 'error');
            }
        } catch (error) {
            showNotification('Verification error', 'error');
        }
        
        btn.textContent = 'Verify Payment';
        btn.disabled = false;
    }
});

// Close modals with animation
closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 300);
    }
});

// Switch sections with animation
pricesBtn.addEventListener('click', () => {
    heroSection.style.display = 'none';
    featuresSection.classList.add('section-hidden');
    supportSection.classList.add('section-hidden');
    accountSection.classList.add('section-hidden');
    pricesInternalSection.classList.add('section-hidden');
    pricesSection.classList.remove('section-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

pricesBtnInternal.addEventListener('click', () => {
    heroSection.style.display = 'none';
    featuresSection.classList.add('section-hidden');
    supportSection.classList.add('section-hidden');
    accountSection.classList.add('section-hidden');
    pricesSection.classList.add('section-hidden');
    pricesInternalSection.classList.remove('section-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

pricesBtnNav.addEventListener('click', () => {
    heroSection.style.display = 'none';
    featuresSection.classList.add('section-hidden');
    supportSection.classList.add('section-hidden');
    accountSection.classList.add('section-hidden');
    pricesInternalSection.classList.add('section-hidden');
    pricesSection.classList.remove('section-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

featuresBtnNav.addEventListener('click', () => {
    heroSection.style.display = 'none';
    pricesSection.classList.add('section-hidden');
    pricesInternalSection.classList.add('section-hidden');
    supportSection.classList.add('section-hidden');
    accountSection.classList.add('section-hidden');
    featuresSection.classList.remove('section-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

supportBtn.addEventListener('click', () => {
    heroSection.style.display = 'none';
    pricesSection.classList.add('section-hidden');
    pricesInternalSection.classList.add('section-hidden');
    featuresSection.classList.add('section-hidden');
    accountSection.classList.add('section-hidden');
    supportSection.classList.remove('section-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Handle forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Check if it's login form
        if (form.closest('#loginModal')) {
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            const result = await API.login(email, password);
            
            if (result.success) {
                showNotification('Logged in successfully!');
                form.reset();
                document.getElementById('loginModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'none';
                    location.reload();
                }, 1000);
            } else {
                showNotification(result.error || 'Login failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
        // Check if it's register form
        else if (form.closest('#registerModal')) {
            const name = form.querySelector('input[type="text"]').value;
            const email = form.querySelector('input[type="email"]').value;
            const passwords = form.querySelectorAll('input[type="password"]');
            const password = passwords[0].value;
            const confirmPassword = passwords[1].value;
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            const result = await API.register(name, email, password);
            
            if (result.success) {
                showNotification('Account created successfully!');
                form.reset();
                document.getElementById('registerModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('registerModal').style.display = 'none';
                    location.reload();
                }, 1000);
            } else {
                showNotification(result.error || 'Registration failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
        // Support form
        else if (form.id === 'supportForm') {
            const name = form.querySelector('input[type="text"]').value;
            const email = form.querySelector('input[type="email"]').value;
            const message = form.querySelector('textarea').value;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            const result = await API.submitSupport(name, email, message);
            
            if (result.success) {
                showNotification(`Support ticket #${result.ticketId} created successfully!`);
                form.reset();
            } else {
                showNotification(result.error || 'Failed to submit ticket', 'error');
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Animate cards on appearance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.price-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});


// Create animated particles
function createParticles() {
    const container = document.getElementById('particlesContainer');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 40 + 20;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation duration
        const duration = Math.random() * 15 + 10;
        particle.style.animationDuration = duration + 's';
        
        // Random delay
        const delay = Math.random() * 5;
        particle.style.animationDelay = delay + 's';
        
        container.appendChild(particle);
    }
}

// Initialize particles on page load
createParticles();
