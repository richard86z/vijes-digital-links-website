/* Vijes Global Spotlight and Google Analytics 4 */
(function () {
  'use strict';

  // Google Analytics 4 — property web stream for vijesdigitallinks.online.
  // The measurement ID is public configuration, never a secret.
  var measurementId = 'G-1K4ENKK6V4';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  if (!document.querySelector('script[data-vijes-ga="true"]')) {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    gaScript.setAttribute('data-vijes-ga', 'true');
    document.head.appendChild(gaScript);
  }

  function track(eventName, parameters) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, parameters || {});
    }
  }

  var path = (window.location.pathname || '/').toLowerCase();
  if (path.indexOf('billboard.html') !== -1 || path.indexOf('advert-admin') !== -1) return;

  var isMarketplace = path.indexOf('marketplace.html') !== -1;
  var isResources = path.indexOf('resources.html') !== -1;
  var title = isMarketplace ? 'Have a product or service to promote?' :
    isResources ? 'Turn useful ideas into brand visibility.' :
    'Put your brand in the Vijes spotlight.';
  var copy = isMarketplace ?
    'Reach visitors exploring products, services and business opportunities on the Vijes website.' :
    isResources ?
    'Businesses and organisations can request a reviewed advertising placement through Vijes Billboard.' :
    'Explore advertising opportunities for your products, services, offers and campaigns.';
  var action = isMarketplace ? 'Promote your product' : 'Explore advertising';
  var section = document.createElement('section');
  section.className = 'vijes-spotlight-banner';
  section.setAttribute('aria-label', 'Vijes Billboard advertising opportunity');
  section.innerHTML =
    '<div class="vjs-spotlight-mark" aria-hidden="true">V<span>+</span></div>' +
    '<div class="vjs-spotlight-copy"><p class="vjs-spotlight-kicker">VIJES BILLBOARD · ADVERTISING OPPORTUNITIES</p>' +
    '<h2>' + title + '</h2><p>' + copy + '</p></div>' +
    '<a class="vjs-spotlight-button" href="/billboard.html"> ' + action + ' <span aria-hidden="true">↗</span></a>';

  var main = document.querySelector('main');
  var hero = main && main.querySelector('.hero, .market-hero, .resource-hero, .page-hero');
  if (main) {
    if (hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling);
    else main.insertBefore(section, main.firstChild);
  }

  var floating = document.createElement('a');
  floating.className = 'vijes-spotlight-float';
  floating.href = '/billboard.html';
  floating.setAttribute('aria-label', 'Advertise with Vijes Billboard');
  floating.innerHTML = '<span class="vjs-float-dot"></span><span><b>Advertise with Vijes</b><small>Explore Billboard</small></span><span class="vjs-float-arrow" aria-hidden="true">↗</span>';
  document.body.appendChild(floating);

  section.querySelectorAll('a[href="/billboard.html"]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('billboard_cta_click', { placement: 'page_banner', page_path: path });
    });
  });
  floating.addEventListener('click', function () {
    track('billboard_cta_click', { placement: 'floating_shortcut', page_path: path });
  });

  var close = document.createElement('button');
  close.className = 'vijes-spotlight-dismiss';
  close.type = 'button';
  close.setAttribute('aria-label', 'Hide advertising shortcut for this visit');
  close.textContent = '×';
  floating.appendChild(close);
  close.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    floating.remove();
    try { sessionStorage.setItem('vijesSpotlightHidden', '1'); } catch (error) {}
  });
  try {
    if (sessionStorage.getItem('vijesSpotlightHidden') === '1') floating.remove();
  } catch (error) {}
})();