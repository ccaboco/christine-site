let products = []; // Variable globale pour stocker les produits une seule fois

// Charge les produits depuis le JSON une seule fois au chargement
async function loadProducts() {
  try {
    const res = await fetch('./src/data/products.json'); // adapte le chemin si besoin
    products = await res.json();
  } catch (e) {
    console.error('Erreur chargement produits:', e);
  }
}

// Ajoute un produit au panier localStorage
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(String(productId)); // stocker en string pour cohérence
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('Produit ajouté au panier !');
}

// Met à jour l’affichage du compteur d’articles dans le panier
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cart.length;
  }
}

// Affiche les articles du panier sur la page panier.html (ou similaire)
function displayCart() {
  const cartContainer = document.getElementById('cart-items');
  const totalPriceContainer = document.getElementById('total-price');
  if (!cartContainer) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Votre panier est vide.</p>';
    if (totalPriceContainer) totalPriceContainer.textContent = '';
    return;
  }

  // Compter les quantités de chaque produit
  const counts = {};
  cart.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  cartContainer.innerHTML = '';
  let total = 0;

  Object.entries(counts).forEach(([productId, quantity]) => {
    const product = products.find(p => String(p.id) === productId);
    if (!product) return;

    const productTotal = product.price * quantity;
    total += productTotal;

    const item = document.createElement('div');
    item.classList.add('cart-item');
    item.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="cart-image">
      <div class="cart-info">
        <h3>${product.title}</h3>
        <p>Prix unitaire : ${product.price.toFixed(2)} €</p>
        <p>Quantité : ${quantity}</p>
        <p>Sous-total : ${productTotal.toFixed(2)} €</p>
        <button class="remove-button" data-productid="${productId}">Retirer une unité</button>
      </div>
    `;
    cartContainer.appendChild(item);
  });

  if (totalPriceContainer) totalPriceContainer.textContent = `Total : ${total.toFixed(2)} €`;

  // Gestion des boutons pour retirer une unité
  document.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-productid');
      removeOneUnitFromCart(productId);
    });
  });
}

// Retire une unité d’un produit du panier
function removeOneUnitFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.indexOf(productId);
  if (index !== -1) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
  }
}

// Prépare le panier pour l’envoyer au backend et créer une session Stripe Checkout
async function getItemsForStripe() {
  const response = await fetch('./src/data/products.json');
  if (!response.ok) {
    throw new Error('Impossible de charger les produits.');
  }
  const products = await response.json();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const counts = {};
  cart.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  const items = Object.entries(counts).map(([id, quantity]) => {
    const product = products.find(p => String(p.id) === id);
    if (!product || !product.stripe) {
      throw new Error(`Produit introuvable ou sans price_id Stripe : id=${id}`);
    }
    return {
      price: product.stripe, // c’est ton price_id Stripe côté produit
      quantity
    };
  });

  console.log('Items envoyés à Stripe:', items);

  return items;
}

// Gère le clic sur le bouton de paiement → crée la session côté serveur puis redirige vers Stripe
document.getElementById('checkout-button')?.addEventListener('click', async () => {
  try {
    const items = await getItemsForStripe();

    if (items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    const response = await fetch('http://localhost:4242/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la session de paiement.');

    const data = await response.json();

    // Ta clé publique Stripe — en dur comme tu l’as demandé
    const stripe = Stripe('pk_test_51RdteyR5ypv4Eb3pIKK3rg2qxPLETnr4nPZHwUfMfRGOhy8VxiQXo1ipebStYXVCxl3pIcVP7LTrnS9DPizGw97400aDzFrhjF');

    await stripe.redirectToCheckout({ sessionId: data.id });
  } catch (error) {
    alert(`Erreur: ${error.message}`);
  }
});

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  updateCartCount();
  displayCart();
});
