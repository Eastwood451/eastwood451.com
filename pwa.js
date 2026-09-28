(() => {
  'use strict';

  // Upgrade old HTTP bookmarks, retaining their path, query and fragment.
  if (location.protocol === 'http:' &&
      ['eastwood451.com', 'www.eastwood451.com'].includes(location.hostname)) {
    const secureURL = new URL(location.href);
    secureURL.protocol = 'https:';
    location.replace(secureURL.href);
    return;
  }

  const button = document.getElementById('install-app');
  const status = document.getElementById('install-status');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let deferredPrompt = null;
  let installedThisSession = false;
  const isInstalled = () => installedThisSession || standalone.matches || navigator.standalone === true;
  const message = text => { if (status) status.textContent = text; };

  const dialog = document.getElementById('install-help');
  const instructions = document.getElementById('install-instructions');
  const syncButton = () => { if (button) button.hidden = isInstalled(); };
  const showHelp = () => {
    const apple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const samsung = /SamsungBrowser/.test(navigator.userAgent);
    instructions.innerHTML = apple
      ? '<ol><li>Tryk på browserens <strong>Del</strong>-knap (firkanten med en pil op).</li><li>Vælg <strong>Føj til hjemmeskærm</strong>. Tryk eventuelt på <strong>Mere</strong> først.</li><li>Slå <strong>Åbn som webapp</strong> til, hvis valget vises, og tryk <strong>Tilføj</strong>.</li></ol><p>Kan du ikke finde valget? Åbn eastwood451.com i Safari og følg trinnene.</p>'
      : samsung
        ? '<ol><li>Åbn browserens menu <strong>☰</strong>.</li><li>Vælg <strong>Føj side til → Startskærm</strong> eller <strong>Installer app</strong>.</li><li>Bekræft installationen.</li></ol>'
        : '<ol><li>Åbn browserens menu <strong>⋮</strong>.</li><li>Vælg <strong>Installer app</strong> eller <strong>Føj til startskærm</strong>.</li><li>Tryk <strong>Installer</strong> eller <strong>Tilføj</strong>.</li></ol><p>Hvis valget mangler, så åbn eastwood451.com i Chrome eller Safari. På computer kan installation også findes i adresselinjen.</p>';
    if (!dialog.open) dialog.showModal();
  };
  syncButton();

  window.addEventListener('beforeinstallprompt', event => {
    if (!button || isInstalled()) return;
    event.preventDefault();
    deferredPrompt = event;
    button.disabled = false;
    button.hidden = false;
    message('');
  });

  button?.addEventListener('click', async () => {
    if (isInstalled()) return;
    if (!deferredPrompt) { showHelp(); return; }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    button.disabled = true;
    message('');
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch (error) {
      console.warn('App installation prompt failed:', error);
      message('Installationen kunne ikke åbnes. Prøv via browserens menu.');
      showHelp();
    } finally {
      // Keep manual installation available after a dismissed or failed prompt.
      syncButton();
      button.disabled = false;
    }
  });

  const hideInstall = () => {
    installedThisSession = true;
    deferredPrompt = null;
    if (button) button.hidden = true;
    if (dialog?.open) dialog.close();
    message('');
  };
  window.addEventListener('appinstalled', hideInstall);
  standalone.addEventListener('change', syncButton);

  if ('serviceWorker' in navigator && window.isSecureContext) {
    const register = () => {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      }).catch(error => console.warn('App service worker registration failed:', error));
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
})();
