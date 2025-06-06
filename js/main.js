/**
 * RETECH - Main JavaScript
 * Global utility functions and performance monitoring
 */

// ====================================================
// PERFORMANCE MONITORING
// ====================================================

const performanceMonitor = {
  timers: {},

  // Start timing an operation
  startTiming: function (operation) {
    this.timers[operation] = performance.now();
  },

  // End timing and log duration
  endTiming: function (operation) {
    if (!this.timers[operation]) return;

    const duration = performance.now() - this.timers[operation];

    // Only log in development environment
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      console.log(`${operation} took ${duration.toFixed(2)}ms`);
    }

    // Store for analytics if needed
    this.recordMetric(operation, duration);

    delete this.timers[operation];
    return duration;
  },

  // Record metric for potential analytics
  recordMetric: function (operation, duration) {
    // Could send to analytics service in production
    if (
      window.analyticsService &&
      typeof window.analyticsService.recordTiming === "function"
    ) {
      window.analyticsService.recordTiming(operation, duration);
    }
  },
};

// ====================================================
// EVENT LISTENERS
// ====================================================

// Start timing page load when DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
  performanceMonitor.startTiming("pageLoad");

  // Initialize Bootstrap tooltips if available
  initializeBootstrapComponents();

  // Load demo data if needed and ensure user data is saved
  loadDemoDataIfNeeded();
  saveUserDataToLocalStorage();

  // Handle page routing and redirection
  handlePageRouting();

  // Check login status and update navbar (using the same approach as about-us.js)
  // This will be the ONLY function to handle navbar profile state
  checkLoginStatusAndUpdateNavbar();

  // Initialize page-specific functionality
  initializePageFunctionality();

  // Skip initialization of navbar state since checkLoginStatusAndUpdateNavbar handles it
  // initializeNavbarState();

  // Enhance navbar functionality
  enhanceNavbar();

  // Setup points display navigation
  setupPointsDisplayNavigation();

  // No need for separate points display initialization
  // setTimeout(initializePointsDisplay, 100);
});

// End timing when page is fully loaded
window.addEventListener("load", function () {
  performanceMonitor.endTiming("pageLoad");

  // Optimize images after page load to avoid blocking rendering
  setTimeout(optimizeImages, 100);
});

// ====================================================
// INITIALIZATION FUNCTIONS
// ====================================================

/**
 * Initialize Bootstrap components
 */
function initializeBootstrapComponents() {
  // Initialize Bootstrap tooltips if available
  if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}

/**
 * Handle page routing and redirection
 */
function handlePageRouting() {
  // Check if we're in a redirect loop
  const redirectAttempt = sessionStorage.getItem("redirectAttempt");
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop();

  console.log("Current page path:", currentPath, "Current page:", currentPage);

  // If we've already attempted a redirect to this page, don't try again
  if (redirectAttempt === currentPage) {
    console.log("Detected potential redirect loop, stabilizing page");
    sessionStorage.removeItem("redirectAttempt");
    return;
  }

  // Identify page types - check for both html/login.html and login.html paths
  const isLoginPage = currentPage === "login.html";
  const isSignupPage = currentPage === "signup.html";
  const isIndexPage = currentPage === "index.html" || currentPath.endsWith("/");
  const isAboutUsPage = currentPage === "about-us.html";

  // Get login state
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");

  console.log("Login state:", {
    isLoggedIn,
    userEmail,
    currentPage,
    isLoginPage,
    isSignupPage,
    isAboutUsPage,
  });

  // Handle login page specifically
  if (isLoginPage) {
    // If user is already logged in, redirect to home page
    if (isLoggedIn) {
      console.log("User already logged in, redirecting from login page");
      sessionStorage.setItem("redirectAttempt", "index.html");
      window.location.replace("../index.html");
      return;
    }
    // If not logged in, allow access to login page
    return;
  }

  // Handle signup page - always allow access
  if (isSignupPage) {
    console.log("On signup page, allowing access");
    return;
  }

  // Handle about-us page - always allow access
  if (isAboutUsPage) {
    console.log("On about-us page, allowing access");
    return;
  }

  // For all other pages, if user is not logged in, redirect to login
  if (!isLoggedIn && !isIndexPage && !isSignupPage && !isAboutUsPage) {
    console.log("User not logged in, redirecting to login page");

    // Determine if we're in the html directory or root
    const inHtmlDir = currentPath.includes("/html/");
    const loginPath = inHtmlDir ? "login.html" : "html/login.html";

    sessionStorage.setItem("redirectAttempt", "login.html");
    window.location.replace(loginPath);
    return;
  }
}

