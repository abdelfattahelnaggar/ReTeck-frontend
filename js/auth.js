// Document ready function
document.addEventListener("DOMContentLoaded", function () {
  // Check login status and update navbar
  checkAuthRedirect();

  // Initialize navbar state based on the available functions
  if (typeof checkLoginStatusAndUpdateNavbar === "function") {
    // Use the page-specific function if available (about-us page or faq page)
    checkLoginStatusAndUpdateNavbar();
  } else if (typeof updateUserProfileInNav === "function") {
    // Use the utils.js function if available
    updateUserProfileInNav();
  } else {
    // Fall back to the main.js function
    initializeNavbarState();
  }

  // Setup login form
  setupLoginForm();

  // Setup signup form
  setupSignupForm();

  // Setup password toggle visibility
  setupPasswordToggles();

  // Setup password strength meter
  setupPasswordStrengthMeter();

  // Set up newsletter subscription
  setupNewsletterSubscription();

  // Setup logout functionality
  setupLogout();
});

// Function to toggle password visibility
function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;

  // Toggle the type attribute
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle the eye / eye slash icon
  const eyeIcon = document.querySelector(
    `[onclick="togglePassword('${inputId}')"] i`
  );
  if (eyeIcon) {
    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
  }
}

// Check if user is already logged in and redirect if necessary
function checkAuthRedirect() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");
  const currentPage = window.location.pathname.split("/").pop();
  const isAboutUsPage = currentPage === "about-us.html";
  const isAdminPage = currentPage === "admin-dashboard.html";
  const isInventoryStorePage = currentPage === "inventory-store.html";

  // Don't redirect if on about-us page
  if (isAboutUsPage) {
    return;
  }

  if (isLoggedIn) {
    // If on login or signup page, redirect based on role
    if (currentPage === "login.html" || currentPage === "signup.html") {
      if (userRole === "admin") {
        window.location.href = "admin-dashboard.html";
      } else if (userRole === "company") {
        // Redirect company users to inventory store
        window.location.href = "inventory-store.html";
      } else {
        window.location.href = "index.html";
      }
    }

    // If admin tries to access customer pages, redirect to admin dashboard
    if (
      userRole === "admin" &&
      !isAdminPage &&
      currentPage !== "index.html" &&
      !currentPage.startsWith("about") &&
      !currentPage.startsWith("faq")
    ) {
      window.location.href = "admin-dashboard.html";
    }

    // If customer tries to access admin pages, redirect to home
    if (userRole !== "admin" && isAdminPage) {
      window.location.href = "index.html";
    }

    // If non-company user tries to access inventory store, redirect to home
    if (userRole !== "company" && isInventoryStorePage) {
      window.location.href =
        "index.html?access=denied&message=Only recycling companies can access the inventory store";
    }
  } else {
    // If not logged in and trying to access admin page, redirect to login
    if (isAdminPage) {
      window.location.href = "login.html";
    }

    // If not logged in and trying to access inventory store, redirect to login
    if (isInventoryStorePage) {
      window.location.href =
        "login.html?redirect=inventory-store.html&message=Please log in as a recycling company to access the inventory store";
    }
  }
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const rememberMe = document.getElementById("rememberMe").checked;

      // Get selected role if available
      const selectedRole =
        document.querySelector('input[name="userRole"]:checked')?.value || null;

      // Validate email format
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address", "danger");
        return;
      }

      // Check if user exists
      let userData = getUserData(email);

      if (!userData) {
        showToast("No account found with this email", "danger");
        return;
      }

      // Validate password (in a real app, this would be done securely on the server)
      if (!validatePassword(password, userData.passwordHash)) {
        showToast("Invalid password", "danger");
        return;
      }

      // Validate selected role matches user role if role selection exists
      if (selectedRole && userData.role !== selectedRole) {
        showToast(
          `This email is not registered as a ${selectedRole} account`,
          "danger"
        );
        return;
      }

      // Set login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", userData.role);

      // If remember me is checked, set a longer expiration
      if (rememberMe) {
        // In a real app, this would set a longer-lived cookie or token
        localStorage.setItem("rememberLogin", "true");
      }

      // Redirect based on user role
      if (userData.role === "admin") {
        // Redirect to admin dashboard
        window.location.href = "admin-dashboard.html";
      } else if (userData.role === "company") {
        // Redirect company users to inventory store
        window.location.href = "inventory-store.html";
      } else {
        // Redirect to home page
        window.location.href = "index.html";
      }
    });
  }

  // Handle "forgot password" link
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      if (email && isValidEmail(email)) {
        showToast("Password reset instructions sent to your email", "info");
      } else {
        showToast("Please enter your email address first", "warning");
      }
    });
  }
}

