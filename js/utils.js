/**
 * RETECH - Utilities
 * Common utility functions used across the application
 */

// ====================================================
// USER DATA MANAGEMENT
// ====================================================

/**
 * Get user data from local storage
 * @param {string} email - User's email
 * @returns {Object|null} User data or null if not found
 */
function getUserData(email) {
  // First check the users object
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[email];

  if (!user) {
    return null;
  }

  // Then get the user's data
  const userData = JSON.parse(
    localStorage.getItem(`userData_${email}`) || "{}"
  );

  return {
    ...user,
    ...userData,
  };
}

/**
 * Check if a user is logged in and redirect if needed
 * @param {boolean} requireLogin - Whether login is required
 * @param {string} redirectUrl - URL to redirect to if not logged in
 * @returns {boolean} Whether user is logged in
 */
function checkLoginStatus(requireLogin = true, redirectUrl = "login.html") {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (requireLogin && !isLoggedIn) {
    window.location.href = redirectUrl;
    return false;
  }

  if (!requireLogin && isLoggedIn) {
    window.location.href = "index.html";
    return true;
  }

  return isLoggedIn;
}

/**
 * Update user profile in navigation
 */
function updateUserProfileInNav() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  // First check if there's a cached display name for better performance
  const cachedDisplayName = localStorage.getItem(
    `userDisplayName_${userEmail}`
  );
  const userRole = localStorage.getItem("userRole") || "Customer";

  // Get user data for full profile information
  const userData = getUserData(userEmail);
  if (!userData && !cachedDisplayName) return; // No data to display

  // Determine name to display (in order of preference)
  let displayName = "";
  let firstName = "";

  if (cachedDisplayName) {
    // Use cached name for performance
    displayName = cachedDisplayName;
    firstName = localStorage.getItem(`userFirstName_${userEmail}`) || "";
  } else if (userData && userData.profile) {
    // Generate from profile
    firstName = userData.profile.firstName || "";
    const lastName = userData.profile.lastName || "";
    displayName = `${firstName} ${lastName}`.trim() || userEmail.split("@")[0];

    // Cache for future use
    if (displayName) {
      localStorage.setItem(`userDisplayName_${userEmail}`, displayName);
    }
    if (firstName) {
      localStorage.setItem(`userFirstName_${userEmail}`, firstName);
    }
  } else {
    // Fallback to email username
    displayName = userEmail.split("@")[0];
  }

  // Update UI elements
  const userName = document.getElementById("userName");
  if (userName) {
    userName.innerHTML = `
      ${displayName}
      <span class="badge bg-success ms-2">
        ${userRole}
      </span>
    `;
  }

  // Update dropdown header
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserEmail = document.getElementById("dropdownUserEmail");
  if (dropdownUserName) {
    dropdownUserName.textContent = displayName;
  }
  if (dropdownUserEmail) {
    dropdownUserEmail.textContent = userEmail;
  }

  // Get profile image
  let profileImage = null;
  if (userData && userData.profile) {
    profileImage = userData.profile.profileImage;
  }

  // Update profile images in navigation
  const userAvatarSmall = document.querySelector(".user-avatar-small");
  const dropdownAvatar = document.querySelector(".user-dropdown-avatar");

  if (profileImage) {
    const imgHtml = `<img src="${profileImage}" alt="${displayName}" class="rounded-circle" width="24" height="24">`;
    const dropdownImgHtml = `<img src="${profileImage}" alt="${displayName}" class="rounded-circle" width="40" height="40">`;

    if (userAvatarSmall) userAvatarSmall.innerHTML = imgHtml;
    if (dropdownAvatar) dropdownAvatar.innerHTML = dropdownImgHtml;
  } else {
    // Use initials if no image
    const initials = getInitials(firstName, displayName.split(" ")[1] || "");

    // Create initials HTML for both small and large versions
    const initialsHtml = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">${initials}</div>`;
    const dropdownInitialsHtml = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">${initials}</div>`;

    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = initialsHtml;
    }
    if (dropdownAvatar) {
      dropdownAvatar.innerHTML = dropdownInitialsHtml;
    }
  }
}

/**
 * Update user profile data
 * @param {string} email - User email 
 * @param {Object} profileData - Updated profile data
 * @returns {boolean} Success status
 */
function updateUserProfile(email, profileData) {
  // Get existing user data
  const userData = getUserData(email);
  if (!userData) return false;

  // Update profile data
  const updatedUserData = {
    ...userData,
    profile: {
      ...userData.profile,
      ...profileData,
    },
  };

  // Save to local storage
  localStorage.setItem(`userData_${email}`, JSON.stringify(updatedUserData));

  // Clear display name cache to force refresh
  localStorage.removeItem(`userDisplayName_${email}`);
  localStorage.removeItem(`userFirstName_${email}`);

  return true;
}

/**
 * Update user profile image
 * @param {string} email - User email
 * @param {string} imageDataUrl - Image data URL
 * @returns {boolean} Success status
 */
