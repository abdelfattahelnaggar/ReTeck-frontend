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

  // Check if page has a market link
  const marketLink = document.querySelector('a[href="market.html"]');
  if (marketLink) {
    // Add rewards after a short delay to ensure user data is loaded
    setTimeout(addDemoRewards, 1000);
  }
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
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Pages that are accessible to non-logged-in users
  const publicPages = [
    "login.html",
    "signup.html",
    "about-us.html",
    "faq.html",
  ];

  // If user is not logged in and tries to access a protected page
  if (!isLoggedIn && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
    return;
  }

  // Logic for logged-in users
  if (isLoggedIn) {
    const isAdminPage = currentPage === "admin-dashboard.html";
    const isInventoryStorePage = currentPage === "inventory-store.html";

    // If on login or signup page, redirect based on role
    if (currentPage === "login.html" || currentPage === "signup.html") {
      if (userRole === "admin") {
        window.location.href = "admin-dashboard.html";
      } else if (userRole === "company") {
        window.location.href = "inventory-store.html";
      } else {
        window.location.href = "index.html";
      }
      return;
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

    // If a non-admin user tries to access the admin dashboard
    if (userRole !== "admin" && isAdminPage) {
      window.location.href = "index.html";
    }

    // If a non-company user tries to access the inventory store
    if (userRole !== "company" && isInventoryStorePage) {
      window.location.href =
        "index.html?access=denied&message=Only recycling companies can access the inventory store";
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
        showNotification("Please enter a valid email address", "danger");
        return;
      }

      // Check if user exists
      let userData = getUserData(email);

      if (!userData) {
        showNotification("No account found with this email", "danger");
        return;
      }

      // Validate password (in a real app, this would be done securely on the server)
      if (!validatePassword(password, userData.passwordHash)) {
        showNotification("Invalid password", "danger");
        return;
      }

      // Validate selected role matches user role if role selection exists
      if (selectedRole && userData.role !== selectedRole) {
        showNotification(
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
        showNotification(
          "Password reset instructions sent to your email",
          "info"
        );
      } else {
        showNotification("Please enter your email address first", "warning");
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
        showNotification("Please enter a valid email address", "danger");
        resetButtonState();
        return;
      }

      // Check if email already exists
      const existingUser = getUserData(email);
      if (existingUser) {
        showNotification("An account with this email already exists", "danger");
        resetButtonState();
        return;
      }

      // Validate password
      if (password.length < 8) {
        showNotification(
          "Password must be at least 8 characters long",
          "danger"
        );
        resetButtonState();
        return;
      }

      // Check password strength
      const strengthResult = checkPasswordStrength(password);
      if (strengthResult.score < 2) {
        showNotification(
          "Please use a stronger password: " + strengthResult.feedback,
          "danger"
        );
        resetButtonState();
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        showNotification("Passwords do not match", "danger");
        resetButtonState();
        return;
      }

      // Create user account and store it
      createUserAccount(email, password, firstName, lastName);

      // Show success message
      showNotification(
        "Account created successfully! You can now log in.",
        "success"
      );

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
        showNotification("Please enter your email address", "warning");
        return;
      }

      if (!validateEmail(email)) {
        showNotification("Please enter a valid email address", "warning");
        return;
      }

      // Save subscription to localStorage
      saveNewsletterSubscription(email);

      // Clear the input field
      inputField.value = "";

      // Show success message
      showNotification(
        "Thank you for subscribing to our newsletter!",
        "success"
      );
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
 * Show notification
 * @param {string} message - Message to show
 * @param {string} type - Notification type (success, warning, danger)
 */
function showNotification(message, type = "success") {
  // Clean up any existing notifications to prevent stacking
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => {
    notif.classList.remove("show");
    setTimeout(() => {
      if (notif.parentNode) {
        notif.parentNode.removeChild(notif);
      }
    }, 300);
  });

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "warning"
          ? "fa-exclamation-triangle"
          : "fa-times-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = `<i class="fas fa-times"></i>`;
  closeButton.className = "notification-close";
  closeButton.style.background = "transparent";
  closeButton.style.border = "none";
  closeButton.style.color = "inherit";
  closeButton.style.opacity = "0.7";
  closeButton.style.marginLeft = "10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.padding = "0";
  closeButton.onclick = function () {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };

  notification.querySelector(".notification-content").appendChild(closeButton);

  // Add to body
  document.body.appendChild(notification);

  // Trigger animation after a short delay to ensure proper rendering
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000); // 5 seconds display time
}