// ====================================================
// PERFORMANCE & OPTIMIZATION
// ====================================================

/**
 * Add lazy loading to images that don't already have it
 */
function optimizeImages() {
  performanceMonitor.startTiming("imageOptimization");

  const images = document.querySelectorAll("img:not([loading])");
  let optimizedCount = 0;

  images.forEach((img) => {
    // Skip small images or those already in viewport
    if (isInViewport(img)) return;

    // Add lazy loading
    img.setAttribute("loading", "lazy");
    optimizedCount++;
  });

  performanceMonitor.endTiming("imageOptimization");
  return optimizedCount;
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Check browser support for modern features
 */
function checkBrowserSupport() {
  const supportData = {
    webp: false,
    avif: false,
    intersectionObserver: "IntersectionObserver" in window,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
  };

  // Check WebP support
  testWebP(function (hasWebP) {
    supportData.webp = hasWebP;
  });

  // For demo purposes, log the support data
  console.log("Browser support:", supportData);

  return supportData;
}

/**
 * Test for WebP support
 */
function testWebP(callback) {
  const webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height === 2);
  };
  webP.src =
    "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

// ====================================================
// NAVIGATION & UI
// ====================================================

/**
 * Enhance navbar with additional functionality
 */
function enhanceNavbar() {
  // Set active nav link
  setActiveNavLink();

  // Add scroll effect
  addNavbarScrollEffect();

  // Add dropdown hover effect for desktop
  addDropdownHoverEffect();

  // Animate navbar items
  animateNavbarItems();
}

/**
 * Set the active navigation link based on current page
 */
function setActiveNavLink() {
  // Get current page
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  // Find navigation links
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Reset all active states
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // Set active state for current page
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    const linkPage = href.split("/").pop();

    // Check exact match first
    if (linkPage === currentPage) {
      link.classList.add("active");

      // Also add active class to parent if in dropdown
      const dropdownParent = link.closest(".nav-item.dropdown");
      if (dropdownParent) {
        const parentLink = dropdownParent.querySelector(".nav-link");
        if (parentLink) {
          parentLink.classList.add("active");
        }
      }
      return;
    }

    // Check for index special case
    if (currentPage === "" && linkPage === "index.html") {
      link.classList.add("active");
      return;
    }

    // Check for section links on same page
    if (
      currentPage === linkPage &&
      href.includes("#") &&
      window.location.hash
    ) {
      const linkHash = href.split("#")[1];
      const pageHash = window.location.hash.substring(1);

      if (linkHash === pageHash) {
        link.classList.add("active");
      }
    }
  });
}

/**
 * Add scroll effect to navbar
 */
function addNavbarScrollEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });
}

/**
 * Add dropdown hover effect for desktop
 */
