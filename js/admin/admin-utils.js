// Utility Functions

// Setup mobile sidebar toggle
function setupMobileSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const layout = document.querySelector(".admin-layout");

  if (sidebarToggle && layout) {
    // Create and append the overlay
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    const sidebar = document.querySelector(".admin-sidebar");

    sidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      layout.classList.toggle("sidebar-open");
    });

    overlay.addEventListener("click", () => {
      layout.classList.remove("sidebar-open");
    });

    // Close sidebar when a nav link is clicked on mobile
    sidebar.addEventListener("click", (e) => {
      if (e.target.closest("a") && window.innerWidth < 992) {
        layout.classList.remove("sidebar-open");
      }
    });
  }
}

// Setup scroll to top button
function setupScrollToTop() {
  const scrollToTopBtn = document.getElementById("scrollToTop");

  if (scrollToTopBtn) {
    // Hide/show button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("visible");
      } else {
        scrollToTopBtn.classList.remove("visible");
      }
    });

    // Scroll to top when clicked
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

// Setup navigation
function setupNavigation() {
  setupMobileSidebar(); // Initialize mobile sidebar functionality
  setupScrollToTop(); // Initialize scroll to top button

  const navLinks = document.querySelectorAll(".sidebar-menu a[data-section]");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");

  console.log(
    "Setting up navigation with links:",
    navLinks.length,
    "and sections:",
    sections.length
  );

  // Map available sections for debugging
  const availableSections = Array.from(sections).map((section) => section.id);
  console.log("Available sections:", availableSections);

  // Add a helper class to make navigation links more visible
  navLinks.forEach((link) => {
    link.classList.add("nav-link-interactive");
  });

  navLinks.forEach((link) => {
    const sectionId = link.getAttribute("data-section");
    console.log("Setting up listener for:", sectionId);

    // Check if the target section exists
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (!targetSection) {
      console.warn(
        `Warning: Target section "${sectionId}Section" not found in the DOM`
      );
    }

    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling

      const sectionId = this.getAttribute("data-section");
      console.log("Navigation clicked:", sectionId);

      // Update active link with visual feedback
      navLinks.forEach((link) => {
        link.classList.remove("active");
        link.classList.remove("pulse-animation"); // Remove any existing animations
      });
      this.classList.add("active");
      this.classList.add("pulse-animation"); // Add a subtle animation for feedback

      // Update URL hash for better navigation (allows browser back button)
      window.location.hash = sectionId;

      // Show selected section
      let sectionFound = false;
      sections.forEach((section) => {
        if (section.id === `${sectionId}Section`) {
          section.classList.remove("d-none");
          console.log("Showing section:", section.id);
          sectionFound = true;

          // Add animation class for smooth transition
          section.classList.add("section-fade-in");
          setTimeout(() => {
            section.classList.remove("section-fade-in");
          }, 500);

          // Update page title
          if (pageTitle) {
            pageTitle.textContent =
              sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
          }

          // If inventory section is shown, refresh the inventory data
          if (sectionId === "inventory") {
            console.log("Refreshing inventory data");
            loadInventory();
          }

          // If inventory admins section is shown, initialize it
          if (sectionId === "inventory-admins") {
            console.log("Initializing inventory admins section");
            if (typeof initInventoryAdmins === "function") {
              initInventoryAdmins();
            }
          }

          // If customer market section is shown, initialize it
          if (sectionId === "customer-market") {
            console.log("Initializing customer market section");
            if (typeof initCustomerMarket === "function") {
              initCustomerMarket();
            }
          }

          // If settings section is shown, set up the form
          if (sectionId === "settings") {
            console.log("Initializing settings section");
            if (typeof setupSettingsForm === "function") {
              setupSettingsForm();
            }
          }
        } else {
          section.classList.add("d-none");
        }
      });

      if (!sectionFound) {
        console.error(`Error: Section "${sectionId}Section" not found`);
        // Fallback to dashboard
        const dashboardSection = document.getElementById("dashboardSection");
        if (dashboardSection) {
          dashboardSection.classList.remove("d-none");
          if (pageTitle) {
            pageTitle.textContent = "Dashboard";
          }
        }
      }
    });
  });

  // Check for URL hash to determine initial section
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1); // Remove the # character
    const sectionLink = document.querySelector(
      `.sidebar-menu a[data-section="${sectionId}"]`
    );
    if (sectionLink) {
      console.log("Loading section from URL hash:", sectionId);
      sectionLink.click();
      return;
    }
  }

  // Initialize with dashboard section visible if no section is active
  const hasActiveSection = Array.from(navLinks).some((link) =>
    link.classList.contains("active")
  );
  if (!hasActiveSection && navLinks.length > 0) {
    console.log("No active section found, defaulting to dashboard");
    navLinks[0].click();
  }
}

// Function to enlarge an image in a modal view
function enlargeImage(imageSrc) {
  // Create a fullscreen modal
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";
  modal.style.cursor = "zoom-out";

  // Create the enlarged image
  const img = document.createElement("img");
  img.src = imageSrc;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.objectFit = "contain";
  img.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.5)";
  img.style.transition = "transform 0.3s ease";

  // Add a subtle animation
  img.style.transform = "scale(0.9)";
  setTimeout(() => {
    img.style.transform = "scale(1)";
  }, 10);

  // Add a close button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "20px";
  closeBtn.style.fontSize = "30px";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "white";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.width = "40px";
  closeBtn.style.height = "40px";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.transition = "background 0.3s ease";

  closeBtn.addEventListener("mouseover", () => {
    closeBtn.style.background = "rgba(255, 255, 255, 0.1)";
  });

  closeBtn.addEventListener("mouseout", () => {
    closeBtn.style.background = "transparent";
  });

  // Handle closing the modal
  const closeModal = () => {
    img.style.transform = "scale(0.9)";
    modal.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  };

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);

  // Prevent closing when clicking on the image itself
  img.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Add elements to DOM
  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  // Add fade-in animation
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.3s ease";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);
}

