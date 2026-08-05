(() => {
  const HOME_URL = 'https://eastwood451.com/';
  const LINK_ID = 'eastwood-home-link';
  const STYLE_ID = 'eastwood-home-link-style';

  function addHomeLink() {
    if (!document.body || document.getElementById(LINK_ID)) return;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #${LINK_ID} {
          position: fixed;
          top: max(10px, env(safe-area-inset-top));
          left: max(10px, env(safe-area-inset-left));
          z-index: 2147483647;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          max-width: calc(100vw - 20px);
          padding: 7px 11px;
          border: 1px solid rgba(148, 163, 184, 0.48);
          border-radius: 999px;
          color: #f8fafc;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font: 600 12px/1.1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease;
        }

        #${LINK_ID}:hover {
          border-color: #38bdf8;
          background: rgba(30, 41, 59, 0.96);
          transform: translateY(-1px);
        }

        #${LINK_ID}:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 3px;
        }

        #${LINK_ID} svg {
          flex: 0 0 auto;
          width: 14px;
          height: 14px;
        }

        #${LINK_ID} span {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        #${LINK_ID}.eastwood-home-link--suite {
          position: static;
          align-self: flex-start;
          margin: -2px 0 12px;
        }

        #main-sidebar.collapsed #${LINK_ID}.eastwood-home-link--suite {
          align-self: center;
          margin: -2px auto 12px;
          padding: 7px;
        }

        #main-sidebar.collapsed #${LINK_ID}.eastwood-home-link--suite span {
          display: none;
        }

        @media (max-width: 420px) {
          #${LINK_ID} {
            padding: 6px 9px;
            font-size: 11px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const link = document.createElement('a');
    link.id = LINK_ID;
    link.href = HOME_URL;
    link.setAttribute('aria-label', 'Tilbage til Eastwood451.com forsiden');
    link.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 10 9-7 9 7"></path>
        <path d="M5 9v11h14V9"></path>
        <path d="M9 20v-6h6v6"></path>
      </svg>
      <span>Tilbage til Eastwood451.com</span>
    `;

    const suiteSidebar = document.getElementById('main-sidebar');
    if (suiteSidebar) {
      link.classList.add('eastwood-home-link--suite');
      suiteSidebar.insertBefore(link, suiteSidebar.firstChild);
    } else {
      document.body.appendChild(link);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addHomeLink, { once: true });
  } else {
    addHomeLink();
  }
})();
