// storage.js
export class StorageManager {
  constructor() {
    this.rootHandle = null;
    this.vaultKey = null;
  }

  // Ask user to pick a folder
  async pickFolder() {
    try {
      this.rootHandle = await window.showDirectoryPicker();
      return true;
    } catch (e) {
      alert('Folder access denied');
      return false;
    }
  }

  // Create subfolder
  async createFolder(path) {
    if (!this.rootHandle) return null;

    const parts = path.split('/').filter(Boolean);
    let current = this.rootHandle;

    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: true });
    }

    return current;
  }

  // Save file to folder
  async saveFile(path, name, data) {
    if (!this.rootHandle) {
      const ok = await this.pickFolder();
      if (!ok) return;
    }

    const folder = await this.createFolder(path);
    const fileHandle = await folder.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  // --- SECURE VAULT ---

  async generateVaultKey() {
    this.vaultKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    localStorage.setItem('vaultKey', await this.exportKey(this.vaultKey));
  }

  async loadVaultKey() {
    const stored = localStorage.getItem('vaultKey');
    if (!stored) return false;
    this.vaultKey = await this.importKey(stored);
    return true;
  }

  async exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  }

  async importKey(str) {
    const raw = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    if (!this.vaultKey) await this.generateVaultKey();

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.vaultKey,
      data
    );

    return { encrypted, iv };
  }

  async decrypt(encrypted, iv) {
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.vaultKey,
      encrypted
    );
  }
}
