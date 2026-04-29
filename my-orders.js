document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    setTimeout(() => {
    window.location.href = "login.html";
    }, 1200);
    window.location.href = "login.html";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const container = document.getElementById("user-orders");

  // filter only current user orders
  const userOrders = orders.filter(order => order.user.email === user.email);

  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty">
        Vous n'avez aucune commande.
      </div>
    `;
    return;
  }

  userOrders
    .slice()
    .reverse()
    .forEach(order => {

      const div = document.createElement("div");
      div.className = "order-card";

      div.innerHTML = `
        <div class="order-top">
          <div>
            <h3>Commande #${order.id}</h3>
            <p><strong>Date:</strong> ${order.date}</p>
          </div>

          <span class="order-status ${order.status.toLowerCase()}">
            ${order.status}
          </span>
        </div>

        <div class="order-items">
          ${order.items.map(item => `
            <p>
              ${item.name} x${item.quantity}
              - €${(item.price * item.quantity).toFixed(2)}
            </p>
          `).join("")}
        </div>

        <div class="order-bottom">
          <strong>Total: €${order.total.toFixed(2)}</strong>
        </div>
      `;

      container.appendChild(div);
    });

});