/**
 * RETECH - Profile Page JavaScript
 * Handles user profile functionality including:
 * - Loading and displaying user data
 * - Profile image uploads
 * - Personal information form
 * - Recycling quotes list and details
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
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

/**
 * Cache for storing loaded images
 */
const imageCache = new Map();

/**
 * Load and cache an image
 * @param {string} src - Image source URL
 * @returns {Promise<string>} - Cached image URL
 */
function loadAndCacheImage(src) {
  // Return from cache if available
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }

  // Load and cache the image
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      resolve(src);
    };
    img.onerror = (error) => reject(error);
    img.src = src;
  });
}

// Document ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Profile page loaded");

  // Check login status - redirect to login if not logged in
  if (!checkLoginStatus(true)) {
    return;
  }

  // Update navbar with consistent implementation
  checkLoginStatusAndUpdateNavbar();

  // Load user's profile data
  loadUserProfile();

  // Load user's recycling requests
  loadUserRecycleRequests();

  // Load points history
  loadPointsHistory();

  // Load user's coupons
  loadUserCoupons();

  // Setup forms and event listeners
  setupProfileForm();
  setupProfileImageUpload();
  setupQuotesFilter();
  setupRedeemButtons();
  setupRewardsFilter();

  // Add direct event listener to the save button for redundancy
  const saveButton = document.getElementById("saveInfoBtn");
  if (saveButton) {
    console.log("Attaching direct click handler to save button");
    // Remove any existing click handlers
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    // Add a click handler with multiple fallback options
    newSaveButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Save button clicked directly");

      try {
        // Try the global saveProfileData function first
        if (typeof window.saveProfileData === "function") {
          console.log("Using window.saveProfileData");
          window.saveProfileData();
          return;
        }

        // If that fails, try the direct save method
        if (typeof window.saveProfileDirectly === "function") {
          console.log("Falling back to window.saveProfileDirectly");
          window.saveProfileDirectly();
          return;
        }

        // Last resort - trigger manual form submission
        const form = document.getElementById("personalInfoForm");
        if (form) {
          console.log("Last resort: Manually triggering form submission");
          const event = new Event("submit", {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(event);
          return;
        }

        // If all else fails, show an error
        console.error("No save method available");
        showToast(
          "Error: Could not save profile. Please try again or reload the page.",
          "danger"
        );
      } catch (error) {
        console.error("Error saving profile:", error);
        showToast(
          "An error occurred while saving. Please try again.",
          "danger"
        );

        // Last chance fallback - try direct save
        try {
          window.saveProfileDirectly();
        } catch (e) {
          console.error("Final fallback also failed:", e);
        }
      }
    });
  }

  // Initialize quotes functionality
  initializeQuotes();
});

/**
 * Load and display user profile data
 */
function loadUserProfile() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.error("No user email found in storage");
    return;
  }

  // Get user data from localStorage
  const userData = getUserData(userEmail);
  if (!userData) {
    console.error("No user data found for:", userEmail);
    return;
  }

  // Update profile display
  updateProfileDisplay(userData);

  // Update points display
  updatePointsDisplay(userData);

  // Populate personal info form
  populatePersonalInfoForm(userData.profile || {});
}

/**
 * Populate the personal information form with user data
 */
function populatePersonalInfoForm(profile) {
  // Set email address (read-only)
  const emailField = document.getElementById("emailAddress");
  if (emailField) {
    emailField.value = profile.email || localStorage.getItem("userEmail") || "";
  }

  // Set name fields
  const firstNameField = document.getElementById("firstName");
  const lastNameField = document.getElementById("lastName");

  if (firstNameField && profile.firstName) {
    firstNameField.value = profile.firstName;
    highlightPopulatedField(firstNameField, true);
  }

  if (lastNameField && profile.lastName) {
    lastNameField.value = profile.lastName;
    highlightPopulatedField(lastNameField, true);
  }

  // Set phone number
  const phoneField = document.getElementById("phone");
  if (phoneField && profile.phoneNumber) {
    phoneField.value = profile.phoneNumber;
    highlightPopulatedField(phoneField, true);
  }

  // Set address fields
  const addressField = document.getElementById("address");
  const addressLine2Field = document.getElementById("addressLine2");
  const cityField = document.getElementById("city");
  const stateField = document.getElementById("state");
  const zipField = document.getElementById("zip");

  // Handle different address formats (string or object)
  if (typeof profile.address === "string" && profile.address) {
    // If address is a simple string, put it in the main address field
    if (addressField) {
      addressField.value = profile.address;
      highlightPopulatedField(addressField, true);
    }
  } else if (typeof profile.address === "object" && profile.address) {
    // If address is an object, populate all address fields
    if (addressField && profile.address.street) {
      addressField.value = profile.address.street;
      highlightPopulatedField(addressField, true);
    }

    if (addressLine2Field && profile.address.apt) {
      addressLine2Field.value = profile.address.apt;
      highlightPopulatedField(addressLine2Field, true);
    }

    if (cityField && profile.address.city) {
      cityField.value = profile.address.city;
      highlightPopulatedField(cityField, true);
    }

    if (stateField && profile.address.state) {
      stateField.value = profile.address.state;
      highlightPopulatedField(stateField, true);
    }

    if (zipField && profile.address.zip) {
      zipField.value = profile.address.zip;
      highlightPopulatedField(zipField, true);
    }
  }
}

/**
 * Highlight fields that have been populated with data
 */
function highlightPopulatedField(field, isPopulated) {
  if (isPopulated) {
    field.classList.add("is-valid");
  } else {
    field.classList.remove("is-valid");
  }
}

/**
 * Update profile display with user data
 */
