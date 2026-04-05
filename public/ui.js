// ui.js
import { Unified } from './unified.js';
import { Timeline } from './timeline.js';

export class UI {
  constructor(accounts) {
    this.accounts = accounts;
    this.timeline = new Timeline();
    this.unified = new Unified(accounts);

    this.currentSection = 'navBrowse';
  }

  // Render separate account boxes
  renderAccountBoxes() {
    const container = document.getElementById('accountBoxes');
    const unifiedBox = document.getElementById('unifiedBox');

    if (this.accounts.isUnified()) {
      container.classList.add('hidden');
      unifiedBox.classList.remove('hidden');
      this.renderUnified();
      return;
    }

    unifiedBox.classList.add('hidden');
    container.classList.remove('hidden');

    container.innerHTML = '';

    const accs = this.accounts.getAll();

    accs.forEach((acc, index) => {
      const box = document.createElement('div');
      box.className = 'glass account-box';
      box.innerHTML = `
        <h2>Account ${index + 1}</h2>
        <div id="acc_${index}_content">Loading...</div>
      `;
      container.appendChild(box);

      this.loadFolder(index, 'root');
    });
  }

  // Load folder contents for a specific account
  async loadFolder(accIndex, itemId) {
    const acc = this.accounts.get(accIndex);
    const token = acc.token;

    const res = await fetch('/api/onedrive/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list',
        token,
        itemId
      })
    });

    const json = await res.json();
    const container = document.getElementById(`acc_${accIndex}_content`);

    if (json.error) {
      container.innerHTML = `<p>Error loading folder</p>`;
      return;
    }

    container.innerHTML = '';

    json.value.forEach(item => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = `
        <span>${item.folder ? '📁' : '📄'} ${item.name}</span>
      `;

      row.onclick = () => {
        if (item.folder) {
          this.loadFolder(accIndex, item.id);
        } else {
          this.openFile(accIndex, item);
        }
      };

      container.appendChild(row);
    });
  }

  // Open file preview
  openFile(accIndex, item) {
    import('./viewer.js').then(module => {
      const viewer = new module.Viewer(this.accounts);
      viewer.open(accIndex, item);
    });
  }

  // Unified view rendering
  async renderUnified() {
    const box = document.getElementById('unifiedContent');
    box.innerHTML = 'Loading unified view...';

    const accounts = this.accounts.getAll();

    const res = await fetch('/api/onedrive/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unifiedList',
        accounts
      })
    });

    const json = await res.json();
    box.innerHTML = '';

    json.merged.forEach(group => {
      const header = document.createElement('h3');
      header.textContent = `Account: ${group.accountId}`;
      box.appendChild(header);

      group.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'file-row';
        row.innerHTML = `
          <span>${item.folder ? '📁' : '📄'} ${item.name}</span>
        `;
        box.appendChild(row);
      });
    });
  }

  // Navigation between sections
  showSection(sectionId) {
    this.currentSection = sectionId;

    switch (sectionId) {
      case 'navBrowse':
        this.renderAccountBoxes();
        break;

      case 'navFavorites':
        alert('Favorites coming soon');
        break;

      case 'navTimeline':
        this.timeline.render();
        break;

      case 'navAnalyzer':
        alert('Analyzer coming soon');
        break;

      case 'navVault':
        alert('Vault coming soon');
        break;
    }
  }
}
