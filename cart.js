let cart = JSON.parse(localStorage.getItem("cart")) || [];
const container = document.getElementById("cart-items");

function updateCart() {
    container.innerHTML = ""; 
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <img src="${item.image}">
            <div class="details">
                <h3>${item.title}</h3>
                <p>₹${item.price}</p>

                <div class="qty-box">
                    <button class="minus" data-id="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="plus" data-id="${index}">+</button>
                </div>

                <button class="remove" data-id="${index}">Remove</button>
            </div>
        `;

        container.appendChild(div);
    });

    document.getElementById("subtotal").innerText = subtotal;
    document.getElementById("gst").innerText = Math.round(subtotal * 0.18);
    document.getElementById("total").innerText = subtotal + Math.round(subtotal * 0.18);

    attachEvents();
}

function attachEvents() {
    document.querySelectorAll(".plus").forEach(btn => {
        btn.onclick = () => {
            cart[btn.dataset.id].quantity++;
            save();
        };
    });

    document.querySelectorAll(".minus").forEach(btn => {
        btn.onclick = () => {
            if (cart[btn.dataset.id].quantity > 1) {
                cart[btn.dataset.id].quantity--;
            }
            save();
        };
    });
        

    document.querySelectorAll(".remove").forEach(btn => {
        btn.onclick = () => {
            cart.splice(btn.dataset.id, 1);
            save();
        };
    });
}

function save() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

updateCart();