function updateUserProfileImage(email, imageDataUrl) {
  return updateUserProfile(email, { profileImage: imageDataUrl });
}

// ====================================================
// AUTHENTICATION
// ====================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Hash a password (simplified for demo)
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
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
 * Validate password against hash
 * @param {string} password - Password to validate
 * @param {string} hash - Password hash
 * @returns {boolean} Whether password is valid
 */
function validatePassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} Strength details with score and feedback
 */
function checkPasswordStrength(password) {
  // Initialize strength details
  const strength = {
    score: 0,
    feedback: "",
  };

  // Check length
  if (password.length < 8) {
    strength.feedback = "Password is too short";
    return strength;
  } else {
    strength.score += 1;
  }

  // Check for mixed case
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback = "Add both uppercase and lowercase letters";
    return strength;
  }

  // Check for numbers
  if (/\d/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback = "Add at least one number";
    return strength;
  }

  // Check for special characters
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength.score += 1;
  } else {
    strength.feedback = "Add at least one special character";
    return strength;
  }

  // Set feedback based on score
  if (strength.score < 2) {
    strength.feedback = "Password is weak";
  } else if (strength.score < 3) {
    strength.feedback = "Password is moderate";
  } else if (strength.score < 4) {
    strength.feedback = "Password is strong";
  } else {
    strength.feedback = "Password is very strong";
  }

  return strength;
}

/**
 * Log out the current user
 */
function logoutUser() {
  console.log("Performing logout from utils.js");
  
  // Clear all auth-related localStorage
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("adminLoggedIn"); 
  localStorage.removeItem("userRole");
  
  // Show success message
  try {
    showToast("You have been successfully logged out", "success");
  } catch (e) {
    console.error("Error showing toast:", e);
  }
  
  // Redirect to login page after a short delay
  setTimeout(() => {
    try {
      // Determine the correct login path based on current location
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

// ====================================================
// UI UTILITIES
// ====================================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (info, success, warning, danger)
 */
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Set the toast type class
  const bgClass = `bg-${type === "danger" ? "danger" : type === "warning" ? "warning" : type === "success" ? "success" : "info"}`;
  const textClass = type === "warning" ? "text-dark" : "text-white";

  // Create a unique ID for this toast
  const toastId = `toast-${Date.now()}`;

  // Create the toast HTML
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} ${textClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Add the toast to the container
  toastContainer.insertAdjacentHTML("beforeend", toastHtml);

  // Initialize the toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000
  });

  // Show the toast
  toast.show();

  // Remove the element after it's hidden
  toastElement.addEventListener("hidden.bs.toast", function () {
    toastElement.remove();
  });
}

/**
 * Get user initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} User initials
 */
function getInitials(firstName, lastName) {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return firstInitial + lastInitial || "U";
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Get appropriate badge class based on status
 * @param {string} status - Status value
 * @returns {string} Bootstrap badge class
 */
function getBadgeClassByStatus(status) {
  if (!status) return "bg-secondary";

  status = status.toLowerCase();

  switch (status) {
    case "completed":
    case "approved":
    case "active":
    case "success":
      return "bg-success";
    
    case "pending":
    case "in progress":
    case "processing":
      return "bg-primary";
    
    case "rejected":
    case "failed":
    case "error":
      return "bg-danger";
    
    case "waiting":
    case "hold":
    case "on hold":
      return "bg-warning text-dark";
    
    case "new":
    case "info":
      return "bg-info text-dark";
    
    default:
      return "bg-secondary";
  }
}

// ====================================================
// HELPER FUNCTIONS
// ====================================================

/**
 * Generate a unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function generateUniqueId(prefix = "ID") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize demo data if needed
 */
function loadDemoDataIfNeeded() {
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
      createdAt: new Date().toISOString()
    };
  }
  
  // Add demo user if not exists
  if (!users["user@example.com"]) {
    users["user@example.com"] = {
      email: "user@example.com",
      passwordHash: hashPassword("User@123"),
      role: "customer",
      createdAt: new Date().toISOString()
    };
    
    // Add user profile data
    const userData = {
      profile: {
        firstName: "Demo",
        lastName: "User",
        phone: "555-123-4567",
        address: "123 Example St, Demo City",
        points: 2500
      },
      recycleHistory: [
        {
          id: "REC_001",
          type: "Laptop",
          brand: "Dell",
          model: "XPS 15",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Completed",
          points: 500
        },
        {
          id: "REC_002",
          type: "Smartphone",
          brand: "Samsung",
          model: "Galaxy S10",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Completed",
          points: 300
        }
      ]
    };
    
    localStorage.setItem(`userData_user@example.com`, JSON.stringify(userData));
  }
  
  // Save users to localStorage
  localStorage.setItem("users", JSON.stringify(users));
  
  // Set demo data loaded flag
  localStorage.setItem("demoDataLoaded", "true");
}

// ====================================================
// INITIALIZE DEMO DATA
// ====================================================

// Automatically load demo data when the script runs
loadDemoDataIfNeeded();
