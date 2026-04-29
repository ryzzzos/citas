const fs = require('fs');
let c = fs.readFileSync('frontend/app/globals.css', 'utf8');
c = c.replace(/  \/\* --- Apple UI Standard Glassmorphism --- \*\/[\s\S]*?  \/\* --- End Apple UI ---\*\//, `  /* --- Apple UI Standard Glassmorphism --- */
  .glass-panel {
    background: var(--glass-surface-1-bg);
    border: 1px solid var(--glass-border-soft);
    box-shadow: 0 8px 32px -12px rgba(15, 23, 42, 0.15);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-radius: var(--dashboard-radius-2xl);
  }
  .dark .glass-panel {
    box-shadow: 0 8px 32px -12px rgba(0, 0, 0, 0.6);
  }

  .glass-panel-heavy {
    background: var(--glass-surface-2-bg);
    border: 1px solid var(--glass-border-default);
    box-shadow: 0 12px 48px -18px rgba(15, 23, 42, 0.2);
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border-radius: var(--dashboard-radius-2xl);
  }
  .dark .glass-panel-heavy {
    box-shadow: 0 12px 48px -18px rgba(0, 0, 0, 0.7);
  }

  /* The primary royal blue glass for map filters */
  .glass-panel-accent {
    background: linear-gradient(165deg, color-mix(in oklab, var(--app-primary) 92%, #ffffff 8%) 0%, var(--app-primary-strong) 100%);
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 18px 48px -12px rgba(29, 78, 216, 0.45);
    border-radius: var(--dashboard-radius-2xl);
    color: #ffffff; /* force white text */
  }
  .glass-panel-accent * {
    color: #ffffff !important; /* ensure children icons and text inherit white */
    border-color: rgba(255, 255, 255, 0.3) !important;
  }
  .glass-panel-accent input::placeholder,
  .glass-panel-accent input {
    color: #ffffff !important;
  }
  .dark .glass-panel-accent {
    background: linear-gradient(165deg, color-mix(in oklab, var(--app-primary-soft) 85%, #050911 15%) 0%, color-mix(in oklab, var(--app-primary) 70%, #050911 30%) 100%);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.8);
  }

  .glass-floating {
    background: var(--glass-floating-bg);
    border: 1px solid var(--glass-border-default);
    box-shadow: 0 4px 16px -6px rgba(15, 23, 42, 0.15);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border-radius: 9999px;
  }
  .dark .glass-floating {
    box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.5);
  }

  .glass-floating-muted {
    background: var(--glass-surface-1-bg);
    border: 1px solid var(--glass-border-soft);
    box-shadow: 0 2px 10px -4px rgba(15, 23, 42, 0.1);
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
    border-radius: 9999px;
  }
  .dark .glass-floating-muted {
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.4);
  }

  .glass-overlay {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(248, 250, 252, 0.6) 100%);
    backdrop-filter: blur(8px) saturate(100%);
    -webkit-backdrop-filter: blur(8px) saturate(100%);
  }
  .dark .glass-overlay {
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(6, 11, 20, 0.8) 100%);
  }
  /* --- End Apple UI ---*/`);
fs.writeFileSync('frontend/app/globals.css', c, 'utf8');

// Now fix the SucursalesFiltersPanel.tsx
let f = fs.readFileSync('frontend/components/sucursales/SucursalesFiltersPanel.tsx', 'utf8');
// Fix wrappers back from 'glass-panel-accent text-white' to 'glass-panel-heavy'
f = f.replace(/glass-panel-accent text-white/g, 'glass-panel-heavy');
// Fix the header inside to use 'glass-panel-accent' and remove inline style
f = f.replace(/<header\s+className="rounded-\[1\.35rem\] border p-4"\s+style=\{\{[\s\S]*?boxShadow:[\s\S]*?\}\}\s+>/, '<header className="glass-panel-accent p-4">');
fs.writeFileSync('frontend/components/sucursales/SucursalesFiltersPanel.tsx', f, 'utf8');

console.log('Fixed CSS and Panel.');
