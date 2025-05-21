/**
 * RETECH - Login Page JavaScript
 * Handles user login functionality
 */

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cache DOM elements for better performance
let loginForm,
  emailInput,
  passwordInput,
  rememberMeCheckbox,
  loginButton,
  loginSpinner;

// Document ready with performance monitoring
document.addEventListener("DOMContentLoaded", function () {
  if (window.performanceMonitor) {
    window.performanceMonitor.startTiming("loginScriptInit");
  }

  console.log("Login script loaded");

  // Cache DOM elements
  loginForm = document.getElementById("loginForm");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  rememberMeCheckbox = document.getElementById("rememberMe");
  loginButton = document.getElementById("loginButton");
  loginSpinner = document.getElementById("loginSpinner");

  // Debug element status
  console.log("Form elements status:");
  console.log("- loginForm:", !!loginForm);
  console.log("- emailInput:", !!emailInput);
  console.log("- passwordInput:", !!passwordInput);
  console.log("- rememberMeCheckbox:", !!rememberMeCheckbox);
  console.log("- loginButton:", !!loginButton);
  console.log("- loginSpinner:", !!loginSpinner);

  // Check for critical missing elements
  if (!loginForm) {
    console.warn("Critical error: Login form not found");
  }
  if (!emailInput) {
    console.warn("Critical error: Email input not found");
  }
  if (!passwordInput) {
    console.warn("Critical error: Password input not found");
  }

  // Initialize login form
  initLoginForm();

  // Set up password visibility toggle
  setupPasswordToggle();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  if (window.performanceMonitor) {
    window.performanceMonitor.endTiming("loginScriptInit");
  }
});

/**
 * Initialize login form
 */
function initLoginForm() {
  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }

  // Double-check that we have our form elements
  if (!emailInput) {
    console.error("Email input not found. Attempting to get it again.");
    emailInput = document.getElementById("email");
    if (!emailInput) {
      console.error("Still can't find email input!");
    }
  }

  if (!passwordInput) {
    console.error("Password input not found. Attempting to get it again.");
    passwordInput = document.getElementById("password");
    if (!passwordInput) {
      console.error("Still can't find password input!");
    }
  }

  // Add form submission handler
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the email and password values directly from the form elements
    // This is a safeguard in case the global variables don't work
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");

    if (!emailEl || !passwordEl) {
      console.error("Critical error: Form inputs not found on submit");
      showLoginMessage(
        "Error processing login. Please try again later.",
        "danger"
      );
      return;
    }

    // Start timing login process
    if (window.performanceMonitor) {
      window.performanceMonitor.startTiming("loginProcess");
    }

    // Get form values
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

    console.log("Login attempt:", email, "Password length:", password.length);

    // Validate email format
    if (!validateEmail(email)) {
      showLoginMessage("Please enter a valid email address", "danger");
      return;
    }

    // Show loading state
    setLoginButtonLoading(true);

    // Simulate network delay (remove in production)
    setTimeout(function () {
      // Handle demo user credentials directly
      if (email === "user@example.com" && password === "user123") {
        console.log("Demo user login successful");

        // Store user data in localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // Ensure demo user exists in localStorage
        createDemoUserIfNeeded(email);

        // Redirect to home page
        window.location.href = "index.html";
        return;
      }

      // Handle admin credentials directly
      if (email === "admin@retech.com" && password === "admin123") {
        console.log("Admin login successful");

        // Store user data in localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // Ensure admin user exists in localStorage
        createAdminUserIfNeeded(email);

        // Redirect to admin dashboard
        window.location.href = "admin-dashboard.html";
        return;
      }

      // For other users, check if they exist in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const userData = users[email];

      if (userData && validatePassword(password, userData.passwordHash)) {
        // Login successful
        console.log("Login successful");

        // Store user data in localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // End timing login process
        if (window.performanceMonitor) {
          window.performanceMonitor.endTiming("loginProcess");
        }

        // Redirect to home page
        window.location.href = "index.html";
      } else {
        // Login failed
        console.log("Login failed");
        showLoginMessage("Invalid email or password", "danger");
        setLoginButtonLoading(false);

        // End timing login process
        if (window.performanceMonitor) {
          window.performanceMonitor.endTiming("loginProcess");
        }
      }
    }, 800); // Simulated delay
  });
}

/**
 * Set up password visibility toggle
 */
function setupPasswordToggle() {
  const togglePassword = document.querySelector(".toggle-password");
  if (!togglePassword || !passwordInput) return;

  togglePassword.addEventListener("click", function () {
    // Toggle password visibility
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Toggle eye icon
    this.querySelector("i").classList.toggle("fa-eye");
    this.querySelector("i").classList.toggle("fa-eye-slash");
  });
}

