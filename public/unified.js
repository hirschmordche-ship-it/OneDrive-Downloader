// unified.js
export class Unified {
  constructor(accounts) {
    this.accounts = accounts;
  }

  updateVisibility() {
    const unified = this.accounts.isUnified();
    const unifiedBox = document.getElementById('unifiedBox');
    const accountBoxes = document.getElementById('accountBoxes');

    if (unified) {
      unifiedBox.classList.remove('hidden');
      accountBoxes.classList.add('hidden');
    } else {
      unifiedBox.classList.add('hidden');
      accountBoxes.classList.remove('hidden');
    }
  }

  // Merge folder lists (client-side assist)
  mergeLists(lists) {
    const map = new Map();

    lists.forEach(group => {
      group.items.forEach(item => {
        if (!map.has(item.name)) {
          map.set(item.name, []);
        }
        map.get(item.name).push({
          accountId: group.accountId,
          item
        });
      });
    });

    return Array.from(map.entries()).map(([name, entries]) => ({
      name,
      entries
    }));
  }
}
