import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const cartContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const shippingEl = document.getElementById("shipping");
const checkoutBtn = document.getElementById("checkout-btn");

const SHIPPING = 5;
let currentUser = null;
let cartItems = [];

function showToast(message, type = "success") {
  const oldToast = document.querySelector(".toast-message");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

    return;
  }

  currentUser = user;
  await loadCart();
});

async function loadCart() {
  const cartRef = doc(db, "carts", currentUser.uid);
  const cartSnap = await getDoc(cartRef);

  cartItems = cartSnap.exists() ? cartSnap.data().items || [] : [];
  displayCart();
}

async function saveCart() {
  await setDoc(doc(db, "carts", currentUser.uid), {
    userId: currentUser.uid,
    items: cartItems
  });

  displayCart();
}

function displayCart() {
  cartContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty">
        <p>Votre panier est vide</p>
        <a href="products.html" class="btn btn-primary">Voir les produits</a>
      </div>
    `;

    updateTotals(0, false);
    return;
  }

  let subtotal = 0;

  cartItems.forEach((item, index) => {
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
          <button class="qty-btn" data-index="${index}" data-action="minus">-</button>
          <input type="number" value="${quantity}" readonly>
          <button class="qty-btn" data-index="${index}" data-action="plus">+</button>
        </div>
      </div>

      <button class="remove-item" data-index="${index}" data-action="remove">
        <i class="fas fa-trash"></i>
      </button>
    `;

    cartContainer.appendChild(div);
  });

  updateTotals(subtotal, true);
}

function updateTotals(subtotal, hasItems) {
  const shipping = hasItems ? SHIPPING : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
  shippingEl.textContent = `€${shipping.toFixed(2)}`;
  totalEl.textContent = `€${total.toFixed(2)}`;
}

cartContainer.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "plus") {
    cartItems[index].quantity += 1;
  }

  if (action === "minus") {
    cartItems[index].quantity -= 1;

    if (cartItems[index].quantity <= 0) {
      cartItems.splice(index, 1);
    }
  }

  if (action === "remove") {
    cartItems.splice(index, 1);
  }

  await saveCart();
});

checkoutBtn.addEventListener("click", () => {
  if (cartItems.length === 0) {
    showToast("Votre panier est vide !", "error");
    return;
  }

  window.location.href = "checkout.html";
});