// Setup signup form
function setupSignupForm() {
  const signupForm = document.getElementById("signupForm");
  console.log("Setting up signup form", signupForm);

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      console.log("Signup form submitted!");
      e.preventDefault();

      // Get button and spinner elements
      const signupButton = document.getElementById("signupButton");
      const signupSpinner = document.getElementById("signupSpinner");

      console.log("Button elements:", signupButton, signupSpinner);

      // Show spinner and disable button
      if (signupButton && signupSpinner) {
        signupButton.disabled = true;
        signupSpinner.classList.remove("d-none");
      }

      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const firstName = document.getElementById("firstName")?.value.trim();
      const lastName = document.getElementById("lastName")?.value.trim();

      console.log("Form values:", {
        email,
        password: "****",
        confirmPassword: "****",
        firstName,
        lastName,
      });

      // Helper function to reset button state
      const resetButtonState = () => {
        if (signupButton && signupSpinner) {
          signupButton.disabled = false;
          signupSpinner.classList.add("d-none");
        }
      };

      // Validate email format
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address", "danger");
        resetButtonState();
        return;
      }

      // Check if email already exists
      const existingUser = getUserData(email);
      if (existingUser) {
        showToast("An account with this email already exists", "danger");
        resetButtonState();
        return;
      }

      // Validate password
      if (password.length < 8) {
        showToast("Password must be at least 8 characters long", "danger");
        resetButtonState();
        return;
      }

      // Check password strength
      const strengthResult = checkPasswordStrength(password);
      if (strengthResult.score < 2) {
        showToast(
          "Please use a stronger password: " + strengthResult.feedback,
          "danger"
        );
        resetButtonState();
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        showToast("Passwords do not match", "danger");
        resetButtonState();
        return;
      }

      // Create user account and store it
      createUserAccount(email, password, firstName, lastName);

      // Show success message
      showToast("Account created successfully! You can now log in.", "success");

      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    });
  } else {
    console.error("Signup form not found in DOM!");
  }
}

// Create user account
function createUserAccount(email, password, firstName, lastName) {
  // Get existing users or initialize empty object
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  // Create user object
  users[email] = {
    email: email,
    passwordHash: hashPassword(password), // In a real app, this would be securely hashed
    role: "customer",
    createdAt: new Date().toISOString(),
    profile: {
      firstName: firstName || "",
      lastName: lastName || "",
      phoneNumber: "",
      address: "",
      profileImage: "",
    },
  };

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Create empty userData object for this user
  const userData = {
    email: email,
    role: "customer",
    profile: {
      firstName: firstName || "",
      lastName: lastName || "",
      phoneNumber: "",
      address: "",
      profileImage: "",
    },
    quotes: [],
    recycleRequests: [],
    notifications: [],
  };

  // Store the user's data
  localStorage.setItem(`userData_${email}`, JSON.stringify(userData));
}

// Get user data
function getUserData(email) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  return users[email];
}

// Setup password visibility toggles
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const passwordInput = document.getElementById(this.dataset.target);

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.innerHTML = '<i class="bi bi-eye-slash"></i>';
      } else {
        passwordInput.type = "password";
        this.innerHTML = '<i class="bi bi-eye"></i>';
      }
    });
  });
}