function updateProfileDisplay(userData) {
  const profile = userData.profile || {};
  const userEmail = localStorage.getItem("userEmail");

  // Update profile avatar
  const profileAvatar = document.getElementById("profileAvatar");
  if (profileAvatar) {
    if (profile.profileImage) {
      profileAvatar.innerHTML = `<img src="${profile.profileImage}" alt="Profile" />`;
    } else {
      // Use initials if no profile image
      const initials = getInitials(profile.firstName, profile.lastName);
      profileAvatar.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100 w-100 bg-primary text-white">
          <span style="font-size: 2rem;">${initials}</span>
        </div>
      `;
    }
  }

  // Update profile name display
  const profileName = document.getElementById("profileName");
  if (profileName) {
    if (profile.firstName || profile.lastName) {
      const fullName = `${profile.firstName || ""} ${
        profile.lastName || ""
      }`.trim();
      profileName.textContent = fullName;
    } else {
      // Use email username as fallback
      profileName.textContent = userEmail ? userEmail.split("@")[0] : "User";
    }
  }

  // Update profile email display
  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) {
    profileEmail.textContent = profile.email || userEmail || "";
  }

  // Update user points display
  const userPoints = document.getElementById("userPoints");
  if (userPoints) {
    userPoints.textContent = profile.points || 0;
  }

  // Update navigation display using synchronized function
  checkLoginStatusAndUpdateNavbar();
}

/**
 * Load user recycling requests and display them in the table
 */
function loadUserRecycleRequests() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const userData = getUserData(userEmail);
  if (!userData) return;

  // Get recycling requests from user data or use test data if none exists
  let recycleRequests = [];

  // Check if user has recycling requests
  if (userData.recycleRequests && userData.recycleRequests.length > 0) {
    recycleRequests = userData.recycleRequests;
  } else {
    // Use static test data if no requests exist
    recycleRequests = [
      {
        id: "RQ-2023-001",
        type: "Phone",
        device: "iPhone 13 Pro",
        date: "2023-06-15T10:30:00Z",
        status: "Pending",
        details: { condition: "Good", storage: "256GB", color: "Graphite" },
      },
      {
        id: "RQ-2023-002",
        type: "Laptop",
        device: "MacBook Pro 2021",
        date: "2023-05-20T14:45:00Z",
        status: "Quoted",
        details: { condition: "Excellent", processor: "M1 Pro", ram: "16GB" },
        quote: {
          amount: 850.0,
          notes: "Premium condition with original accessories",
          validUntil: "2023-07-30T00:00:00Z",
        },
      },
      {
        id: "RQ-2023-003",
        type: "Electronics",
        device: "Sony PlayStation 5",
        date: "2023-04-10T09:15:00Z",
        status: "Accepted",
        details: {
          condition: "Like New",
          model: "Disc Edition",
          accessories: "2 Controllers",
        },
        quote: {
          amount: 320.0,
          notes: "Includes original packaging",
          validUntil: "2023-06-30T00:00:00Z",
        },
      },
      {
        id: "RQ-2023-004",
        type: "Kitchen",
        device: "Vitamix Blender Pro",
        date: "2023-03-05T16:20:00Z",
        status: "Completed",
        details: { condition: "Good", model: "5200 Series", age: "3 years" },
        quote: {
          amount: 120.0,
          notes: "Working condition with minor wear",
          validUntil: "2023-05-30T00:00:00Z",
        },
      },
      {
        id: "RQ-2023-005",
        type: "Phone",
        device: "Samsung Galaxy S22 Ultra",
        date: "2023-02-18T11:10:00Z",
        status: "Rejected",
        details: {
          condition: "Damaged",
          storage: "128GB",
          issues: "Cracked screen",
        },
      },
      {
        id: "RQ-2023-006",
        type: "Laptop",
        device: "Dell XPS 15",
        date: "2023-01-25T13:40:00Z",
        status: "Quoted",
        details: { condition: "Fair", processor: "i7-11800H", ram: "32GB" },
        quote: {
          amount: 550.0,
          notes: "Value reduced due to keyboard wear",
          validUntil: "2023-03-30T00:00:00Z",
        },
      },
      {
        id: "RQ-2023-007",
        type: "Electronics",
        device: "Apple Watch Series 7",
        date: "2023-06-01T15:30:00Z",
        status: "Pending",
        details: { condition: "Good", size: "45mm", color: "Midnight" },
      },
    ];

    // Save test data to user data for persistence
    if (!userData.recycleRequests) {
      userData.recycleRequests = [];
    }

    // Only save test data if recycleRequests is empty
    if (userData.recycleRequests.length === 0) {
      userData.recycleRequests = recycleRequests;
      saveUserData(userEmail, userData);
    }
  }

  // Get the table rows from DOM
  const tableBody = document.getElementById("quotesTableBody");
  const rows = tableBody ? Array.from(tableBody.querySelectorAll("tr")) : [];

  // Status counters - count both dynamic data and static rows
  const statusCounts = {
    all: rows.length, // Start with the count of static rows
    Pending: 0,
    Quoted: 0,
    Accepted: 0,
    Completed: 0,
    Rejected: 0,
  };

  // Count rows by status
  rows.forEach((row) => {
    const statusCell = row.querySelector("td:nth-child(4)");
    if (statusCell) {
      const statusText = statusCell.textContent.trim();
      const status = statusText
        .replace(/^\s+|\s+$/g, "")
        .split(/\s+/)
        .pop();

      // Increment the appropriate counter
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    }
  });

  // Update filter count badges
  document.querySelector(".all-count").textContent = statusCounts.all;
  document.querySelector(".pending-count").textContent = statusCounts.Pending;
  document.querySelector(".quoted-count").textContent = statusCounts.Quoted;
  document.querySelector(".accepted-count").textContent = statusCounts.Accepted;
  document.querySelector(".completed-count").textContent =
    statusCounts.Completed;

  // Animate count badges if they've changed
  document.querySelectorAll(".filter-count").forEach((badge) => {
    badge.classList.add("count-updated");
    setTimeout(() => {
      badge.classList.remove("count-updated");
    }, 1000);
  });

  // Show empty state if no requests/rows
  const emptyState = document.getElementById("emptyQuotesState");
  if (rows.length === 0) {
    if (emptyState) emptyState.classList.remove("d-none");
    if (tableBody) tableBody.innerHTML = "";
    return;
  }

  // Hide empty state since we have rows
  if (emptyState) emptyState.classList.add("d-none");

  // Add event listeners to view buttons
  addViewDetailsListeners();

  // Add event listeners to quote action buttons
  addQuoteActionListeners();

  // Initialize filters
  setupQuotesFilter();
}

/**
 * Add event listeners to "View Details" buttons
 */
function addViewDetailsListeners() {
  // Get all view buttons
  const viewButtons = document.querySelectorAll(".view-details-btn");

  // Add event listeners to each button
  viewButtons.forEach((button) => {
    // First remove any existing event listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", function (e) {
      // Prevent default behavior and stop event propagation
      e.preventDefault();
      e.stopPropagation();

      console.log("View button clicked");

      // Get the request ID from the button
      const requestId = this.getAttribute("data-id");
      console.log("Request ID:", requestId);

      // Check if this is a stored request
      const userEmail = localStorage.getItem("userEmail");
      if (requestId && userEmail) {
        const userData = getUserData(userEmail);
        if (userData && userData.recycleRequests) {
          // Try to find request in user data
          const request = userData.recycleRequests.find(
            (r) => r.id === requestId
          );
          if (request) {
            console.log("Found dynamic request:", request);
            showRequestDetailsModal(request);
            return;
          }
        }
      }

      // If we get here, it's a static row or the request wasn't found
      // Extract data from the row
      const row = this.closest("tr");
      if (!row) {
        console.error("Could not find parent row");
        return;
      }

      // Get all cells
      const cells = row.querySelectorAll("td");
      if (cells.length < 5) {
        console.error("Row has insufficient cells:", cells.length);
        return;
      }

      try {
        // Type cell (extract from innerText to handle HTML content)
        const typeContent = cells[0].textContent.trim();
        // Get the last word in the text which should be the type (Phone, Laptop, etc.)
        const type = typeContent
          .replace(/^\s+|\s+$/g, "")
          .split(/\s+/)
          .pop();

        // Device name
        const device = cells[1].textContent.trim();

        // Request date
        const date = cells[2].textContent.trim();

        // Status (remove any icons and whitespace)
        const statusText = cells[3].textContent.trim();
        // Extract just the status text (last word)
        const status = statusText
          .replace(/^\s+|\s+$/g, "")
          .split(/\s+/)
          .pop();

        // Points value (handle empty or formatted values)
        let points = cells[4].textContent.trim();
        if (points === "--") {
          points = "0 points";
        } else if (!points.toLowerCase().includes("points")) {
          points = points + " points";
        }

        console.log("Extracted quote data:", {
          type,
          device,
          date,
          status,
          points,
        });

        // Show modal with extracted data
        showStaticQuoteDetailsModal({
          type,
          device,
          date,
          status,
          points,
          requestId,
        });
      } catch (error) {
        console.error("Error extracting data from row:", error);
        alert(
          "There was an error displaying the quote details. Please try again."
        );
      }
    });
  });
}

// Show a simple modal for static table rows
function showStaticQuoteDetailsModal({
  type,
  device,
  date,
  status,
  points,
  requestId,
}) {
  // Remove any existing modal
  const existing = document.getElementById("staticQuoteDetailsModal");
  if (existing) existing.remove();

  // Get device icon based on type
  let deviceIcon = "question";
  switch (type.toLowerCase()) {
    case "phone":
      deviceIcon = "mobile-alt";
      break;
    case "laptop":
      deviceIcon = "laptop";
      break;
    case "kitchen":
      deviceIcon = "blender";
      break;
    case "electronics":
      deviceIcon = "tv";
      break;
    case "tablet":
      deviceIcon = "tablet-alt";
      break;
  }

  // Get status icon and color based on status
  let statusIcon = "question-circle";
  let statusBadgeClass = "bg-secondary";
  let statusColor = "#6c757d";

  switch (status.toLowerCase()) {
    case "pending":
      statusIcon = "clock";
      statusBadgeClass = "bg-warning";
      statusColor = "#ffc107";
      break;
    case "quoted":
      statusIcon = "tag";
      statusBadgeClass = "bg-info";
      statusColor = "#17a2b8";
      break;
    case "accepted":
      statusIcon = "handshake";
      statusBadgeClass = "bg-success";
      statusColor = "#28a745";
      break;
    case "rejected":
      statusIcon = "times-circle";
      statusBadgeClass = "bg-danger";
      statusColor = "#dc3545";
      break;
    case "completed":
      statusIcon = "check-circle";
      statusBadgeClass = "bg-primary";
      statusColor = "#0d6efd";
      break;
  }

  // Generate demo specs based on device type
  let deviceSpecs = {};

  if (type.toLowerCase() === "phone") {
    deviceSpecs = {
      model: device.includes("iPhone")
        ? "Apple"
        : device.includes("Galaxy")
        ? "Samsung"
        : "Android",
      storage: ["64GB", "128GB", "256GB"][Math.floor(Math.random() * 3)],
      condition: ["Fair", "Good", "Excellent"][Math.floor(Math.random() * 3)],
      color: ["Black", "White", "Blue", "Silver"][
        Math.floor(Math.random() * 4)
      ],
    };
  } else if (type.toLowerCase() === "laptop") {
    deviceSpecs = {
      processor: ["Intel i5", "Intel i7", "AMD Ryzen 5", "Apple M1"][
        Math.floor(Math.random() * 4)
      ],
      ram: ["8GB", "16GB", "32GB"][Math.floor(Math.random() * 3)],
      storage: ["256GB SSD", "512GB SSD", "1TB SSD"][
        Math.floor(Math.random() * 3)
      ],
      screen: ["13-inch", "15-inch", "16-inch"][Math.floor(Math.random() * 3)],
    };
  } else if (type.toLowerCase() === "electronics") {
    deviceSpecs = {
      category: ["Gaming", "Audio", "Computing", "Entertainment"][
        Math.floor(Math.random() * 4)
      ],
      condition: ["Fair", "Good", "Excellent"][Math.floor(Math.random() * 3)],
      age: ["< 1 year", "1-2 years", "2-3 years", "3+ years"][
        Math.floor(Math.random() * 4)
      ],
    };
  }

  // Format points for display
  const pointsValue = points.replace(/[^0-9]/g, "");
  const pointsDisplay = pointsValue === "0" ? "Pending evaluation" : points;

  const modalHtml = `
    <div class="modal fade" id="staticQuoteDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content quote-details-modal">
          <div class="modal-header bg-gradient-primary text-white">
            <div class="d-flex align-items-center">
              <i class="fas fa-${deviceIcon} me-2"></i>
              <h5 class="modal-title">Recycling Quote Details</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <!-- Request Status Banner -->
            <div class="request-status-banner status-${status.toLowerCase()}">
              <div class="status-icon">
                <i class="fas fa-${statusIcon}"></i>
              </div>
              <div class="status-details">
                <div class="status-label">Status</div>
                <div class="status-value">${status}</div>
              </div>
              <div class="status-date">
                <div class="date-label">Request Date</div>
                <div class="date-value">${date}</div>
              </div>
            </div>
            
            <div class="request-details-content p-4">
              <div class="row">
                <div class="col-md-6 mb-4">
                  <div class="details-card">
                    <div class="details-card-header">
                      <i class="fas fa-info-circle me-2"></i>
                      <h6 class="mb-0">Device Information</h6>
                    </div>
                    <div class="details-card-body">
                      <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">
                          <span class="category-badge category-${type.toLowerCase()}">
                            <i class="fas fa-${deviceIcon} me-1"></i>${type}
                          </span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Device</div>
                        <div class="detail-value device-name">${device}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Request Date</div>
                        <div class="detail-value">${date}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Condition</div>
                        <div class="detail-value">${
                          deviceSpecs.condition || "Good"
                        }</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6 mb-4">
                  <div class="details-card ${
                    points !== "0 points" ? "has-quote" : ""
                  }">
                    <div class="details-card-header">
                      <i class="fas fa-leaf me-2"></i>
                      <h6 class="mb-0">Points Information</h6>
                    </div>
                    <div class="details-card-body">
                      ${
                        points !== "0 points"
                          ? `<div class="quote-amount">${points}</div>
                           <div class="quote-note">
                             These are the recycling points you'll receive for this device.
                           </div>
                           <div class="quote-expiry">
                             <i class="far fa-calendar-alt me-1"></i> Valid for 30 days
                           </div>`
                          : `<div class="quote-pending">
                             <i class="fas fa-hourglass-half mb-3"></i>
                             <p>Quote pending review</p>
                             <small>Our team is evaluating your device and will provide a quote soon.</small>
                           </div>`
                      }
                      ${
                        status.toLowerCase() === "quoted"
                          ? `<div class="quote-actions mt-3">
                              <button class="btn btn-success accept-quote-modal-btn" data-id="${
                                requestId || "static"
                              }">
                                <i class="fas fa-check me-1"></i> Accept
                              </button>
                              <button class="btn btn-outline-danger reject-quote-modal-btn" data-id="${
                                requestId || "static"
                              }">
                                <i class="fas fa-times me-1"></i> Reject
                              </button>
                            </div>`
                          : ""
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-12">
                  <div class="details-card">
                    <div class="details-card-header">
                      <i class="fas fa-cog me-2"></i>
                      <h6 class="mb-0">Device Specifications</h6>
                    </div>
                    <div class="details-card-body">
                      <div class="specs-grid">
                        ${Object.entries(deviceSpecs)
                          .map(
                            ([key, value]) => `
                          <div class="spec-item">
                            <div class="spec-label">${
                              key.charAt(0).toUpperCase() + key.slice(1)
                            }</div>
                            <div class="spec-value">${value}</div>
                          </div>
                        `
                          )
                          .join("")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              ${
                status.toLowerCase() === "accepted" ||
                status.toLowerCase() === "completed"
                  ? `<div class="row mt-4">
                      <div class="col-12">
                        <div class="details-card shipping-card">
                          <div class="details-card-header">
                            <i class="fas fa-shipping-fast me-2"></i>
                            <h6 class="mb-0">Shipping Information</h6>
                          </div>
                          <div class="details-card-body">
                            <div class="shipping-instructions">
                              <p>Please package your device securely and send it to our recycling center using the prepaid shipping label below.</p>
                              <div class="shipping-address">
                                <strong>RETECH Recycling Center</strong><br>
                                123 Green Street<br>
                                Eco City, EC 12345<br>
                                United States
                              </div>
                              <button class="btn btn-primary mt-3">
                                <i class="fas fa-print me-1"></i> Print Shipping Label
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`
                  : ""
              }
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            ${
              status.toLowerCase() === "completed"
                ? `<div class="completed-badge">
                    <i class="fas fa-check-circle"></i> Recycling Complete
                  </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHtml;
  document.body.appendChild(container);

  const modal = new bootstrap.Modal(
    document.getElementById("staticQuoteDetailsModal")
  );
  modal.show();

  // Add event listeners for accept/reject buttons if status is "Quoted"
  if (status.toLowerCase() === "quoted") {
    const acceptBtn = container.querySelector(".accept-quote-modal-btn");
    const rejectBtn = container.querySelector(".reject-quote-modal-btn");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        // Close the modal
        modal.hide();

        // Show a success message
        showToast("Quote accepted successfully! +150 points", "success");

        // Allow the table to update with new status
        setTimeout(() => {
          loadUserRecycleRequests();
        }, 500);
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        // Close the modal
        modal.hide();

        // Show a success message
        showToast("Quote rejected", "info");

        // Allow the table to update with new status
        setTimeout(() => {
          loadUserRecycleRequests();
        }, 500);
      });
    }
  }

  // Remove modal from DOM when hidden
  document
    .getElementById("staticQuoteDetailsModal")
    .addEventListener("hidden.bs.modal", function () {
      container.remove();
    });
}

/**
 * Setup the profile information form submission
 */
function setupProfileForm() {
  const form = document.getElementById("personalInfoForm");
  const saveButton = document.getElementById("saveInfoBtn");
  let formData = {};

  // Create a global reference to saveProfileData function
  window.saveProfileData = function () {
    console.log("Global saveProfileData called");
    prepareAndShowConfirmation();
  };

  if (form) {
    console.log("Setting up profile form with ID:", form.id);

    // Direct form submission handler
    form.addEventListener("submit", function (e) {
      console.log("Form submitted");
      e.preventDefault();
      prepareAndShowConfirmation();
    });

    // Also attach to save button click for redundancy
    if (saveButton) {
      console.log("Attaching event to save button:", saveButton.id);
      saveButton.addEventListener("click", function (e) {
        console.log("Save button clicked from setup function");
        e.preventDefault();
        prepareAndShowConfirmation();
      });
    }

    // Function to prepare data and show confirmation
    function prepareAndShowConfirmation() {
      console.log("Preparing data and showing confirmation");

      // Get the user email
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        showToast("User email not found. Please log in again.", "danger");
        return;
      }

      // Get form data
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const phone = document.getElementById("phone").value.trim();

      // Get address fields
      const address = document.getElementById("address").value.trim();
      const addressLine2 = document.getElementById("addressLine2").value.trim();
      const city = document.getElementById("city").value.trim();
      const state = document.getElementById("state").value.trim();
      const zip = document.getElementById("zip").value.trim();

      // Create address object
      const addressObject = {
        street: address,
        apt: addressLine2,
        city: city,
        state: state,
        zip: zip,
      };

      // Get existing user data
      const userData = getUserData(userEmail);

      // Create updated profile object
      formData = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        email: userEmail,
        address: addressObject,
      };

      // Preserve existing profile image if present
      if (userData && userData.profile && userData.profile.profileImage) {
        formData.profileImage = userData.profile.profileImage;
      }

      // Preserve existing points if present
      if (userData && userData.profile && userData.profile.points) {
        formData.points = userData.profile.points;
      }

      // Update confirmation modal content with user details
      const confirmNameEl = document.getElementById("confirmName");
      if (confirmNameEl) {
        confirmNameEl.textContent = `${firstName} ${lastName}`;
      }

      // Add phone and address details to confirmation
      const modalBody = document.querySelector(
        "#saveConfirmationModal .modal-body"
      );
      if (modalBody) {
        // Check if we already have a details section
        let detailsSection = modalBody.querySelector(".profile-details");
        if (!detailsSection) {
          // Create a details section
          detailsSection = document.createElement("div");
          detailsSection.className =
            "profile-details mt-3 mb-3 text-start border rounded p-3";

          // Insert before the alert
          const alert = modalBody.querySelector(".alert");
          if (alert) {
            modalBody.insertBefore(detailsSection, alert);
          } else {
            modalBody.appendChild(detailsSection);
          }
        }

        // Create a summary of changes
        let addressDisplay = "";
        if (address) {
          addressDisplay = address;
          if (addressLine2) addressDisplay += `, ${addressLine2}`;
          if (city || state || zip) {
            addressDisplay += `<br>${city || ""} ${state || ""} ${
              zip || ""
            }`.trim();
          }
        }

        // Fill in the details
        detailsSection.innerHTML = `
          <h6 class="text-primary mb-2">Profile Information Summary:</h6>
          <div class="row mb-2">
            <div class="col-4 text-muted">Name:</div>
            <div class="col-8">${firstName} ${lastName}</div>
          </div>
          ${
            phone
              ? `
          <div class="row mb-2">
            <div class="col-4 text-muted">Phone:</div>
            <div class="col-8">${phone}</div>
          </div>
          `
              : ""
          }
          ${
            address
              ? `
          <div class="row">
            <div class="col-4 text-muted">Address:</div>
            <div class="col-8">${addressDisplay}</div>
          </div>
          `
              : ""
          }
        `;
      }

      // Show confirmation modal
      const confirmationModal = new bootstrap.Modal(
        document.getElementById("saveConfirmationModal")
      );
      confirmationModal.show();

      // Ensure the confirm button has a fresh event listener
      const confirmSaveBtn = document.getElementById("confirmSaveBtn");
      if (confirmSaveBtn) {
        // Remove any existing event listeners
        const newConfirmBtn = confirmSaveBtn.cloneNode(true);
        confirmSaveBtn.parentNode.replaceChild(newConfirmBtn, confirmSaveBtn);

        // Add event listener to the new button
        newConfirmBtn.addEventListener("click", function () {
          console.log("Confirm button clicked, saving user data");
          saveUserData(userEmail, formData);
          confirmationModal.hide();
        });
      }
    }

    // Function to save the user data after confirmation
    function saveUserData(email, profileData) {
      console.log("Saving user data for:", email);

      // Change button state to saving
      const saveButton = document.getElementById("saveInfoBtn");
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        saveButton.classList.add("saving");
      }

      // Add saving class to form for visual feedback
      form.classList.add("saving");

      // Update user profile in local storage
      const success = updateUserProfile(email, profileData);
      console.log("Save result:", success);

      setTimeout(() => {
        // Reset form state
        form.classList.remove("saving");

        if (saveButton) {
          saveButton.disabled = false;
          saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
          saveButton.classList.remove("saving");
        }

        if (success) {
          showToast("Profile information saved successfully!", "success");

          // Update navigation and profile display using synchronized function
          checkLoginStatusAndUpdateNavbar();
          loadUserProfile();
        } else {
          showToast(
            "Failed to save profile information. Please try again.",
            "danger"
          );
        }
      }, 1000);
    }
  } else {
    console.warn("Personal info form not found in the DOM");
  }
}

/**
 * Get appropriate icon for request type
 */
function getRequestTypeIcon(type) {
  switch (type) {
    case "Phone":
      return "mobile-alt";
    case "Laptop":
      return "laptop";
    case "Kitchen":
      return "blender";
    case "Electronics":
      return "tv";
    default:
      return "recycle";
  }
}

/**
 * Get appropriate icon for request status
 */
function getStatusIcon(status) {
  switch (status) {
    case "Pending":
      return "clock";
    case "Quoted":
      return "dollar-sign";
    case "Accepted":
      return "check";
    case "Rejected":
      return "times";
    case "Completed":
      return "check-double";
    default:
      return "question";
  }
}

/**
 * Render device specifications from details object
 */
function renderDeviceSpecs(details) {
  if (!details || typeof details !== "object") {
    return '<p class="text-muted">No additional details available</p>';
  }

  let specsHtml = '<div class="specs-grid">';

  // Filter out common keys that are displayed elsewhere
  const excludedKeys = [
    "condition",
    "id",
    "date",
    "updatedAt",
    "status",
    "images",
    "deviceImages",
  ];

  Object.entries(details).forEach(([key, value]) => {
    if (
      !excludedKeys.includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      specsHtml += `
        <div class="spec-item">
          <div class="spec-label">${formatSpecLabel(key)}</div>
          <div class="spec-value">${formatSpecValue(value)}</div>
        </div>
      `;
    }
  });

  specsHtml += "</div>";

  if (specsHtml === '<div class="specs-grid"></div>') {
    return '<p class="text-muted">No additional details available</p>';
  }

  return specsHtml;
}

/**
 * Format specification label for display
 */
function formatSpecLabel(key) {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    })
    .trim();
}

/**
 * Format specification value for display
 */
function formatSpecValue(value) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value.toString();
}

function showSuccessMessage(message) {
  const toastContainer = document.createElement("div");
  toastContainer.className = "position-fixed bottom-0 end-0 p-3";
  toastContainer.style.zIndex = "11";

  const toastHtml = `
    <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  toastContainer.innerHTML = toastHtml;
  document.body.appendChild(toastContainer);

  const toast = new bootstrap.Toast(toastContainer.querySelector(".toast"));
  toast.show();

  // Remove toast after it's hidden
  toastContainer
    .querySelector(".toast")
    .addEventListener("hidden.bs.toast", () => {
      toastContainer.remove();
    });
}

/**
 * Get user data from localStorage with improved error handling
 */
function getUserData(email) {
  if (!email) {
    console.error("Email is required to get user data");
    return null;
  }

  try {
    // Try to get user-specific data first
    let userData = null;
    let userSpecificData = null;
    let usersObjectData = null;

    // First attempt: Get from user-specific storage
    try {
      const userDataStr = localStorage.getItem(`userData_${email}`);
      if (userDataStr) {
        userSpecificData = JSON.parse(userDataStr);
        console.log("Got user data from userData_" + email, userSpecificData);
        userData = userSpecificData;
      }
    } catch (e) {
      console.error("Error parsing user-specific data:", e);
    }

    // Second attempt: Check users object
    try {
      const usersStr = localStorage.getItem("users");
      if (usersStr) {
        const users = JSON.parse(usersStr);
        if (users && users[email]) {
          usersObjectData = users[email];
          console.log("Got user data from users object", usersObjectData);

          // If we don't have user-specific data yet, use this
          if (!userData) {
            userData = usersObjectData;
          }
        }
      }
    } catch (e) {
      console.error("Error parsing users object:", e);
    }

    // If we have data from both sources, merge them
    if (userSpecificData && usersObjectData) {
      userData = {
        ...usersObjectData,
        ...userSpecificData,
        profile: {
          ...(usersObjectData.profile || {}),
          ...(userSpecificData.profile || {}),
        },
      };
      console.log("Merged user data from both sources", userData);
    }

    // Ensure we have a valid profile object
    if (userData && !userData.profile) {
      userData.profile = {};
    }

    return userData;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Update user profile in localStorage with enhanced reliability
 */
function updateUserProfile(email, profileData) {
  console.log("Updating profile for:", email);
  console.log("Profile data to update:", profileData);

  if (!email) {
    console.error("Email is required to update user profile");
    return false;
  }

  try {
    // First, get the complete current user data
    const userData = getUserData(email) || {};

    // Create a backup before updating
    try {
      localStorage.setItem(
        `userData_${email}_backup`,
        JSON.stringify(userData)
      );
    } catch (e) {
      console.warn("Could not create backup of user data:", e);
    }

    // Merge the new profile data with existing profile
    const updatedUserData = {
      ...userData,
      profile: {
        ...(userData.profile || {}),
        ...profileData,
      },
    };

    console.log("Updated user data structure:", updatedUserData);

    // Try simple direct approach first
    try {
      localStorage.setItem(
        `userData_${email}`,
        JSON.stringify(updatedUserData)
      );
      console.log("Successfully saved user data directly");

      // Also try to update the users object if it exists
      try {
        const usersString = localStorage.getItem("users");
        if (usersString) {
          const users = JSON.parse(usersString);
          if (users && typeof users === "object") {
            // Update or add the user
            users[email] = {
              ...(users[email] || {}),
              profile: {
                ...((users[email] && users[email].profile) || {}),
                ...profileData,
              },
            };
            localStorage.setItem("users", JSON.stringify(users));
            console.log("Also updated users object");
          }
        }
      } catch (usersError) {
        console.error(
          "Error updating users object, but direct save worked:",
          usersError
        );
      }

      // Clear name caches
      localStorage.removeItem(`userDisplayName_${email}`);
      localStorage.removeItem(`userFirstName_${email}`);

      return true;
    } catch (saveError) {
      console.error("Error saving user data directly:", saveError);
      return false;
    }
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return false;
  }
}

/**
 * Update user profile image in localStorage
 */
function updateUserProfileImage(email, imageDataUrl) {
  try {
    // Get current user data
    const userData = getUserData(email) || {};

    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = {};
    }

    // Update profile image
    userData.profile.profileImage = imageDataUrl;

    // Save updated user data
    return updateUserData(email, userData);
  } catch (error) {
    console.error("Error updating profile image:", error);
    return false;
  }
}

/**
 * Get initials from name
 */
function getInitials(firstName, lastName) {
  const first = firstName ? firstName[0].toUpperCase() : "";
  const last = lastName ? lastName[0].toUpperCase() : "";
  return first + last || "?";
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  if (!dateString) return "Unknown Date";

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get badge class based on status
 */
function getBadgeClassByStatus(status) {
  switch (status) {
    case "Pending":
      return "bg-warning text-dark";
    case "Quoted":
      return "bg-info text-white";
    case "Accepted":
      return "bg-success";
    case "Completed":
      return "bg-secondary";
    case "Rejected":
      return "bg-danger";
    default:
      return "bg-light text-dark";
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
    return;
  }

  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
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

/**
 * Update points display in the points tab
 */
function updatePointsDisplay(userData) {
  const profile = userData.profile || {};
  const points = profile.points || 0;

  // Update total points display
  const totalPointsDisplay = document.getElementById("totalPointsDisplay");
  if (totalPointsDisplay) {
    totalPointsDisplay.textContent = points;
  }

  // Update user level based on points
  const userLevel = document.getElementById("userLevel");
  if (userLevel) {
    if (points < 500) {
      userLevel.textContent = "Beginner";
    } else if (points < 1000) {
      userLevel.textContent = "Recycler";
    } else if (points < 2500) {
      userLevel.textContent = "Eco Warrior";
    } else if (points < 5000) {
      userLevel.textContent = "Sustainability Champion";
    } else {
      userLevel.textContent = "Green Master";
    }
  }
}

/**
 * Load and display points history
 */
function loadPointsHistory() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const userData = getUserData(userEmail);
  if (!userData) return;

  // Get points history from user data
  const pointsHistory = userData.pointsHistory || [];

  // Get table body element
  const tableBody = document.getElementById("pointsHistoryTableBody");
  if (!tableBody) return;

  // Show empty state if no history
  if (!pointsHistory.length) {
    tableBody.innerHTML = `
      <tr class="empty-history-row">
        <td colspan="3" class="text-center py-4">
          <i class="fas fa-leaf text-muted mb-3" style="font-size: 2rem;"></i>
          <p class="mb-1">No points history yet</p>
          <p class="text-muted small">Start recycling to earn points!</p>
        </td>
      </tr>
    `;
    return;
  }

  // Sort history by date (newest first)
  const sortedHistory = [...pointsHistory].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Generate table rows
  let tableContent = "";

  sortedHistory.forEach((entry) => {
    // Format date
    const entryDate = new Date(entry.date);
    const formattedDate = entryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Set point class based on amount
    const pointClass = entry.points > 0 ? "text-success" : "text-danger";
    const pointPrefix = entry.points > 0 ? "+" : "";

    tableContent += `
      <tr>
        <td>${formattedDate}</td>
        <td>${entry.activity}</td>
        <td class="${pointClass}">${pointPrefix}${entry.points}</td>
      </tr>
    `;
  });

  tableBody.innerHTML = tableContent;
}

/**
 * Add points to user account and record in history
 */
function addUserPoints(email, points, activity) {
  try {
    // Get current user data
    const userData = getUserData(email) || {};

    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = { points: 0 };
    }

    // Add points
    userData.profile.points = (userData.profile.points || 0) + points;

    // Create history entry
    const historyEntry = {
      date: new Date().toISOString(),
      activity: activity || "Recycling activity",
      points: points,
    };

    // Ensure pointsHistory array exists
    if (!userData.pointsHistory) {
      userData.pointsHistory = [];
    }

    // Add entry to history
    userData.pointsHistory.push(historyEntry);

    // Save updated user data
    const success = updateUserData(email, userData);

    if (success) {
      // Update points display if on profile page
      const userPoints = document.getElementById("userPoints");
      if (userPoints) {
        userPoints.textContent = userData.profile.points;

        // Animate points change
        userPoints.classList.add("points-updated");
        setTimeout(() => {
          userPoints.classList.remove("points-updated");
        }, 2000);
      }

      // Update points tab if visible
      updatePointsDisplay(userData);
      loadPointsHistory();
    }

    return success;
  } catch (error) {
    console.error("Error adding user points:", error);
    return false;
  }
}

/**
 * Setup redemption buttons for coupons
 */
function setupRedeemButtons() {
  const redeemButtons = document.querySelectorAll(".redeem-btn");
  if (redeemButtons.length === 0) return;

  const confirmRedeemBtn = document.getElementById("confirmRedeemBtn");
  const redeemModalElement = document.getElementById("redeemConfirmationModal");

  // Check if modal element exists
  if (!redeemModalElement) {
    console.error("Redeem confirmation modal not found");
    return;
  }

  const redeemModal = new bootstrap.Modal(redeemModalElement);

  // Get current user points
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const userData = getUserData(userEmail);
  if (!userData) return;

  const userPoints = userData.profile?.points || 0;

  // Disable buttons if user doesn't have enough points
  redeemButtons.forEach((button) => {
    const pointsCost = parseInt(button.getAttribute("data-points"), 10);
    if (pointsCost > userPoints) {
      button.disabled = true;
      button.title = "Not enough points";
    }

    // Remove any existing event listeners to avoid duplicates
    button.replaceWith(button.cloneNode(true));
  });

  // Re-select buttons after replacement
  const refreshedButtons = document.querySelectorAll(".redeem-btn");

  // Add click event listeners to redeem buttons
  refreshedButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const pointsCost = parseInt(this.getAttribute("data-points"), 10);
      const rewardName = this.getAttribute("data-reward");

      // Update modal content
      document.getElementById("redeemCouponName").textContent = rewardName;
      document.getElementById("redeemCouponPoints").textContent = pointsCost;

      // Calculate remaining balance
      const remainingPoints = userPoints - pointsCost;
      document
        .getElementById("pointsBalance")
        .querySelector("span").textContent = remainingPoints;

      // Store selected coupon data for redemption
      confirmRedeemBtn.setAttribute("data-points", pointsCost);
      confirmRedeemBtn.setAttribute("data-reward", rewardName);

      // Show modal
      redeemModal.show();
    });
  });

  // Handle confirm redemption button
  if (confirmRedeemBtn) {
    // Remove any existing event listeners to avoid duplicates
    const newConfirmBtn = confirmRedeemBtn.cloneNode(true);
    confirmRedeemBtn.parentNode.replaceChild(newConfirmBtn, confirmRedeemBtn);

    newConfirmBtn.addEventListener("click", function () {
      const pointsCost = parseInt(this.getAttribute("data-points"), 10);
      const rewardName = this.getAttribute("data-reward");

      // Redeem the coupon
      redeemCoupon(userEmail, pointsCost, rewardName);

      // Hide modal
      redeemModal.hide();
    });
  }
}

/**
 * Redeem a coupon with points
 */
function redeemCoupon(email, points, couponName) {
  try {
    // Get current user data
    const userData = getUserData(email) || {};

    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = { points: 0 };
    }

    // Check if enough points
    if ((userData.profile.points || 0) < points) {
      showToast("Not enough points to redeem this coupon", "warning");
      return false;
    }

    // Deduct points
    userData.profile.points = (userData.profile.points || 0) - points;

    // Create points history entry for redemption
    const historyEntry = {
      date: new Date().toISOString(),
      activity: `Redeemed ${couponName} coupon`,
      points: -points,
    };

    // Ensure pointsHistory array exists
    if (!userData.pointsHistory) {
      userData.pointsHistory = [];
    }

    // Add entry to history
    userData.pointsHistory.push(historyEntry);

    // Generate coupon code
    const couponCode = generateCouponCode(couponName);

    // Create coupon object
    const coupon = {
      id: Date.now().toString(),
      name: couponName,
      code: couponCode,
      points: points,
      platform: couponName.split(" ")[0], // Extract platform name (Amazon/Noon)
      dateIssued: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isUsed: false,
    };

    // Ensure coupons array exists
    if (!userData.coupons) {
      userData.coupons = [];
    }

    // Add coupon to user data
    userData.coupons.push(coupon);

    // Save updated user data
    const success = updateUserData(email, userData);

    if (success) {
      // Update points display
      const userPoints = document.getElementById("userPoints");
      if (userPoints) {
        userPoints.textContent = userData.profile.points;
      }

      // Update total points display
      const totalPointsDisplay = document.getElementById("totalPointsDisplay");
      if (totalPointsDisplay) {
        totalPointsDisplay.textContent = userData.profile.points;
      }

      // Update points tab
      updatePointsDisplay(userData);
      loadPointsHistory();
      loadUserCoupons();

      // Refresh redeem buttons
      setupRedeemButtons();

      // Show success message
      showToast(`Successfully redeemed ${couponName} coupon!`, "success");
    }

    return success;
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return false;
  }
}