function addDropdownHoverEffect() {
  const dropdowns = document.querySelectorAll(".navbar-nav .dropdown");

  // Check if we're on desktop
  const isDesktop = window.innerWidth >= 992;

  if (isDesktop) {
    dropdowns.forEach((dropdown) => {
      // Add hover event listeners for desktop
      dropdown.addEventListener("mouseenter", function () {
        if (window.innerWidth >= 992) {
          const dropdownMenu = this.querySelector(".dropdown-menu");
          if (dropdownMenu) {
            dropdownMenu.classList.add("show");
          }
        }
      });

      dropdown.addEventListener("mouseleave", function () {
        if (window.innerWidth >= 992) {
          const dropdownMenu = this.querySelector(".dropdown-menu");
          if (dropdownMenu) {
            dropdownMenu.classList.remove("show");
          }
        }
      });
    });
  }
}

/**
 * Animate navbar items on page load
 */
function animateNavbarItems() {
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");

  navItems.forEach((item, index) => {
    // Add animation delay based on index
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add("animate-fade-in");

    // Remove animation class after animation completes
    setTimeout(() => {
      item.classList.remove("animate-fade-in");
      item.style.animationDelay = "";
    }, 1000 + index * 100);
  });
}

/**
 * Update navigation based on login state
 */
function updateNavigation() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole") || "customer";

  console.log(
    "Updating navigation. Login state:",
    isLoggedIn,
    "Email:",
    userEmail
  );

  // Get auth-related elements
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const authRequiredElements = document.querySelectorAll(".auth-required");

  // Toggle authentication elements based on login state
  if (authButtons && userProfile) {
    if (isLoggedIn) {
      authButtons.classList.add("d-none");
      userProfile.classList.remove("d-none");

      // Update user avatar and name - with retry mechanism
      try {
        updateUserInfo(userEmail);
      } catch (e) {
        console.error("Error updating user info:", e);
        // Try again after a short delay
        setTimeout(() => {
          try {
            updateUserInfo(userEmail);
          } catch (error) {
            console.error("Error in retry updating user info:", error);
          }
        }, 500);
      }
    } else {
      authButtons.classList.remove("d-none");
      userProfile.classList.add("d-none");
    }
  }

  // Toggle auth-required elements
  authRequiredElements.forEach((element) => {
    if (isLoggedIn) {
      element.classList.remove("d-none");
    } else {
      element.classList.add("d-none");
    }
  });

  // Show admin-only elements if user is admin
  const adminElements = document.querySelectorAll(".admin-only");
  adminElements.forEach((element) => {
    if (isLoggedIn && userRole === "admin") {
      element.classList.remove("d-none");
    } else {
      element.classList.add("d-none");
    }
  });

  // Handle mobile menu adjustments
  const mobileMenuItems = document.querySelectorAll(".mobile-menu-item");
  mobileMenuItems.forEach((item) => {
    const requiredAuth = item.classList.contains("auth-required");
    const adminOnly = item.classList.contains("admin-only");

    if ((requiredAuth && !isLoggedIn) || (adminOnly && userRole !== "admin")) {
      item.classList.add("d-none");
    } else {
      item.classList.remove("d-none");
    }
  });

  // Setup logout handlers
  if (isLoggedIn) {
    setupLogoutHandler();
  }
}

/**
 * Update user information in navigation
 */
function updateUserInfo(email) {
  if (!email) return;

  // Get both users object and user-specific data
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const userSpecificData = JSON.parse(
    localStorage.getItem(`userData_${email}`) || "{}"
  );

  // Merge the user data
  const userData = {
    ...users[email],
    ...userSpecificData,
  };

  if (!userData) return;

  // Update display name
  const userName = document.querySelector(".user-name");
  const userDropdownName = document.getElementById("dropdownUserName");
  const userDropdownEmail = document.getElementById("dropdownUserEmail");

  // Get display name from localStorage or user data
  let displayName = localStorage.getItem(`userDisplayName_${email}`);

  if (!displayName && userData.profile) {
    const firstName = userData.profile.firstName || "";
    const lastName = userData.profile.lastName || "";
    displayName = `${firstName} ${lastName}`.trim();

    if (!displayName) {
      displayName = email.split("@")[0];
    }

    // Cache the display name
    localStorage.setItem(`userDisplayName_${email}`, displayName);
    if (firstName) {
      localStorage.setItem(`userFirstName_${email}`, firstName);
    }
  } else if (!displayName) {
    displayName = email.split("@")[0];
  }

  const userRole = localStorage.getItem("userRole") || "customer";

  // Update UI elements
  if (userName) {
    userName.innerHTML = displayName;
  }

  if (userDropdownName) {
    userDropdownName.textContent = displayName;
  }

  if (userDropdownEmail) {
    userDropdownEmail.textContent = email;
  }

  // Update avatar
  updateUserAvatar(email, userData);
}

