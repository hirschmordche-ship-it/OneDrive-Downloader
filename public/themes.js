// themes.js
export class Themes {
  constructor() {
    this.themes = [
      { name: 'teal', bg: 'linear-gradient(135deg, #0f766e, #115e59)' },
      { name: 'purple', bg: 'linear-gradient(135deg, #4c1d95, #6d28d9)' },
      { name: 'gold', bg: 'linear-gradient(135deg, #b45309, #92400e)' },
      { name: 'midnight', bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },
      { name: 'frost', bg: 'linear-gradient(135deg, #334155, #64748b)' }
    ];

    this.index = 0;
    this.load();
    this.apply();
  }

  load() {
    const saved = localStorage.getItem('themeIndex');
    if (saved) this.index = parseInt(saved);
  }

  save() {
    localStorage.setItem('themeIndex', this.index);
  }

  apply() {
    document.body.style.background = this.themes[this.index].bg;
  }

  nextTheme() {
    this.index = (this.index + 1) % this.themes.length;
    this.save();
    this.apply();
  }
}
