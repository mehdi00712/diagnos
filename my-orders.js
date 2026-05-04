import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const container = document.getElementById("user-orders");

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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  await loadUserOrders(user.uid);
});

async function loadUserOrders(userId) {
  if (!container) return;

  container.innerHTML = "";

  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(ordersQuery);

    const orders = [];

    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty">
          Vous n'avez aucune commande.
        </div>
      `;
      return;
    }

    orders
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
      .forEach(order => {
        const div = document.createElement("div");
        div.className = "order-card";

        div.innerHTML = `
          <div class="order-top">
            <div>
              <h3>Commande #${order.id}</h3>
              <p><strong>Date:</strong> ${order.date || "-"}</p>
            </div>

            <span class="order-status ${(order.status || "Pending").toLowerCase()}">
              ${order.status || "Pending"}
            </span>
          </div>

          <div class="order-items">
            ${(order.items || []).map(item => `
              <p>
                ${item.name} x${item.quantity}
                - €${(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </p>
            `).join("")}
          </div>

          <div class="order-bottom">
            <strong>Total: €${Number(order.total || 0).toFixed(2)}</strong>
          </div>
        `;

        container.appendChild(div);
      });

  } catch (error) {
    console.error("Load orders error:", error);
    showToast("Erreur lors du chargement des commandes.", "error");
  }
}