/**
 * Update user avatar in navigation
 */
function updateUserAvatar(email, userData) {
  // Get avatar containers
  const userAvatarSmall = document.querySelector(".user-avatar-small");
  const userAvatarLarge = document.querySelector(".user-dropdown-avatar");

  if (!userAvatarSmall && !userAvatarLarge) return;

  // Check if user has a profile image
  let profileImage = null;

  if (userData && userData.profile && userData.profile.profileImage) {
    profileImage = userData.profile.profileImage;
  }

  // Get the user's first and last name
  let firstName = "";
  let lastName = "";

  if (userData && userData.profile) {
    firstName = userData.profile.firstName || "";
    lastName = userData.profile.lastName || "";
  }

  // Get cached names if available
  if (!firstName) {
    firstName = localStorage.getItem(`userFirstName_${email}`) || "";
  }

  // Generate initials based on available information
  const initials = getInitials(firstName, lastName);

  if (profileImage) {
    // User has an image, use it
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<img src="${profileImage}" alt="Profile" class="rounded-circle" width="24" height="24">`;
    }

    if (userAvatarLarge) {
      userAvatarLarge.innerHTML = `<img src="${profileImage}" alt="Profile" class="rounded-circle" width="40" height="40">`;
    }
  } else {
    // No image, use initials
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 12px;">
          ${initials}
        </div>
      `;
    }

    if (userAvatarLarge) {
      userAvatarLarge.innerHTML = `
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 18px;">
          ${initials}
        </div>
      `;
    }
  }
}

/**
 * Get initials from name
 */
function getInitials(firstName, lastName) {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

  return firstInitial + lastInitial || "U";
}

// ====================================================
// PAGE FUNCTIONALITY
// ====================================================

/**
 * Initialize page-specific functionality
 */
function initializePageFunctionality() {
  // Determine current page
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  console.log("Initializing page functionality for:", currentPage);

  // Initialize based on page type
  if (currentPage === "index.html" || currentPath.endsWith("/")) {
    initializeHomePage();
  } else if (currentPage === "profile.html") {
    initializeProfilePage();
  }

  // Set up logout handler
  setupLogoutHandler();
}

/**
 * Setup logout handler
 */
function setupLogoutHandler() {
  // Find all logout links
  const logoutLinks = document.querySelectorAll('[data-action="logout"]');

  if (logoutLinks.length === 0) {
    console.warn("No logout links found in page");
    return;
  }

  console.log(`Found ${logoutLinks.length} logout links`);

  logoutLinks.forEach((link) => {
    // Remove any existing listeners to prevent duplicates
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);

    // Add click event listener
    newLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Logout link clicked");
      handleLogout();
    });
  });
}

/**
 * Handle logout process
 */
function handleLogout() {
  console.log("Handling logout");

  // Check if we need to confirm logout
  const confirmLogout = true; // Could be a setting

  if (confirmLogout) {
    // Create the modal if it doesn't exist
    createLogoutConfirmationModal();

    // Show the modal
    const logoutModal = new bootstrap.Modal(
      document.getElementById("logoutConfirmModal")
    );
    logoutModal.show();
  } else {
    // Perform the logout without confirmation
    performLogout();
  }
}

/**
 * Perform the actual logout
 */
