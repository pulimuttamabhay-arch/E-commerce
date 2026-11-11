const products=[
 {id:1,name:'Nova X Pro Headphones',price:2999,img:'product-1.png',cat:'Audio',rating:4.8},
 {id:2,name:'Pulse Smart Watch',price:4499,img:'product-2.png',cat:'Wearables',rating:4.7},
 {id:3,name:'AirBeat Wireless Buds',price:1999,img:'product-3.png',cat:'Audio',rating:4.6},
 {id:4,name:'Vision 4K Smart TV',price:32999,img:'product-4.png',cat:'TV',rating:4.9},
 {id:5,name:'PowerMax Laptop',price:58999,img:'product-5.png',cat:'Computers',rating:4.7},
 {id:6,name:'SnapShot Camera',price:26999,img:'product-6.png',cat:'Cameras',rating:4.5},
 {id:7,name:'GameCore Controller',price:3499,img:'product-7.png',cat:'Gaming',rating:4.8},
 {id:8,name:'ChargePro Power Bank',price:1499,img:'product-8.png',cat:'Accessories',rating:4.4}
];
function money(n){return '₹'+Number(n).toLocaleString('en-IN')}
function cart(){let raw=[];try{raw=JSON.parse(localStorage.getItem('novacart')||'[]')}catch(e){raw=[]}return raw.map(x=>{const p=products.find(v=>v.id==x.id);return p?{...p,...x,qty:Math.max(1,Number(x.qty)||1)}:null}).filter(Boolean)}
function saveCart(c){localStorage.setItem('novacart',JSON.stringify(c));updateCartCount()}
function updateCartCount(){const n=cart().reduce((s,x)=>s+x.qty,0);document.querySelectorAll('.cart-count').forEach(e=>e.textContent=n)}
const MAX_QTY=10;
function addToCart(id){let c=cart(),p=products.find(x=>x.id==id),i=c.findIndex(x=>x.id==id);if(!p)return;if(i>-1){if(c[i].qty>=MAX_QTY){toast('Maximum quantity is '+MAX_QTY);renderCart();return}c[i].qty++}else c.push({...p,qty:1});saveCart(c);showCartAdded(p,c.find(x=>x.id==id).qty)}
function showCartAdded(p,qty){let old=document.getElementById('cart-added-box');if(old)old.remove();let e=document.createElement('div');e.id='cart-added-box';e.className='cart-added-box position-fixed end-0 top-0 m-3 shadow-lg';e.innerHTML=`<div class="d-flex align-items-start gap-3"><img src="assets/img/${p.img}" alt="${p.name}"><div class="flex-grow-1"><div class="small text-success fw-bold mb-1">✓ Added to cart</div><h6 class="mb-1">${p.name}</h6><div class="small text-muted">${p.cat} • ★ ${p.rating}</div><div class="mt-1"><b>${money(p.price)}</b> × ${qty} = <b>${money(p.price*qty)}</b></div></div><button class="btn-close" onclick="this.closest('#cart-added-box').remove()"></button></div><a href="cart.html" class="btn btn-brand btn-sm w-100 mt-3">View cart details</a>`;document.body.appendChild(e);setTimeout(()=>e.remove(),5000)}
function toast(t){let e=document.createElement('div');e.className='position-fixed bottom-0 end-0 m-4 alert alert-dark shadow';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1500)}
function productCard(p){return `<div class="col-md-6 col-lg-3"><div class="product-card overflow-hidden"><a href="product.html?id=${p.id}" class="product-image-link" aria-label="View ${p.name} details"><img class="product-img" src="assets/img/${p.img}" alt="${p.name}"></a><div class="product-body"><div class="d-flex justify-content-between"><span class="small-muted">${p.cat}</span><span class="badge badge-sale">New</span></div><h5 class="mt-2 mb-2"><a href="product.html?id=${p.id}" class="product-title-link">${p.name}</a></h5><div class="rating mb-2">★★★★★ <span class="small-muted">${p.rating}</span></div><div class="d-flex align-items-center justify-content-between"><div><span class="price">${money(p.price)}</span></div><button class="icon-btn" onclick="addToCart(${p.id})" title="Add to cart">+</button></div></div></div></div>`}
function renderProducts(el,limit=8){el.innerHTML=products.slice(0,limit).map(productCard).join('')}
function renderShop(){const grid=document.getElementById('shop-grid');if(!grid)return;let list=[...products];const q=document.getElementById('search').value.toLowerCase(),cat=document.getElementById('category').value;list=list.filter(p=>(p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q))&&(!cat||p.cat===cat));grid.innerHTML=list.map(productCard).join('')||'<div class="col-12"><div class="text-center py-5"><h4>No products found</h4><p class="small-muted">Try another search.</p></div></div>'}
function renderCart(){
 const box=document.getElementById('cart-items');
 if(!box)return;
 const c=cart();
 if(!c.length){
   box.innerHTML='<div class="text-center py-5"><h4>Your cart is empty</h4><p class="small-muted">Add a product and its full details will appear here.</p><a class="btn btn-brand mt-2" href="shop.html">Start shopping</a></div>';
 }else{
   box.innerHTML=`<div class="cart-details-head d-none d-md-grid"><span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span><span></span></div>`+c.map(x=>`
    <div class="cart-row">
      <div class="cart-product">
        <img class="cart-thumb" src="assets/img/${x.img}" alt="${x.name}">
        <div class="cart-product-info">
          <h6 class="mb-1">${x.name}</h6>
          <div class="small-muted">${x.cat} • ★ ${x.rating}</div>
          <div class="small text-muted mt-1">Unit price: ${money(x.price)}</div>
        </div>
      </div>
      <div class="cart-price fw-semibold">${money(x.price)}</div>
      <div class="cart-qty">
        <button type="button" class="qty-btn" onclick="changeQty(${x.id},-1)" aria-label="Decrease quantity" ${x.qty<=1?"disabled":""}>−</button>
        <span class="qty-value">${x.qty}</span>
        <button type="button" class="qty-btn" onclick="changeQty(${x.id},1)" aria-label="Increase quantity" ${x.qty>=MAX_QTY?"disabled":""}>+</button>
      </div>
      <div class="cart-subtotal"><b>${money(x.price*x.qty)}</b><div class="small text-muted">${x.qty} × ${money(x.price)}</div></div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 cart-remove" onclick="removeItem(${x.id})">Remove</button>
    </div>`).join('');
 }
 const total=c.reduce((s,x)=>s+x.price*x.qty,0);
 document.querySelectorAll('.cart-total').forEach(e=>e.textContent=money(total));
}
function changeQty(id,d){
 let c=cart();
 const x=c.find(a=>a.id==id);
 if(!x)return;
 x.qty=Math.min(MAX_QTY,Math.max(1,(Number(x.qty)||1)+d));
 saveCart(c);
 renderCart();
}
function removeItem(id){saveCart(cart().filter(x=>x.id!=id));renderCart()}
function productDetail(){const id=new URLSearchParams(location.search).get('id')||1,p=products.find(x=>x.id==id)||products[0],el=document.getElementById('detail');if(!el)return;el.innerHTML=`<div class="col-lg-6"><img class="detail-img" src="assets/img/${p.img}"></div><div class="col-lg-6 ps-lg-5"><span class="eyebrow">${p.cat}</span><h1 class="mt-2">${p.name}</h1><div class="rating fs-6 mb-3">★★★★★ ${p.rating}</div><p class="small-muted fs-5">Premium design, reliable performance and an effortless everyday experience. Built for modern shoppers who want quality without the clutter.</p><div class="mt-4"><h5>Product description</h5><p class="small-muted">The ${p.name} combines modern design, dependable performance and everyday convenience. It is a great choice for home, office or personal use.</p><ul class="small-muted ps-3"><li>Premium build and modern finish</li><li>Designed for comfortable everyday use</li><li>Reliable performance with easy setup</li><li>Quality-focused NovaCart product</li></ul></div><h2 class="mt-4">${money(p.price)}</h2><div class="d-flex gap-2 mt-4"><button class="btn btn-brand" onclick="addToCart(${p.id})">Add to cart</button><a href="cart.html" class="btn btn-outline-dark">View cart</a></div><hr class="my-4"><div class="row g-3"><div class="col-6"><b>Free delivery</b><div class="small-muted">On orders above ₹999</div></div><div class="col-6"><b>7-day returns</b><div class="small-muted">Easy replacement</div></div></div></div>`}
document.addEventListener('DOMContentLoaded',()=>{updateCartCount();renderProducts(document.getElementById('featured-grid'),4);renderProducts(document.getElementById('deal-grid'),8);renderShop();renderCart();productDetail();document.getElementById('search')?.addEventListener('input',renderShop);document.getElementById('category')?.addEventListener('change',renderShop);});
