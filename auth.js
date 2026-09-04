(function () {
  const AUTH_KEY = "eastwood451-auth";
  const PASSWORD_HASH = "115964a71a8f37";

  function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  if (sessionStorage.getItem(AUTH_KEY) === PASSWORD_HASH) {
    return;
  }

  document.documentElement.classList.add("auth-locked");

  const style = document.createElement("style");
  style.textContent = `
    .auth-locked body > :not(.auth-gate) {
      display: none !important;
    }

    .auth-gate {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 28px;
      padding: 24px;
      color: #f5f8fc;
      background:
        linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        radial-gradient(circle at 70% 30%, rgba(30, 183, 255, 0.22), transparent 34%),
        radial-gradient(circle at 18% 74%, rgba(255, 140, 26, 0.16), transparent 28%),
        #07090d;
      background-size: 44px 44px, 44px 44px, auto, auto, auto;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow-y: auto;
    }

    .auth-card {
      width: min(100%, 380px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      padding: 24px;
      background: rgba(10, 15, 22, 0.86);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
      backdrop-filter: blur(18px);
    }

    .auth-card h1 {
      margin: 0 0 8px;
      font-size: 1.45rem;
      line-height: 1.15;
    }

    .auth-card p {
      margin: 0 0 18px;
      color: #a8b6c6;
      line-height: 1.45;
    }

    .auth-card label {
      display: block;
      margin-bottom: 8px;
      color: #dce7f3;
      font-size: 0.85rem;
      font-weight: 800;
    }

    .auth-row {
      display: grid;
      gap: 10px;
    }

    .auth-card input {
      width: 100%;
      min-height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 8px;
      padding: 0 12px;
      color: #f5f8fc;
      background: rgba(255, 255, 255, 0.08);
      font: inherit;
    }

    .auth-card button {
      min-height: 44px;
      border: 1px solid rgba(30, 183, 255, 0.55);
      border-radius: 8px;
      color: #041019;
      background: #1eb7ff;
      font: inherit;
      font-weight: 900;
      cursor: pointer;
    }

    .auth-error {
      min-height: 20px;
      margin-top: 10px;
      color: #ff9a8f;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .auth-quicklinks {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: center;
      gap: 20px 24px;
      max-width: 900px;
      width: 100%;
      margin-top: 4px;
    }

    .auth-link-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #f5f8fc;
      text-decoration: none;
      width: 76px;
      transition: transform 0.18s ease;
    }

    .auth-link-item:hover {
      transform: translateY(-3px);
    }

    .auth-link-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: box-shadow 0.18s ease, transform 0.18s ease;
    }

    .auth-link-item:hover .auth-link-icon {
      box-shadow: 0 6px 18px rgba(30, 183, 255, 0.3);
    }

    .auth-link-label {
      font-size: 0.78rem;
      font-weight: 500;
      color: #d1d5db;
      text-align: center;
      line-height: 1.25;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);

  function showGate() {
    const gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.innerHTML = `
      <form class="auth-card" autocomplete="off">
        <h1>Eastwood451</h1>
        <p>Indtast password for at aabne websitet.</p>
        <div class="auth-row">
          <label for="site-password">Password</label>
          <input id="site-password" type="password" autofocus />
          <button type="submit">Log ind</button>
        </div>
        <div class="auth-error" aria-live="polite"></div>
      </form>

      <div class="auth-quicklinks" aria-label="AI Links">
        <a class="auth-link-item" href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #eef3fc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#gemini-grad)"/>
              <defs>
                <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#4285F4"/>
                  <stop offset="35%" stop-color="#9B72CB"/>
                  <stop offset="70%" stop-color="#D96570"/>
                  <stop offset="100%" stop-color="#D97706"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="auth-link-label">Gemini</span>
        </a>

        <a class="auth-link-item" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #eef3fc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/>
            </svg>
          </div>
          <span class="auth-link-label">ChatGPT</span>
        </a>

        <a class="auth-link-item" href="https://claude.ai/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #eef3fc;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#d97757">
              <path d="M12 2L13.8 8.8L20 6.5L16.2 11.8L22 15L15.4 16.2L16.8 23L12 18.2L7.2 23L8.6 16.2L2 15L7.8 11.8L4 6.5L10.2 8.8L12 2Z"/>
            </svg>
          </div>
          <span class="auth-link-label">Claude</span>
        </a>

        <a class="auth-link-item" href="https://grok.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #000000; border: 1px solid rgba(255,255,255,0.15);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <span class="auth-link-label">Grok</span>
        </a>

        <a class="auth-link-item" href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #171717; border: 1px solid rgba(255,255,255,0.15);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/>
            </svg>
          </div>
          <span class="auth-link-label">Perplexity</span>
        </a>

        <a class="auth-link-item" href="https://ithy.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #5b7c10;">
            <span style="font-family: Georgia, serif; font-size: 1.45rem; font-weight: 700; color: #ffffff; line-height: 1;">I</span>
          </div>
          <span class="auth-link-label">ITHY</span>
        </a>

        <a class="auth-link-item" href="https://x.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #000000; border: 1px solid rgba(255,255,255,0.15);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <span class="auth-link-label">X</span>
        </a>

        <a class="auth-link-item" href="https://learnyourway.withgoogle.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #9333ea;">
            <span style="font-family: system-ui, sans-serif; font-size: 1.35rem; font-weight: 700; color: #ffffff; line-height: 1;">L</span>
          </div>
          <span class="auth-link-label">Learn Your Way</span>
        </a>

        <a class="auth-link-item" href="https://illuminate.google.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #eef3fc;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.47 21h11.06a2 2 0 0 0 1.72-2.9L14 9.31V2"/>
              <line x1="8.5" y1="2" x2="15.5" y2="2"/>
              <line x1="7" y1="15" x2="17" y2="15"/>
            </svg>
          </div>
          <span class="auth-link-label">Illuminate</span>
        </a>

        <a class="auth-link-item" href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
          <div class="auth-link-icon" style="background: #eef3fc;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M8 7h8M8 11h8"/>
            </svg>
          </div>
          <span class="auth-link-label">NotebookLM</span>
        </a>
      </div>
    `;

    const form = gate.querySelector("form");
    const input = gate.querySelector("input");
    const error = gate.querySelector(".auth-error");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (cyrb53(input.value) === PASSWORD_HASH) {
        sessionStorage.setItem(AUTH_KEY, PASSWORD_HASH);
        document.documentElement.classList.remove("auth-locked");
        gate.remove();
        return;
      }

      input.value = "";
      input.focus();
      error.textContent = "Forkert password.";
    });

    document.body.appendChild(gate);
    input.focus();
  }

  if (document.body) {
    showGate();
  } else {
    document.addEventListener("DOMContentLoaded", showGate, { once: true });
  }
})();