// Setup password strength meter
function setupPasswordStrengthMeter() {
  const passwordInput = document.getElementById("signupPassword");
  const strengthMeter = document.getElementById("passwordStrengthMeter");
  const strengthText = document.getElementById("passwordStrengthText");

  if (passwordInput && strengthMeter) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const result = checkPasswordStrength(password);

      // Update meter
      strengthMeter.value = result.score;

      // Update text
      if (strengthText) {
        strengthText.textContent = result.message;

        // Update color
        strengthText.className = "form-text";
        strengthText.classList.add(result.className);
      }
    });
  }
}

// Check password strength
function checkPasswordStrength(password) {
  // Simple password strength check
  // In a real app, use a library like zxcvbn for better security
  let score = 0;
  let message = "";
  let feedback = "";
  let className = "text-danger";

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      message = "Very weak";
      feedback = "Use a longer password with mixed character types";
      className = "text-danger";
      break;
    case 2:
    case 3:
      message = "Could be stronger";
      feedback = "Add more character types";
      className = "text-warning";
      break;
    case 4:
      message = "Good password";
      feedback = "";
      className = "text-info";
      break;
    case 5:
    case 6:
      message = "Strong password";
      feedback = "";
      className = "text-success";
      break;
  }

  return { score, message, feedback, className };
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Hash password (simplified for demo)
function hashPassword(password) {
  // In a real app, use a secure hashing algorithm with salt
  // This is just a simple hash for demonstration
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Validate password against hash
function validatePassword(password, hash) {
  // In a real app, use a secure password verification
  return hashPassword(password) === hash;
}

/**
 * Sets up the newsletter subscription functionality in the footer
 */
function setupNewsletterSubscription() {
  const subscribeButtons = document.querySelectorAll(".footer-newsletter .btn");

  subscribeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const inputField = this.closest(".input-group").querySelector(
        'input[type="email"]'
      );
      const email = inputField.value.trim();

      if (!email) {
        showToast("Please enter your email address", "warning");
        return;
      }

      if (!validateEmail(email)) {
        showToast("Please enter a valid email address", "warning");
        return;
      }

      // Save subscription to localStorage
      saveNewsletterSubscription(email);

      // Clear the input field
      inputField.value = "";

      // Show success message
      showToast("Thank you for subscribing to our newsletter!", "success");
    });
  });
}

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Saves newsletter subscription to localStorage
 * @param {string} email - The email to save
 */
function saveNewsletterSubscription(email) {
  // Get existing subscriptions
  let subscriptions = JSON.parse(
    localStorage.getItem("newsletterSubscriptions") || "[]"
  );

  // Check if email is already subscribed
  if (!subscriptions.includes(email)) {
    subscriptions.push(email);
    localStorage.setItem(
      "newsletterSubscriptions",
      JSON.stringify(subscriptions)
    );
  }
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, warning, info, error)
 */
function showToast(message, type = "info") {
  // Check if toast container exists
  let toastContainer = document.querySelector(".toast-container");

  if (!toastContainer) {
    // Create toast container
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toastId = "toast-" + Date.now();
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.id = toastId;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  // Create toast content
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000,
  });
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", function () {
    toast.remove();
  });
}

// Setup logout functionality
function setupLogout() {
  const logoutLinks = document.querySelectorAll(".logout-link");
  logoutLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Clear authentication data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminLoggedIn");

      // Update navbar state based on available functions
      if (typeof checkLoginStatusAndUpdateNavbar === "function") {
        // Use the page-specific function if available (about-us page or faq page)
        checkLoginStatusAndUpdateNavbar();
      } else if (typeof updateUserProfileInNav === "function") {
        // Use the utils.js function if available
        updateUserProfileInNav();
      } else {
        // Fall back to the main.js function
        initializeNavbarState();
      }

      // Show a success message
      showToast("Logged out successfully", "success");

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    });
  });
}

