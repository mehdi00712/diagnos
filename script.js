import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupUserSystem();
});

function setupMobileMenu() {
  const btn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".mobile-nav");

  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("active");

    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    }
  });
}

function setupUserSystem() {
  const userLink = document.getElementById("user-link");
  const userMenu = document.getElementById("user-menu");
  const dropdown = document.getElementById("user-dropdown");

  const mobileUser = document.getElementById("mobile-user-link");
  const mobileOrders = document.getElementById("mobile-orders-link");
  const mobileLogout = document.querySelector(".mobile-logout-btn");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const name = user.displayName || user.email;

      if (userLink) {
        userLink.textContent = name;
        userLink.href = "#";
      }

      if (mobileUser) {
        mobileUser.textContent = name;
        mobileUser.href = "#";
      }

      if (mobileOrders) mobileOrders.style.display = "block";
      if (mobileLogout) mobileLogout.style.display = "block";

      updateFirebaseCartCounter(user.uid);

      if (userMenu && dropdown) {
        userMenu.onclick = (e) => {
          e.preventDefault();
          dropdown.classList.toggle("active");
        };
      }

    } else {
      if (userLink) {
        userLink.textContent = "Connexion";
        userLink.href = "login.html";
      }

      if (mobileUser) {
        mobileUser.textContent = "Connexion";
        mobileUser.href = "login.html";
      }

      if (mobileOrders) mobileOrders.style.display = "none";
      if (mobileLogout) mobileLogout.style.display = "none";

      document.querySelectorAll(".cart-count").forEach(el => {
        el.textContent = "0";
      });
    }
  });
}

async function updateFirebaseCartCounter(uid) {
  const cartRef = doc(db, "carts", uid);
  const cartSnap = await getDoc(cartRef);

  let count = 0;

  if (cartSnap.exists()) {
    const items = cartSnap.data().items || [];
    count = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
  });
}

window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};