function performLogout() {
  console.log("Performing logout");

  // Clear auth-related data
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("userRole");

  // Optional: Show a message
  try {
    showToast("You have been successfully logged out", "success");
  } catch (e) {
    console.error("Error showing toast:", e);
  }

  // Redirect to login page after a short delay
  setTimeout(() => {
    try {
      // Determine the correct login path
      const currentPath = window.location.pathname;
      const inHtmlDir = currentPath.includes("/html/");
      const loginPath = inHtmlDir ? "login.html" : "html/login.html";

      // Navigate to login page
      window.location.href = loginPath;
    } catch (e) {
      console.error("Error redirecting:", e);
      // Fallback redirect
      window.location.href = "/html/login.html";
    }
  }, 1000);
}

/**
 * Initialize home page functionality
 */
function initializeHomePage() {
  console.log("Initializing home page");
  // Home page specific initialization
}

/**
 * Initialize profile page functionality
 */
function initializeProfilePage() {
  console.log("Initializing profile page");
  // Profile page specific initialization
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  // Use improved notification system if available
  if (typeof showNotification === "function") {
    showNotification(message, type);
    return;
  }

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

/**
 * Format date string
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Generate unique ID
 */
function generateUniqueId(prefix = "ID") {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

// ====================================================
// USER DATA MANAGEMENT
// ====================================================

/**
 * Initialize user data
 */
function initializeUserData() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");

  if (!isLoggedIn || !userEmail) return;

  // Get users data
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[userEmail];

  if (!user) return;

  // Get user-specific data
  const userSpecificData = JSON.parse(
    localStorage.getItem(`userData_${userEmail}`) || "{}"
  );

  // Merge the data
  const mergedData = {
    ...user,
    ...userSpecificData,
  };

  // Store in session for quick access
  sessionStorage.setItem("currentUser", JSON.stringify(mergedData));

  // For admin users, load admin-specific data
  if (user.role === "admin") {
    loadAdminData();
  }
}

/**
 * Creates the logout confirmation modal if it doesn't already exist
 */
function createLogoutConfirmationModal() {
  // Check if modal already exists
  if (document.getElementById("logoutConfirmModal")) {
    return;
  }

  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="logoutConfirmModal" tabindex="-1" aria-labelledby="logoutConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header text-white" style="background: linear-gradient(135deg, #4361ee, #4895ef);">
            <h5 class="modal-title" id="logoutConfirmModalLabel">
              <i class="fas fa-sign-out-alt me-2"></i>Confirm Logout
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <div class="mb-4 logout-icon-wrapper">
              <i class="fas fa-exclamation-circle text-warning pulse" style="font-size: 3.5rem;"></i>
            </div>
            <h5 class="mb-3">Are you sure you want to log out?</h5>
            <p class="text-muted mb-0">You will need to login again to access your account.</p>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cancel
            </button>
            <button type="button" class="btn logout-confirm-btn" id="confirmLogoutBtn">
              <i class="fas fa-sign-out-alt me-1"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Add Font Awesome if not already included
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.rel = "stylesheet";
    fontAwesomeLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    document.head.appendChild(fontAwesomeLink);
  }

  // Add custom styles to make the modal more attractive
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    #logoutConfirmModal .modal-content {
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    #logoutConfirmModal .modal-header {
      border-bottom: none;
    }
    #logoutConfirmModal .modal-footer {
      border-top: none;
    }
    #logoutConfirmModal .btn {
      border-radius: 0.5rem;
      padding: 0.5rem 1.5rem;
      transition: all 0.2s;
    }
    #logoutConfirmModal .logout-confirm-btn {
      background: linear-gradient(135deg, #4361ee, #4895ef);
      color: white;
      box-shadow: 0 2px 5px rgba(67, 97, 238, 0.3);
    }
    #logoutConfirmModal .logout-confirm-btn:hover {
      background: linear-gradient(135deg, #3a56e2, #3d8de9);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(67, 97, 238, 0.4);
    }
    #logoutConfirmModal.fade .modal-dialog {
      transition: transform 0.3s ease-out;
    }
    #logoutConfirmModal.show .modal-dialog {
      transform: none;
    }
    #logoutConfirmModal .fas.fa-exclamation-circle {
      color: #f72585;
      animation: pulse 1.5s infinite;
    }
    #logoutConfirmModal .logout-icon-wrapper {
      position: relative;
      display: inline-block;
    }
    #logoutConfirmModal .logout-icon-wrapper:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
      animation: shimmer 2s infinite;
      transform: skewX(-15deg);
    }
    @keyframes shimmer {
      0% { transform: translateX(-150%) skewX(-15deg); }
      100% { transform: translateX(150%) skewX(-15deg); }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(styleElement);

  // Add event listener to confirm button
  document
    .getElementById("confirmLogoutBtn")
    .addEventListener("click", function () {
      // Add click animation
      this.classList.add("clicked");

      // Hide modal
      const logoutModal = bootstrap.Modal.getInstance(
        document.getElementById("logoutConfirmModal")
      );
      logoutModal.hide();

      // Perform logout with slight delay for animation
      setTimeout(performLogout, 150);
    });
}