/**
 * Generate a random coupon code
 */
function generateCouponCode(couponName) {
  const platform = couponName.split(" ")[0].toUpperCase(); // AMAZON or NOON
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${platform}-${randomPart}`;
}

/**
 * Load and display user's coupons and rewards
 */
function loadUserCoupons() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  // Get user data
  const userData = getUserData(userEmail);
  if (!userData) return;

  console.log(
    "Loading rewards with user points:",
    userData.profile ? userData.profile.points : 0
  );

  // Get rewards container
  const rewardsContainer = document.querySelector(".rewards-list");
  if (!rewardsContainer) {
    console.error("Rewards container not found");
    return;
  }

  // Clear container
  rewardsContainer.innerHTML = "";

  // Define available rewards
  const availableRewards = [
    {
      name: "Hyper $5 Voucher",
      points: 500,
      platform: "hyper",
      icon: "fa-shopping-cart",
    },
    {
      name: "Hyperone $10 Voucher",
      points: 1000,
      platform: "hyperone",
      icon: "fa-shopping-bag",
    },
    {
      name: "Hyper $20 Voucher",
      points: 2000,
      platform: "hyper",
      icon: "fa-shopping-cart",
    },
    {
      name: "Hyperone $30 Voucher",
      points: 3000,
      platform: "hyperone",
      icon: "fa-shopping-bag",
    },
    {
      name: "Hyper $50 Voucher",
      points: 5000,
      platform: "hyper",
      icon: "fa-shopping-cart",
    },
  ];

  // User points
  const userPoints =
    userData.profile && userData.profile.points ? userData.profile.points : 0;

  // Add rewards to container
  availableRewards.forEach((reward) => {
    const canRedeem = userPoints >= reward.points;

    // For CSS compatibility, we still use amazon/noon classes
    // but data-platform is the new hyper/hyperone
    const iconClass = reward.platform === "hyper" ? "amazon" : "noon";

    const rewardItem = document.createElement("li");
    rewardItem.className = `reward-item ${reward.platform}-reward`;
    rewardItem.setAttribute("data-platform", reward.platform);

    rewardItem.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="platform-icon ${iconClass}">
          <i class="fas ${reward.icon}"></i>
        </div>
        <div>
          <div class="reward-name">${reward.name}</div>
          <span class="reward-points">${reward.points} points</span>
        </div>
      </div>
      <button class="btn btn-sm btn-earn-rewards redeem-btn" 
              data-points="${reward.points}" 
              data-reward="${
                reward.platform === "hyper" ? "Hyper" : "Hyperone"
              } $${reward.points / 100}"
              ${!canRedeem ? "disabled" : ""}>
        <i class="fas fa-exchange-alt me-1"></i> Redeem
      </button>
    `;

    rewardsContainer.appendChild(rewardItem);
  });

  // Initialize redeem buttons for new items
  setupRedeemButtons();

  // Make sure filter is working with new items
  reloadRewardsFilter();

  console.log("Rewards loaded and filter initialized");
}

