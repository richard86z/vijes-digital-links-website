/* Vijes Marketplace public storefront: live listings, basket, guest checkout and order tracking. */
(function () {
  'use strict';

  const root = document.querySelector('.vjm-store');
  if (!root) return;

  const API_ROOT = 'https://api-v2.appdeploy.ai/app/vijes-marketplace-w0zy9z';
  const API_URL = API_ROOT + '/api/products';
  const SELLER_PORTAL_URL = 'https://vijes-marketplace-w0zy9z.v2.appdeploy.ai/';
  const CART_KEY = 'vijes-public-market-cart';
  const ORDER_KEY = 'vijes-public-market-order-tokens';
  const searchInput = root.querySelector('#vjm-search');
  const locationSelect = root.querySelector('#vjm-location');
  const grid = root.querySelector('#vjm-products-grid');
  const count = root.querySelector('#vjm-result-count');
  const detailModal = document.getElementById('vjm-detail-modal');
  const cartModal = document.getElementById('vjm-cart-modal');
  const checkoutModal = document.getElementById('vjm-checkout-modal');
  const ordersModal = document.getElementById('vjm-orders-modal');
  const cartContent = document.getElementById('vjm-cart-content');
  const checkoutForm = document.getElementById('vjm-checkout-form');
  const ordersContent = document.getElementById('vjm-orders-content');
  let products = [];
  let activeCategory = 'All';
  let cartIds = readStorage(CART_KEY);
  let orderTokens = readStorage(ORDER_KEY);

  function readStorage(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function saveStorage() {
    localStorage.setItem(CART_KEY, JSON.stringify(cartIds));
    localStorage.setItem(ORDER_KEY, JSON.stringify(orderTokens));
  }

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

  async function apiRequest(path, options) {
    const settings = options || {};
    const response = await fetch(API_ROOT + path, {
      method: settings.method || 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: settings.body ? { 'Content-Type': 'application/json' } : undefined,
      body: settings.body ? JSON.stringify(settings.body) : undefined
    });
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(data.message || data.error || 'The Marketplace service could not complete this request.');
    }
    return data;
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    if (!document.querySelector('.vjm-modal.open')) document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.vjm-modal.open').forEach(closeModal);
  }

  function updateCartCount() {
    const countNode = document.getElementById('vjm-cart-count');
    if (countNode) countNode.textContent = String(cartIds.length);
  }

  function openSellerPortal() {
    let modal = document.getElementById('vjm-seller-start-guide');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vjm-seller-start-guide';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'vjm-seller-guide-title');
      modal.style.cssText = 'position:fixed;inset:0;z-index:10050;background:rgba(8,16,32,.82);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
      modal.innerHTML = '<section style="width:min(620px,100%);max-height:92vh;overflow:auto;background:#fff;color:#15213a;border-radius:20px;padding:clamp(20px,4vw,34px);box-shadow:0 24px 80px rgba(0,0,0,.35)">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px"><div><span style="display:inline-block;background:#eef5d7;color:#41540b;padding:6px 10px;border-radius:30px;font-size:11px;font-weight:800;letter-spacing:.08em">FREE SELLER REGISTRATION</span><h2 id="vjm-seller-guide-title" style="margin:14px 0 8px;font-size:26px;line-height:1.15">Start selling on Vijes</h2></div><button type="button" data-seller-guide-close aria-label="Close" style="border:0;background:#f0f2f6;border-radius:10px;padding:8px 12px;font-size:20px;cursor:pointer">×</button></div>' +
        '<p style="color:#526078;line-height:1.6;margin:0 0 18px">You are in the right place. Seller registration and your private Seller Centre open in a secure separate page. Your customers will continue shopping and checking out here on the Vijes website.</p>' +
        '<ol style="padding-left:22px;margin:0 0 20px;color:#26344d;line-height:1.65"><li style="padding:5px 0"><b>Create an account or sign in.</b> Use an email or an available sign-in option on the secure page.</li><li style="padding:5px 0"><b>Complete your seller profile.</b> Add your shop name, seller type, country, city and phone number.</li><li style="padding:5px 0"><b>Add your first product.</b> Upload a clear photo, enter the description, price, currency and delivery details.</li><li style="padding:5px 0"><b>Submit for review.</b> Your listing appears publicly after Vijes approves it.</li></ol>' +
        '<div style="background:#f5f7fa;border:1px solid #e5e9f0;border-radius:12px;padding:14px;margin-bottom:20px"><b style="display:block;margin-bottom:5px">Before you continue</b><span style="color:#526078;font-size:13px;line-height:1.5">Registration is free. Keep your sign-in details private. Do not pay anyone to create a seller account. Seller Centre currently opens on the AppDeploy secure portal while we work on bringing the seller experience directly onto this website.</span></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:10px"><a href="' + SELLER_PORTAL_URL + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;background:#15213a;color:#fff;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:10px;min-height:46px">Continue to Seller Centre ↗</a><button type="button" data-seller-guide-close style="border:1px solid #d8deea;background:#fff;color:#26344d;font-weight:700;padding:13px 18px;border-radius:10px;cursor:pointer">Maybe later</button></div>' +
        '</section>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (event) {
        if (event.target === modal || event.target.closest('[data-seller-guide-close]')) {
          modal.remove();
          document.body.style.overflow = '';
        }
      });
    }
    document.body.style.overflow = 'hidden';
  }

  root.querySelectorAll('[data-vjm-open]').forEach(function (button) {
    button.addEventListener('click', openSellerPortal);
  });

  root.querySelectorAll('[data-vjm-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      closeModal(button.closest('.vjm-modal'));
    });
  });

  document.querySelectorAll('[data-vjm-cart-open]').forEach(function (button) {
    button.addEventListener('click', function () {
      renderCart();
      openModal(cartModal);
    });
  });

  document.querySelectorAll('[data-vjm-orders-open]').forEach(function (button) {
    button.addEventListener('click', function () {
      openModal(ordersModal);
      void refreshOrders();
    });
  });

  document.querySelectorAll('[data-vjm-back-cart]').forEach(function (button) {
    button.addEventListener('click', function () {
      closeModal(checkoutModal);
      renderCart();
      openModal(cartModal);
    });
  });

  [detailModal, cartModal, checkoutModal, ordersModal].forEach(function (modal) {
    if (!modal) return;
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAllModals();
  });

  function updateLocations() {
    const current = locationSelect.value || '';
    const places = Array.from(new Set(products.map(function (product) {
      return String(product.country || '').trim();
    }).filter(Boolean))).sort();
    locationSelect.innerHTML = '<option value="">Choose seller country</option>' +
      places.map(function (place) {
        return '<option value="' + escapeHtml(place) + '">' + escapeHtml(place) + '</option>';
      }).join('');
    locationSelect.value = places.includes(current) ? current : '';
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const country = locationSelect.value;

    if (!products.length) {
      count.textContent = 'No approved listings yet';
      grid.innerHTML = '<div class="vjm-empty"><strong>No approved product listings are currently available.</strong><br>Seller submissions will appear here after review. You can still explore Vijes business services and digital resources below.</div>';
      return;
    }

    if (!country) {
      count.textContent = 'Choose a seller country';
      grid.innerHTML = '<div class="vjm-empty"><strong>Choose a seller country to browse.</strong><br>The catalogue is filtered by the location recorded on each seller listing. This selection does not independently verify your physical location.</div>';
      return;
    }

    const visible = products.filter(function (product) {
      const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
      const countryMatch = product.country === country;
      const searchable = [
        product.title, product.description, product.category, product.city,
        product.country, product.sellerName
      ].join(' ').toLowerCase();
      return categoryMatch && countryMatch && (!query || searchable.includes(query));
    });

    count.textContent = visible.length + (visible.length === 1 ? ' listing' : ' listings');
    if (!visible.length) {
      grid.innerHTML = '<div class="vjm-empty"><strong>No approved products found.</strong><br>Approved seller listings will appear here after review.<br><br><button class="vjm-btn vjm-btn-outline" type="button" data-retry>Refresh listings</button></div>';
      const retry = grid.querySelector('[data-retry]');
      if (retry) retry.addEventListener('click', loadProducts);
      return;
    }

    grid.innerHTML = visible.map(function (product) {
      const image = product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85';
      const delivery = Number(product.deliveryFee || 0) === 0
        ? 'Free delivery / pickup'
        : 'Delivery fee: ' + money(product.deliveryFee, product.currency);
      const inBasket = cartIds.includes(product.id);
      return '<article class="vjm-product">' +
        '<div class="vjm-product-image"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.title) + '" loading="lazy"><span class="vjm-product-tag">Vijes reviewed</span></div>' +
        '<div class="vjm-product-body">' +
        '<span class="vjm-product-cat">' + escapeHtml(product.category) + '</span>' +
        '<h3>' + escapeHtml(product.title) + '</h3>' +
        '<span class="vjm-product-location">⌖ ' + escapeHtml(product.city) + ', ' + escapeHtml(product.country) + '</span>' +
        '<div class="vjm-product-price"><strong>' + money(product.price, product.currency) + '</strong><span>' + escapeHtml(product.sellerName || 'Vijes seller') + '</span></div>' +
        '<p class="vjm-product-delivery">' + escapeHtml(delivery) + '</p>' +
        '<div class="vjm-product-actions"><button class="vjm-product-view" type="button" data-view="' + escapeHtml(product.id) + '">View details</button>' +
        '<button class="vjm-add-button" type="button" data-add="' + escapeHtml(product.id) + '">' + (inBasket ? 'Added ✓' : 'Add to basket') + '</button></div>' +
        '</div></article>';
    }).join('');
    updateCartCount();
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
      const data = await apiRequest('/api/products');
      products = Array.isArray(data.products) ? data.products : [];
      updateLocations();
      render();
    } catch (error) {
      console.error('Vijes Marketplace feed error:', error);
      showLoadError('We could not load approved listings. Please refresh and try again.');
    }
  }

  function getCartProducts() {
    return cartIds.map(function (id) {
      return products.find(function (product) { return product.id === id; });
    }).filter(Boolean);
  }

  function addToCart(id) {
    const product = products.find(function (item) { return item.id === id; });
    if (!product) return;
    if (!cartIds.includes(id)) cartIds.push(id);
    saveStorage();
    updateCartCount();
    render();
    const detail = document.querySelector('.vjm-detail-content');
    if (detail) {
      const button = detail.querySelector('[data-detail-add]');
      if (button) button.textContent = 'Added to basket ✓';
    }
  }

  function removeFromCart(id) {
    cartIds = cartIds.filter(function (item) { return item !== id; });
    saveStorage();
    updateCartCount();
    renderCart();
    render();
  }

  function renderCart() {
    const items = getCartProducts();
    if (!items.length) {
      cartContent.innerHTML = '<div class="vjm-empty">Your basket is empty. Browse the approved products and add items to your basket.</div>';
      return;
    }
    const totals = {};
    items.forEach(function (item) {
      const currency = item.currency || 'USD';
      totals[currency] = (totals[currency] || 0) + Number(item.price || 0) + Number(item.deliveryFee || 0);
    });
    const totalMarkup = Object.keys(totals).map(function (currency) {
      return '<div class="vjm-total-line"><span>Estimated total (' + escapeHtml(currency) + ')</span><strong>' + money(totals[currency], currency) + '</strong></div>';
    }).join('');
    const itemsMarkup = items.map(function (item) {
      return '<div class="vjm-cart-item"><img src="' + escapeHtml(item.imageUrl || '') + '" alt="' + escapeHtml(item.title) + '">' +
        '<div><b>' + escapeHtml(item.title) + '</b><small>' + escapeHtml(item.sellerName || 'Vijes seller') + ' · ' + escapeHtml(item.city) + ', ' + escapeHtml(item.country) + '</small>' +
        '<strong>' + money(item.price, item.currency) + '</strong><small>Delivery: ' + money(item.deliveryFee || 0, item.currency) + '</small></div>' +
        '<button type="button" data-remove="' + escapeHtml(item.id) + '" class="vjm-remove-button">Remove</button></div>';
    }).join('');
    const codEligible = items.every(function (item) {
      return Array.isArray(item.paymentMethods) && item.paymentMethods.includes('Pay on Delivery');
    });
    cartContent.innerHTML = '<div class="vjm-cart-list">' + itemsMarkup + '</div>' + totalMarkup +
      (codEligible ? '<p class="vjm-form-notice">Cash on Delivery is available for every item in this basket. You will pay the seller when the products arrive.</p>' :
        '<p class="vjm-checkout-error">At least one product does not currently accept Cash on Delivery. Remove it or contact the seller. Vijes online payment is not active.</p>') +
      '<div class="vjm-form-submit"><button type="button" class="vjm-btn vjm-btn-outline" data-vjm-close>Continue shopping</button>' +
      '<button type="button" class="vjm-btn vjm-btn-primary" id="vjm-checkout-start" ' + (codEligible ? '' : 'disabled') + '>Proceed to checkout →</button></div>';
    cartContent.querySelectorAll('[data-remove]').forEach(function (button) {
      button.addEventListener('click', function () { removeFromCart(button.dataset.remove); });
    });
    const checkoutButton = cartContent.querySelector('#vjm-checkout-start');
    if (checkoutButton) checkoutButton.addEventListener('click', openCheckout);
    cartContent.querySelectorAll('[data-vjm-close]').forEach(function (button) {
      button.addEventListener('click', function () { closeModal(cartModal); });
    });
  }

  function openCheckout() {
    const items = getCartProducts();
    if (!items.length) return;
    const summary = items.map(function (item) {
      return '<div class="vjm-checkout-summary-line"><span>' + escapeHtml(item.title) + '</span><strong>' + money(Number(item.price || 0) + Number(item.deliveryFee || 0), item.currency) + '</strong></div>';
    }).join('');
    document.getElementById('vjm-checkout-summary').innerHTML = '<div class="vjm-checkout-summary">' + summary + '</div>';
    const errorNode = document.getElementById('vjm-checkout-error');
    errorNode.hidden = true;
    errorNode.textContent = '';
    closeModal(cartModal);
    openModal(checkoutModal);
  }

  function makeRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'vj' + Date.now().toString(36) + Math.random().toString(36).slice(2, 24);
  }

  async function placeOrder(event) {
    event.preventDefault();
    const items = getCartProducts();
    const errorNode = document.getElementById('vjm-checkout-error');
    const submitButton = document.getElementById('vjm-place-order');
    if (!items.length) {
      errorNode.textContent = 'Your basket is empty. Add a product before checkout.';
      errorNode.hidden = false;
      return;
    }
    if (!items.every(function (item) { return item.paymentMethods && item.paymentMethods.includes('Pay on Delivery'); })) {
      errorNode.textContent = 'Every product in your basket must accept Cash on Delivery.';
      errorNode.hidden = false;
      return;
    }
    const form = new FormData(checkoutForm);
    const buyer = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      country: String(form.get('country') || '').trim(),
      city: String(form.get('city') || '').trim(),
      postalCode: String(form.get('postalCode') || '').trim(),
      address: String(form.get('address') || '').trim(),
      deliveryNote: String(form.get('deliveryNote') || '').trim()
    };
    const countryKey = function (value) {
      return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    };
    const selectedMarket = locationSelect.value;
    const sameCountry = selectedMarket &&
      countryKey(buyer.country) === countryKey(selectedMarket) &&
      items.every(function (item) {
        return countryKey(item.country) === countryKey(selectedMarket) &&
          countryKey(item.sellerCountry || item.country) === countryKey(selectedMarket);
      });
    if (!sameCountry) {
      errorNode.textContent = 'This checkout is for domestic orders only. Select the seller country and enter a delivery address in that same country. Cross-border orders are not supported through this Cash on Delivery checkout.';
      errorNode.hidden = false;
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting order…';
    errorNode.hidden = true;
    try {
      const data = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          requestId: makeRequestId(),
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone,
          country: buyer.country,
          city: buyer.city,
          address: buyer.address,
          postalCode: buyer.postalCode,
          deliveryNote: buyer.deliveryNote,
          paymentMethod: 'Cash on Delivery',
          items: items.map(function (item) { return { productId: item.id, quantity: 1 }; })
        }
      });
      const newTokens = (data.orders || []).map(function (order) {
        return { id: String(order.id), trackingToken: String(order.trackingToken) };
      });
      orderTokens = orderTokens.filter(function (item) {
        return !newTokens.some(function (next) { return next.id === item.id; });
      }).concat(newTokens);
      cartIds = [];
      saveStorage();
      updateCartCount();
      checkoutForm.reset();
      closeModal(checkoutModal);
      await refreshOrders();
      openModal(ordersModal);
      ordersContent.insertAdjacentHTML('afterbegin', '<p class="vjm-form-notice">Your order has been placed successfully. Pay the seller on delivery. No online payment was collected.</p>');
      render();
    } catch (error) {
      errorNode.textContent = error.message || 'Your order could not be placed. Please try again.';
      errorNode.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Place order';
    }
  }

  checkoutForm.addEventListener('submit', placeOrder);

  async function refreshOrders() {
    if (!orderTokens.length) {
      ordersContent.innerHTML = '<div class="vjm-empty">You have no tracked orders on this device yet. Orders placed here will appear in this section.</div>';
      return;
    }
    ordersContent.innerHTML = '<div class="vjm-empty">Loading your order updates…</div>';
    const results = await Promise.all(orderTokens.map(async function (item) {
      try {
        const data = await apiRequest('/api/orders/track', {
          method: 'POST',
          body: { orderId: item.id, trackingToken: item.trackingToken }
        });
        return { order: data.order, token: item.trackingToken };
      } catch (error) {
        return { error: error.message };
      }
    }));
    const cards = results.map(function (result) {
      if (!result.order) return '<div class="vjm-checkout-error">An order could not be retrieved. Keep your order reference and try again later.</div>';
      const order = result.order;
      const status = String(order.status || 'placed').replace(/_/g, ' ');
      const items = Array.isArray(order.items) ? order.items : [];
      const lines = items.map(function (item) {
        return '<li>' + escapeHtml(item.title) + ' — ' + money(item.unitPrice, order.currency) + '</li>';
      }).join('');
      const cancel = order.status === 'placed'
        ? '<button type="button" class="vjm-btn vjm-btn-outline" data-order-cancel="' + escapeHtml(order.id) + '">Cancel order</button>'
        : '';
      const received = order.status === 'delivered'
        ? '<button type="button" class="vjm-btn vjm-btn-primary" data-order-received="' + escapeHtml(order.id) + '">Confirm receipt</button>'
        : '';
      return '<article class="vjm-order-card"><div class="vjm-order-head"><div><small>ORDER REFERENCE</small><b>' + escapeHtml(order.orderNumber || order.id) + '</b></div><span class="vjm-order-status">' + escapeHtml(status) + '</span></div>' +
        '<ul>' + lines + '</ul><div class="vjm-order-meta"><span>Seller: ' + escapeHtml(order.sellerName || 'Vijes seller') + '</span><strong>Total: ' + money(order.total, order.currency) + '</strong></div>' +
        '<p>Payment: Cash on Delivery · ' + escapeHtml(order.paymentStatus || 'Collect on delivery') + '</p>' +
        '<div class="vjm-order-actions">' + cancel + received + '</div></article>';
    }).join('');
    ordersContent.innerHTML = cards || '<div class="vjm-empty">No order details are currently available.</div>';
    ordersContent.querySelectorAll('[data-order-cancel]').forEach(function (button) {
      button.addEventListener('click', async function () {
        const item = orderTokens.find(function (entry) { return entry.id === button.dataset.orderCancel; });
        if (!item || !window.confirm('Cancel this order?')) return;
        button.disabled = true;
        try {
          await apiRequest('/api/orders/' + encodeURIComponent(item.id) + '/cancel', {
            method: 'POST',
            body: { trackingToken: item.trackingToken }
          });
          await refreshOrders();
        } catch (error) {
          window.alert(error.message);
          button.disabled = false;
        }
      });
    });
    ordersContent.querySelectorAll('[data-order-received]').forEach(function (button) {
      button.addEventListener('click', async function () {
        const item = orderTokens.find(function (entry) { return entry.id === button.dataset.orderReceived; });
        if (!item || !window.confirm('Confirm that you have received this order?')) return;
        button.disabled = true;
        try {
          await apiRequest('/api/orders/' + encodeURIComponent(item.id) + '/received', {
            method: 'POST',
            body: { trackingToken: item.trackingToken }
          });
          await refreshOrders();
        } catch (error) {
          window.alert(error.message);
          button.disabled = false;
        }
      });
    });
  }

  function showProduct(product) {
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
      '<p><b>Seller payment preferences:</b> ' + escapeHtml(payment) + '</p>' +
      '<button type="button" class="vjm-btn vjm-btn-primary" data-detail-add="' + escapeHtml(product.id) + '">Add to basket</button>' +
      '<p class="vjm-product-delivery">Checkout is completed here on vijesdigitallinks.online. Cash on Delivery only; online payment through Vijes is not active yet.</p></div></div>';
    const addButton = detailModal.querySelector('[data-detail-add]');
    addButton.addEventListener('click', function () {
      addToCart(product.id);
      closeModal(detailModal);
      renderCart();
      openModal(cartModal);
    });
    openModal(detailModal);
  }

  grid.addEventListener('click', function (event) {
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      addToCart(addButton.dataset.add);
      addButton.textContent = 'Added ✓';
      return;
    }
    const viewButton = event.target.closest('[data-view]');
    if (!viewButton) return;
    const product = products.find(function (item) { return item.id === viewButton.dataset.view; });
    if (product) showProduct(product);
  });

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
  updateCartCount();
  loadProducts();
})();
