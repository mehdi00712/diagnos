import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

const itemsContainer = document.getElementById("checkout-items");
const totalEl = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

let currentUser = null;
let cartItems = [];
let total = 0;

// ================= AUTH CHECK =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showToast("Veuillez vous connecter d'abord.", "error");

    localStorage.setItem("redirectAfterLogin", "checkout.html");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  currentUser = user;

  nameInput.value = user.displayName || "";
  emailInput.value = user.email || "";

  await loadCart();
});

// ================= LOAD FIREBASE CART =================
async function loadCart() {
  const cartRef = doc(db, "carts", currentUser.uid);
  const cartSnap = await getDoc(cartRef);

  cartItems = cartSnap.exists() ? cartSnap.data().items || [] : [];

  displayCheckoutItems();
}

// ================= DISPLAY CHECKOUT =================
function displayCheckoutItems() {
  itemsContainer.innerHTML = "";
  total = 0;

  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty">Votre panier est vide.</div>
    `;

    totalEl.textContent = "€0.00";
    return;
  }

  cartItems.forEach(item => {
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
}

// ================= PLACE ORDER =================
checkoutForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!currentUser) {
    showToast("Veuillez vous connecter d'abord.", "error");
    return;
  }

  if (cartItems.length === 0) {
    showToast("Votre panier est vide !", "error");
    return;
  }

  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  if (!phone || !address) {
    showToast("Veuillez remplir le téléphone et l'adresse.", "error");
    return;
  }

  try {
    const order = {
      userId: currentUser.uid,
      user: {
        name: currentUser.displayName || nameInput.value.trim(),
        email: currentUser.email
      },
      phone,
      address,
      items: cartItems,
      total,
      status: "Pending",
      date: new Date().toLocaleString(),
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "orders"), order);

    await deleteDoc(doc(db, "carts", currentUser.uid));

    showToast("Commande passée avec succès !", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("Order error:", error);
    showToast("Erreur lors de la commande.", "error");
  }
});