/**
 * Setup the rewards filter with a more robust implementation
 */
function setupRewardsFilter() {
  console.log("Setting up rewards filter");

  // Get the filter select element
  const filterSelect = document.getElementById("rewardsFilter");
  if (!filterSelect) {
    console.error("Rewards filter select not found");
    return;
  }

  // Remove any existing event listeners by cloning and replacing
  const newFilterSelect = filterSelect.cloneNode(true);
  filterSelect.parentNode.replaceChild(newFilterSelect, filterSelect);

  // Add the event listener to the new element
  newFilterSelect.addEventListener("change", function () {
    const selectedPlatform = this.value;
    console.log("Filter changed to:", selectedPlatform);

    // Get all reward items
    const rewardItems = document.querySelectorAll(".reward-item");
    console.log("Found", rewardItems.length, "reward items");

    // Filter the rewards
    rewardItems.forEach((item) => {
      const itemPlatform = item.getAttribute("data-platform") || "";
      console.log("Item platform:", itemPlatform);

      // Determine if this item should be shown
      const shouldShow =
        selectedPlatform === "all" ||
        itemPlatform === selectedPlatform ||
        // Handle old platform values
        (selectedPlatform === "hyper" && itemPlatform === "amazon") ||
        (selectedPlatform === "hyperone" && itemPlatform === "noon");

      // Show or hide the item
      item.style.display = shouldShow ? "flex" : "none";
      console.log("Item visibility:", shouldShow ? "showing" : "hiding", item);
    });
  });

  // Make sure the current selection is applied
  const initialFilter = newFilterSelect.value;
  if (initialFilter && initialFilter !== "all") {
    // Trigger the filter
    const event = new Event("change");
    newFilterSelect.dispatchEvent(event);
  }
}

