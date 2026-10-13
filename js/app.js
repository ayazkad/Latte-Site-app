/**
 * L'ATELIER DU LATTE - CLIENT APPLICATION SCRIPT
 * Modern, interactive and elegant coffee shop experience.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. MENU DATA & RENDERING
  // ==========================================
  const menuItems = [
    {
      id: 'latte-swan',
      name: 'Swan Latte Signature',
      category: 'latte',
      tag: 'Coup de Cœur',
      price: 5.80,
      description: 'Double shot d’Arabica d’Éthiopie (Yirgacheffe), lait d’avoine soyeux et motif cygne exécuté à la main.',
      notes: ['Bio', 'Lait d\'avoine', 'Notes florales']
    },
    {
      id: 'latte-pistache',
      name: 'Latte Pistache de Sicile',
      category: 'latte',
      tag: 'Édition Spéciale',
      price: 6.50,
      description: 'Pur praliné de pistache de Bronte, espresso velouté, mousse légère et éclats de pistaches torréfiées.',
      notes: ['Gourmand', 'Artisanal', 'Équilibré']
    },
    {
      id: 'latte-vanilla-bourbon',
      name: 'Caramel & Sel de Guérande Latte',
      category: 'latte',
      tag: 'Signature',
      price: 6.20,
      description: 'Sirop de caramel au beurre salé fait maison, espresso colombien et micro-mousse onctueuse.',
      notes: ['Caramel Maison', 'Onctueux']
    },
    {
      id: 'espresso-single-origin',
      name: 'Espresso Micro-Lot Colombie',
      category: 'espresso',
      tag: 'Pur Terroir',
      price: 3.50,
      description: 'Variété Geisha lavée. Notes intenses de jasmin, bergamote et cacao fin avec une acidité cristalline.',
      notes: ['100% Arabica', 'Extraction 9 bar']
    },
    {
      id: 'flat-white',
      name: 'Flat White Barista',
      category: 'espresso',
      tag: 'Classique',
      price: 4.80,
      description: 'Double ristretto serré recouvert d’une fine couche soyeuse de lait entier fermier micro-moussé.',
      notes: ['Intense', 'Texture veloutée']
    },
    {
      id: 'chemex-slow',
      name: 'Filtre Slow Coffee (Chemex)',
      category: 'espresso',
      tag: 'Slow Drip',
      price: 5.50,
      description: 'Infusion manuelle pour extraire la pureté aromatique la plus délicate. Servi en carafe.',
      notes: ['Éthiopie Bio', 'Léger & fruité']
    },
    {
      id: 'cold-brew-tonic',
      name: 'Cold Brew Citrus & Tonic',
      category: 'cold',
      tag: 'Rafraîchissant',
      price: 6.00,
      description: 'Café infusé à froid pendant 18 heures, tonic artisanal français, zeste de pamplemousse bio et romarin.',
      notes: ['Infusé 18h', 'Zéro Sucre', 'Pétillant']
    },
    {
      id: 'iced-matcha-latte',
      name: 'Iced Matcha Cérémonial Uji',
      category: 'cold',
      tag: 'Japon Supérieur',
      price: 6.80,
      description: 'Matcha de grade cérémonial importé de Kyoto, émulsionné au fouet bambou, lait végétal et glaçons.',
      notes: ['Antioxydant', 'Kyoto Bio', 'Végétal']
    },
    {
      id: 'cardamom-bun',
      name: 'Kardemummabulle Suédois',
      category: 'pastry',
      tag: 'Fait Maison',
      price: 4.50,
      description: 'Brioche feuilletée traditionnelle parfumée à la cardamome fraîchement moulue et perles de sucre croquant.',
      notes: ['Cuit chaque matin', 'Beurre AOP']
    },
    {
      id: 'croissant-amande',
      name: 'Croissant Suprême Chocolat-Noisette',
      category: 'pastry',
      tag: 'Boulangerie',
      price: 4.90,
      description: 'Croissant pur beurre feuilleté garni d’un crémeux noisette du Piémont et nappage chocolat noir 70%.',
      notes: ['Feuilletage doré', 'Chocolat Valrhona']
    },
    {
      id: 'avocado-brunch',
      name: 'Tartine Avocado & Œuf Parfait',
      category: 'pastry',
      tag: 'Brunch',
      price: 13.50,
      description: 'Pain au levain naturel grillé, avocat écrasé au citron vert, œuf bio cuit à 64°C, dukkah et pousses bio.',
      notes: ['Bio', 'Frais du jour']
    }
  ];

  const menuGrid = document.getElementById('menuGrid');
  const menuTabs = document.querySelectorAll('.category-tab');

  function renderMenu(category = 'all') {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    const filtered = category === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.category === category);

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'menu-item-card';
      card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.05}s`;

      const notesHtml = item.notes.map(n => `<span class="note-pill">${n}</span>`).join('');

      card.innerHTML = `
        <div class="menu-item-top">
          <div class="menu-item-title-wrap">
            <span class="menu-item-tag">${item.tag}</span>
            <h3 class="menu-item-title">${item.name}</h3>
          </div>
          <span class="menu-item-price">${item.price.toFixed(2)} €</span>
        </div>
        <p class="menu-item-desc">${item.description}</p>
        <div class="menu-item-footer">
          <div class="menu-item-notes">${notesHtml}</div>
          <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
            <i class="fa-solid fa-plus"></i> Ajouter
          </button>
        </div>
      `;
      menuGrid.appendChild(card);
    });

    // Rebind cart buttons in menu
    document.querySelectorAll('.menu-item-card .add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        addToCart({ id, name, price, qty: 1 });
      });
    });
  }

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.getAttribute('data-category'));
    });
  });

  renderMenu('all');

  // ==========================================
  // 2. SHOPPING CART SYSTEM
  // ==========================================
  let cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartCount = document.getElementById('cartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalPrice = document.getElementById('cartSubtotalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function saveCart() {
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    if (cartCount) cartCount.textContent = totalQty;

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <i class="fa-solid fa-mug-saucer"></i>
          <h4>Votre panier est vide</h4>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Découvrez notre carte et ajoutez vos cafés ou douceurs préférés.</p>
        </div>
      `;
      if (cartSubtotalPrice) cartSubtotalPrice.textContent = '0.00 €';
      return;
    }

    let subtotal = 0;
    cartItemsList.innerHTML = '';

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p>${item.price.toFixed(2)} € × ${item.qty} = <strong>${itemTotal.toFixed(2)} €</strong></p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
          <span style="font-weight: 600; font-size: 0.9rem; min-width: 18px; text-align: center;">${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
        </div>
      `;
      cartItemsList.appendChild(itemEl);
    });

    if (cartSubtotalPrice) cartSubtotalPrice.textContent = `${subtotal.toFixed(2)} €`;

    // Bind quantity buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const action = btn.getAttribute('data-action');
        if (action === 'increase') {
          cart[idx].qty += 1;
        } else if (action === 'decrease') {
          cart[idx].qty -= 1;
          if (cart[idx].qty <= 0) {
            cart.splice(idx, 1);
          }
        }
        saveCart();
      });
    });
  }

  function addToCart(item) {
    const existing = cart.find(c => c.id === item.id && c.name === item.name);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart();
    showToast(`☕ <strong>${item.name}</strong> ajouté au panier !`);
    openCart();
  }

  function openCart() {
    cartDrawer?.classList.add('active');
    cartOverlay?.classList.add('active');
  }

  function closeCart() {
    cartDrawer?.classList.remove('active');
    cartOverlay?.classList.remove('active');
  }

  cartToggleBtn?.addEventListener('click', openCart);
  cartCloseBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('⚠️ Votre panier est vide. Veuillez sélectionner des articles.');
      return;
    }
    showToast('✨ Commande Click & Collect validée avec succès ! Préparation en cours.');
    cart = [];
    saveCart();
    setTimeout(closeCart, 1200);
  });

  updateCartUI();

  // ==========================================
  // 3. LATTE LAB / DRINK CUSTOMIZER
  // ==========================================
  const customizerState = {
    base: { name: 'Espresso Double Éthiopie', price: 0, type: 'espresso' },
    milk: { name: 'Lait d\'Avoine Barista Bio', price: 0.5, foam: 'dense' },
    syrup: { name: 'Sans Sirop (Pur)', price: 0 },
    temp: { name: 'Chaud Velouté (65°C)', temp: 'hot' }
  };

  const basePrice = 4.50;
  const customDrinkTitle = document.getElementById('customDrinkTitle');
  const customDrinkDesc = document.getElementById('customDrinkDesc');
  const customPrice = document.getElementById('customPrice');
  const cupLayerBase = document.getElementById('cupLayerBase');
  const cupLayerMilk = document.getElementById('cupLayerMilk');
  const cupLayerFoam = document.getElementById('cupLayerFoam');
  const cupSteam = document.getElementById('cupSteam');
  const addCustomDrinkBtn = document.getElementById('addCustomDrinkBtn');

  function updateCustomizerUI() {
    const total = basePrice + customizerState.base.price + customizerState.milk.price + customizerState.syrup.price;
    
    if (customPrice) customPrice.textContent = `${total.toFixed(2)} €`;

    // Dynamic title & desc
    let title = 'Latte Création ';
    if (customizerState.base.type === 'matcha') title = 'Matcha Latte Signature ';
    else if (customizerState.base.type === 'chai') title = 'Chai Latte Épicé ';
    else title += customizerState.milk.name.replace('Lait d\'', '').replace('Lait ', '');

    if (customDrinkTitle) customDrinkTitle.textContent = title;
    if (customDrinkDesc) {
      customDrinkDesc.textContent = `${customizerState.base.name} • ${customizerState.milk.name} • ${customizerState.syrup.name} • ${customizerState.temp.name}`;
    }

    // Dynamic Visual Cup representation
    if (cupLayerBase) {
      if (customizerState.base.type === 'matcha') {
        cupLayerBase.style.background = 'linear-gradient(180deg, #4d7c0f 0%, #365314 100%)';
      } else if (customizerState.base.type === 'chai') {
        cupLayerBase.style.background = 'linear-gradient(180deg, #b45309 0%, #78350f 100%)';
      } else if (customizerState.base.type === 'colombia') {
        cupLayerBase.style.background = 'linear-gradient(180deg, #28140c 0%, #150a06 100%)';
      } else {
        cupLayerBase.style.background = 'linear-gradient(180deg, #3d2417 0%, #20130b 100%)';
      }
    }

    if (cupSteam) {
      if (customizerState.temp.temp === 'cold') {
        cupSteam.textContent = '🧊';
        cupSteam.style.animation = 'none';
      } else {
        cupSteam.textContent = '💨';
        cupSteam.style.animation = 'steamRise 3s infinite ease-in-out';
      }
    }

    if (cupLayerFoam) {
      if (customizerState.base.type === 'matcha') {
        cupLayerFoam.textContent = '🍵';
      } else {
        cupLayerFoam.textContent = '🌿';
      }
    }
  }

  // Bind option clicks
  function setupOptionGroup(groupId, stateKey) {
    const buttons = document.querySelectorAll(`#${groupId} .option-btn`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        customizerState[stateKey] = {
          name: btn.getAttribute('data-name'),
          price: parseFloat(btn.getAttribute('data-price') || '0'),
          type: btn.getAttribute('data-base') || '',
          temp: btn.getAttribute('data-temp') || '',
          foam: btn.getAttribute('data-foam') || ''
        };

        updateCustomizerUI();
      });
    });
  }

  setupOptionGroup('baseOptions', 'base');
  setupOptionGroup('milkOptions', 'milk');
  setupOptionGroup('syrupOptions', 'syrup');
  setupOptionGroup('tempOptions', 'temp');

  addCustomDrinkBtn?.addEventListener('click', () => {
    const total = basePrice + customizerState.base.price + customizerState.milk.price + customizerState.syrup.price;
    const title = customDrinkTitle?.textContent || 'Latte Lab Signature';
    
    addToCart({
      id: 'custom-' + Date.now(),
      name: title + ` (${customizerState.temp.name.split(' ')[0]})`,
      price: total,
      qty: 1
    });
  });

  updateCustomizerUI();

  // ==========================================
  // 4. RESERVATION FORM
  // ==========================================
  const reservationForm = document.getElementById('reservationForm');
  const resDate = document.getElementById('resDate');

  // Set default date to tomorrow
  if (resDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    resDate.value = tomorrow.toISOString().split('T')[0];
    resDate.min = new Date().toISOString().split('T')[0];
  }

  reservationForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('resName')?.value;
    const date = document.getElementById('resDate')?.value;
    const time = document.getElementById('resTime')?.value;
    const guests = document.getElementById('resGuests')?.value;

    showToast(`🎉 Merci ${name} ! Votre table pour <strong>${guests} pers.</strong> le <strong>${date} à ${time}</strong> est confirmée.`);
    reservationForm.reset();
    if (resDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      resDate.value = tomorrow.toISOString().split('T')[0];
    }
  });

  // ==========================================
  // 5. LIVE SHOP STATUS
  // ==========================================
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  function checkLiveStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 is Sunday

    let isOpen = false;
    let hoursStr = '08h00 - 19h00';

    if (currentDay === 0) { // Sunday
      hoursStr = '09h30 - 18h30 (Brunch)';
      isOpen = (currentHour >= 9 && currentHour < 18) || (currentHour === 18 && now.getMinutes() <= 30);
    } else if (currentDay === 6) { // Saturday
      hoursStr = '09h00 - 20h00';
      isOpen = (currentHour >= 9 && currentHour < 20);
    } else { // Weekdays
      hoursStr = '08h00 - 19h00';
      isOpen = (currentHour >= 8 && currentHour < 19);
    }

    if (statusDot && statusText) {
      if (isOpen) {
        statusDot.className = 'status-dot';
        statusText.textContent = `Ouvert maintenant • Aujourd'hui ${hoursStr}`;
      } else {
        statusDot.className = 'status-dot closed';
        statusText.textContent = `Fermé actuellement • Réouverture dès ${hoursStr.split('-')[0].trim()}`;
      }
    }
  }
  checkLiveStatus();

  // ==========================================
  // 6. STICKY NAVBAR & MOBILE MENU
  // ==========================================
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('mobile-active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('mobile-active');
    });
  });

  // Newsletter Form
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('☕ Bienvenue dans le Club Privé L\'Atelier Latte !');
    e.target.reset();
  });

  // ==========================================
  // 7. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(htmlMessage) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-gold" style="font-size: 1.2rem;"></i> <div>${htmlMessage}</div>`;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

});
