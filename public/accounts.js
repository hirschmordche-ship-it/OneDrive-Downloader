// accounts.js
export class Accounts {
  constructor() {
    this.accounts = [];
    this.unified = false;
  }

  load() {
    const saved = localStorage.getItem('accounts');
    const unified = localStorage.getItem('unifiedMode');

    if (saved) this.accounts = JSON.parse(saved);
    if (unified) this.unified = unified === 'true';
  }

  save() {
    localStorage.setItem('accounts', JSON.stringify(this.accounts));
    localStorage.setItem('unifiedMode', this.unified);
  }

  add(acc) {
    if (this.accounts.length >= 3) {
      alert('Maximum of 3 accounts allowed');
      return;
    }
    this.accounts.push(acc);
    this.save();
  }

  count() {
    return this.accounts.length;
  }

  getAll() {
    return this.accounts;
  }

  get(index) {
    return this.accounts[index];
  }

  toggleUnified() {
    this.unified = !this.unified;
    this.save();
  }

  isUnified() {
    return this.unified;
  }

  // Token refresh placeholder (optional)
  async refreshIfNeeded(acc) {
    // For now, assume token is valid.
    // You can expand this later if needed.
    return acc.token;
  }
}
