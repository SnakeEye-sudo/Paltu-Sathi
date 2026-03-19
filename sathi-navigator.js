"use strict";
(() => {
  const NAV_ID = "sathi-global-navigator";
  const OVERLAY_ID = "sathi-nav-overlay";
  const DRAWER_ID = "sathi-nav-drawer";
  
  const APPS = [
    { title: "Aapka Sathi", url: "https://snakeeye-sudo.github.io/Aapka-Sathi/", icon: "🏠", desc: "Family Hub" },
    { title: "Pariksha Sathi", url: "https://snakeeye-sudo.github.io/pariksha-sathi/", icon: "📚", desc: "Study Planner" },
    { title: "Rozgar Sathi", url: "https://snakeeye-sudo.github.io/rozgar-sathi/", icon: "💼", desc: "Job Portal" },
    { title: "Samachar Sathi", url: "https://snakeeye-sudo.github.io/Samachar-Sathi/", icon: "📰", desc: "Daily News" },
    { title: "Hisaab Sathi", url: "https://snakeeye-sudo.github.io/Hisaab-Sathi/", icon: "💸", desc: "Daily Ledger" },
    { title: "Antariksh Sathi", url: "https://snakeeye-sudo.github.io/Antariksh-Sathi/", icon: "🚀", desc: "Space Guide" },
    { title: "Ganit Sathi", url: "https://snakeeye-sudo.github.io/Ganit-Sathi/", icon: "🔢", desc: "Calculator" },
    { title: "Jal Sathi", url: "https://snakeeye-sudo.github.io/Jal-Sathi/", icon: "💧", desc: "Hydration Hub" },
    { title: "Mann Sathi", url: "https://snakeeye-sudo.github.io/Mann-Sathi/", icon: "🧠", desc: "Journal & Mood" },
    { title: "Sanket Sathi", url: "https://snakeeye-sudo.github.io/Sanket-Sathi/", icon: "⚡", desc: "Morse Studio" },
    { title: "Sikka Sathi", url: "https://snakeeye-sudo.github.io/Sikka-Sathi/", icon: "🪙", desc: "Quick Flip" },
    { title: "Khel Sathi", url: "https://snakeeye-sudo.github.io/Khel-Sathi/", icon: "🎮", desc: "Classic Games" },
    { title: "Dhyan Sathi", url: "https://snakeeye-sudo.github.io/Dhyan-Sathi/", icon: "🧘", desc: "Focus Timer" },
    { title: "Mausam Sathi", url: "https://snakeeye-sudo.github.io/Mausam-Sathi/", icon: "🌤️", desc: "Weather Watch" },
    { title: "Paltu Sathi", url: "https://snakeeye-sudo.github.io/Paltu-Sathi/", icon: "🐾", desc: "Virtual Pet" },
    { title: "Panchang Sathi", url: "https://snakeeye-sudo.github.io/Panchang-Sathi/", icon: "🕉️", desc: "Daily Tithi" },
    { title: "Ank Sathi", url: "https://snakeeye-sudo.github.io/Ank-Sathi/", icon: "🔮", desc: "Numerology" }
  ];

  function toggle() {
    const overlay = document.getElementById(OVERLAY_ID);
    const drawer = document.getElementById(DRAWER_ID);
    const isOpen = overlay.getAttribute("aria-hidden") === "false";
    
    overlay.setAttribute("aria-hidden", String(isOpen));
    overlay.style.opacity = isOpen ? "0" : "1";
    overlay.style.pointerEvents = isOpen ? "none" : "auto";
    drawer.style.transform = isOpen ? "translateX(-100%)" : "translateX(0)";
  }

  function inject() {
    if (document.getElementById(NAV_ID)) return;

    const nav = document.createElement("div");
    nav.id = NAV_ID;
    nav.innerHTML = `
      <style>
        :root {
          --sathi-glass: rgba(15, 23, 42, 0.85);
          --sathi-border: rgba(255, 255, 255, 0.1);
          --sathi-accent: #f59e0b;
        }
        #sathi-nav-trigger {
          display: none !important;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 10001;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--sathi-glass);
          border: 1px solid var(--sathi-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #sathi-nav-trigger:hover {
          background: rgba(15, 23, 42, 0.95);
          transform: translateY(-2px);
          border-color: var(--sathi-accent);
        }
        #\${OVERLAY_ID} {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 10002;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }
        #\${DRAWER_ID} {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(340px, 85vw);
          background: #0f172a;
          z-index: 10003;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-right: 1px solid var(--sathi-border);
          display: flex;
          flex-direction: column;
          box-shadow: 20px 0 60px rgba(0,0,0,0.5);
        }
        #sathi-nav-header {
          padding: 30px 24px;
          border-bottom: 1px solid var(--sathi-border);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent);
        }
        #sathi-nav-header h2 {
          margin: 0;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--sathi-accent);
        }
        #sathi-nav-header p {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.6);
        }
        #sathi-nav-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .sathi-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 14px;
          margin-bottom: 4px;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .sathi-nav-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--sathi-border);
          transform: translateX(4px);
        }
        .sathi-nav-item.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.3);
          color: var(--sathi-accent);
        }
        .sathi-app-icon {
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .sathi-app-info {
          display: flex;
          flex-direction: column;
        }
        .sathi-app-name {
          font-weight: 600;
          font-size: 1rem;
        }
        .sathi-app-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }
        #sathi-nav-footer {
          padding: 20px;
          border-top: 1px solid var(--sathi-border);
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
      </style>
      <div id="sathi-nav-trigger" title="Open Sathi Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      <div id="\${OVERLAY_ID}" aria-hidden="true"></div>
      <div id="\${DRAWER_ID}">
        <div id="sathi-nav-header">
          <h2>Aapka Sathi</h2>
          <p>Family of Helpful Indian Apps</p>
        </div>
        <div id="sathi-nav-list">
          \${APPS.map(app => {
            const isActive = location.href.includes(app.url) || (app.url === "https://snakeeye-sudo.github.io/Aapka-Sathi/" && (location.pathname === "/" || location.pathname.includes("Aapka-Sathi")));
            return \`
              <a href="\${app.url}" class="sathi-nav-item \${isActive ? 'active' : ''}">
                <div class="sathi-app-icon">\${app.icon}</div>
                <div class="sathi-app-info">
                  <span class="sathi-app-name">\${app.title}</span>
                  <span class="sathi-app-desc">\${app.desc}</span>
                </div>
              </a>
            \`;
          }).join("")}
        </div>
        <div id="sathi-nav-footer">
          Developed by Er. Sangam Krishna &copy; 2026
        </div>
      </div>
    `;

    document.body.appendChild(nav);

    // Event listeners
    document.getElementById("sathi-nav-trigger").addEventListener("click", toggle);
    document.getElementById(OVERLAY_ID).addEventListener("click", toggle);
    
    // Auto-hide trigger if it covers important UI (optional logic can go here)
  }

  // Use Timeout to ensure DOM and original app styles are ready
  if (document.readyState === 'loading') {
    window.addEventListener('scroll', () => {}, {passive: true}); // dummy
    window.addEventListener("DOMContentLoaded", () => setTimeout(inject, 1200));
  } else {
    setTimeout(inject, 1200);
  }
})();
