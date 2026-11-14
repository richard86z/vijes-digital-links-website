/* Reads only approved, currently scheduled adverts from the central public inventory. */
(function () {
  'use strict';

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var excludedPages = ['advert-admin.html'];
  if (excludedPages.indexOf(currentPage) !== -1) return;

  function safeHttpUrl(value) {
    try {
      var url = new URL(value, window.location.origin);
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function isLive(ad) {
    if (!ad || ad.approved !== true || ad.status !== 'published') return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = ad.startDate ? new Date(ad.startDate + 'T00:00:00') : null;
    var end = ad.endDate ? new Date(ad.endDate + 'T23:59:59') : null;
    if (start && !Number.isNaN(start.getTime()) && today < start) return false;
    if (end && !Number.isNaN(end.getTime()) && today > end) return false;
    return true;
  }

  function makeAd(ad) {
    var card = document.createElement('article');
    card.className = 'sitewide-ad';

    var imageUrl = safeHttpUrl(ad.imageUrl || '');
    if (imageUrl) {
      var image = document.createElement('img');
      image.className = 'sitewide-ad-image';
      image.src = imageUrl;
      image.alt = ad.imageAlt || ('Advert for ' + (ad.advertiser || 'a featured business'));
      image.loading = 'lazy';
      card.appendChild(image);
    }

    var copy = document.createElement('div');
    copy.className = 'sitewide-ad-copy';

    var kicker = document.createElement('p');
    kicker.className = 'sitewide-ad-kicker';
    kicker.textContent = 'Sponsored · ' + (ad.advertiser || 'Featured partner');

    var heading = document.createElement('h2');
    heading.textContent = ad.headline || 'Featured advert';

    copy.appendChild(kicker);
    copy.appendChild(heading);

    if (ad.description) {
      var description = document.createElement('p');
      description.textContent = ad.description;
      copy.appendChild(description);
    }

    var destination = safeHttpUrl(ad.destinationUrl || '');
    if (destination) {
      var link = document.createElement('a');
      link.className = 'sitewide-ad-link';
      link.href = destination;
      link.target = '_blank';
      link.rel = 'sponsored noopener noreferrer';
      link.textContent = ad.callToAction || 'Learn more';
      copy.appendChild(link);
    }

    card.appendChild(copy);
    return card;
  }

  function renderAds(ads) {
    var liveAds = Array.isArray(ads) ? ads.filter(isLive) : [];
    if (!liveAds.length) return;

    var header = document.querySelector('.site-header');
    var main = document.querySelector('main');
    var host = document.createElement('section');
    host.className = 'sitewide-ads';
    host.setAttribute('aria-label', 'Sponsored adverts');

    liveAds.forEach(function (ad) {
      host.appendChild(makeAd(ad));
    });

    if (header && header.parentNode) {
      header.parentNode.insertBefore(host, header.nextSibling);
    } else if (main) {
      main.parentNode.insertBefore(host, main);
    }
  }

  fetch('ads.json', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Advertising inventory unavailable');
      return response.json();
    })
    .then(function (data) {
      renderAds(data.ads);
    })
    .catch(function () {
      /* Keep the rest of the website usable if the advert inventory cannot load. */
    });
})();
