/* Vijes Marketplace public storefront: live, approved listings only. */
(function () {
  'use strict';

  const root = document.querySelector('.vjm-store');
  if (!root) return;

  const API_URL = 'https://api-v2.appdeploy.ai/app/vijes-marketplace-w0zy9z/api/products';
  const SELLER_PORTAL_URL = 'https://vijes-marketplace-w0zy9z.v2.appdeploy.ai/';
  const searchInput = root.querySelector('#vjm-search');
  const locationSelect = root.querySelector('#vjm-location');
  const grid = root.querySelector('#vjm-products-grid');
  const count = root.querySelector('#vjm-result-count');
  const detailModal = document.getElementById('vjm-detail-modal');
  let products = [];
  let activeCategory = 'All';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function money(value, currency) {
    const symbols = { NGN: '₦', GBP: '£', EUR: '€', CAD: 'C$', USD: '$' };
    return (symbols[currency] || (currency ? currency + ' ' : '$')) +
      Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function openSellerPortal() {
    const opened = window.open(SELLER_PORTAL_URL, '_blank', 'noopener');
    if (!opened) window.location.href = SELLER_PORTAL_URL;
  }

  root.querySelectorAll('[data-vjm-open]').forEach(function (button) {
    button.addEventListener('click', openSellerPortal);
  });

  root.querySelectorAll('[data-vjm-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      const modal = button.closest('.vjm-modal');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  if (detailModal) {
    detailModal.addEventListener('click', function (event) {
      if (event.target === detailModal) {
        detailModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && detailModal && detailModal.classList.contains('open')) {
      detailModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  function updateLocations() {
    const current = locationSelect.value || 'All locations';
    const places = Array.from(new Set(products.map(function (product) {
      return String(product.country || '').trim();
    }).filter(Boolean))).sort();
    locationSelect.innerHTML = '<option value="All locations">All locations</option>' +
      places.map(function (place) {
        return '<option value="' + escapeHtml(place) + '">' + escapeHtml(place) + '</option>';
      }).join('');
    locationSelect.value = places.includes(current) ? current : 'All locations';
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const country = locationSelect.value;
    const visible = products.filter(function (product) {
      const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
      const countryMatch = country === 'All locations' || product.country === country;
      const searchable = [
        product.title, product.description, product.category, product.city,
        product.country, product.sellerName
      ].join(' ').toLowerCase();
      return categoryMatch && countryMatch && (!query || searchable.includes(query));
    });

    count.textContent = visible.length + (visible.length === 1 ? ' listing' : ' listings');

    if (!visible.length) {
      grid.innerHTML = '<div class="vjm-empty"><strong>No approved products yet.</strong><br>Be among the first sellers to list a product on Vijes Marketplace. Listings appear publicly after review.<br><br><button class="vjm-btn vjm-btn-primary" type="button" data-empty-sell>Start selling free →</button></div>';
      const sellButton = grid.querySelector('[data-empty-sell]');
      if (sellButton) sellButton.addEventListener('click', openSellerPortal);
      return;
    }

    grid.innerHTML = visible.map(function (product) {
      const image = product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85';
      const delivery = Number(product.deliveryFee || 0) === 0
        ? 'Free delivery / pickup'
        : 'Delivery fee: ' + money(product.deliveryFee, product.currency);
      return '<article class="vjm-product">' +
        '<div class="vjm-product-image"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.title) + '" loading="lazy"><span class="vjm-product-tag">Vijes reviewed</span></div>' +
        '<div class="vjm-product-body">' +
        '<span class="vjm-product-cat">' + escapeHtml(product.category) + '</span>' +
        '<h3>' + escapeHtml(product.title) + '</h3>' +
        '<span class="vjm-product-location">⌖ ' + escapeHtml(product.city) + ', ' + escapeHtml(product.country) + '</span>' +
        '<div class="vjm-product-price"><strong>' + money(product.price, product.currency) + '</strong><span>' + escapeHtml(product.sellerName || 'Vijes seller') + '</span></div>' +
        '<p class="vjm-product-delivery">' + escapeHtml(delivery) + '</p>' +
        '<button class="vjm-product-view" type="button" data-view="' + escapeHtml(product.id) + '">View listing</button>' +
        '</div></article>';
    }).join('');
  }

  function showLoadError(message) {
    count.textContent = 'Listings unavailable';
    grid.innerHTML = '<div class="vjm-empty">' + escapeHtml(message) + '<br><br><button class="vjm-btn vjm-btn-outline" type="button" data-retry>Try again</button></div>';
    const retry = grid.querySelector('[data-retry]');
    if (retry) retry.addEventListener('click', loadProducts);
  }

  async function loadProducts() {
    grid.innerHTML = '<div class="vjm-empty">Loading approved marketplace listings…</div>';
    try {
      const response = await fetch(API_URL, { method: 'GET', mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error('Marketplace service returned ' + response.status);
      const data = await response.json();
      products = Array.isArray(data.products) ? data.products : [];
      updateLocations();
      render();
    } catch (error) {
      console.error('Vijes Marketplace feed error:', error);
      showLoadError('We could not load marketplace listings right now. Please try again.');
    }
  }

  root.querySelectorAll('.vjm-cat').forEach(function (button) {
    button.addEventListener('click', function () {
      root.querySelectorAll('.vjm-cat').forEach(function (item) { item.classList.remove('active'); });
      button.classList.add('active');
      activeCategory = button.dataset.category || 'All';
      render();
    });
  });

  searchInput.addEventListener('input', render);
  locationSelect.addEventListener('change', render);

  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-view]');
    if (!button || !detailModal) return;
    const product = products.find(function (item) { return item.id === button.dataset.view; });
    if (!product) return;
    const payment = Array.isArray(product.paymentMethods) ? product.paymentMethods.join(' · ') : 'Contact seller';
    const delivery = Number(product.deliveryFee || 0) === 0
      ? 'Free delivery / pickup'
      : money(product.deliveryFee, product.currency);
    detailModal.querySelector('.vjm-detail-content').innerHTML =
      '<div class="vjm-detail"><img src="' + escapeHtml(product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85') + '" alt="' + escapeHtml(product.title) + '">' +
      '<div><span class="vjm-product-cat">' + escapeHtml(product.category) + '</span>' +
      '<h3>' + escapeHtml(product.title) + '</h3>' +
      '<p>⌖ ' + escapeHtml(product.city) + ', ' + escapeHtml(product.country) + '</p>' +
      '<strong>' + money(product.price, product.currency) + '</strong>' +
      '<p>' + escapeHtml(product.description) + '</p>' +
      '<p><b>Delivery fee:</b> ' + escapeHtml(delivery) + '</p>' +
      '<p><b>Estimated delivery:</b> ' + escapeHtml(product.deliveryEstimate || 'Confirm with seller') + '</p>' +
      '<p><b>Seller:</b> ' + escapeHtml(product.sellerName || 'Vijes seller') + '</p>' +
      '<p><b>Payment preference:</b> ' + escapeHtml(payment) + '</p>' +
      '<div class="vjm-form-notice">Buyer enquiries, checkout and payment processing will be enabled in the next stage. Contact and order options are not active yet.</div></div></div>';
    detailModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  loadProducts();
})();
