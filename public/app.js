let accounts = [];
let currentSection = "browse";
let currentTheme = localStorage.getItem("theme") || "default";
let currentBrowse = { accountIndex: null, itemId: "root", path: [] };

document.body.classList.add(currentTheme);

// ELEMENTS
const menuBtn = document.getElementById("menuBtn");
const avatarBtn = document.getElementById("avatarBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const themeBtn = document.getElementById("themeBtn");
const themeSheet = document.getElementById("themeSheet");
const sectionTitle = document.getElementById("sectionTitle");
const sectionContent = document.getElementById("sectionContent");
const navButtons = document.querySelectorAll(".nav-btn");

const drawerAccounts = document.getElementById("drawerAccounts");
const drawerSettings = document.getElementById("drawerSettings");
const drawerPrivacy = document.getElementById("drawerPrivacy");
const drawerLogout = document.getElementById("drawerLogout");

// INIT
window.addEventListener("DOMContentLoaded", async () => {
  loadAccounts();
  await handleAuthCallback();
  renderSection();
});

// AUTH CALLBACK
async function handleAuthCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (!code) return;

  // Clean URL
  url.searchParams.delete("code");
  window.history.replaceState({}, "", url.toString());

  try {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (json.error) {
      alert("Login failed: " + json.error);
      return;
    }

    const acc = {
      token: json.access_token,
      refresh: json.refresh_token,
      expires: Date.now() + (json.expires_in || 3600) * 1000,
      accountId: json.accountId || json.user_id || ("acc_" + Math.random().toString(36).slice(2))
    };

    accounts.push(acc);
    saveAccounts();
  } catch {
    alert("Login error");
  }
}

// STORAGE
function loadAccounts() {
  const saved = localStorage.getItem("accounts");
  if (saved) accounts = JSON.parse(saved);
}

function saveAccounts() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

// DRAWER
function openDrawer() {
  drawer.classList.remove("hidden");
  drawer.classList.add("open");
  overlay.classList.remove("hidden");
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.add("hidden");
  setTimeout(() => drawer.classList.add("hidden"), 200);
}

menuBtn.onclick = openDrawer;
avatarBtn.onclick = openDrawer;

// THEME SHEET
function openThemeSheet() {
  themeSheet.classList.remove("hidden");
  themeSheet.classList.add("open");
  overlay.classList.remove("hidden");
}

function closeThemeSheet() {
  themeSheet.classList.remove("open");
  setTimeout(() => themeSheet.classList.add("hidden"), 200);
}

themeBtn.onclick = openThemeSheet;

document.querySelectorAll(".theme-row").forEach(row => {
  row.onclick = () => {
    const theme = row.dataset.theme;
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    closeThemeSheet();
  };
});

// OVERLAY
overlay.onclick = () => {
  closeDrawer();
  closeThemeSheet();
};

// NAV
navButtons.forEach(btn => {
  btn.onclick = () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSection = btn.dataset.section;
    renderSection();
  };
});

function setActiveNav(section) {
  navButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.section === section);
  });
}

// DRAWER ACTIONS
drawerAccounts.onclick = () => {
  currentSection = "browse";
  setActiveNav("browse");
  renderSection();
  closeDrawer();
};

drawerSettings.onclick = () => {
  closeDrawer();
  openThemeSheet();
};

drawerPrivacy.onclick = () => {
  closeDrawer();
  window.open("/privacy.html", "_blank");
};

drawerLogout.onclick = () => {
  if (!confirm("Clear all accounts and logout?")) return;
  localStorage.removeItem("accounts");
  accounts = [];
  currentBrowse = { accountIndex: null, itemId: "root", path: [] };
  renderSection();
  closeDrawer();
};

