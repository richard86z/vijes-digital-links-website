/* Vijes Digital Links — global customer support chat.
   This public widget exposes only the visitor chat interface.
   It does not embed Ads Manager, payment, publishing or admin controls. */
(function () {
  'use strict';

  if (window.__vijesCustomerChatLoaded) return;
  window.__vijesCustomerChatLoaded = true;

  var frame = document.createElement('iframe');
  frame.title = 'Vijes AI Customer Support Assistant';
  frame.src = 'https://vijes-ai-customer-support-assistant-0kl8tk.v2.appdeploy.ai/?embed=1';
  frame.setAttribute('allow', 'clipboard-write');
  frame.setAttribute('loading', 'lazy');
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.style.cssText = [
    'position:fixed',
    'right:0',
    'bottom:0',
    'width:min(430px,100vw)',
    'height:88px',
    'border:0',
    'background:transparent',
    'z-index:2147483000',
    'overflow:hidden',
    'color-scheme:normal'
  ].join(';');

  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://vijes-ai-customer-support-assistant-0kl8tk.v2.appdeploy.ai') return;
    if (!event.data || event.data.type !== 'vijes-chat-resize') return;
    frame.style.height = event.data.open ? 'min(720px, 100dvh)' : '88px';
  });

  function mountChat() {
    if (!document.body || frame.isConnected) return;
    document.body.appendChild(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountChat, { once: true });
  } else {
    mountChat();
  }
})();