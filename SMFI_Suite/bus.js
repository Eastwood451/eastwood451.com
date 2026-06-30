// bus.js - Simple message bus using BroadcastChannel for inter‑app communication
// Each app loads this script and can publish/subscribe to topics.

class MessageBus {
  constructor(channelName = 'smfi_suite_bus') {
    this.channelName = channelName;
    this.handlers = {};

    window.addEventListener('message', (event) => {
      // For cross-origin file:// we verify the data structure
      if (event.data && event.data._isSmfiBus && event.data.channel === this.channelName) {
        const { topic, data } = event.data;
        if (this.handlers[topic]) {
          this.handlers[topic].forEach((cb) => cb(data));
        }
      }
    });
  }

  publish(topic, data) {
    const payload = { _isSmfiBus: true, channel: this.channelName, topic, data };

    // 1. Are we the main suite window?
    const isMaster = (window === window.parent);

    if (isMaster) {
      // Send to self and all iframe children
      window.postMessage(payload, '*');
      const frames = document.querySelectorAll('iframe.app-iframe');
      frames.forEach(frame => {
        if (frame && frame.contentWindow) {
          frame.contentWindow.postMessage(payload, '*');
        }
      });
    } else {
      // Send to self and the parent window
      window.postMessage(payload, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, '*');
      }
    }
  }

  subscribe(topic, callback) {
    if (!this.handlers[topic]) this.handlers[topic] = [];
    if (!this.handlers[topic].includes(callback)) {
      this.handlers[topic].push(callback);
    }
  }

  unsubscribe(topic, callback) {
    if (!this.handlers[topic]) return;
    this.handlers[topic] = this.handlers[topic].filter((cb) => cb !== callback);
  }
}

// Export a singleton instance globally for convenience (supports local execution)
window.bus = new MessageBus();
