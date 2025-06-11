document.addEventListener("DOMContentLoaded", function () {
  initializeCompanyProfile();
});

function initializeCompanyProfile() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    window.location.href = "../login.html";
    return;
  }

  // Update last login time
  const users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[userEmail]) {
    users[userEmail].lastLogin = new Date().toISOString();
    localStorage.setItem("users", JSON.stringify(users));
  }

  loadProfileData();
  setupEventListeners();
}

function loadProfileData() {
  const userEmail = localStorage.getItem("userEmail");
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const companyData = users[userEmail];

  if (companyData) {
    // Update profile information on the main page
    document.getElementById("profileCompanyName").textContent =
      companyData.profile?.company || "N/A";
    document.getElementById("profileCompanyEmail").textContent =
      companyData.email || "N/A";
    document.getElementById("profileCompanyPhone").textContent =
      companyData.profile?.phone || "N/A";
    document.getElementById("profileCompanyAddress").textContent =
      companyData.profile?.address || "N/A";

    // Update Company Overview section
    // Format and display joined date
    const joinedDate = new Date(companyData.createDate || new Date());
    const formattedJoinedDate = joinedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    document.getElementById("memberSinceValue").textContent =
      formattedJoinedDate;

    // Last login
    const lastLogin = companyData.lastLogin
      ? new Date(companyData.lastLogin).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Today";
    document.getElementById("lastLoginValue").textContent = lastLogin;

    // Update form fields in the edit modal
    document.getElementById("companyNameInput").value =
      companyData.profile?.company || "";
    document.getElementById("companyPhoneInput").value =
      companyData.profile?.phone || "";
    document.getElementById("companyAddressInput").value =
      companyData.profile?.address || "";

    // Update company name in navbar and dropdown
    updateCompanyNav(companyData.profile?.company);
  }
}

function setupEventListeners() {
  const saveProfileBtn = document.getElementById("saveProfileChanges");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", saveProfile);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("userEmail");
      window.location.href = "../login.html";
    });
  }

  const editModal = document.getElementById("editProfileModal");
  if (editModal) {
    editModal.addEventListener("hidden.bs.modal", function () {
      const form = document.getElementById("companyProfileForm");
      form
        .querySelectorAll(".is-invalid")
        .forEach((el) => el.classList.remove("is-invalid"));
    });
  }

  // Set up reset password modal
  const resetPasswordBtn = document.getElementById("savePasswordChanges");
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener("click", resetPassword);
  }

  const resetPasswordModal = document.getElementById("resetPasswordModal");
  if (resetPasswordModal) {
    resetPasswordModal.addEventListener("hidden.bs.modal", function () {
      const form = document.getElementById("resetPasswordForm");
      form
        .querySelectorAll(".is-invalid")
        .forEach((el) => el.classList.remove("is-invalid"));
      form.reset();
    });
  }
}

function saveProfile() {
  const form = document.getElementById("companyProfileForm");
  const companyNameInput = document.getElementById("companyNameInput");
  const phoneInput = document.getElementById("companyPhoneInput");
  const addressInput = document.getElementById("companyAddressInput");

  const companyName = companyNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  // Reset validation state
  form
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  let isValid = true;

  if (!companyName) {
    companyNameInput.classList.add("is-invalid");
    isValid = false;
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
  if (!phone || !phoneRegex.test(phone)) {
    phoneInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!address) {
    addressInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!isValid) {
    showPrettyAlert(
      "Please correct the highlighted fields and try again.",
      "warning"
    );
    return;
  }

  try {
    const userEmail = localStorage.getItem("userEmail");
    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[userEmail]) {
      // Initialize profile object if it doesn't exist
      if (!users[userEmail].profile) {
        users[userEmail].profile = {};
      }

      // Update user data
      users[userEmail].profile.company = companyName;
      users[userEmail].profile.phone = phone;
      users[userEmail].profile.address = address;

      // Record last login/update time
      users[userEmail].lastLogin = new Date().toISOString();

      // If this is a new user without a creation date, set it
      if (!users[userEmail].createDate) {
        users[userEmail].createDate = new Date().toISOString();
      }

      // Save updated user data
      localStorage.setItem("users", JSON.stringify(users));

      // Close the modal
      const modalElement = document.getElementById("editProfileModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Reload profile data
      loadProfileData();

      // Show success message - try toast first, fall back to alert
      const toastElement = document.getElementById("notificationToast");
      if (toastElement) {
        const titleElement = document.getElementById("toastTitle");
        const messageElement = document.getElementById("toastMessage");

        if (titleElement && messageElement) {
          titleElement.textContent = "Success";
          messageElement.textContent = "Profile updated successfully";

          const toast = new bootstrap.Toast(toastElement);
          toast.show();
        } else {
          // Fall back to pretty alert if toast elements are missing
          showPrettyAlert("Profile updated successfully!", "success");
        }
      } else {
        // Fall back to pretty alert if toast is missing
        showPrettyAlert("Profile updated successfully!", "success");
      }
    } else {
      showPrettyAlert(
        "Could not find user data. Please log in again.",
        "danger"
      );
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    showPrettyAlert(
      "An error occurred while saving your profile. Please try again.",
      "danger"
    );
  }
}

function updateCompanyNav(companyName) {
  const navCompanyName = document.getElementById("companyName");
  if (navCompanyName) {
    navCompanyName.textContent = companyName || "Company";
  }
  const dropdownCompanyName = document.getElementById("dropdownCompanyName");
  if (dropdownCompanyName) {
    dropdownCompanyName.textContent = companyName || "Company";
  }
}

function showPrettyAlert(message, type = "info") {
  let alertContainer = document.querySelector(".alert-container");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.className =
      "alert-container position-fixed top-0 start-50 translate-middle-x p-3";
    alertContainer.style.zIndex = "1050";
    document.body.appendChild(alertContainer);
  }

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 150);
  }, 5000);
}

function resetPassword() {
  const form = document.getElementById("resetPasswordForm");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Reset validation state
  form
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  let isValid = true;

  // Validate current password
  if (!currentPassword) {
    currentPasswordInput.classList.add("is-invalid");
    isValid = false;
  }

  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    newPasswordInput.classList.add("is-invalid");
    isValid = false;
  }

  // Validate password confirmation
  if (!confirmPassword || confirmPassword !== newPassword) {
    confirmPasswordInput.classList.add("is-invalid");
    confirmPasswordInput.nextElementSibling.textContent =
      "Passwords do not match.";
    isValid = false;
  }

  if (!isValid) {
    showPrettyAlert(
      "Please correct the highlighted fields and try again.",
      "warning"
    );
    return;
  }

  try {
    const userEmail = localStorage.getItem("userEmail");
    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[userEmail]) {
      showPrettyAlert(
        "Could not find user data. Please log in again.",
        "danger"
      );
      return;
    }

    // Check if current password is correct
    if (users[userEmail].password !== currentPassword) {
      currentPasswordInput.classList.add("is-invalid");
      currentPasswordInput.nextElementSibling.textContent =
        "Current password is incorrect.";
      showPrettyAlert("Current password is incorrect.", "danger");
      return;
    }

    // Update password
    users[userEmail].password = newPassword;

    // Save updated user data
    localStorage.setItem("users", JSON.stringify(users));

    // Close the modal
    const modalElement = document.getElementById("resetPasswordModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    // Show success message
    showPrettyAlert("Password has been reset successfully!", "success");

    // Reset form
    form.reset();
  } catch (error) {
    console.error("Error resetting password:", error);
    showPrettyAlert(
      "An error occurred while resetting your password. Please try again.",
      "danger"
    );
  }
}
