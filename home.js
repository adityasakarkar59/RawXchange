// Function to show a toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Function to update the cart count in the navbar
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countElement = document.getElementById("cart-count");
    if (countElement) {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        countElement.textContent = totalItems;
        countElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', updateCartCount);

document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", function () {

        const card = this.parentElement;
        const imgElement = card.querySelector("img");

        const product = {
            title: card.dataset.title,
            price: Number(card.dataset.price),
            image: card.dataset.image || (imgElement ? imgElement.getAttribute("src") : ""),
            quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(item => item.title === product.title);

        if (existing) {
            existing.quantity++;
            // Update the image just in case it was previously broken or empty
            existing.image = product.image;
        } else {
            cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();

        // Visual feedback
        const originalText = this.textContent;
        this.textContent = "Added!";
        this.style.backgroundColor = "#4CAF50";
        this.style.color = "white";
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.backgroundColor = "";
            this.style.color = "";
        }, 1500);

        showToast("Item added to cart");
    });
});