/**
 * Enlarge image when thumbnail is clicked with caching
 */
function enlargeImage(imageSrc) {
  // Show loading state
  const loadingModal = document.createElement("div");
  loadingModal.className = "modal-backdrop fade show";
  loadingModal.innerHTML = `
    <div class="position-fixed top-50 start-50 translate-middle">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
  document.body.appendChild(loadingModal);

  // Load and cache the image
  loadAndCacheImage(imageSrc)
    .then(() => {
      // Remove loading state
      document.body.removeChild(loadingModal);

      // Create a modal for the enlarged image
      const modalHtml = `
        <div class="modal fade" id="imageEnlargeModal" tabindex="-1">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content image-modal">
              <div class="modal-header">
                <h5 class="modal-title">Device Image</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-0 text-center">
                <img src="${imageSrc}" class="enlarged-image" alt="Enlarged device image" loading="lazy">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Add modal to DOM
      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);

      // Show modal
      const modal = new bootstrap.Modal(
        document.getElementById("imageEnlargeModal")
      );
      modal.show();

      // Remove modal from DOM when hidden
      document
        .getElementById("imageEnlargeModal")
        .addEventListener("hidden.bs.modal", () => {
          modalContainer.remove();
        });
    })
    .catch(() => {
      // Remove loading state and show error
      document.body.removeChild(loadingModal);
      showToast("Failed to load image. Please try again.", "danger");
    });
}

