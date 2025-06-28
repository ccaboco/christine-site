// Exemple : Mise à jour du compteur de panier
document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.product-card button');
    const cartCounter = document.querySelector('nav ul li:last-child a');

    let cartCount = 0;

    cartButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartCount++;
            cartCounter.textContent = `Panier (${cartCount})`;
            alert('Produit ajouté au panier !');
        });
    });
});