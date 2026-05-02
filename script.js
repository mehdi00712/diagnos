/**
 * FINAL CLEAN VERSION
 * Mobile Menu + Cart + Login System + UI Fix
 */

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupUserSystem();
  setupCartSystem();
});

// ================= MOBILE MENU =================
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

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");

      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
    });
  });
}

// ================= USER SYSTEM =================
function setupUserSystem() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const userLink = document.getElementById("user-link");
  const userMenu = document.getElementById("user-menu");
  const dropdown = document.getElementById("user-dropdown");

  const mobileUser = document.getElementById("mobile-user-link");
  const mobileOrders = document.getElementById("mobile-orders-link");
  const mobileLogout = document.querySelector(".mobile-logout-btn");

  if (user) {
    // DESKTOP
    if (userLink) {
      userLink.textContent = user.name;
      userLink.href = "#";
    }

    if (userMenu && dropdown) {
      userMenu.onclick = (e) => {
        e.preventDefault();
        dropdown.classList.toggle("active");
      };

      document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });
    }

    // MOBILE
    if (mobileUser) {
      mobileUser.textContent = user.name;
      mobileUser.href = "#";
    }

    if (mobileOrders) mobileOrders.style.display = "block";
    if (mobileLogout) mobileLogout.style.display = "block";

  } else {
    // NOT LOGGED
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
  }
}

// ================= LOGOUT =================
function logoutUser() {
  localStorage.removeItem("currentUser");
  location.reload();
}

// ================= CART =================
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

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

function setupCartSystem() {
  updateCartCounter();
  setupAddToCart();
}

function updateCartCounter() {
  const cart = getCart();

  const count = cart.reduce((total, item) => {
    return total + (item.quantity || 0);
  }, 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
  });
}

// ================= ADD TO CART =================
function setupAddToCart() {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");

      if (!card) return;

      const name = card.querySelector("h3").textContent.trim();
      const priceText = card.querySelector(".price, .product-price").textContent;
      const image = card.querySelector("img").src;

      const price = parseFloat(
        priceText.replace("€", "").replace(",", ".").replace(/[^\d.]/g, "")
      );

      let cart = getCart();

      const existing = cart.find(item => item.name === name);

      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
          name,
          price,
          image,
          quantity: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCounter();

      btn.textContent = "Ajouté ✓";

      setTimeout(() => {
        btn.textContent = "Ajouter au panier";
      }, 1000);
    });
  });
}