/**
 * Check login status and update navbar (synchronized with about-us.js and main.js)
 */
function checkLoginStatusAndUpdateNavbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const pointsDisplay = document.querySelector(".points-display-navbar");

  console.log("Profile page: Checking login status:", isLoggedIn);

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
    updateUserInfoInNavbar(userEmail);

    // Update points display
    updatePointsDisplayInNavbar(userEmail);
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
 * Update user information in navbar (synchronized with about-us.js and main.js)
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
 * Update points display in navbar (synchronized with about-us.js and main.js)
 */
function updatePointsDisplayInNavbar(email) {
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

/**
 * Call setupRewardsFilter after any DOM updates that affect the rewards list
 */
function reloadRewardsFilter() {
  // Short timeout to ensure DOM is updated
  setTimeout(setupRewardsFilter, 100);
}

// Add a direct save method that bypasses the confirmation modal
window.saveProfileDirectly = function () {
  console.log("Direct save method called");

  // Get the user email
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    showToast("User email not found. Please log in again.", "danger");
    return;
  }

  try {
    // Get form data
    const form = document.getElementById("personalInfoForm");
    if (!form) {
      console.error("Personal info form not found");
      showToast("Form not found. Please refresh the page.", "danger");
      return;
    }

    // Get form field values - add defensive checks
    const firstName = document.getElementById("firstName")?.value?.trim() || "";
    const lastName = document.getElementById("lastName")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";

    // Get address fields with defensive checks
    const address = document.getElementById("address")?.value?.trim() || "";
    const addressLine2 =
      document.getElementById("addressLine2")?.value?.trim() || "";
    const city = document.getElementById("city")?.value?.trim() || "";
    const state = document.getElementById("state")?.value?.trim() || "";
    const zip = document.getElementById("zip")?.value?.trim() || "";

    console.log("Collected form data:", {
      firstName,
      lastName,
      phone,
      address,
    });

    // Create address object
    const addressObject = {
      street: address,
      apt: addressLine2,
      city: city,
      state: state,
      zip: zip,
    };

    // Get existing user data
    const userData = getUserData(userEmail) || {};
    console.log("Existing user data:", userData);

    // Create updated profile object
    const profileData = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phone,
      email: userEmail,
      address: addressObject,
    };

    // Preserve existing profile image if present
    if (userData && userData.profile && userData.profile.profileImage) {
      profileData.profileImage = userData.profile.profileImage;
    }

    // Preserve existing points if present
    if (userData && userData.profile && userData.profile.points) {
      profileData.points = userData.profile.points;
    }

    // Show saving indicator
    const saveButton = document.getElementById("saveInfoBtn");
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    }

    // Display what we're saving for debugging
    console.log("Profile data being saved:", profileData);

    // Directly update user profile in local storage
    const success = updateUserProfile(userEmail, profileData);
    console.log("Direct save result:", success);

    setTimeout(() => {
      // Reset button state
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
      }

      if (success) {
        showToast("Profile information saved successfully!", "success");
        // Update navigation and profile display
        checkLoginStatusAndUpdateNavbar();
        loadUserProfile();
      } else {
        showToast(
          "Failed to save profile information. Please try again.",
          "danger"
        );
      }
    }, 1000);
  } catch (error) {
    console.error("Error in saveProfileDirectly:", error);
    showToast("An error occurred while saving. Please try again.", "danger");

    // Reset button state
    const saveButton = document.getElementById("saveInfoBtn");
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
    }
  }
};

