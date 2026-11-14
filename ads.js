/* Shared advert placement served by the secure Vijes Ads Manager. */
(function () {
  'use strict';

  var managerOrigin = 'https://vijes-ads-manager-y6cp0s.v2.appdeploy.ai';
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'advert-admin.html') return;

  var header = document.querySelector('.site-header, header');
  var main = document.querySelector('main');
  if (!header && !main) return;

  var section = document.createElement('section');
  section.className = 'sitewide-ads';
  section.setAttribute('aria-label', 'Sponsored adverts');

  var frame = document.createElement('iframe');
  frame.id = 'vijes-sitewide-ad-frame';
  frame.title = 'Sponsored adverts from Vijes Digital Links';
  frame.src = managerOrigin + '/?embed=1';
  frame.loading = 'eager';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.style.width = '100%';
  frame.style.height = '0';
  frame.style.display = 'block';
  frame.style.border = '0';
  frame.style.overflow = 'hidden';
  frame.setAttribute('scrolling', 'no');
  section.appendChild(frame);

  if (header && header.parentNode) {
    header.parentNode.insertBefore(section, header.nextSibling);
  } else if (main && main.parentNode) {
    main.parentNode.insertBefore(section, main);
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== managerOrigin || !event.data ||
        event.data.type !== 'vijes-ads-resize' ||
        typeof event.data.height !== 'number') return;
    var height = Math.max(0, Math.min(900, Math.ceil(event.data.height)));
    frame.style.height = height + 'px';
    section.style.display = height ? 'block' : 'none';
  });
})();
