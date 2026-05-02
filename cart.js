const cartContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const shippingEl = document.getElementById("shipping");
const checkoutBtn = document.getElementById("checkout-btn");

const SHIPPING = 5;

document.addEventListener("DOMContentLoaded", () => {
  displayCart();

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }
});

function showToast(message, type = "success") {
  const oldToast = document.querySelector(".toast-message");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function getCart() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return [];

  return JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
}

function saveCart(cart) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));

  displayCart();
  updateCartCounter();
}

function displayCart() {
  const cart = getCart();

  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty">
        <p>Votre panier est vide</p>
        <a href="products.html" class="btn btn-primary">Voir les produits</a>
      </div>
    `;

    updateTotals(0, false);
    toggleCheckout(false);
    updateCartCounter();
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    subtotal += price * quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">

      <div class="item-details">
        <h3>${item.name}</h3>
        <p class="price">€${price.toFixed(2)}</p>

        <div class="quantity-selector">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <input type="number" value="${quantity}" readonly>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </div>
      </div>

      <button class="remove-item" onclick="removeItem(${index})">
        <i class="fas fa-trash"></i>
      </button>
    `;

    cartContainer.appendChild(div);
  });

  updateTotals(subtotal, true);
  toggleCheckout(true);
  updateCartCounter();
}

function updateTotals(subtotal, hasItems) {
  const shipping = hasItems ? SHIPPING : 0;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `€${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
}

function toggleCheckout(enabled) {
  if (!checkoutBtn) return;

  checkoutBtn.disabled = !enabled;
  checkoutBtn.style.opacity = enabled ? "1" : "0.5";
  checkoutBtn.style.cursor = enabled ? "pointer" : "not-allowed";
}

function changeQty(index, amount) {
  const cart = getCart();

  if (!cart[index]) return;

  cart[index].quantity = Number(cart[index].quantity) + amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
}

function removeItem(index) {
  const cart = getCart();

  if (!cart[index]) return;

  cart.splice(index, 1);
  saveCart(cart);
  showToast("Produit supprimé du panier.", "success");
}

function checkout() {
  const cart = getCart();

  if (cart.length === 0) {
    showToast("Votre panier est vide !", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    localStorage.setItem("redirectAfterLogin", "checkout.html");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  window.location.href = "checkout.html";
}

function updateCartCounter() {
  const cart = getCart();

  const count = cart.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  document.querySelectorAll(".cart-count").forEach(counter => {
    counter.textContent = count;
  });
}
