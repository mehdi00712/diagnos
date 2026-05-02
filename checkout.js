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

/* ============================= */
/* 🔐 USER & CART KEY */
/* ============================= */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getCartKey() {
  const user = getCurrentUser();
  return user ? `cart_${user.id}` : null;
}

function getCart() {
  const key = getCartKey();
  return key ? JSON.parse(localStorage.getItem(key)) || [] : [];
}

/* ============================= */
/* 🚀 INIT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const cart = getCart();

  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");

  const SHIPPING = 5;

  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  // remplir les infos user
  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;

  let subtotal = 0;

  itemsContainer.innerHTML = "";

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty">Votre panier est vide.</div>
    `;
  }

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    subtotal += price * quantity;

    const div = document.createElement("div");
    div.className = "checkout-item";

    div.innerHTML = `
      <p>${item.name} x${quantity} - €${(price * quantity).toFixed(2)}</p>
    `;

    itemsContainer.appendChild(div);
  });

  const total = subtotal + SHIPPING;

  // afficher total + livraison
  itemsContainer.innerHTML += `
    <hr>
    <p>Sous-total: €${subtotal.toFixed(2)}</p>
    <p>Livraison: €${SHIPPING.toFixed(2)}</p>
  `;

  totalEl.textContent = `€${total.toFixed(2)}`;

  /* ============================= */
  /* 🧾 SUBMIT ORDER */
  /* ============================= */

  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Votre panier est vide !", "error");
      return;
    }

    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!phone || phone.length < 8) {
      showToast("Numéro de téléphone invalide", "error");
      return;
    }

    if (!address) {
      showToast("Adresse requise", "error");
      return;
    }

    const order = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      email: user.email,
      phone: phone,
      address: address,
      items: cart,
      subtotal: subtotal,
      shipping: SHIPPING,
      total: total,
      status: "Pending",
      date: new Date().toLocaleString()
    };

    // stocker commandes par utilisateur (propre)
    const ordersKey = `orders_${user.id}`;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    orders.push(order);

    localStorage.setItem(ordersKey, JSON.stringify(orders));

    // vider panier utilisateur
    const cartKey = getCartKey();
    if (cartKey) {
      localStorage.removeItem(cartKey);
    }

    showToast("Commande confirmée 🎉", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
});
