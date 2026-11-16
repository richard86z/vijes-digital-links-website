/* Vijes Billboard 2.0 — global directory and live public campaign feed. */
(function () {
  'use strict';

  var FEED_URL = 'https://api-v2.appdeploy.ai/app/vijes-ads-manager-y6cp0s/api/billboard/ads';
  var METRICS_URL = 'https://api-v2.appdeploy.ai/app/vijes-ads-manager-y6cp0s/api/billboard/metrics';

  var categories = [
    ['✦', 'Fashion & Beauty', 'Apparel, personal care and lifestyle brands'],
    ['⌘', 'Technology', 'Software, devices and digital products'],
    ['▤', 'Education', 'Schools, learning and training services'],
    ['⌂', 'Real Estate', 'Property, construction and related services'],
    ['❖', 'Food & Agriculture', 'Food brands, farming and agribusiness'],
    ['＋', 'Healthcare', 'Health services and wellness organisations'],
    ['♫', 'Entertainment', 'Music, media, arts and events'],
    ['◎', 'Business & Professional Services', 'Agencies, consultants and business support'],
    ['▣', 'Retail & E-commerce', 'Online stores, products and consumer brands']
  ];

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addDirectory() {
    var intro = document.querySelector('.billboard-intro');
    if (!intro || document.querySelector('.billboard-marketplace-directory')) return;

    var section = element('section', 'billboard-marketplace-directory');
    section.setAttribute('aria-labelledby', 'billboard-marketplace-title');

    var heading = element('div', 'billboard-marketplace-heading');
    var headingCopy = document.createElement('div');
    headingCopy.appendChild(element('p', 'eyebrow', 'EXPLORE THE BUSINESS DIRECTORY'));
    var title = element('h2', '', 'Discover by industry.');
    title.id = 'billboard-marketplace-title';
    headingCopy.appendChild(title);
    heading.appendChild(headingCopy);
    heading.appendChild(element('p', '', 'Explore the sectors represented across the Vijes Billboard marketplace. Approved campaigns appear in the featured listings below as the marketplace grows.'));
    section.appendChild(heading);

    var regions = element('div', 'billboard-marketplace-regions');
    regions.appendChild(element('strong', '', 'CAMPAIGN MARKETS ADVERTISERS CAN REQUEST'));
    ['Worldwide', 'Africa', 'Europe', 'North America', 'South America', 'Middle East', 'Asia-Pacific'].forEach(function (region) {
      regions.appendChild(element('span', '', region));
    });
    section.appendChild(regions);

    var grid = element('div', 'billboard-marketplace-grid');
    categories.forEach(function (item) {
      var card = element('article', 'billboard-marketplace-category');
      var icon = element('span', 'billboard-marketplace-category-icon', item[0]);
      icon.setAttribute('aria-hidden', 'true');
      var copy = document.createElement('div');
      copy.appendChild(element('strong', '', item[1]));
      copy.appendChild(element('small', '', item[2]));
      card.appendChild(icon);
      card.appendChild(copy);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    section.appendChild(element('p', 'billboard-marketplace-note', 'Market and audience selections are campaign preferences, not a guarantee of reach. Current placements appear on Vijes-owned digital properties; partner-network distribution will be introduced only when confirmed partners and reporting are in place.'));
    intro.insertAdjacentElement('afterend', section);

    var liveHeading = document.querySelector('#live-ads-title');
    if (liveHeading) liveHeading.textContent = 'Explore featured campaigns';
  }

  function sendMetric(campaignId, eventName) {
    if (!campaignId) return;
    fetch(METRICS_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaignId, event: eventName }),
      keepalive: true
    }).catch(function () {
      // A metrics failure must never prevent an advert from being displayed.
    });
  }

  function renderCampaign(ad) {
    var card = element('article', 'billboard-live-card');
    card.setAttribute('data-campaign-id', ad.id || '');

    if (ad.imageUrl) {
      var image = element('img', 'billboard-live-image');
      image.src = ad.imageUrl;
      image.alt = ad.advertiser ? ad.advertiser + ' advert' : 'Advert image';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', function () {
        image.remove();
      });
      card.appendChild(image);
    }

    var body = element('div', 'billboard-live-body');
    body.appendChild(element('p', 'billboard-live-kicker', ad.placement || 'FEATURED CAMPAIGN'));
    if (ad.advertiser) body.appendChild(element('p', 'billboard-live-advertiser', ad.advertiser));
    body.appendChild(element('h3', 'billboard-live-headline', ad.headline || 'Featured campaign'));
    if (ad.description) body.appendChild(element('p', 'billboard-live-description', ad.description));

    var details = element('div', 'billboard-live-details');
    [ad.category, ad.targetMarket || ad.country].filter(Boolean).forEach(function (value) {
      details.appendChild(element('span', '', value));
    });
    if (details.childNodes.length) body.appendChild(details);

    if (ad.destinationUrl) {
      var link = element('a', 'billboard-live-action', 'Visit website ↗');
      link.href = ad.destinationUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer sponsored';
      link.addEventListener('click', function () {
        sendMetric(ad.id, 'click');
      });
      body.appendChild(link);
    }

    card.appendChild(body);
    return card;
  }

  function showDiagnostics(container, diagnostics) {
    if (!diagnostics || new URLSearchParams(window.location.search).get('debug') !== '1') return;
    var details = element(
      'p',
      'billboard-feed-status',
      'Feed diagnostics — checked ' + (diagnostics.checkedDate || 'date unavailable') +
      '; records: ' + (diagnostics.totalCampaigns || 0) +
      '; approved: ' + (diagnostics.approvedCampaigns || 0) +
      '; payment verified: ' + (diagnostics.paymentVerifiedCampaigns || 0) +
      '; published/scheduled: ' + (diagnostics.publishedOrScheduledCampaigns || 0) +
      '; within dates: ' + (diagnostics.campaignsWithinDates || 0) +
      '; eligible: ' + (diagnostics.eligibleCampaigns || 0) +
      '; future: ' + (diagnostics.futureCampaigns || 0) +
      '; expired: ' + (diagnostics.expiredCampaigns || 0) +
      '; invalid dates: ' + (diagnostics.invalidDateCampaigns || 0) +
      (diagnostics.hasMore ? '; more records may be available' : '')
    );
    details.setAttribute('aria-live', 'polite');
    container.appendChild(details);
  }

  function loadFeed(container) {
    container.replaceChildren(element('p', 'billboard-feed-status', 'Loading approved campaigns…'));

    fetch(FEED_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('The advert feed returned HTTP ' + response.status + '.');
        return response.json();
      })
      .then(function (payload) {
        container.replaceChildren();
        var ads = Array.isArray(payload.ads) ? payload.ads : [];

        if (!ads.length) {
          container.appendChild(element(
            'div',
            'billboard-empty',
            ''
          ));
          var empty = container.firstChild;
          empty.appendChild(element('span', 'empty-symbol', '✦'));
          empty.appendChild(element('p', 'empty-kicker', 'THE BILLBOARD'));
          empty.appendChild(element('h3', '', 'No active campaigns just yet.'));
          empty.appendChild(element('p', '', 'Approved, payment-verified campaigns will appear here during their scheduled dates. Check back soon or enquire about advertising with Vijes.'));
          var enquiry = element('a', '', 'Request an advertising placement →');
          enquiry.href = '#advertise';
          empty.appendChild(enquiry);
          showDiagnostics(container, payload.diagnostics);
          return;
        }

        var grid = element('div', 'billboard-live-grid');
        ads.forEach(function (ad) {
          grid.appendChild(renderCampaign(ad));
        });
        container.appendChild(grid);

        if ('IntersectionObserver' in window) {
          var seen = Object.create(null);
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var id = entry.target.getAttribute('data-campaign-id');
              if (id && !seen[id]) {
                seen[id] = true;
                sendMetric(id, 'impression');
              }
              observer.unobserve(entry.target);
            });
          }, { threshold: 0.35 });
          grid.querySelectorAll('[data-campaign-id]').forEach(function (card) {
            observer.observe(card);
          });
        } else {
          ads.forEach(function (ad) {
            sendMetric(ad.id, 'impression');
          });
        }
        showDiagnostics(container, payload.diagnostics);
      })
      .catch(function (error) {
        container.replaceChildren();
        var message = element(
          'p',
          'billboard-feed-error',
          'We could not load the live campaigns right now. Please try again.'
        );
        container.appendChild(message);
        var retry = element('button', 'billboard-feed-retry', 'Retry loading adverts');
        retry.type = 'button';
        retry.addEventListener('click', function () {
          loadFeed(container);
        });
        container.appendChild(retry);
        if (window.console && console.warn) console.warn('Vijes public Billboard feed:', error);
      });
  }

  function init() {
    var heroLabel = document.querySelector('.billboard-hero .eyebrow');
    if (heroLabel) heroLabel.textContent = 'VIJES BILLBOARD · GLOBAL ADVERTISING MARKETPLACE';

    var heroCopy = document.querySelector('.billboard-hero-copy>p:not(.eyebrow)');
    if (heroCopy) {
      heroCopy.textContent = 'Discover businesses, products, services and campaigns featured on Vijes Billboard. A growing global business-discovery space where brands can showcase what they offer and request reviewed advertising campaigns.';
    }

    addDirectory();

    var feed = document.querySelector('.billboard-live-feed');
    if (feed) loadFeed(feed);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();