/* Vijes Digital Links — Stage 1 website assistant.
   Local FAQ flow only: no AI API, third-party iframe, or automatic data collection. */
(function () {
  'use strict';
  if (window.__vijesStage1AssistantLoaded) return;
  window.__vijesStage1AssistantLoaded = true;

  var email = 'vijesdigitallinks@gmail.com';
  var whatsapp = '2347038364520';
  var services = [
    'Digital Marketing', 'Social Media Management', 'Content & Email Marketing',
    'Websites & Digital Design', 'Automation & Operations',
    'Research & Business Development', 'Translation & Interpretation',
    'Outsourcing & Project Support'
  ];

  var root = document.createElement('div');
  root.id = 'vijes-assistant';
  root.innerHTML =
    '<button class="vijes-chat-launcher" type="button" aria-label="Open Vijes customer support chat" aria-expanded="false">' +
      '<span class="vijes-chat-launcher-icon" aria-hidden="true">✦</span><span>Chat with Vijes</span>' +
    '</button>' +
    '<section class="vijes-chat-panel" role="dialog" aria-label="Vijes Digital Links customer support" aria-modal="false" hidden>' +
      '<header class="vijes-chat-header"><div><span class="vijes-chat-kicker">VIJES DIGITAL LINKS</span><strong>How can we help?</strong><small>Instant answers · Global enquiries</small></div>' +
      '<button class="vijes-chat-close" type="button" aria-label="Close chat">×</button></header>' +
      '<div class="vijes-chat-messages" aria-live="polite" aria-relevant="additions">' +
        '<div class="vijes-chat-message vijes-bot-message">Hello! Welcome to Vijes Digital Links. I can help you explore our services, projects, partnerships and ways to contact our team. What would you like to know?</div>' +
      '</div>' +
      '<div class="vijes-chat-quick" aria-label="Popular questions">' +
        '<button type="button" data-question="services">Our services</button>' +
        '<button type="button" data-question="pricing">Pricing</button>' +
        '<button type="button" data-question="project">Revenue Engine AI</button>' +
        '<button type="button" data-question="contact">Contact the team</button>' +
      '</div>' +
      '<form class="vijes-chat-form"><label class="vijes-sr-only" for="vijes-chat-input">Type your question</label>' +
        '<input id="vijes-chat-input" maxlength="400" autocomplete="off" placeholder="Type your question…" required>' +
        '<button type="submit" aria-label="Send message">Send</button></form>' +
      '<p class="vijes-chat-footnote">Automated help · For a human response, use email or WhatsApp.</p>' +
    '</section>';
  document.body.appendChild(root);

  var launcher = root.querySelector('.vijes-chat-launcher');
  var panel = root.querySelector('.vijes-chat-panel');
  var close = root.querySelector('.vijes-chat-close');
  var messages = root.querySelector('.vijes-chat-messages');
  var form = root.querySelector('.vijes-chat-form');
  var input = root.querySelector('#vijes-chat-input');

  function openChat() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    window.setTimeout(function () { input.focus(); }, 30);
  }
  function closeChat() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  launcher.addEventListener('click', function () {
    if (panel.hidden) openChat(); else closeChat();
  });
  close.addEventListener('click', closeChat);

  function addMessage(text, kind) {
    var item = document.createElement('div');
    item.className = 'vijes-chat-message ' + (kind === 'user' ? 'vijes-user-message' : 'vijes-bot-message');
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }
  function addLinks() {
    var row = document.createElement('div');
    row.className = 'vijes-chat-actions';
    var mail = document.createElement('a');
    mail.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Enquiry to Vijes Digital Links');
    mail.textContent = 'Email our team';
    var wa = document.createElement('a');
    wa.href = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent('Hello Vijes Digital Links, I would like to make an enquiry.');
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.textContent = 'WhatsApp us';
    row.appendChild(mail); row.appendChild(wa); messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }
  function answer(question) {
    var q = String(question || '').toLowerCase();
    if (/^(services|service)$/.test(q) || /what.*(service|offer|do you do)|services/.test(q)) {
      return 'We support organisations worldwide with ' + services.join('; ') + '. Tell us which area you need help with and we can direct your enquiry.';
    }
    if (/price|pricing|cost|fee|quote|how much/.test(q)) {
      return 'Our pricing depends on the service, project scope, deliverables, timeframe and level of support required. Send us a brief description and we can discuss a suitable proposal. We do not quote a universal fixed price here.';
    }
    if (/revenue|engine|ai project/.test(q)) {
      return 'Vijes Revenue Engine AI is a business intelligence and client-discovery platform in development. It is being designed to help service providers research prospects, understand business needs, identify opportunities, match services and organise outreach. It has not launched and is not currently available for public use.';
    }
    if (/marketplace|buy|sell|provider/.test(q)) {
      return 'The Vijes Marketplace is being developed as a place to explore digital services and connect around business needs. Visit the Marketplace page on this website for current information.';
    }
    if (/billboard|advertis|campaign|promot/.test(q)) {
      return 'Our Billboard page provides information about advertising opportunities. Campaigns are reviewed before publication; adverts are not published automatically. Please contact our team with your campaign goals, audience, location and timeframe.';
    }
    if (/partner|school|institution|organisation/.test(q)) {
      return 'We welcome relevant business, institutional and project partnership enquiries. Please share your organisation, the purpose of the partnership, the audience or market involved, and the outcome you hope to achieve.';
    }
    if (/global|country|international|worldwide|location/.test(q)) {
      return 'Vijes Digital Links is positioned to work with businesses and organisations across markets worldwide. The scope and delivery arrangements are discussed according to each project.';
    }
    if (/contact|human|person|agent|team|email|whatsapp|speak/.test(q)) {
      return 'You can reach the Vijes team by email or WhatsApp using the contact buttons below.';
    }
    if (/hello|hi|hey|good morning|good afternoon|good evening/.test(q)) {
      return 'Hello! Thanks for contacting Vijes Digital Links. You can ask about our services, pricing, advertising, partnerships or Revenue Engine AI.';
    }
    if (/thank/.test(q)) return 'You are welcome. If you need more help, send another question or contact our team.';
    return 'I can help with our services, pricing, advertising opportunities, partnerships, the Marketplace and Vijes Revenue Engine AI. For a question that needs a team member, use the contact options below.';
  }

  function respond(question, label) {
    addMessage(question, 'user');
    addMessage(answer(label || question), 'bot');
    if (/contact|human|person|agent|team|email|whatsapp|speak|price|pricing|cost|quote|partner|advertis|campaign/.test(String(label || question).toLowerCase())) addLinks();
  }
  root.querySelectorAll('[data-question]').forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-question');
      var labels = { services: 'What services do you offer?', pricing: 'How does your pricing work?', project: 'Tell me about Vijes Revenue Engine AI.', contact: 'How can I contact your team?' };
      respond(labels[key], key === 'project' ? 'revenue engine ai' : key);
    });
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();
    if (!value) return;
    respond(value);
    input.value = '';
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) closeChat();
  });
})();