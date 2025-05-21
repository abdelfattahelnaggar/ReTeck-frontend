// Form submission handling
document.addEventListener("DOMContentLoaded", function () {
  // Get the contact form
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get form fields
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();
      const agreement = document.getElementById("agreement").checked;

      // Simple validation
      if (!name || !email || !subject || !message || !agreement) {
        showToast(
          "Please fill in all fields and accept the agreement",
          "error"
        );
        return;
      }

      // Email validation
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address", "error");
        return;
      }

      // Simulate form submission (in a real app, you'd send data to server)
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;

      // Show loading state
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
      submitButton.disabled = true;

      // Simulate server delay
      setTimeout(() => {
        // Reset the form
        contactForm.reset();

        // Show success message
        showToast(
          "Your message has been sent successfully! We'll get back to you soon.",
          "success"
        );

        // Add animation class to form
        contactForm
          .closest(".contact-form-container")
          .classList.add("form-success");

        // Reset the button text
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;

        // Remove animation class after animation completes
        setTimeout(() => {
          contactForm
            .closest(".contact-form-container")
            .classList.remove("form-success");
        }, 500);
      }, 1500);
    });
  }

  // Initialize Auth Flow (to handle user profile display in the navbar)
  if (typeof initAuthFlow === "function") {
    initAuthFlow();
  }
});

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show toast notification
function showToast(message, type = "info") {
  // First, check if we have the showToast function from utils.js
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
    return;
  }

  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Get title based on type
  const title = getToastTitle(type);

  // Create toast content
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">
        <i class="${getIconForToastType(type)}"></i>
      </div>
      <div class="toast-message">
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
      <button class="toast-close" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Trigger reflow to enable animation
  toast.offsetHeight;

  // Show the toast
  toast.classList.add("show");

  // Add click listener to close button
  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideToast(toast);
    });
  }

  // Start progress bar animation
  const progressBar = toast.querySelector(".toast-progress-bar");
  if (progressBar) {
    progressBar.style.width = "0%";
    setTimeout(() => {
      progressBar.style.width = "100%";
    }, 10);
  }

  // Auto-hide the toast after 5 seconds
  setTimeout(() => {
    hideToast(toast);
  }, 5000);
}

// Hide toast with animation
function hideToast(toast) {
  toast.classList.remove("show");
  toast.classList.add("hide");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Get toast title based on type
function getToastTitle(type) {
  switch (type) {
    case "success":
      return "Success!";
    case "error":
      return "Error!";
    case "warning":
      return "Warning!";
    case "info":
    default:
      return "Information";
  }
}

// Get icon for toast type
function getIconForToastType(type) {
  switch (type) {
    case "success":
      return "fas fa-check-circle";
    case "error":
      return "fas fa-times-circle";
    case "warning":
      return "fas fa-exclamation-circle";
    case "info":
    default:
      return "fas fa-info-circle";
  }
}

// Add CSS for the fallback toast to the page if needed
function addToastStyles() {
  if (document.getElementById("toast-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "toast-styles";
  style.innerHTML = `
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: white;
      color: #333;
      padding: 12px 20px;
      border-radius: 5px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
      max-width: 350px;
    }
    
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .toast-content {
      display: flex;
      align-items: center;
    }
    
    .toast-message {
      margin-left: 10px;
    }
    
    .toast-close {
      cursor: pointer;
      margin-left: 10px;
    }
    
    .toast-success {
      border-left: 4px solid #28a745;
    }
    
    .toast-error {
      border-left: 4px solid #dc3545;
    }
    
    .toast-warning {
      border-left: 4px solid #ffc107;
    }
    
    .toast-info {
      border-left: 4px solid #17a2b8;
    }
    
    .toast-success i {
      color: #28a745;
    }
    
    .toast-error i {
      color: #dc3545;
    }
    
    .toast-warning i {
      color: #ffc107;
    }
    
    .toast-info i {
      color: #17a2b8;
    }
  `;

  document.head.appendChild(style);
}

// Add toast styles when the page loads
document.addEventListener("DOMContentLoaded", addToastStyles);
