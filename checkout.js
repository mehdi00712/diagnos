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

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");

  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;

  let total = 0;

  itemsContainer.innerHTML = "";

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty">Votre panier est vide.</div>
    `;
  }

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    total += price * quantity;

    const div = document.createElement("div");
    div.className = "checkout-item";

    div.innerHTML = `
      <p>${item.name} x${quantity} - €${(price * quantity).toFixed(2)}</p>
    `;

    itemsContainer.appendChild(div);
  });

  totalEl.textContent = `€${total.toFixed(2)}`;

  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Votre panier est vide !", "error");
      return;
    }

    const order = {
      id: Date.now(),
      user: user,
      phone: document.getElementById("phone").value.trim(),
      address: document.getElementById("address").value.trim(),
      items: cart,
      total: total,
      status: "Pending",
      date: new Date().toLocaleString()
    };

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("cart");

    showToast("Commande passée avec succès !", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
});
