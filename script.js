const COUNTS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

let jazzSteps = { startOn1: [], startOn8: [] };
let basicSteps = [];
let mode = '1';
let drawerOpen = false;

// Load steps from JSON
async function loadSteps() {
    try {
        const response = await fetch('steps.json');
        const data = await response.json();
        jazzSteps = data.jazz;
        basicSteps = data.basic;
    } catch (error) {
        console.error('Failed to load steps:', error);
    }
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
settingsToggle.addEventListener('click', () => {
    if (!drawerOpen) toggleDrawer();
});

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
    const n = parseInt(document.getElementById('jazzCount').value) || 2;
    const m = parseInt(document.getElementById('basicCount').value) || 1;

    if (mode === 'mixed' && n < 2) {
        document.getElementById('display').innerHTML =
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

    const display = document.getElementById('display');
    let html = '<div class="combo">';

    // Jazz steps
    html += '<div class="combo-row">';
    selectedJazz.forEach((step, i) => {
        html += `<div class="step-card" style="animation-delay: ${i * 0.08}s">
            <span class="count">${COUNTS[i]}</span>${step}
        </div>`;
    });
    html += '</div>';

    // Basic steps
    if (selectedBasic.length > 0) {
        html += '<div class="combo-row">';
        selectedBasic.forEach((step, i) => {
            html += `<div class="step-card basic" style="animation-delay: ${(selectedJazz.length + i) * 0.08}s">
                <span class="count">${COUNTS[i]}</span>${step}
            </div>`;
        });
        html += '</div>';
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
loadSteps();
