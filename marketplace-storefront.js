
/* Vijes Marketplace storefront interaction preview.
   Seller submissions remain in this browser only; no live account, order or payment is created. */
(function(){
  'use strict';
  var root=document.querySelector('.vjm-store');
  if(!root)return;
  var demo=[
    {id:'demo-1',title:'Wireless Bluetooth Headphones',category:'Electronics',price:45,currency:'USD',location:'Lagos, Nigeria',delivery:5,image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',payment:'Both',description:'Wireless over-ear headphones with a comfortable fit and rechargeable battery. Sample marketplace listing.'},
    {id:'demo-2',title:'Everyday Leather Tote Bag',category:'Fashion',price:38,currency:'USD',location:'London, United Kingdom',delivery:7,image:'https://images.unsplash.com/photo-1590870880860-9e5a9f4f4b5c?auto=format&fit=crop&w=900&q=85',payment:'Pay through Vijes',description:'A versatile everyday tote bag. Sample marketplace listing.'},
    {id:'demo-3',title:'Handmade Ceramic Tableware Set',category:'Home & Living',price:62,currency:'USD',location:'Accra, Ghana',delivery:9,image:'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85',payment:'Pay on Delivery',description:'Handmade ceramic tableware for everyday dining. Sample marketplace listing.'},
    {id:'demo-4',title:'Modern Desk & Workspace Setup',category:'Home & Living',price:180,currency:'USD',location:'Toronto, Canada',delivery:18,image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',payment:'Both',description:'A clean, modern workspace desk setup. Sample marketplace listing.'},
    {id:'demo-5',title:'Organic Skincare Essentials',category:'Beauty',price:29,currency:'USD',location:'Nairobi, Kenya',delivery:4,image:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',payment:'Both',description:'A simple skincare essentials set. Sample marketplace listing.'},
    {id:'demo-6',title:'Professional Camera Kit',category:'Electronics',price:320,currency:'USD',location:'New York, USA',delivery:22,image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',payment:'Pay through Vijes',description:'Camera equipment for content creators and professionals. Sample marketplace listing.'},
    {id:'demo-7',title:'Fitness & Yoga Mat',category:'Sports',price:24,currency:'USD',location:'Cape Town, South Africa',delivery:6,image:'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85',payment:'Pay on Delivery',description:'Non-slip exercise mat for home workouts. Sample marketplace listing.'},
    {id:'demo-8',title:'Business Planning Notebook',category:'Books & Office',price:16,currency:'USD',location:'Manchester, United Kingdom',delivery:4,image:'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85',payment:'Both',description:'A notebook for business ideas, planning and daily priorities. Sample marketplace listing.'}
  ];
  var key='vijes_marketplace_preview_listings_v1';
  var userItems=[];
  try{userItems=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(userItems))userItems=[];}catch(e){userItems=[];}
  var active='All';
  var searchInput=root.querySelector('#vjm-search');
  var locationSelect=root.querySelector('#vjm-location');
  var grid=root.querySelector('#vjm-products-grid');
  var modal=document.getElementById('vjm-seller-modal');
  var detailModal=document.getElementById('vjm-detail-modal');
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function money(n,c){return (c==='NGN'?'₦':c==='GBP'?'£':c==='EUR'?'€':'$')+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});}
  function allItems(){return userItems.concat(demo);}
  function render(){
    var q=(searchInput.value||'').toLowerCase().trim(),loc=locationSelect.value;
    var rows=allItems().filter(function(p){
      var matchCat=active==='All'||p.category===active;
      var matchText=!q||(p.title+' '+p.category+' '+p.location+' '+(p.description||'')).toLowerCase().indexOf(q)>-1;
      var matchLoc=loc==='All locations'||(p.location||'').toLowerCase().indexOf(loc.toLowerCase())>-1;
      return matchCat&&matchText&&matchLoc;
    });
    grid.innerHTML=rows.length?rows.map(function(p){
      var user=p.id&&p.id.indexOf('user-')===0;
      return '<article class="vjm-product"><div class="vjm-product-image"><img src="'+esc(p.image||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85')+'" alt="'+esc(p.title)+'" loading="lazy"><span class="vjm-product-tag">'+(user?'Your preview listing':'Sample listing')+'</span></div><div class="vjm-product-body"><span class="vjm-product-cat">'+esc(p.category)+'</span><h3>'+esc(p.title)+'</h3><span class="vjm-product-location">⌖ '+esc(p.location)+'</span><div class="vjm-product-price"><strong>'+money(p.price,p.currency)+'</strong><span>'+(p.payment==='Both'?'2 payment options':esc(p.payment))+'</span></div><p class="vjm-product-delivery">'+(Number(p.delivery)===0?'Pickup / free delivery':('Delivery from '+money(p.delivery,p.currency)))+'</p><button class="vjm-product-view" type="button" data-view="'+esc(p.id)+'">View listing</button></div></article>';
    }).join(''):'<div class="vjm-empty">No listings match those filters. Try another search or location.</div>';
    root.querySelector('#vjm-result-count').textContent=rows.length+' listings shown';
  }
  function openModal(m){m.classList.add('open');document.body.style.overflow='hidden';}
  function closeModal(m){m.classList.remove('open');document.body.style.overflow='';}
  root.querySelectorAll('[data-vjm-open]').forEach(function(b){b.addEventListener('click',function(){openModal(modal);});});
  root.querySelectorAll('[data-vjm-close]').forEach(function(b){b.addEventListener('click',function(){closeModal(b.closest('.vjm-modal'));});});
  [modal,detailModal].forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)closeModal(m);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){[modal,detailModal].forEach(function(m){if(m.classList.contains('open'))closeModal(m);});}});
  root.querySelectorAll('.vjm-cat').forEach(function(b){b.addEventListener('click',function(){root.querySelectorAll('.vjm-cat').forEach(function(x){x.classList.remove('active');});b.classList.add('active');active=b.dataset.category;render();});});
  searchInput.addEventListener('input',render);locationSelect.addEventListener('change',render);
  grid.addEventListener('click',function(e){
    var b=e.target.closest('[data-view]');if(!b)return;
    var p=allItems().find(function(x){return x.id===b.dataset.view;});if(!p)return;
    detailModal.querySelector('.vjm-detail-content').innerHTML='<div class="vjm-detail"><img src="'+esc(p.image)+'" alt="'+esc(p.title)+'"><div><span class="vjm-product-cat">'+esc(p.category)+'</span><h3>'+esc(p.title)+'</h3><p>⌖ '+esc(p.location)+'</p><strong>'+money(p.price,p.currency)+'</strong><p>'+esc(p.description||'Seller product listing.')+'</p><p><b>Delivery fee:</b> '+(Number(p.delivery)===0?'Free / pickup':money(p.delivery,p.currency))+'</p><p><b>Payment:</b> '+esc(p.payment)+'</p><div class="vjm-form-notice">Preview only. Customer accounts, live orders and payment processing will be connected in the next development stage.</div></div></div>';
    openModal(detailModal);
  });
  root.querySelector('#vjm-seller-form').addEventListener('submit',function(e){
    e.preventDefault();var f=e.currentTarget;
    var data=new FormData(f);
    var pay=Array.from(f.querySelectorAll('input[name="payment"]:checked')).map(function(x){return x.value;});
    var item={id:'user-'+Date.now(),title:data.get('title'),category:data.get('category'),price:Number(data.get('price')),currency:data.get('currency'),location:String(data.get('city')||'')+', '+String(data.get('country')||''),delivery:Number(data.get('delivery')||0),image:data.get('image')||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',payment:pay.length>1?'Both':(pay[0]||'Not selected'),description:data.get('description')||'',seller:String(data.get('seller')||''),email:String(data.get('email')||'')};
    userItems.unshift(item);
    try{localStorage.setItem(key,JSON.stringify(userItems));}catch(err){}
    f.reset();closeModal(modal);active='All';root.querySelectorAll('.vjm-cat').forEach(function(x){x.classList.toggle('active',x.dataset.category==='All');});searchInput.value='';locationSelect.value='All locations';render();
    var msg=root.querySelector('#vjm-save-message');msg.hidden=false;msg.textContent='Your sample listing has been added to this browser preview only. It has not been published or sent to Vijes.';root.querySelector('#vjm-products').scrollIntoView({behavior:'smooth',block:'start'});
  });
  render();
})();