/**
 * Update user data in localStorage
 */
function updateUserData(email, userData) {
  try {
    // Save to user-specific storage
    localStorage.setItem(`userData_${email}`, JSON.stringify(userData));

    // Also update in users object if it exists
    try {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[email]) {
        // Merge the updated profile data with existing user data
        users[email] = {
          ...users[email],
          profile: {
            ...(users[email].profile || {}),
            ...(userData.profile || {}),
          },
        };

        localStorage.setItem("users", JSON.stringify(users));
      }
    } catch (e) {
      console.error("Error updating users object in updateUserData:", e);
    }

    return true;
  } catch (error) {
    console.error("Error updating user data:", error);
    return false;
  }
}

/**
 * Set up the quotes filter functionality
 */
function setupQuotesFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (!filterButtons.length) return; // Exit if no filter buttons found

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Visual feedback for clicked button
      this.classList.add("filter-btn-clicked");
      setTimeout(() => {
        this.classList.remove("filter-btn-clicked");
      }, 300);

      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      filterQuotes(filter);
    });
  });

  // Initial filter update (show all by default)
  filterQuotes("all");
}

/**
 * Filter quotes based on status
 * @param {string} status - The status to filter by ('all' or specific status)
 */
function filterQuotes(status) {
  const quoteRows = document.querySelectorAll("#quotesTable tbody tr");
  let visibleCount = 0;

  if (!quoteRows.length) {
    const emptyState = document.querySelector(".quotes-empty-state");
    if (emptyState) {
      emptyState.classList.remove("d-none");
    }
    return;
  }

  quoteRows.forEach((row) => {
    const rowStatus = row.getAttribute("data-status");

    // Remove any previous highlight
    row.classList.remove("row-highlight");

    if (status === "all" || rowStatus === status) {
      row.classList.remove("d-none");

      // Add highlight animation
      row.classList.add("row-highlight");

      visibleCount++;
    } else {
      row.classList.add("d-none");
    }
  });

  // Toggle empty state message
  const emptyState = document.querySelector(".quotes-empty-state");
  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.classList.remove("d-none");
      emptyState.textContent = `No quotes found with status "${status}"`;
    } else {
      emptyState.classList.add("d-none");
    }
  }

  // Update count badges
  updateQuoteFilterCounts();
}

/**
 * Update the count badges on filter buttons
 */
