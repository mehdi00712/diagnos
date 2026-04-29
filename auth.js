// ================= TOAST MESSAGE =================
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

// ================= REGISTER =================
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      showToast("Cet email est déjà utilisé.", "error");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem("currentUser", JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }));

    showToast("Compte créé avec succès !", "success");

    setTimeout(() => {
      redirectUser();
    }, 1200);
  });
}

// ================= LOGIN =================
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
      showToast("Email ou mot de passe incorrect.", "error");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    showToast("Connexion réussie !", "success");

    setTimeout(() => {
      redirectUser();
    }, 1200);
  });
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

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("currentUser");
  showToast("Déconnexion réussie.", "success");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// ================= CHECK USER =================
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}