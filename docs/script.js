let jazzSteps = { startOn1: [], startOn8: [] };
let basicSteps = [];
let mode = '1';
let drawerOpen = false;
let jazzCount = 2;
let basicCount = 1;
let maxJazzCount = 8;
let maxBasicCount = 6;
let qrCode = null;

// Load steps from JSON
async function loadSteps() {
    const display = document.getElementById('display');
    display.innerHTML = '<div class="display-loading">Loading steps…</div>';

    try {
        const response = await fetch('steps.json');
        const data = await response.json();
        jazzSteps = data.jazz;
        basicSteps = data.basic;
        maxJazzCount = jazzSteps.startOn1.length + jazzSteps.startOn8.length;
        maxBasicCount = basicSteps.length;
        display.innerHTML = '<div class="display-placeholder">Tap to generate a combination</div>';
        startStepMarquee();
    } catch (error) {
        console.error('Failed to load steps:', error);
        display.innerHTML = '<div class="display-placeholder">Failed to load. Refresh to try again.</div>';
    }
}

// Step marquee
function startStepMarquee() {
    const marqueeEl = document.getElementById('stepMarquee');
    if (!marqueeEl) return;

    const allSteps = [...jazzSteps.startOn1, ...jazzSteps.startOn8, ...basicSteps];
    const stepText = allSteps.join(' • ');
    // Repeat enough times for seamless loop
    const marqueeText = (stepText + ' • ').repeat(4);

    const content = document.createElement('div');
    content.className = 'step-marquee-content';
    content.textContent = marqueeText;

    const content2 = content.cloneNode(true);

    marqueeEl.appendChild(content);
    marqueeEl.appendChild(content2);
}

// Settings drawer
const drawer = document.getElementById('drawer');
const drawerHandle = document.getElementById('drawerHandle');
const settingsToggle = document.getElementById('settingsToggle');

function toggleDrawer() {
    drawerOpen = !drawerOpen;
    drawer.classList.toggle('open', drawerOpen);
}

drawerHandle.addEventListener('click', toggleDrawer);
settingsToggle.addEventListener('click', toggleDrawer);

// Close drawer when clicking outside
document.addEventListener('click', (e) => {
    if (drawerOpen && !drawer.contains(e.target) && !settingsToggle.contains(e.target)) {
        toggleDrawer();
    }
});

// Mode chips
const modeChips = document.getElementById('modeChips');
modeChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        modeChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        mode = e.target.dataset.mode;
    }
});

// Stepper controls
document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const delta = parseInt(btn.dataset.delta);

        if (target === 'jazzCount') {
            jazzCount = Math.max(1, Math.min(maxJazzCount, jazzCount + delta));
            document.getElementById('jazzCount').textContent = jazzCount;
        } else if (target === 'basicCount') {
            basicCount = Math.max(0, Math.min(maxBasicCount, basicCount + delta));
            document.getElementById('basicCount').textContent = basicCount;
        }
    });
});

// Random helpers
function pickRandom(arr, count) {
    const actualCount = Math.min(count, arr.length);
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, actualCount);
}

function pickRandomExcluding(arr, count, exclude) {
    const available = arr.filter(item => !exclude.includes(item));
    return pickRandom(available, count);
}

// Generate
function generate() {
    const display = document.getElementById('display');

    // Exit animation for existing cards
    const existingCards = display.querySelectorAll('.step-card');
    if (existingCards.length > 0) {
        existingCards.forEach(card => card.classList.add('exiting'));
        setTimeout(() => {
            renderCombo(display);
        }, 250);
    } else {
        renderCombo(display);
    }
}

function renderCombo(display) {
    const n = jazzCount;
    const m = basicCount;

    if (mode === 'mixed' && n < 2) {
        display.innerHTML =
            '<div class="display-placeholder">Mixed mode needs at least 2 jazz steps</div>';
        return;
    }

    let selectedJazz = [];

    if (mode === '1') {
        selectedJazz = pickRandom(jazzSteps.startOn1, n);
    } else if (mode === '8') {
        selectedJazz = pickRandom(jazzSteps.startOn8, n);
    } else {
        const oneFrom1 = pickRandom(jazzSteps.startOn1, 1);
        const oneFrom8 = pickRandom(jazzSteps.startOn8, 1);
        const remaining = pickRandomExcluding(
            [...jazzSteps.startOn1, ...jazzSteps.startOn8],
            n - 2,
            [...oneFrom1, ...oneFrom8]
        );
        selectedJazz = [...oneFrom1, ...oneFrom8, ...remaining].sort(() => Math.random() - 0.5);
    }

    const selectedBasic = pickRandom(basicSteps, m);

    let html = '<div class="combo">';

    // Jazz steps section
    html += '<div class="combo-section">';
    html += '<div class="combo-section-label">Jazz Steps</div>';
    html += '<div class="combo-row">';
    selectedJazz.forEach((step, i) => {
        html += `<div class="step-card" style="animation-delay: ${i * 0.08}s">${step}</div>`;
    });
    html += '</div></div>';

    // Basic steps section
    if (selectedBasic.length > 0) {
        html += '<div class="combo-section">';
        html += '<div class="combo-section-label">Basic Steps</div>';
        html += '<div class="combo-row">';
        selectedBasic.forEach((step, i) => {
            html += `<div class="step-card basic" style="animation-delay: ${(selectedJazz.length + i) * 0.08}s">${step}</div>`;
        });
        html += '</div></div>';
    }

    html += '</div>';
    display.innerHTML = html;
}

// Ripple effect
function createRipple(event) {
    const hitZone = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = hitZone.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    // Remove old ripples
    const oldRipple = hitZone.querySelector('.ripple');
    if (oldRipple) oldRipple.remove();

    hitZone.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
}

// Initialize
const hitZone = document.getElementById('hitZone');
hitZone.addEventListener('click', (e) => {
    createRipple(e);
    generate();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        // Trigger ripple at center of hit zone
        const rect = hitZone.getBoundingClientRect();
        const fakeEvent = {
            currentTarget: hitZone,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        };
        createRipple(fakeEvent);
        generate();
    }
    // Close share modal on Escape
    if (e.code === 'Escape') {
        const shareModal = document.getElementById('shareModal');
        if (shareModal.classList.contains('open')) {
            shareModal.classList.remove('open');
        }
    }
});

// Share modal
const shareToggle = document.getElementById('shareToggle');
const shareModal = document.getElementById('shareModal');
const shareModalClose = document.getElementById('shareModalClose');
const shareQrCode = document.getElementById('shareQrCode');
const shareUrl = document.getElementById('shareUrl');

function openShareModal() {
    const url = window.location.href;
    shareUrl.textContent = url;

    // Generate QR code
    shareQrCode.innerHTML = '';
    qrCode = new QRCode(shareQrCode, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#2C2F2D',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    shareModal.classList.add('open');
}

function closeShareModal() {
    shareModal.classList.remove('open');
}

shareToggle.addEventListener('click', openShareModal);
shareModalClose.addEventListener('click', closeShareModal);

// Close share modal when clicking outside
shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        closeShareModal();
    }
});

// Initialize
loadSteps();
