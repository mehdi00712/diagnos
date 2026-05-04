import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
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

// ================= REDIRECT =================
function redirectUser() {
  const redirect = localStorage.getItem("redirectAfterLogin");

  if (redirect) {
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } else {
    window.location.href = "index.html";
  }
}

// ================= ALREADY LOGGED IN CHECK =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase user active:", user.email);
  } else {
    console.log("No Firebase user active");
  }
});

// ================= REGISTER =================
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;

    if (!name || !email || !password) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: name
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: "customer",
        createdAt: serverTimestamp()
      });

      showToast("Compte créé avec succès !", "success");

      setTimeout(() => {
        redirectUser();
      }, 1200);

    } catch (error) {
      console.error("Register error:", error);

      if (error.code === "auth/email-already-in-use") {
        showToast("Cet email est déjà utilisé.", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Email invalide.", "error");
      } else {
        showToast("Erreur lors de la création du compte.", "error");
      }
    }
  });
}

// ================= LOGIN =================
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      showToast("Veuillez entrer votre email et mot de passe.", "error");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log("Logged in:", userCredential.user.email);

      showToast("Connexion réussie !", "success");

      setTimeout(() => {
        redirectUser();
      }, 1200);

    } catch (error) {
      console.error("Login error:", error);
      showToast("Email ou mot de passe incorrect.", "error");
    }
  });
}

// ================= LOGOUT =================
window.logoutUser = async function () {
  try {
    await signOut(auth);
    showToast("Déconnexion réussie.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);

  } catch (error) {
    console.error("Logout error:", error);
    showToast("Erreur lors de la déconnexion.", "error");
  }
};