/**
 * Set up keyboard shortcuts for demo credentials
 */
function setupKeyboardShortcuts() {
  // Use event delegation for better performance
  document.addEventListener("keydown", function (e) {
    // Alt+F to fill test credentials
    if (e.altKey && e.key === "f") {
      fillTestCredentials();
    }

    // Alt+A to fill admin credentials
    if (e.altKey && e.key === "a") {
      fillAdminCredentials();
    }
  });
}

/**
 * Fill test credentials for demo
 */
function fillTestCredentials() {
  if (!emailInput || !passwordInput) return;

  emailInput.value = "user@example.com";
  passwordInput.value = "user123";

  // Add animation to show fields were filled
  emailInput.classList.add("filled-animation");
  passwordInput.classList.add("filled-animation");

  // Remove animation class after animation completes
  setTimeout(() => {
    emailInput.classList.remove("filled-animation");
    passwordInput.classList.remove("filled-animation");
  }, 1000);
}

/**
 * Fill admin credentials for demo
 */
function fillAdminCredentials() {
  if (!emailInput || !passwordInput) return;

  emailInput.value = "admin@retech.com";
  passwordInput.value = "admin123";

  // Add animation to show fields were filled
  emailInput.classList.add("filled-animation");
  passwordInput.classList.add("filled-animation");

  // Remove animation class after animation completes
  setTimeout(() => {
    emailInput.classList.remove("filled-animation");
    passwordInput.classList.remove("filled-animation");
  }, 1000);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password against stored hash
 */
function validatePassword(password, hash) {
  // Special case for the test user
  if (password === "user123" && (hash === "user123" || hash === undefined)) {
    return true;
  }

  // Special case for admin user
  if (password === "admin123" && hash === "admin123") {
    return true;
  }

  // In a real application, this would use proper password hashing
  // For demo purposes, we're using simple string comparison
  return password === hash;
}

/**
 * Show login message
 */
function showLoginMessage(message, type = "info") {
  const loginAlert = document.getElementById("loginAlert");
  const loginAlertMessage = document.getElementById("loginAlertMessage");

  if (!loginAlert || !loginAlertMessage) return;

  // Set message and type
  loginAlertMessage.textContent = message;
  loginAlert.className = `alert alert-${type} login-alert`;
  loginAlert.classList.remove("d-none");

  // Hide message after 5 seconds
  setTimeout(() => {
    loginAlert.classList.add("d-none");
  }, 5000);
}

/**
 * Set login button loading state
 */
function setLoginButtonLoading(isLoading) {
  if (!loginButton || !loginSpinner) return;

  if (isLoading) {
    loginButton.disabled = true;
    loginSpinner.classList.remove("d-none");
  } else {
    loginButton.disabled = false;
    loginSpinner.classList.add("d-none");
  }
}

/**
 * Create demo user if it doesn't exist
 */
function createDemoUserIfNeeded(email) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  // Check if demo user already exists
  if (!users[email]) {
    // Create demo user
    users[email] = {
      email: email,
      passwordHash: "user123", // In a real app, this would be securely hashed
      role: "customer",
      createdAt: new Date().toISOString(),
      profile: {
        firstName: "Demo",
        lastName: "User",
        points: 100,
        phoneNumber: "555-1234",
        address: {
          street: "123 Example St",
          city: "Demo City",
          state: "DS",
          zip: "12345",
        },
      },
    };

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Create empty userData object for this user
    const userData = {
      email: email,
      role: "customer",
      profile: users[email].profile,
      recycleRequests: [],
      pointsHistory: [
        {
          date: new Date().toISOString(),
          activity: "Welcome bonus",
          points: 100,
        },
      ],
    };

    localStorage.setItem(`userData_${email}`, JSON.stringify(userData));
  }
}

/**
 * Create admin user if it doesn't exist
 */
function createAdminUserIfNeeded(email) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  // Check if admin user already exists
  if (!users[email]) {
    // Create admin user
    users[email] = {
      email: email,
      passwordHash: "admin123", // In a real app, this would be securely hashed
      role: "admin",
      createdAt: new Date().toISOString(),
      profile: {
        firstName: "Admin",
        lastName: "User",
        phoneNumber: "555-5678",
      },
    };

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Create empty userData object for this user
    const userData = {
      email: email,
      role: "admin",
      profile: users[email].profile,
    };

    localStorage.setItem(`userData_${email}`, JSON.stringify(userData));
  }
}