/**
 * Load demo data if needed
 */
function loadDemoDataIfNeeded() {
  // Use utility function if available
  if (typeof window.loadDemoDataIfNeeded === "function") {
    window.loadDemoDataIfNeeded();
    return;
  }

  // Check if demo data already loaded
  if (localStorage.getItem("demoDataLoaded")) return;

  // Create demo users if they don't exist
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  // Add demo admin if not exists
  if (!users["admin@retech.com"]) {
    users["admin@retech.com"] = {
      email: "admin@retech.com",
      passwordHash: hashPassword("Admin@123"),
      role: "admin",
      createdAt: new Date().toISOString(),
    };
  }

  // Add demo user if not exists
  if (!users["user@example.com"]) {
    users["user@example.com"] = {
      email: "user@example.com",
      passwordHash: hashPassword("User@123"),
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    // Add user profile data
    const userData = {
      profile: {
        firstName: "Demo",
        lastName: "User",
        phone: "555-123-4567",
        address: "123 Example St, Demo City",
        points: 2500,
      },
      recycleHistory: [
        {
          id: "REC_001",
          type: "Laptop",
          brand: "Dell",
          model: "XPS 15",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Completed",
          points: 500,
        },
        {
          id: "REC_002",
          type: "Smartphone",
          brand: "Samsung",
          model: "Galaxy S10",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Completed",
          points: 300,
        },
      ],
    };

    localStorage.setItem(`userData_user@example.com`, JSON.stringify(userData));
  }

  // Save users to localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Set demo data loaded flag
  localStorage.setItem("demoDataLoaded", "true");
}

/**
 * Helper function to hash passwords
 */
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

/**
 * Save user data to local storage
 */
function saveUserDataToLocalStorage() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");

  if (!isLoggedIn || !userEmail) return;

  // Check if need to create user data
  let userData = JSON.parse(
    localStorage.getItem(`userData_${userEmail}`) || "{}"
  );
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  // Return if no user found
  if (!users[userEmail]) return;

  // Initialize user data structure if needed
  if (!userData.profile) {
    userData.profile = {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      points: 0,
    };
  }

  if (!userData.recycleHistory) {
    userData.recycleHistory = [];
  }

  if (!userData.orders) {
    userData.orders = [];
  }

  if (!userData.rewards) {
    userData.rewards = [];
  }

  // Save back to localStorage
  localStorage.setItem(`userData_${userEmail}`, JSON.stringify(userData));
}

// ====================================================
// NAVBAR STATE MANAGEMENT
// ====================================================

/**
 * Initialize navbar state
 */
