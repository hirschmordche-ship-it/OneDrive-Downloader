// viewer.js
export class Viewer {
  constructor(accounts) {
    this.accounts = accounts;
    this.modal = null;
  }

  async open(accIndex, item) {
    const acc = this.accounts.get(accIndex);

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.innerHTML = `
      <div class="modal-content glass" style="max-height: 80vh; overflow-y: auto;">
        <h2>${item.name}</h2>
        <div id="viewerContent">Loading...</div>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button id="viewerMicrosoft" class="btn small">Microsoft Viewer</button>
          <button id="viewerLocal" class="btn small">Local Preview</button>
          <button id="viewerClose" class="btn small">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);

    document.getElementById('viewerClose').onclick = () => this.close();
    document.getElementById('viewerMicrosoft').onclick = () => this.openMicrosoft(acc, item);
    document.getElementById('viewerLocal').onclick = () => this.openLocal(acc, item);
  }

  close() {
    if (this.modal) this.modal.remove();
  }

  // Microsoft viewer (opens in new tab)
  openMicrosoft(acc, item) {
    const url = `https://onedrive.live.com/?cid=${acc.accountId}#id=${item.id}`;
    window.open(url, '_blank');
  }

  // Local preview (stream file)
  async openLocal(acc, item) {
    const contentDiv = document.getElementById('viewerContent');
    contentDiv.innerHTML = 'Loading preview...';

    const res = await fetch('/api/onedrive/fileOps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'download',
        token: acc.token,
        itemId: item.id
      })
    });

    if (!res.ok) {
      contentDiv.innerHTML = '<p>Error loading file</p>';
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Detect type
    if (item.name.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      contentDiv.innerHTML = `<img src="${url}" style="width: 100%; border-radius: 12px;" />`;
    } else if (item.name.match(/\.(txt|md|json|js|css|html)$/i)) {
      const text = await blob.text();
      contentDiv.innerHTML = `<pre style="white-space: pre-wrap;">${text}</pre>`;
    } else if (item.name.match(/\.pdf$/i)) {
      contentDiv.innerHTML = `<iframe src="${url}" style="width: 100%; height: 70vh;"></iframe>`;
    } else {
      contentDiv.innerHTML = `
        <p>Preview not supported.</p>
        <a href="${url}" download="${item.name}" class="btn small">Download</a>
      `;
    }
  }
}
