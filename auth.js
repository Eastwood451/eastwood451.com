(function () {
  const AUTH_KEY = "eastwood451-auth";
  const PASSWORD_HASH = "b18694640e3f5";

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
      display: grid;
      place-items: center;
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