// Function to show/hide navigation elements based on login status
function updateNavigation() {
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const authRequired = document.querySelectorAll(".auth-required");

  // Get email from localStorage
  const userEmail = localStorage.getItem("userEmail");

  if (userEmail) {
    // User is logged in
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) userProfile.classList.remove("d-none");

    // Show auth-required elements
    authRequired.forEach((el) => el.classList.remove("d-none"));

    // Update user profile information
    const userData = getUserData(userEmail);

    if (userData) {
      // Update username in dropdown
      const userName = document.querySelector(".user-name");
      const dropdownUserName = document.getElementById("dropdownUserName");
      const dropdownUserEmail = document.getElementById("dropdownUserEmail");

      if (userName) {
        const name = getUserDisplayName(userData);
        userName.textContent = name;
      }

      if (dropdownUserName) {
        const name = getUserDisplayName(userData);
        dropdownUserName.textContent = name;
      }

      if (dropdownUserEmail) {
        dropdownUserEmail.textContent = userEmail;
      }

      // Update avatar in dropdown
      updateUserAvatar(userData);

      // Update points in navbar if the element exists
      const pointsDisplay = document.querySelector(".points-display-navbar");
      if (pointsDisplay) {
        const pointsValue = document.getElementById("navbarPoints");
        if (pointsValue) {
          pointsValue.textContent = userData.profile?.points || 0;
        }

        // Make the points display clickable to navigate to profile page
        if (!pointsDisplay.hasAttribute("data-click-initialized")) {
          pointsDisplay.style.cursor = "pointer";
          pointsDisplay.addEventListener("click", function () {
            // Check if we're in a subfolder (html/) or the root
            const currentPath = window.location.pathname;
            if (currentPath.includes("/html/")) {
              window.location.href = "profile.html";
            } else {
              window.location.href = "html/profile.html";
            }
          });
          pointsDisplay.setAttribute("data-click-initialized", "true");
        }
      }
    }
  } else {
    // User is not logged in
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");

    // Hide auth-required elements
    authRequired.forEach((el) => el.classList.add("d-none"));
  }
}

// Helper function to get user display name
function getUserDisplayName(userData) {
  if (userData.profile) {
    if (userData.profile.firstName && userData.profile.lastName) {
      return `${userData.profile.firstName} ${userData.profile.lastName}`;
    } else if (userData.profile.firstName) {
      return userData.profile.firstName;
    }
  }

  // Fallback to email username
  const userEmail = localStorage.getItem("userEmail");
  return userEmail ? userEmail.split("@")[0] : "Account";
}

// Get user data from local storage
function getUserData(email) {
  try {
    // Try user-specific data first
    const userData = JSON.parse(
      localStorage.getItem(`userData_${email}`) || "{}"
    );

    // If no user-specific data, try users object
    if (Object.keys(userData).length === 0) {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      return users[email] || null;
    }

    return userData;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Update user avatar
function updateUserAvatar(userData) {
  const avatarElements = document.querySelectorAll(
    ".user-avatar-small, .user-dropdown-avatar"
  );

  if (userData.profile && userData.profile.profileImage) {
    // Use profile image
    avatarElements.forEach((element) => {
      const size = element.classList.contains("user-avatar-small") ? 24 : 40;
      element.innerHTML = `<img src="${userData.profile.profileImage}" alt="Profile" class="rounded-circle" width="${size}" height="${size}">`;
    });
  } else {
    // Use initials
    const initials = getInitials(userData);

    avatarElements.forEach((element) => {
      const size = element.classList.contains("user-avatar-small") ? 24 : 40;
      const fontSize = element.classList.contains("user-avatar-small")
        ? 12
        : 16;

      element.innerHTML = `
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: ${size}px; height: ${size}px; font-size: ${fontSize}px;">
          ${initials}
        </div>
      `;
    });
  }
}

// Get user initials
function getInitials(userData) {
  if (userData.profile) {
    const first = userData.profile.firstName
      ? userData.profile.firstName[0]
      : "";
    const last = userData.profile.lastName ? userData.profile.lastName[0] : "";

    if (first || last) {
      return (first + last).toUpperCase();
    }
  }

  // Fallback to email first letter
  const userEmail = localStorage.getItem("userEmail");
  return userEmail ? userEmail[0].toUpperCase() : "U";
}