function initializeNavbarState() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");

  // Get the navbar elements
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");

  if (!authButtons || !userProfile) {
    console.warn("Navbar elements not found");
    return;
  }

  if (isLoggedIn && userEmail) {
    // User is logged in, show profile
    authButtons.classList.add("d-none");
    userProfile.classList.remove("d-none");

    // Update user information in navbar
    updateUserProfileInNavbar(userEmail);
  } else {
    // User is not logged in, show auth buttons
    authButtons.classList.remove("d-none");
    userProfile.classList.add("d-none");
  }
}

/**
 * Update user profile in navbar
 */
function updateUserProfileInNavbar(email) {
  if (!email) return;

  // Determine if we should use utils.js function
  if (typeof window.updateUserProfileInNav === "function") {
    window.updateUserProfileInNav();
    return;
  }

  // Get user data
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const userData = JSON.parse(
    localStorage.getItem(`userData_${email}`) || "{}"
  );

  // Combine the data
  const user = { ...users[email], ...userData };

  if (!user) return;

  // Get user name elements
  const userNameElement = document.getElementById("dropdownUserName");
  const userEmailElement = document.getElementById("dropdownUserEmail");

  // Get user avatar elements
  const userAvatarSmall = document.querySelector(".user-avatar-small");
  const userDropdownAvatar = document.querySelector(".user-dropdown-avatar");

  // First check if there's a cached name
  let displayName = localStorage.getItem(`userDisplayName_${email}`);
  const firstName =
    localStorage.getItem(`userFirstName_${email}`) ||
    (user.profile ? user.profile.firstName : "") ||
    "";
  const lastName = (user.profile ? user.profile.lastName : "") || "";

  // Create display name if needed
  if (!displayName) {
    if (firstName || lastName) {
      displayName = `${firstName} ${lastName}`.trim();
    } else {
      displayName = email.split("@")[0];
    }

    // Cache the display name
    localStorage.setItem(`userDisplayName_${email}`, displayName);
  }

  // Update user name
  if (userNameElement) {
    userNameElement.textContent = displayName;
  }

  // Update user email
  if (userEmailElement) {
    userEmailElement.textContent = email;
  }

  // Update avatars
  const profileImage = user.profile ? user.profile.profileImage : null;
  const initials = getInitials(firstName, lastName);

  if (profileImage) {
    // Use profile image
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<img src="${profileImage}" alt="${displayName}" class="rounded-circle" width="24" height="24">`;
    }

    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `<img src="${profileImage}" alt="${displayName}" class="rounded-circle" width="40" height="40">`;
    }
  } else {
    // Use initials
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">
          ${initials}
        </div>
      `;
    }

    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          ${initials}
        </div>
      `;
    }
  }
}

/**
 * Setup points display navigation
 */
function setupPointsDisplayNavigation() {
  // Add points refresh functionality
  const pointsDisplay = document.getElementById("navbarPoints");
  if (pointsDisplay) {
    // Get user email
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    // Update points display periodically using our synchronized function
    setInterval(() => {
      if (localStorage.getItem("isLoggedIn") === "true") {
        updatePointsDisplay(userEmail);
      }
    }, 60000); // Every minute
  }
}

/**
 * Initialize points display
 */
function initializePointsDisplay() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userEmail = localStorage.getItem("userEmail");

  if (!isLoggedIn || !userEmail) return;

  // Get points display element
  const pointsDisplay = document.getElementById("navbarPoints");
  if (!pointsDisplay) return;

  // Get user data
  const userData = JSON.parse(
    localStorage.getItem(`userData_${userEmail}`) || "{}"
  );
  const points =
    userData.profile && userData.profile.points ? userData.profile.points : 0;

  // Update points display
  pointsDisplay.textContent = points.toLocaleString();

  // Show points display
  const pointsContainer = document.querySelector(".points-display-navbar");
  if (pointsContainer) {
    pointsContainer.classList.remove("d-none");
  }
}

/**
 * Check login status and update navbar (synchronized with about-us.js)
 */
function checkLoginStatusAndUpdateNavbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const pointsDisplay = document.querySelector(".points-display-navbar");

  console.log("Home page: Checking login status:", isLoggedIn);

  if (isLoggedIn) {
    // User is logged in - hide auth buttons, show profile
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) userProfile.classList.remove("d-none");

    // Show points display
    if (pointsDisplay) {
      pointsDisplay.classList.remove("d-none");
      pointsDisplay.style.display = "block";
    }

    // Get user data and update profile
    const userEmail = localStorage.getItem("userEmail");

    // Update user info directly with our own implementation (don't rely on other functions)
    updateUserInfoInNavbar(userEmail);

    // Update points display
    updatePointsDisplay(userEmail);

    // Set up logout handlers
    setupLogoutHandler();
  } else {
    // User is not logged in - show auth buttons, hide profile
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");

    // Hide points display
    if (pointsDisplay) {
      pointsDisplay.classList.add("d-none");
    }
  }
}

/**
 * Update user information in navbar (synchronized with about-us.js)
 */
function updateUserInfoInNavbar(email) {
  if (!email) return;

  // Get user data
  let userData = null;

  // Try to get from users object
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  userData = users[email];

  // Also check userData_{email} format
  const userDataById = JSON.parse(
    localStorage.getItem(`userData_${email}`) || "{}"
  );

  if (userDataById) {
    userData = { ...userData, ...userDataById };
  }

  if (!userData) return;

  // Get profile data
  const profile = userData.profile || {};
  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];

  // Update user name elements
  const userName = document.querySelector(".user-name");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserEmail = document.getElementById("dropdownUserEmail");

  if (userName) userName.textContent = fullName;
  if (dropdownUserName) dropdownUserName.textContent = fullName;
  if (dropdownUserEmail) dropdownUserEmail.textContent = email;

  // Get user initials or profile image
  const profileImage = profile.profileImage;
  const userAvatarSmall = document.querySelector(".user-avatar-small");
  const userDropdownAvatar = document.querySelector(".user-dropdown-avatar");

  if (profileImage) {
    // If user has a profile image
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<img src="${profileImage}" alt="${fullName}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">`;
    }
    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `<img src="${profileImage}" alt="${fullName}" class="rounded-circle" style="width: 48px; height: 48px; object-fit: cover;">`;
    }
  } else {
    // If no profile image, show initials
    const initials = getInitials(firstName, lastName);
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 14px;">${initials}</div>`;
    }
    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 18px;">${initials}</div>`;
    }
  }
}

/**
 * Update points display in navbar (synchronized with about-us.js)
 */
function updatePointsDisplay(email) {
  if (!email) return;

  const pointsDisplay = document.querySelector(".points-display-navbar");
  const pointsValue = document.getElementById("navbarPoints");

  if (!pointsDisplay || !pointsValue) return;

  try {
    // Try to get user data from localStorage
    let userData = null;

    // Try user-specific data first
    userData = JSON.parse(localStorage.getItem(`userData_${email}`) || "{}");

    // If no user-specific data, try users object
    if (Object.keys(userData).length === 0) {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      userData = users[email] || {};
    }

    // Update points value if user data exists
    if (userData && userData.profile) {
      pointsValue.textContent = userData.profile.points || 0;
    }

    // Make sure points display is visible
    pointsDisplay.classList.remove("d-none");
    pointsDisplay.style.display = "block";

    // Make points display clickable
    if (!pointsDisplay.hasAttribute("data-click-initialized")) {
      pointsDisplay.style.cursor = "pointer";
      pointsDisplay.addEventListener("click", function () {
        window.location.href = "profile.html";
      });
      pointsDisplay.setAttribute("data-click-initialized", "true");
    }
  } catch (error) {
    console.error("Error updating points display:", error);
  }
}
