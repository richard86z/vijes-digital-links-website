(function(){
  'use strict';
  function init(){
    var heroLabel=document.querySelector('.billboard-hero .eyebrow');
    if(heroLabel) heroLabel.textContent='VIJES BILLBOARD · GLOBAL ADVERTISING MARKETPLACE';
    var heroCopy=document.querySelector('.billboard-hero-copy>p:not(.eyebrow)');
    if(heroCopy) heroCopy.textContent='Discover businesses, products, services and campaigns featured on Vijes Billboard. A growing global business-discovery space where brands can showcase what they offer and request reviewed advertising campaigns.';
    var intro=document.querySelector('.billboard-intro');
    var listings=document.querySelector('.billboard-listings');
    if(!intro||!listings||document.querySelector('.billboard-marketplace-directory')) return;
    var section=document.createElement('section');
    section.className='billboard-marketplace-directory';
    section.setAttribute('aria-labelledby','billboard-marketplace-title');
    var categories=[
      ['✦','Fashion & Beauty','Apparel, personal care and lifestyle brands'],
      ['⌘','Technology','Software, devices and digital products'],
      ['▤','Education','Schools, learning and training services'],
      ['⌂','Real Estate','Property, construction and related services'],
      ['❖','Food & Agriculture','Food brands, farming and agribusiness'],
      ['＋','Healthcare','Health services and wellness organisations'],
      ['♫','Entertainment','Music, media, arts and events'],
      ['◎','Business & Professional Services','Agencies, consultants and business support'],
      ['▣','Retail & E-commerce','Online stores, products and consumer brands']
    ];
    section.innerHTML='<div class="billboard-marketplace-heading"><div><p class="eyebrow">EXPLORE THE BUSINESS DIRECTORY</p><h2 id="billboard-marketplace-title">Discover by industry.</h2></div><p>Explore the sectors represented across the Vijes Billboard marketplace. Approved campaigns appear in the featured listings below as the marketplace grows.</p></div><div class="billboard-marketplace-regions"><strong>CAMPAIGN MARKETS ADVERTISERS CAN REQUEST</strong><span>Worldwide</span><span>Africa</span><span>Europe</span><span>North America</span><span>South America</span><span>Middle East</span><span>Asia-Pacific</span></div><div class="billboard-marketplace-grid"></div><p class="billboard-marketplace-note">Market and audience selections are campaign preferences, not a guarantee of reach. Current placements appear on Vijes-owned digital properties; partner-network distribution will be introduced only when confirmed partners and reporting are in place.</p>';
    var grid=section.querySelector('.billboard-marketplace-grid');
    categories.forEach(function(item){
      var card=document.createElement('article');
      card.className='billboard-marketplace-category';
      var icon=document.createElement('span');icon.className='billboard-marketplace-category-icon';icon.setAttribute('aria-hidden','true');icon.textContent=item[0];
      var copy=document.createElement('div');
      var title=document.createElement('strong');title.textContent=item[1];
      var desc=document.createElement('small');desc.textContent=item[2];
      copy.appendChild(title);copy.appendChild(desc);card.appendChild(icon);card.appendChild(copy);grid.appendChild(card);
    });
    intro.insertAdjacentElement('afterend',section);
    var heading=document.querySelector('#live-ads-title');
    if(heading) heading.textContent='Explore featured campaigns';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();