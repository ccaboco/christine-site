fetch('/src/data/products.json')
    .then(response => response.json())
    .then(products => {
        const container = document.getElementById('products-container');
        
        products.forEach(product => {
            container.innerHTML += `
                <div class="product-card">
                    <a href="produit.html?id=${product.id}" class="product-link">
                        <img src="${product.image}" alt="${product.title}">
                        <h3>${product.title}</h3>
                    </a>
                    <p>${product.price} €</p>
                    <button onclick="addToCart(${product.id})">Ajouter au panier</button>
                </div>
            `;
        });
    });