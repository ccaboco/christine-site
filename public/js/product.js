document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
      document.getElementById('product-container').innerHTML = `<p>Produit non spécifié.</p>`;
      return;
  }

  fetch('./src/data/products.json') // adapte le chemin si besoin
      .then(response => {
          if (!response.ok) throw new Error('Erreur de chargement JSON');
          return response.json();
      })
      .then(products => {
          const product = products.find(p => p.id == productId);
          if (!product) {
              document.getElementById('product-container').innerHTML = `<p>Produit introuvable.</p>`;
              return;
          }

          document.title = `${product.title} - MonShop`;

          document.getElementById('product-container').innerHTML = `
              <section class="product-gallery">
                  <div class="main-image">
                      <img src="${product.image}" alt="${product.title}" id="mainImage">
                  </div>
              </section>

              <section class="product-details">
                  <h1>${product.title}</h1>
                  <div class="price">${product.price.toFixed(2)} €</div>

                  <button class="add-to-cart" onclick="addToCart(${product.id})">
                      <i class="fas fa-shopping-cart"></i> Ajouter au panier
                  </button>

                  <div class="description">
                      <h3>Description</h3>
                      <p>${product.description}</p>
                  </div>
              </section>
          `;

          updateCartCount();
      })
      .catch(error => {
          console.error(error);
          document.getElementById('product-container').innerHTML = `<p>Erreur lors du chargement du produit.</p>`;
      });
});
