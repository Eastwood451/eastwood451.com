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
  const isInstalled = () => standalone.matches || navigator.standalone === true;
  const message = text => { if (status) status.textContent = text; };

  window.addEventListener('beforeinstallprompt', event => {
    if (!button || isInstalled()) return;
    event.preventDefault();
    deferredPrompt = event;
    button.disabled = false;
    button.hidden = false;
    message('');
  });

  button?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
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
    } finally {
      // Each install event can be used only once. Wait for a new one.
      button.hidden = deferredPrompt === null || isInstalled();
      button.disabled = false;
    }
  });

  const hideInstall = () => {
    deferredPrompt = null;
    if (button) button.hidden = true;
    message('');
  };
  window.addEventListener('appinstalled', hideInstall);
  standalone.addEventListener('change', () => { if (isInstalled()) hideInstall(); });

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
