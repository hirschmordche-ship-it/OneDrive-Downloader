// terms.js
export class Terms {
  constructor() {
    this.key = 'termsAccepted';
    this.modal = document.getElementById('termsModal');
    this.textBox = document.getElementById('termsText');
    this.acceptBtn = document.getElementById('acceptTerms');

    this.acceptBtn.onclick = () => this.accept();
    this.loadText();
  }

  isAccepted() {
    return localStorage.getItem(this.key) === 'true';
  }

  show() {
    this.modal.classList.remove('hidden');
  }

  hide() {
    this.modal.classList.add('hidden');
  }

  accept() {
    localStorage.setItem(this.key, 'true');
    this.hide();
  }

  loadText() {
    this.textBox.innerHTML = `
      <p><strong>Terms & Conditions</strong></p>
      <p>By using this application, you agree to the following terms. These terms apply to you and to all Microsoft/OneDrive accounts you connect now or in the future.</p>

      <p><strong>1. Scope</strong><br>
      These terms apply to the first user who accepts them and automatically apply to all additional accounts connected afterward.</p>

      <p><strong>2. Permissions</strong><br>
      You authorize the app to read, modify, delete, upload, move, rename, and copy files and folders across all connected accounts.</p>

      <p><strong>3. Multi‑Account Use</strong><br>
      You accept responsibility for actions taken across all connected accounts, including unified view operations.</p>

      <p><strong>4. Local Storage</strong><br>
      Files saved to your device or encrypted in the vault are your responsibility.</p>

      <p><strong>5. No Liability</strong><br>
      The app is provided “as is” without warranty. The creators are not liable for data loss, corruption, or account issues.</p>

      <p><strong>6. Compliance</strong><br>
      You agree to comply with Microsoft’s terms and all applicable laws.</p>

      <p><strong>7. Acceptance</strong><br>
      By continuing, you accept these terms for yourself and all connected accounts.</p>
    `;
  }
}
