document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("signin-form");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const BASE_URL = "http://13.59.169.35";

  logoutBtn.addEventListener("click", () => {
    window.location.href = "landing.html";
  });

  // Login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // Save user info
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      alert("Login successful!");
      window.location.href = "landing.html";

    } catch (err) {
      console.error("Login error:", err);
      alert("Could not connect to server.");
    }
  });

  // Register
  signupBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name) {
      alert("Name is required for sign up.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Registered! Please check your email to verify your account.");

    } catch (err) {
      console.error("Register error:", err);
      alert("Could not connect to server.");
    }
  });
});