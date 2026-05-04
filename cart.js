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
let authReady = false;

// ================= TOAST =================
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

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {
  authReady = true;
  currentUser = user;

  console.log("Cart Firebase user:", user ? user.email : null);

  if (!user) {
    cartItems = [];

    if (cartContainer) {
      cartContainer.innerHTML = `
        <div class="empty">
          <p>Veuillez vous connecter pour voir votre panier.</p>
          <a href="login.html" class="btn btn-primary">Se connecter</a>
        </div>
      `;
    }

    updateTotals(0, false);
    return;
  }

  await loadCart();
});

// ================= LOAD CART =================
async function loadCart() {
  if (!currentUser) return;

  try {
    const cartRef = doc(db, "carts", currentUser.uid);
    const cartSnap = await getDoc(cartRef);

    cartItems = cartSnap.exists() ? cartSnap.data().items || [] : [];

    displayCart();
  } catch (error) {
    console.error("Load cart error:", error);
    showToast("Erreur lors du chargement du panier.", "error");
  }
}

// ================= SAVE CART =================
async function saveCart() {
  if (!currentUser) return;

  try {
    await setDoc(doc(db, "carts", currentUser.uid), {
      userId: currentUser.uid,
      items: cartItems
    });

    displayCart();
  } catch (error) {
    console.error("Save cart error:", error);
    showToast("Erreur lors de la mise à jour du panier.", "error");
  }
}

// ================= DISPLAY CART =================
function displayCart() {
  if (!cartContainer) return;

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

// ================= TOTALS =================
function updateTotals(subtotal, hasItems) {
  const shipping = hasItems ? SHIPPING : 0;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `€${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
}

// ================= CART BUTTONS =================
if (cartContainer) {
  cartContainer.addEventListener("click", async (e) => {
    const button = e.target.closest("button");
    if (!button || !currentUser) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (!cartItems[index]) return;

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
      showToast("Produit supprimé du panier.", "success");
    }

    await saveCart();
  });
}

// ================= CHECKOUT =================
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!authReady) {
      showToast("Chargement du compte, réessayez.", "error");
      return;
    }

    if (!currentUser) {
      showToast("Veuillez vous connecter d'abord.", "error");
      localStorage.setItem("redirectAfterLogin", "cart.html");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

      return;
    }

    if (cartItems.length === 0) {
      showToast("Votre panier est vide !", "error");
      return;
    }

    window.location.href = "checkout.html";
  });
}