// Setup logout functionality
function setupLogout() {
  const logoutLinks = document.querySelectorAll('[data-action="logout"]');
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
      showNotification("Logged out successfully", "success");

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    });
  });
}

// Function to show/hide navigation elements based on login status
function updateNavigation() {
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const authRequired = document.querySelectorAll(".auth-required");
  const userEmail = localStorage.getItem("userEmail");

  // Define which links should be disabled when logged out
  const protectedLinkSelectors = [
    '.navbar-nav a[href="index.html"]',
    '.navbar-nav a[href="market.html"]',
    '.navbar-nav a[href="contact-us.html"]',
    '.navbar-nav a[href="profile.html"]',
    "#servicesDropdown", // The main services dropdown toggle
    '.navbar-nav a[href="recycle-phone.html"]',
    '.navbar-nav a[href="recycle-laptop.html"]',
    '.navbar-nav a[href="recycle-kitchen.html"]',
    '.navbar-nav a[href="recycle-electronics.html"]',
  ];
  const protectedLinks = document.querySelectorAll(
    protectedLinkSelectors.join(", ")
  );

  if (userEmail) {
    // User is logged in
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) userProfile.classList.remove("d-none");
    authRequired.forEach((el) => el.classList.remove("d-none"));

    // Ensure all links are enabled
    protectedLinks.forEach((link) => {
      link.classList.remove("disabled-link");
      link.removeAttribute("aria-disabled");
    });

    // Update user profile information
    const userData = getUserData(userEmail);
    if (userData) {
      const userName = document.querySelector(".user-name");
      const dropdownUserName = document.getElementById("dropdownUserName");
      const dropdownUserEmail = document.getElementById("dropdownUserEmail");

      if (userName) userName.textContent = getUserDisplayName(userData);
      if (dropdownUserName)
        dropdownUserName.textContent = getUserDisplayName(userData);
      if (dropdownUserEmail) dropdownUserEmail.textContent = userEmail;

      updateUserAvatar(userData);

      const pointsDisplay = document.querySelector(".points-display-navbar");
      if (pointsDisplay) {
        const pointsValue = document.getElementById("navbarPoints");
        if (pointsValue)
          pointsValue.textContent = userData.profile?.points || 0;
        if (!pointsDisplay.hasAttribute("data-click-initialized")) {
          pointsDisplay.style.cursor = "pointer";
          pointsDisplay.addEventListener("click", () => {
            window.location.href = "profile.html";
          });
          pointsDisplay.setAttribute("data-click-initialized", "true");
        }
      }
    }
  } else {
    // User is not logged in
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");
    authRequired.forEach((el) => el.classList.add("d-none"));

    // Disable protected links
    protectedLinks.forEach((link) => {
      link.classList.add("disabled-link");
      link.setAttribute("aria-disabled", "true");
    });
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

/**
 * Add demo rewards for testing the market functionality
 */
function addDemoRewards() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Get current user data
    const userData = JSON.parse(
      localStorage.getItem(`userData_${currentUser}`) || "{}"
    );

    // Initialize rewards array if needed
    if (!userData.rewards) {
      userData.rewards = [];
    }

    // Only add demo rewards if user doesn't have any
    if (userData.rewards.length === 0) {
      // If available, use createDemoRewards from data.js
      if (typeof createDemoRewards === "function") {
        userData.rewards = createDemoRewards();
      } else {
        // Default rewards if function not available
        userData.rewards = [
          {
            id: "reward_1",
            type: "voucher",
            value: "100",
            description: "E£100 HyperOne Voucher",
            issueDate: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            expiryDate: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
            used: false,
          },
          {
            id: "reward_2",
            type: "voucher",
            value: "150",
            description: "E£150 HyperOne Voucher",
            issueDate: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            expiryDate: new Date(
              Date.now() + 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            used: false,
          },
        ];
      }

      // Save updated user data
      localStorage.setItem(`userData_${currentUser}`, JSON.stringify(userData));
      console.log("Demo rewards added for", currentUser);
    }
  } catch (error) {
    console.error("Error adding demo rewards:", error);
  }
}