function updateQuoteFilterCounts() {
  const quoteRows = document.querySelectorAll("#quotesTable tbody tr");
  const statusCounts = {
    all: 0,
    Pending: 0,
    Quoted: 0,
    Accepted: 0,
    Completed: 0,
    Rejected: 0,
  };

  // Count quotes by status
  quoteRows.forEach((row) => {
    const status = row.getAttribute("data-status");
    if (status && statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
    statusCounts.all++;
  });

  // Update the badges
  for (const [status, count] of Object.entries(statusCounts)) {
    const badge = document.querySelector(`.${status.toLowerCase()}-count`);
    if (badge) {
      badge.textContent = count;

      // Highlight badge if count > 0
      if (count > 0) {
        badge.classList.add("badge", "bg-primary");
      } else {
        badge.classList.remove("bg-primary");
        badge.classList.add("badge", "bg-secondary");
      }
    }
  }
}

/**
 * Set up the view details buttons
 */
function setupViewDetailsButtons() {
  const viewButtons = document.querySelectorAll(".view-details-btn");

  if (!viewButtons.length) return; // Exit if no view buttons found

  viewButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const quoteId = this.getAttribute("data-id");
      showQuoteDetails(quoteId);
    });
  });
}

/**
 * Show quote details in the modal
 * @param {string} quoteId - The ID of the quote to display
 */
function showQuoteDetails(quoteId) {
  console.log(`Showing details for quote ID: ${quoteId}`);

  // Get the quote data - in a real app, this would come from an API or storage
  // For now, we'll use the data from the table row
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (!quoteRow) {
    console.error(`Quote with ID ${quoteId} not found`);
    return;
  }

  const status = quoteRow.getAttribute("data-status");
  const date = quoteRow.querySelector("td:nth-child(2)").textContent;
  const device = quoteRow.querySelector("td:nth-child(3)").textContent;
  const amount = quoteRow
    .querySelector("td:nth-child(4)")
    .textContent.replace("$", "");

  // Set modal data
  document.getElementById("modal-quote-id").textContent = quoteId;
  document.getElementById("modal-quote-date").textContent = date;
  document.getElementById("modal-quote-status").textContent = status;
  document.getElementById("modal-quote-amount").textContent = amount;

  // Set expiry date (14 days from submitted date)
  const submittedDate = new Date(date);
  const expiryDate = new Date(submittedDate);
  expiryDate.setDate(expiryDate.getDate() + 14);
  document.getElementById("modal-quote-expiry").textContent =
    expiryDate.toLocaleDateString();

  // Set status badge color
  const statusBadge = document.getElementById("modal-quote-status");
  statusBadge.className = "badge"; // Reset classes

  switch (status) {
    case "Pending":
      statusBadge.classList.add("bg-warning");
      break;
    case "Quoted":
      statusBadge.classList.add("bg-info");
      break;
    case "Accepted":
      statusBadge.classList.add("bg-success");
      break;
    case "Completed":
      statusBadge.classList.add("bg-primary");
      break;
    case "Rejected":
      statusBadge.classList.add("bg-danger");
      break;
    default:
      statusBadge.classList.add("bg-secondary");
  }

  // Sample device data - in a real app, this would be fetched
  const devices = [
    {
      type: "Smartphone",
      model: device,
      condition: "Good",
      value: amount,
    },
  ];

  // Populate device list
  const deviceList = document.getElementById("modal-device-list");
  deviceList.innerHTML = "";

  devices.forEach((device) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${device.type}</td>
      <td>${device.model}</td>
      <td>${device.condition}</td>
      <td>$${device.value}</td>
    `;
    deviceList.appendChild(row);
  });

  // Set note
  document.getElementById("modal-quote-notes").innerHTML = `
    <i class="fas fa-sticky-note me-2"></i> 
    This quote is based on the described condition of your ${device}. 
    Please ensure all personal data is backed up and removed before sending the device.
  `;

  // Show/hide action buttons based on status
  const acceptBtn = document.getElementById("modal-accept-btn");
  const rejectBtn = document.getElementById("modal-reject-btn");

  if (status === "Quoted") {
    acceptBtn.classList.remove("d-none");
    rejectBtn.classList.remove("d-none");

    // Set up button actions
    acceptBtn.onclick = () => acceptQuote(quoteId);
    rejectBtn.onclick = () => rejectQuote(quoteId);
  } else {
    acceptBtn.classList.add("d-none");
    rejectBtn.classList.add("d-none");
  }

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("quoteDetailsModal")
  );
  modal.show();
}

/**
 * Set up the quote action buttons (accept/reject)
 */
function setupQuoteActionButtons() {
  const acceptButtons = document.querySelectorAll(".accept-quote-btn");
  const rejectButtons = document.querySelectorAll(".reject-quote-btn");

  acceptButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent triggering parent row click
      const quoteId = this.closest("tr").getAttribute("data-id");
      acceptQuote(quoteId);
    });
  });

  rejectButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent triggering parent row click
      const quoteId = this.closest("tr").getAttribute("data-id");
      rejectQuote(quoteId);
    });
  });
}

/**
 * Accept a quote
 * @param {string} quoteId - The ID of the quote to accept
 */
function acceptQuote(quoteId) {
  console.log(`Accepting quote ID: ${quoteId}`);

  // In a real app, this would send a request to the server
  // For now, we'll just update the UI
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (quoteRow) {
    // Update status
    quoteRow.setAttribute("data-status", "Accepted");
    const statusCell = quoteRow.querySelector("td:nth-child(5) span");
    statusCell.textContent = "Accepted";
    statusCell.className = "badge bg-success";

    // Hide accept/reject buttons in the row
    const actionCell = quoteRow.querySelector("td:last-child");
    const acceptBtn = actionCell.querySelector(".accept-quote-btn");
    const rejectBtn = actionCell.querySelector(".reject-quote-btn");

    if (acceptBtn) acceptBtn.classList.add("d-none");
    if (rejectBtn) rejectBtn.classList.add("d-none");

    // Show success message
    const alert = document.createElement("div");
    alert.className = "alert alert-success alert-dismissible fade show mt-3";
    alert.innerHTML = `
      <i class="fas fa-check-circle me-2"></i> 
      You've successfully accepted the quote for ${
        quoteRow.querySelector("td:nth-child(3)").textContent
      }.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const quotesTab = document.querySelector("#quotesTab .tab-pane");
    if (quotesTab) {
      quotesTab.prepend(alert);
    }

    // Close the modal if it's open
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("quoteDetailsModal")
    );
    if (modal) {
      modal.hide();
    }

    // Update filter counts
    updateQuoteFilterCounts();
  }
}

/**
 * Reject a quote
 * @param {string} quoteId - The ID of the quote to reject
 */
function rejectQuote(quoteId) {
  console.log(`Rejecting quote ID: ${quoteId}`);

  // In a real app, this would send a request to the server
  // For now, we'll just update the UI
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (quoteRow) {
    // Update status
    quoteRow.setAttribute("data-status", "Rejected");
    const statusCell = quoteRow.querySelector("td:nth-child(5) span");
    statusCell.textContent = "Rejected";
    statusCell.className = "badge bg-danger";

    // Hide accept/reject buttons in the row
    const actionCell = quoteRow.querySelector("td:last-child");
    const acceptBtn = actionCell.querySelector(".accept-quote-btn");
    const rejectBtn = actionCell.querySelector(".reject-quote-btn");

    if (acceptBtn) acceptBtn.classList.add("d-none");
    if (rejectBtn) rejectBtn.classList.add("d-none");

    // Show rejection message
    const alert = document.createElement("div");
    alert.className = "alert alert-info alert-dismissible fade show mt-3";
    alert.innerHTML = `
      <i class="fas fa-info-circle me-2"></i> 
      You've rejected the quote for ${
        quoteRow.querySelector("td:nth-child(3)").textContent
      }.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const quotesTab = document.querySelector("#quotesTab .tab-pane");
    if (quotesTab) {
      quotesTab.prepend(alert);
    }

    // Close the modal if it's open
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("quoteDetailsModal")
    );
    if (modal) {
      modal.hide();
    }

    // Update filter counts
    updateQuoteFilterCounts();
  }
}

/**
 * Initialize all quotes functionality
 */
function initializeQuotes() {
  setupQuotesFilter();
  setupViewDetailsButtons();
  setupQuoteActionButtons();
  updateQuoteFilterCounts();
}
