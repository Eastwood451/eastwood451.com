const panel = document.querySelector('#loading-panel');
const status = document.querySelector('#status');
const retry = document.querySelector('#retry');

// Public access was enabled by the owner. No account or browser session is needed.
async function open() {
  retry.hidden = true;
  status.textContent = 'Henter din forberedelse…';
  try {
    if (!document.querySelector('#app-styles')) {
      const link = document.createElement('link');
      link.id = 'app-styles';
      link.rel = 'stylesheet';
      link.href = '/api/agent-skolelaerer/assets/app.css';
      document.head.append(link);
    }
    const module = await import('/api/agent-skolelaerer/assets/app.js');
    await module.mount(document.querySelector('#app'));
    panel.hidden = true;
  } catch {
    document.querySelector('#app').replaceChildren();
    status.textContent = 'Appen kunne ikke indlæses. Prøv igen.';
    retry.hidden = false;
  }
}

retry.addEventListener('click', () => window.location.reload());
void open();
