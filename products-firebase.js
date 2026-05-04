import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

function showToast(message, type = "success") {
  const oldToast = document.querySelector(".toast-message");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

document.querySelectorAll(".add-to-cart").forEach((button, index) => {
  button.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Veuillez vous connecter d'abord.", "error");
      localStorage.setItem("redirectAfterLogin", "products.html");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

      return;
    }

    const card = button.closest(".product-card");

    const name = card.querySelector("h3").textContent.trim();
    const image = card.querySelector("img").src;
    const priceText = card.querySelector(".price, .product-price").textContent;

    const price = parseFloat(
      priceText.replace("À partir de", "").replace("€", "").replace(",", ".").trim()
    );

    const cartRef = doc(db, "carts", currentUser.uid);
    const cartSnap = await getDoc(cartRef);

    let items = [];

    if (cartSnap.exists()) {
      items = cartSnap.data().items || [];
    }

    const existing = items.find(item => item.name === name);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: String(index + 1),
        name,
        price,
        image,
        quantity: 1
      });
    }

    await setDoc(cartRef, {
      userId: currentUser.uid,
      items
    });

    showToast("Produit ajouté au panier !", "success");
  });
});