// SECTIONS
function renderSection() {
  sectionContent.innerHTML = "";
  switch (currentSection) {
    case "browse":
      sectionTitle.textContent = "Browse";
      renderBrowse();
      break;
    case "timeline":
      sectionTitle.textContent = "Timeline";
      sectionContent.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Timeline coming soon.</p>";
      break;
    case "analyzer":
      sectionTitle.textContent = "Analyzer";
      sectionContent.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Analyzer coming soon.</p>";
      break;
    case "vault":
      sectionTitle.textContent = "Vault";
      sectionContent.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Vault coming soon.</p>";
      break;
  }
}

// BROWSE
function renderBrowse() {
  const addBtn = document.createElement("button");
  addBtn.className = "primary-btn";
  addBtn.textContent = "+ Add Account";
  addBtn.onclick = () => {
    window.location.href = "/api/auth/start";
  };
  sectionContent.appendChild(addBtn);

  if (accounts.length === 0) {
    const empty = document.createElement("p");
    empty.style.opacity = "0.7";
    empty.style.fontSize = "14px";
    empty.textContent = "No accounts connected yet.";
    sectionContent.appendChild(empty);
    return;
  }

  if (currentBrowse.accountIndex === null) {
    const list = document.createElement("div");
    accounts.forEach((acc, i) => {
      const card = document.createElement("div");
      card.className = "account-card";
      card.innerHTML = `
        <div class="account-icon">${i + 1}</div>
        <div class="account-info">
          <div class="account-name">Account ${i + 1}</div>
          <div class="account-sub">${acc.accountId}</div>
        </div>
      `;
      card.onclick = () => {
        currentBrowse = { accountIndex: i, itemId: "root", path: [] };
        renderSection();
      };
      list.appendChild(card);
    });
    sectionContent.appendChild(list);
  } else {
    renderFolderView();
  }
}

async function renderFolderView() {
  const acc = accounts[currentBrowse.accountIndex];

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "10px";

  const backBtn = document.createElement("button");
  backBtn.className = "chip";
  backBtn.textContent = "← Accounts";
  backBtn.onclick = () => {
    currentBrowse = { accountIndex: null, itemId: "root", path: [] };
    renderSection();
  };

  const pathLabel = document.createElement("span");
  pathLabel.style.fontSize = "12px";
  pathLabel.style.opacity = "0.7";
  pathLabel.textContent = "/" + (currentBrowse.path.join("/") || "");

  header.appendChild(backBtn);
  header.appendChild(pathLabel);
  sectionContent.appendChild(header);

  const list = document.createElement("div");
  sectionContent.appendChild(list);
  list.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Loading...</p>";

  try {
    const res = await fetch("/api/onedrive/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: acc.token,
        itemId: currentBrowse.itemId === "root" ? undefined : currentBrowse.itemId
      })
    });
    const json = await res.json();
    list.innerHTML = "";

    if (json.error) {
      list.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Error loading folder.</p>";
      return;
    }

    (json.value || []).forEach(item => {
      const row = document.createElement("div");
      row.className = "account-card";
      row.style.marginBottom = "8px";
      row.innerHTML = `
        <div class="account-icon">${item.folder ? "📁" : "📄"}</div>
        <div class="account-info">
          <div class="account-name">${item.name}</div>
          <div class="account-sub">${item.folder ? "Folder" : (item.size || 0) + " bytes"}</div>
        </div>
      `;

      row.onclick = () => {
        if (item.folder) {
          currentBrowse.itemId = item.id;
          currentBrowse.path.push(item.name);
          renderSection();
        } else {
          openFile(acc, item);
        }
      };

      list.appendChild(row);
    });

    if ((json.value || []).length === 0) {
      list.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Empty folder.</p>";
    }
  } catch {
    list.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Error loading folder.</p>";
  }
}

// FILE OPEN
async function openFile(acc, item) {
  try {
    const res = await fetch("/api/onedrive/fileOps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "download",
        token: acc.token,
        itemId: item.id
      })
    });

    if (!res.ok) {
      alert("Error downloading file");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch {
    alert("Error opening file");
  }
}
