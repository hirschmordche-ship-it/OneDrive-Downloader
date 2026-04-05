// app.js
import { Accounts } from './accounts.js';
import { UI } from './ui.js';
import { Unified } from './unified.js';
import { Terms } from './terms.js';
import { Themes } from './themes.js';
import { Timeline } from './timeline.js';

const accounts = new Accounts();
const ui = new UI(accounts);
const unified = new Unified(accounts);
const terms = new Terms();
const themes = new Themes();
const timeline = new Timeline();

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // 1. Check if redirected from Microsoft login
  const urlHash = window.location.hash;
  if (urlHash.includes('auth_code=')) {
    const code = urlHash.split('auth_code=')[1];
    window.location.hash = ''; // clean URL
    await exchangeCode(code);
  }

  // 2. Load accounts from storage
  accounts.load();

  // 3. If first account and terms not accepted → show modal
  if (accounts.count() === 1 && !terms.isAccepted()) {
    terms.show();
  }

  // 4. Render UI
  ui.renderAccountBoxes();
  unified.updateVisibility();

  // 5. Navigation
  setupNavigation();

  // 6. Buttons
  document.getElementById('addAccountBtn').onclick = () => startLogin();
  document.getElementById('toggleUnified').onclick = () => toggleUnifiedView();
  document.getElementById('themeBtn').onclick = () => themes.nextTheme();
}

async function startLogin() {
  window.location.href = '/api/auth/start';
}

async function exchangeCode(code) {
  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const json = await res.json();
  if (json.error) {
    alert('Login failed: ' + json.error);
    return;
  }

  // Add account
  accounts.add({
    token: json.access_token,
    refresh: json.refresh_token,
    expires: Date.now() + json.expires_in * 1000,
    accountId: json.id_token || ('acc_' + Math.random().toString(36).slice(2)),
    profile: json
  });

  accounts.save();
}

function toggleUnifiedView() {
  accounts.toggleUnified();
  unified.updateVisibility();
  ui.renderAccountBoxes();
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.onclick = () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ui.showSection(btn.id);
    };
  });
}
