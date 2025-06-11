// Admin Authentication Functions

// Check if user is logged in as admin
function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isLoggedIn || userRole !== "admin") {
    // Redirect to login page if not logged in as admin
    window.location.href = "login.html";
    return;
  }

  // Update admin info in navbar
  updateAdminInfo();
}

// Update admin information in the navbar
function updateAdminInfo() {
  const userEmail = localStorage.getItem("userEmail");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const adminUser = users[userEmail];

  if (adminUser) {
    const firstName = adminUser.profile?.firstName || "Admin";
    const lastName = adminUser.profile?.lastName || "User";
    const fullName = `${firstName} ${lastName}`;
    const initials = getInitials(adminUser.profile);

    // Update header elements
    document.getElementById("headerAdminName").textContent = firstName;

    // Update settings form if it exists
    const adminFullName = document.getElementById("adminFullName");
    const adminEmail = document.getElementById("adminEmail");

    if (adminFullName) {
      adminFullName.value = fullName;
    }

    if (adminEmail) {
      adminEmail.value = userEmail;
    }
  }
}

// Get user initials for avatar
function getInitials(profile) {
  if (!profile) return "A";

  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  } else if (firstName) {
    return firstName.charAt(0);
  } else {
    return "A";
  }
}

// Setup logout functionality
function setupLogout() {
  // Select all logout buttons by their IDs and any elements with logout data-action
  const logoutBtns = document.querySelectorAll(
    "#adminLogoutBtn, #sidebarLogoutBtn, [data-action='logout']"
  );

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Logout clicked"); // Debug log

      // Clear auth data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("loginTimestamp");

      // Redirect to login page
      window.location.href = "login.html";
    });
  });
}

// Simple password validation helper
function validatePassword(password, hash) {
  return hashPassword(password) === hash;
}

// Simple hash function (for demo purposes only)
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

// Export functions
window.checkAdminAuth = checkAdminAuth;
window.updateAdminInfo = updateAdminInfo;
window.getInitials = getInitials;
window.setupLogout = setupLogout;
window.validatePassword = validatePassword;
window.hashPassword = hashPassword;