// Function to animate counter
function animateCounter(element, start, end) {
  // Check if element exists
  if (!element) {
    console.warn("animateCounter: Element not found");
    return;
  }

  // Check for invalid input
  if (end === undefined || end === null || isNaN(end)) {
    console.warn("animateCounter: Invalid end value", end);
    end = 0;
  }

  // Make sure start and end are numbers
  start = Number(start) || 0;
  end = Number(end) || 0;

  // Log the counter animation being started
  console.log(
    `Animating counter from ${start} to ${end} for element:`,
    element.id || element
  );

  // Reset the counter to start value immediately
  element.textContent = start.toLocaleString();

  // Add animation class
  element.classList.add("animate-count");

  // Don't animate if start and end are the same
  if (start === end) {
    element.textContent = end.toLocaleString();
    return;
  }

  // Calculate increment based on the size of the number
  let duration = 1200; // Animation duration in ms
  let steps = 30; // Number of steps
  let increment = Math.max(1, Math.floor((end - start) / steps));

  // Start at initial value
  let current = start;

  // For small numbers, use a different approach
  if (end <= 10) {
    steps = end;
    increment = 1;
  }

  // For large numbers, make sure we have enough steps
  if (end - start > 1000) {
    increment = Math.max(1, Math.floor((end - start) / 40));
  }

  // Set up the animation interval
  const timer = setInterval(() => {
    current += increment;

    // Make sure we don't go past the end value
    if (current >= end) {
      clearInterval(timer);
      current = end;

      // Add a final "pop" effect when counter finishes
      element.style.animation = "none";
      element.offsetHeight; // Trigger reflow
      element.style.animation = "countUp 0.3s ease forwards";
      console.log(
        `Counter animation completed for ${element.id || element}: ${end}`
      );
    }

    // Update the display with thousands separators
    element.textContent = current.toLocaleString();
  }, duration / steps);
}

// Get initials from first and last name
function getInitialsFromName(firstName, lastName) {
  if (!firstName && !lastName) return "U";

  let initials = "";
  if (firstName) initials += firstName.charAt(0).toUpperCase();
  if (lastName) initials += lastName.charAt(0).toUpperCase();

  return initials || "U";
}

// Get initials from a full name
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Generate a consistent color for avatars based on the name
function getAvatarColor(name) {
  if (!name || typeof name !== "string") return "#cccccc";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
}

// Get a styled badge for a given status
function getStatusBadge(status) {
  let badgeClass = "bg-secondary";
  let icon = "fa-info-circle";

  switch (status) {
    case "Pending":
      badgeClass = "bg-warning text-dark";
      icon = "fa-clock";
      break;
    case "Quoted":
      badgeClass = "bg-info text-dark";
      icon = "fa-coins";
      break;
    case "Completed":
      badgeClass = "bg-success";
      icon = "fa-check-circle";
      break;
    case "Rejected":
      badgeClass = "bg-danger";
      icon = "fa-times-circle";
      break;
  }
  return `<span class="badge ${badgeClass} status-badge"><i class="fas ${icon} me-1"></i>${status}</span>`;
}

// Get an icon for a given device category
function getDeviceIcon(category) {
  switch (category) {
    case "Smartphone":
      return "fas fa-mobile-alt";
    case "Laptop":
      return "fas fa-laptop";
    case "Tablet":
      return "fas fa-tablet-alt";
    default:
      return "fas fa-microchip";
  }
}

// Function to show a custom confirmation modal
function showConfirmationModal(title, message, onConfirm) {
  // Remove any existing modals
  const existingModal = document.getElementById("customConfirmationModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="customConfirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <div class="modal-header" style="background: linear-gradient(135deg, #f72585, #b5179e); color: white; border-bottom: none;">
            <h5 class="modal-title" id="confirmationModalLabel">${title}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3" style="animation: pulse 1.5s infinite;"></i>
            <p class="lead">${message}</p>
          </div>
          <div class="modal-footer" style="border-top: none; justify-content: center;">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="min-width: 100px;">Cancel</button>
            <button type="button" id="confirmActionBtn" class="btn btn-danger" style="min-width: 100px;">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modalElement = document.getElementById("customConfirmationModal");
  const confirmBtn = document.getElementById("confirmActionBtn");
  const confirmationModal = new bootstrap.Modal(modalElement);

  // Handle confirm button click
  confirmBtn.addEventListener("click", () => {
    if (typeof onConfirm === "function") {
      onConfirm();
    }
    confirmationModal.hide();
  });

  // Clean up modal from DOM after it's hidden
  modalElement.addEventListener("hidden.bs.modal", () => {
    modalElement.remove();
  });

  // Show the modal
  confirmationModal.show();
}

// Export functions
window.setupNavigation = setupNavigation;
window.enlargeImage = enlargeImage;
window.animateCounter = animateCounter;
window.getInitialsFromName = getInitialsFromName;
window.getInitials = getInitials;
window.getAvatarColor = getAvatarColor;
window.getStatusBadge = getStatusBadge;
window.getDeviceIcon = getDeviceIcon;
window.showConfirmationModal = showConfirmationModal;
window.setupScrollToTop = setupScrollToTop;
