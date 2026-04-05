# OneDrive Multi‑Account Manager (Mobile‑First, Glass UI)

A mobile‑optimized web app that lets you connect up to **three personal OneDrive accounts**, browse files, preview content, download folders with full structure (no ZIPs), mirror folders, copy files between accounts, analyze storage, and store encrypted files in a secure vault.

Built for Vercel + GitHub.  
Zero configuration required.

---

## Features

### 🔐 Multi‑Account Support
- Connect up to **3 personal OneDrive accounts**
- Each account displayed in its own glass box
- Optional **Unified View** merges all accounts into one virtual filesystem

### 📁 File Operations
- View files (Microsoft viewer or local preview)
- Download files (streamed)
- Upload files
- Rename, move, delete
- Create folders
- Edit text files
- Cross‑account copying (A → B, A → C, etc.)

### 🔄 Mirroring
- Mirror any folder
- Change‑only sync
- Background‑aware resume

### 🔍 Analyzer
- Largest files
- Largest folders
- File type breakdown
- Duplicate detection
- Per‑account usage

### 🔐 Secure Vault
- AES‑GCM encrypted local storage
- Automatic key generation
- Works on mobile

### 🧊 Glass UI
- Mobile‑first layout
- 5 themes (Teal, Purple, Gold, Midnight, Frost)
- Smooth transitions

### 📜 Terms & Conditions
- Shown only on first login
- Automatically covers second and third accounts

---

## Deployment (Vercel)

1. Create a new GitHub repo
2. Paste all files exactly as provided
3. Push to GitHub
4. Import repo into Vercel
5. Add environment variables:
6. Deploy

---

## OneDrive App Setup

Create a Microsoft Azure App Registration:

- Supported account type: **Personal Microsoft Accounts only**
- Redirect URI:  
  `https://your-vercel-domain/api/auth/callback`
- Enable **PKCE**
- Enable **Files.ReadWrite** and **Files.ReadWrite.All**

---

## Notes

- No ZIPs are used anywhere
- All downloads preserve full folder structure
- All code is TypeScript (backend) + ES modules (frontend)
- Fully mobile‑compatible

---

## License

MIT License
