// timeline.js
export class Timeline {
  constructor() {
    this.key = 'timelineEntries';
    this.entries = this.load();
  }

  load() {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : [];
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.entries));
  }

  add(action, details = {}) {
    const entry = {
      action,
      details,
      time: new Date().toISOString()
    };
    this.entries.unshift(entry);
    this.save();
  }

  render() {
    const root = document.getElementById('accountBoxes');
    const unified = document.getElementById('unifiedBox');

    root.classList.add('hidden');
    unified.classList.add('hidden');

    const container = document.getElementById('appRoot');
    container.innerHTML = `
      <div class="glass" style="margin: 16px; padding: 16px;">
        <h2>Activity Timeline</h2>
        <div id="timelineList"></div>
      </div>
    `;

    const list = document.getElementById('timelineList');

    if (this.entries.length === 0) {
      list.innerHTML = '<p>No activity yet.</p>';
      return;
    }

    this.entries.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = `
        <strong>${entry.action}</strong><br>
        <small>${new Date(entry.time).toLocaleString()}</small>
      `;
      list.appendChild(row);
    });
  }
}
