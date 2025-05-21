// Admin Settings Functions

// Setup settings form
function setupSettingsForm() {
  const adminSettingsForm = document.getElementById("adminSettingsForm");
  const changePasswordForm = document.getElementById("changePasswordForm");

  // Add animations when settings section is shown
  const settingsLink = document.querySelector('a[data-section="settings"]');
  if (settingsLink) {
    settingsLink.addEventListener('click', function() {
      // Add a small delay to ensure the section is visible
      setTimeout(addFormFieldAnimations, 100);
    });
  }

  // Setup admin settings form
  if (adminSettingsForm) {
    // Populate form fields with current admin data
    const userEmail = localStorage.getItem("userEmail");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const adminUser = users[userEmail];

    if (adminUser) {
      // Set full name input field
      const adminFullName = document.getElementById("adminFullName");
      if (adminFullName) {
        const firstName = adminUser.profile?.firstName || "";
        const lastName = adminUser.profile?.lastName || "";
        adminFullName.value = `${firstName} ${lastName}`.trim();
      }

      // Set email field
      const adminEmail = document.getElementById("adminEmail");
      if (adminEmail) {
        adminEmail.value = userEmail;
      }
    }

    // Handle form submission
    adminSettingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Add button loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
      submitBtn.disabled = true;

      const userEmail = localStorage.getItem("userEmail");
      const adminFullName = document.getElementById("adminFullName").value;

      // Get admin user
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const adminUser = users[userEmail];

      if (!adminUser) {
        addFormFeedback(adminSettingsForm, "Admin user not found", "error");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        return;
      }

      // Simulate a network delay for visual feedback
      setTimeout(() => {
      // Update admin name if provided
        if (adminFullName) {
          const nameParts = adminFullName.split(" ");
        adminUser.profile = adminUser.profile || {};
        adminUser.profile.firstName = nameParts[0] || "";
        adminUser.profile.lastName = nameParts.slice(1).join(" ") || "";
      }

      // Save changes
      users[userEmail] = adminUser;
      localStorage.setItem("users", JSON.stringify(users));

      // Update admin data
      let adminData = JSON.parse(
        localStorage.getItem(`userData_${userEmail}`) || "{}"
      );
      adminData.profile = adminUser.profile;
      localStorage.setItem(`userData_${userEmail}`, JSON.stringify(adminData));

      // Update UI
      updateAdminInfo();

        // Restore button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        // Show success message
        addFormFeedback(adminSettingsForm, "Profile settings updated successfully");
      }, 800);
    });
  }

  // Setup change password form
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Add button loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Updating...';
      submitBtn.disabled = true;

      const userEmail = localStorage.getItem("userEmail");
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmNewPassword").value;

      // Get admin user
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const adminUser = users[userEmail];

      // Simulate a network delay for visual feedback
      setTimeout(() => {
        if (!adminUser) {
          addFormFeedback(changePasswordForm, "Admin user not found", "error");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          return;
        }

        // Validate current password
        if (!validatePassword(currentPassword, adminUser.passwordHash)) {
          addFormFeedback(changePasswordForm, "Current password is incorrect", "error");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          return;
        }

        // Check if new password fields match
        if (newPassword !== confirmPassword) {
          addFormFeedback(changePasswordForm, "New passwords do not match", "error");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          return;
        }

        // Update password
        adminUser.passwordHash = hashPassword(newPassword);

        // Save changes
        users[userEmail] = adminUser;
        localStorage.setItem("users", JSON.stringify(users));

      // Reset password fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";

        // Restore button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

      // Show success message
        addFormFeedback(changePasswordForm, "Password updated successfully");
      }, 800);
    });
  }
}

// Add visual feedback for settings forms
function addFormFeedback(form, message, type = 'success') {
  // Create feedback element
  const feedbackEl = document.createElement('div');
  feedbackEl.className = `settings-feedback ${type}`;
  feedbackEl.innerHTML = `
    <div class="settings-feedback-icon">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    </div>
    <div class="settings-feedback-message">${message}</div>
  `;
  
  // Add to form
  form.appendChild(feedbackEl);
  
  // Add visible class with slight delay for animation
  setTimeout(() => {
    feedbackEl.classList.add('visible');
  }, 10);
  
  // Remove after animation completes
  setTimeout(() => {
    feedbackEl.classList.remove('visible');
    
    // Remove element after fade out
    setTimeout(() => {
      if (feedbackEl.parentNode) {
        feedbackEl.parentNode.removeChild(feedbackEl);
      }
    }, 300);
  }, 3000);
}

// Add form field animations
function addFormFieldAnimations() {
  // Add animation to form fields in settings section
  const formFields = document.querySelectorAll('#settingsSection .form-control');
  
  formFields.forEach((field, index) => {
    // Add animation delay based on index
    field.style.opacity = '0';
    field.style.transform = 'translateY(20px)';
    field.style.transition = 'all 0.3s ease';
    
    // Trigger animation with staggered delay
    setTimeout(() => {
      field.style.opacity = '1';
      field.style.transform = 'translateY(0)';
    }, 100 + (index * 50));
    
    // Add focus animation
    field.addEventListener('focus', function() {
      this.parentNode.classList.add('input-focused');
    });
    
    field.addEventListener('blur', function() {
      this.parentNode.classList.remove('input-focused');
    });
  });
}

// Export functions
window.setupSettingsForm = setupSettingsForm;
window.addFormFeedback = addFormFeedback;
window.addFormFieldAnimations = addFormFieldAnimations; 