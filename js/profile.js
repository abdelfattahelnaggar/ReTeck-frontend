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

  // Load user's coupons (if function exists)
  if (typeof loadUserCoupons === "function") {
    loadUserCoupons();
  }

  // Setup forms and event listeners
  setupProfileForm();
  setupProfileImageUpload();
  setupQuotesFilter();
  setupRedeemButtons();
  setupHyperOneRewards();

  // Initialize quotes and action buttons
  addQuoteActionListeners();

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

  // Direct fix for filter buttons
  directFixQuotesFilter();

  // Ensure responsive profile manager is initialized
  ensureResponsiveProfileManager();

  // Force load points history after a short delay to ensure DOM is ready
  setTimeout(() => {
    console.log("🔄 Force loading points history after DOM ready");
    loadPointsHistory();
    initializeMyPointsSection();
  }, 250);
});

/**
 * Direct fix for quotes filter functionality
 * This function applies event listeners directly to the filter buttons
 */
function directFixQuotesFilter() {
  console.log("Applying direct fix to quotes filter");

  // Get all filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  console.log(`Found ${filterButtons.length} filter buttons`);

  if (filterButtons.length === 0) {
    console.error("No filter buttons found with class .filter-btn");
    return;
  }

  // Remove active class from all buttons first
  filterButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Set 'all' button as active
  const allButton = document.querySelector('.filter-btn[data-filter="all"]');
  if (allButton) {
    allButton.classList.add("active");
  }

  // Apply direct event listeners to each button
  filterButtons.forEach((button) => {
    // Remove any existing event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Get the filter status from the button
    const filterStatus = newButton.getAttribute("data-filter");
    console.log(`Setting up filter button for: ${filterStatus}`);

    // Add click event listener
    newButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log(`Filter button clicked: ${filterStatus}`);

      // Remove active class from all buttons
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Apply filter
      directFilterQuotes(filterStatus);
    });
  });

  // Apply initial filter to show all quotes
  directFilterQuotes("all");
}

/**
 * Direct implementation of quote filtering functionality
 * @param {string} status - The status to filter by ('all' or specific status)
 */
function directFilterQuotes(status) {
  console.log(`Directly filtering quotes by status: ${status}`);

  // Get all quote rows
  const tableRows = document.querySelectorAll("#quotesTableBody tr");
  console.log(`Found ${tableRows.length} rows in the quotes table`);

  let visibleCount = 0;

  // Filter rows based on status
  tableRows.forEach((row) => {
    const rowStatus = row.getAttribute("data-status");
    console.log(`Row ${row.getAttribute("data-id")} has status: ${rowStatus}`);

    if (status === "all" || rowStatus === status) {
      // Show row
      row.style.display = "";
      visibleCount++;
    } else {
      // Hide row
      row.style.display = "none";
    }
  });

  console.log(`Visible rows after filtering: ${visibleCount}`);

  // Update the count badges
  updateFilterCountBadges();
}

/**
 * Update the count badges on the filter buttons
 */
function updateFilterCountBadges() {
  // Get all table rows
  const tableRows = document.querySelectorAll("#quotesTableBody tr");

  // Initialize counters
  const counts = {
    all: tableRows.length,
    Pending: 0,
    Quoted: 0,
    Accepted: 0,
    Completed: 0,
    Rejected: 0,
  };

  // Count rows by status
  tableRows.forEach((row) => {
    const status = row.getAttribute("data-status");
    if (status && counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });

  console.log("Status counts:", counts);

  // Update the count badges
  Object.keys(counts).forEach((status) => {
    const countElement = document.querySelector(
      `.${status.toLowerCase()}-count`
    );
    if (countElement) {
      countElement.textContent = counts[status];
    }
  });
}

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

  // Update points display with actual points value
  const userPoints = userData.profile?.points || 0;
  updatePointsDisplay(userPoints);

  // Populate personal info form
  populatePersonalInfoForm(userData.profile || {});
}

/**
 * Populate the personal information form with user data
 */
function populatePersonalInfoForm(profile) {
  if (profile) {
    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("emailAddress").value =
      profile.email || localStorage.getItem("userEmail") || "";
    if (profile.address) {
      document.getElementById("address").value = profile.address.street || "";
      document.getElementById("addressLine2").value = profile.address.apt || "";
      document.getElementById("city").value = profile.address.city || "";
      document.getElementById("state").value = profile.address.state || "";
      document.getElementById("zip").value = profile.address.zip || "";
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

        // Use the enhanced modal instead of the static one
        const pointsAmount =
          points === "--" ? 0 : parseInt(points.replace(/[^0-9]/g, "")) || 0;
        showEnhancedQuoteModal({
          id: requestId,
          type,
          device,
          date,
          status,
          amount: pointsAmount,
          pointsText: points,
        });
      } catch (error) {
        console.error("Error extracting data from row:", error);
        // Use fallback modal
        if (typeof showFallbackQuoteModal === "function") {
          showFallbackQuoteModal(requestId);
        } else {
          alert(
            "There was an error displaying the quote details. Please try again."
          );
        }
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
        phone: phone,
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
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, info, warning, danger)
 */
function showToast(message, type = "info") {
  window.showToast(message, type);
}

/**
 * Update points display in the points tab with enhanced animations
 * @param {number} points - Points to display
 */
function updatePointsDisplay(points) {
  const totalPointsDisplay = document.getElementById("totalPointsDisplay");
  if (totalPointsDisplay) {
    const currentValue = parseInt(totalPointsDisplay.textContent) || 0;
    const newValue = points || 0;

    if (currentValue !== newValue) {
      animatePointsCountUp(totalPointsDisplay, currentValue, newValue);
    }
  }

  // Update progress bar
  updateRewardProgressBar(points || 0);

  // Add celebration effect for significant point gains
  if (
    points > 0 &&
    points - (parseInt(totalPointsDisplay?.textContent) || 0) >= 50
  ) {
    addPointsGainEffect();
  }
}

/**
 * Animate points count up with smooth transition
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 */
function animatePointsCountUp(element, start, end) {
  if (!element) return;

  const duration = Math.min(1000, Math.abs(end - start) * 50); // Max 1 second
  const startTime = performance.now();
  const difference = end - start;

  // Add loading state
  element.closest(".card")?.classList.add("points-loading");

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Use easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(start + difference * easeOut);

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      // Remove loading state and add completion effect
      element.closest(".card")?.classList.remove("points-loading");
      element.classList.add("points-updated");
      setTimeout(() => element.classList.remove("points-updated"), 500);
    }
  }

  requestAnimationFrame(updateCount);
}

/**
 * Update reward progress bar based on current points
 * @param {number} points - Current points
 */
function updateRewardProgressBar(points) {
  const progressBar = document.getElementById("nextRewardProgressBar");
  const pointsNeeded = document.getElementById("pointsNeeded");

  if (!progressBar || !pointsNeeded) return;

  // Define reward tiers
  const rewardTiers = [100, 150, 200, 250, 500];
  let nextReward =
    rewardTiers.find((tier) => tier > points) ||
    rewardTiers[rewardTiers.length - 1];
  let currentTierIndex = rewardTiers.findIndex((tier) => tier > points);

  if (currentTierIndex === -1) {
    // User has reached highest tier
    nextReward = rewardTiers[rewardTiers.length - 1];
    currentTierIndex = rewardTiers.length - 1;
  }

  const previousTier =
    currentTierIndex > 0 ? rewardTiers[currentTierIndex - 1] : 0;
  const progressInTier = points - previousTier;
  const tierRange = nextReward - previousTier;
  const progressPercentage = Math.min((progressInTier / tierRange) * 100, 100);

  // Animate progress bar
  progressBar.style.width = `${progressPercentage}%`;

  // Update points needed text
  const needed = Math.max(0, nextReward - points);
  if (needed === 0) {
    pointsNeeded.textContent = "Reward available!";
  } else {
    pointsNeeded.textContent = `${needed} points needed`;
  }
}

/**
 * Add celebration effect for points gain
 */
function addPointsGainEffect() {
  const pointsCard = document.querySelector("#points .card-body .card");
  if (!pointsCard) return;

  // Create celebration particles
  for (let i = 0; i < 10; i++) {
    createCelebrationParticle(pointsCard);
  }

  // Add pulse effect to points display
  const pointsDisplay = document.getElementById("totalPointsDisplay");
  if (pointsDisplay) {
    pointsDisplay.classList.add("points-celebration");
    setTimeout(
      () => pointsDisplay.classList.remove("points-celebration"),
      1000
    );
  }
}

/**
 * Create celebration particle effect
 * @param {HTMLElement} container - Container element
 */
function createCelebrationParticle(container) {
  const particle = document.createElement("div");
  particle.className = "celebration-particle";
  particle.innerHTML = ["🎉", "✨", "💰", "🌟", "💎"][
    Math.floor(Math.random() * 5)
  ];

  // Random position within container
  const rect = container.getBoundingClientRect();
  particle.style.position = "absolute";
  particle.style.left = Math.random() * rect.width + "px";
  particle.style.top = Math.random() * rect.height + "px";
  particle.style.fontSize = "1.5rem";
  particle.style.pointerEvents = "none";
  particle.style.zIndex = "1000";
  particle.style.animation = "celebrationFloat 2s ease-out forwards";

  container.style.position = "relative";
  container.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => particle.remove(), 2000);
}

/**
 * Initialize My Points section displays on page load
 */
function initializeMyPointsSection() {
  // Use a small delay to ensure DOM elements are fully rendered
  setTimeout(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    // Get user data
    const userData = getUserData(userEmail);
    if (!userData || !userData.profile) return;

    const userPoints = userData.profile.points || 0;

    // Update the main points display in My Points section
    const totalPointsDisplay = document.getElementById("totalPointsDisplay");
    if (totalPointsDisplay) {
      // Set points directly to avoid animation on initial load
      totalPointsDisplay.textContent = userPoints;
      console.log(`Set totalPointsDisplay to ${userPoints} points`);
    } else {
      console.warn("totalPointsDisplay element not found");
    }

    // Update progress bar
    updateRewardProgressBar(userPoints);

    // Update monthly statistics summary
    updatePointsDisplaySummary(userPoints, userData.pointsHistory || []);

    // Initialize rewards section with proper points
    if (typeof loadAvailableRewards === "function") {
      loadAvailableRewards(userData);
    }

    // Update all redeem button states
    if (typeof setupRedeemButtons === "function") {
      setupRedeemButtons();
    }

    console.log(`My Points section initialized with ${userPoints} points`);
  }, 100); // Small delay to ensure DOM is ready
}

/**
 * Load user's vouchers/coupons
 */
function loadUserCoupons() {
  // This function calls the existing loadUserVouchers functionality
  loadUserVouchers();
}

/**
 * Aggressively clean up all modal backdrops and instances
 * This is a comprehensive solution to prevent backdrop freezing
 */
function forceModalCleanupComplete() {
  console.log("🧹 Executing ULTIMATE modal backdrop cleanup");

  try {
    // STEP 1: Destroy ALL Bootstrap modal instances aggressively
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      try {
        // Try multiple disposal methods
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.dispose();
        }

        // Force hide any still-showing modals
        modal.classList.remove("show");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        modal.removeAttribute("aria-modal");
      } catch (e) {
        console.warn("Error disposing modal:", e);
      }
    });

    // STEP 2: Nuclear backdrop removal - try every possible selector
    const backdropSelectors = [
      ".modal-backdrop",
      ".modal-backdrop.fade",
      ".modal-backdrop.show",
      ".modal-backdrop.fade.show",
      ".fade.modal-backdrop",
      ".show.modal-backdrop",
      ".fade.show.modal-backdrop",
      '[class*="modal-backdrop"]',
      '[class*="backdrop"]',
      'div[style*="background-color: rgba(0, 0, 0"]',
      'div[style*="background: rgba(0, 0, 0"]',
    ];

    backdropSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          el.remove();
          console.log(`Removed backdrop element: ${selector}`);
        });
      } catch (e) {
        console.warn(`Error with selector ${selector}:`, e);
      }
    });

    // STEP 3: Scan ALL elements for backdrop-like properties
    const allElements = Array.from(document.querySelectorAll("*"));
    allElements.forEach((el) => {
      try {
        const computedStyle = window.getComputedStyle(el);
        const inlineStyle = el.style;

        // Check for backdrop-like styling
        const isBackdropLike =
          el.classList.contains("modal-backdrop") ||
          (computedStyle.position === "fixed" &&
            (computedStyle.backgroundColor === "rgba(0, 0, 0, 0.5)" ||
              computedStyle.backgroundColor === "rgba(0, 0, 0, 0.4)" ||
              computedStyle.backgroundColor === "rgba(0, 0, 0, 0.6)" ||
              inlineStyle.backgroundColor === "rgba(0, 0, 0, 0.5)" ||
              inlineStyle.backgroundColor === "rgba(0, 0, 0, 0.4)" ||
              computedStyle.background?.includes("rgba(0, 0, 0") ||
              inlineStyle.background?.includes("rgba(0, 0, 0"))) ||
          (computedStyle.position === "fixed" &&
            computedStyle.top === "0px" &&
            computedStyle.left === "0px" &&
            computedStyle.width === "100%" &&
            computedStyle.height === "100%" &&
            computedStyle.zIndex > 1000);

        if (isBackdropLike) {
          console.log("Removing backdrop-like element:", el);
          el.remove();
        }
      } catch (e) {
        // Ignore errors for elements that can't be checked
      }
    });

    // STEP 4: Reset body state completely
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.body.style.removeProperty("margin-right");
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("padding-right");

    // STEP 5: Force DOM reflow to ensure changes take effect
    document.body.offsetHeight;

    // STEP 6: Final verification and cleanup after a short delay
    setTimeout(() => {
      const remainingBackdrops = document.querySelectorAll(
        '.modal-backdrop, [class*="backdrop"]'
      );
      if (remainingBackdrops.length > 0) {
        console.warn(
          `⚠️ Found ${remainingBackdrops.length} remaining backdrops, removing...`
        );
        remainingBackdrops.forEach((backdrop) => {
          backdrop.style.display = "none";
          backdrop.remove();
        });
      }
    }, 50);

    console.log("✅ ULTIMATE modal cleanup completed successfully");
  } catch (error) {
    console.error("Error during ULTIMATE modal cleanup:", error);

    // Last resort: brute force DOM cleanup
    try {
      document.querySelectorAll("*").forEach((el) => {
        if (
          el.style.position === "fixed" &&
          el.style.backgroundColor?.includes("rgba(0, 0, 0") &&
          el.style.zIndex > 1000
        ) {
          el.remove();
        }
      });
    } catch (e) {
      console.error("Even brute force cleanup failed:", e);
    }
  }
}

/**
 * IMMEDIATE synchronous modal backdrop cleanup - no delays
 */
function immediateModalCleanup() {
  console.log("⚡ IMMEDIATE modal backdrop cleanup");

  try {
    // Remove all backdrop elements immediately using multiple selectors
    const selectors = [
      ".modal-backdrop",
      ".modal-backdrop.fade",
      ".modal-backdrop.show",
      ".modal-backdrop.fade.show",
      ".fade.modal-backdrop",
      ".show.modal-backdrop",
      ".fade.show.modal-backdrop",
      '[class*="modal-backdrop"]',
      '[class*="backdrop"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Force body state reset
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.marginRight = "";

    // Force DOM reflow
    document.body.offsetHeight;
  } catch (error) {
    console.error("Error in immediate cleanup:", error);
  }
}

/**
 * IMMEDIATE synchronous modal backdrop cleanup - no delays
 */
function immediateModalCleanup() {
  console.log("⚡ IMMEDIATE modal backdrop cleanup");

  try {
    // Remove all backdrop elements immediately using multiple selectors
    const selectors = [
      ".modal-backdrop",
      ".modal-backdrop.fade",
      ".modal-backdrop.show",
      ".modal-backdrop.fade.show",
      ".fade.modal-backdrop",
      ".show.modal-backdrop",
      ".fade.show.modal-backdrop",
      '[class*="modal-backdrop"]',
      '[class*="backdrop"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Force body state reset
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.marginRight = "";

    // Force DOM reflow
    document.body.offsetHeight;
  } catch (error) {
    console.error("Error in immediate cleanup:", error);
  }
}

/**
 * Emergency modal cleanup with multiple execution attempts and enhanced verification
 */
function emergencyModalCleanup() {
  console.log("🚨 EMERGENCY modal cleanup sequence initiated");

  // Execute immediate cleanup first
  immediateModalCleanup();

  // Execute comprehensive cleanup immediately
  forceModalCleanupComplete();

  // Execute again after short delay
  setTimeout(() => {
    forceModalCleanupComplete();
  }, 50);

  // Execute one more time after longer delay
  setTimeout(() => {
    forceModalCleanupComplete();
  }, 200);

  // Final verification and nuclear cleanup if needed
  setTimeout(() => {
    const remainingBackdrops = document.querySelectorAll(
      ".modal-backdrop, [class*='backdrop']"
    );
    if (remainingBackdrops.length > 0) {
      console.warn(
        `⚠️ ${remainingBackdrops.length} backdrops still present, executing nuclear cleanup`
      );

      // Nuclear option: remove any element that looks like a backdrop
      remainingBackdrops.forEach((backdrop) => {
        backdrop.style.display = "none";
        backdrop.style.opacity = "0";
        backdrop.style.visibility = "hidden";
        backdrop.remove();
      });

      // Double-check by scanning for fixed positioned dark overlays
      document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.position === "fixed" &&
          style.zIndex > 1000 &&
          (style.backgroundColor?.includes("rgba(0, 0, 0") ||
            style.background?.includes("rgba(0, 0, 0"))
        ) {
          console.log("Nuclear cleanup: removing fixed overlay", el);
          el.remove();
        }
      });
    }

    // Final body state verification
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    console.log("✅ Emergency cleanup sequence completed");
  }, 500);
}

// Expose modal cleanup functions globally for debugging
window.clearModalBackdrop = emergencyModalCleanup;
window.forceModalCleanup = forceModalCleanupComplete;

/**
 * AUTOMATIC BACKDROP WATCHER - Runs periodically to catch lingering backdrops
 */
function startAutomaticBackdropWatcher() {
  // Check for lingering backdrops every 2 seconds
  setInterval(() => {
    const backdrops = document.querySelectorAll(
      '.modal-backdrop, [class*="backdrop"]'
    );
    const visibleModals = document.querySelectorAll(".modal.show");

    // If we have backdrops but no visible modals, clean them up
    if (backdrops.length > 0 && visibleModals.length === 0) {
      console.warn(
        `🔍 Backdrop watcher detected ${backdrops.length} orphaned backdrops, cleaning up...`
      );
      immediateModalCleanup();
    }

    // Also check for frozen body state
    if (
      document.body.classList.contains("modal-open") &&
      visibleModals.length === 0
    ) {
      console.warn("🔍 Backdrop watcher detected frozen body state, fixing...");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, 2000);
}

// Start the automatic backdrop watcher
startAutomaticBackdropWatcher();

/**
 * Add enhanced redemption celebration effect
 */
function addRedemptionCelebrationEffect() {
  const pointsSection = document.getElementById("points");
  if (!pointsSection) return;

  // Create confetti effect
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      createConfettiParticle(pointsSection);
    }, i * 100);
  }

  // Add success pulse to the entire points section
  pointsSection.classList.add("redemption-success");
  setTimeout(() => {
    pointsSection.classList.remove("redemption-success");
  }, 2000);
}

/**
 * Create confetti particle for redemption celebration
 * @param {HTMLElement} container - Container element
 */
function createConfettiParticle(container) {
  const particle = document.createElement("div");
  particle.className = "confetti-particle";
  particle.innerHTML = ["🎊", "🎉", "✨", "🌟", "💫"][
    Math.floor(Math.random() * 5)
  ];

  // Random position from top of container
  particle.style.position = "fixed";
  particle.style.left = Math.random() * window.innerWidth + "px";
  particle.style.top = "0px";
  particle.style.fontSize = "2rem";
  particle.style.pointerEvents = "none";
  particle.style.zIndex = "9999";
  particle.style.animation = `confettiFall ${
    2 + Math.random() * 2
  }s ease-out forwards`;

  document.body.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => particle.remove(), 4000);
}

/**
 * Enhanced points update with visual feedback
 * @param {number} newPoints - New points value
 */
function updatePointsWithFeedback(newPoints) {
  const pointsDisplay = document.getElementById("totalPointsDisplay");
  if (!pointsDisplay) return;

  const currentPoints = parseInt(pointsDisplay.textContent) || 0;
  const difference = newPoints - currentPoints;

  // Show points change indicator
  if (difference !== 0) {
    showPointsChangeIndicator(difference);
  }

  // Update with animation
  animatePointsCountUp(pointsDisplay, currentPoints, newPoints);
  updateRewardProgressBar(newPoints);
}

/**
 * Show points change indicator
 * @param {number} change - Points change amount
 */
function showPointsChangeIndicator(change) {
  const indicator = document.createElement("div");
  indicator.className = "points-change-indicator";
  indicator.innerHTML = `${change > 0 ? "+" : ""}${change}`;
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${change > 0 ? "#28a745" : "#dc3545"};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    z-index: 9999;
    animation: pointsChangeSlide 3s ease-out forwards;
  `;

  document.body.appendChild(indicator);

  // Remove after animation
  setTimeout(() => indicator.remove(), 3000);
}

/**
 * Reset button state with visual feedback
 * @param {HTMLElement} button - Button element
 * @param {string} state - State to set ('error', 'success', 'normal')
 */
function resetButtonState(button, state = "normal") {
  if (!button) return;

  button.disabled = false;
  button.classList.remove("loading");

  switch (state) {
    case "error":
      button.classList.add("error");
      button.innerHTML =
        '<i class="fas fa-exclamation-triangle me-1"></i> Error';
      setTimeout(() => {
        button.classList.remove("error");
        button.innerHTML = "Redeem";
      }, 2000);
      break;

    case "success":
      button.classList.add("success");
      button.innerHTML = '<i class="fas fa-check me-1"></i> Redeemed!';
      setTimeout(() => {
        button.classList.remove("success");
        button.innerHTML = "Redeem";
      }, 3000);
      break;

    default:
      button.innerHTML = "Redeem";
      break;
  }
}

/**
 * Show enhanced redemption confirmation modal
 * @param {Object} rewardData - Reward data
 * @param {HTMLElement} button - Button element
 */
function showEnhancedRedemptionConfirmation(rewardData, button) {
  const currentPoints =
    parseInt(document.getElementById("totalPointsDisplay").textContent) || 0;
  const remainingPoints = currentPoints - rewardData.points;

  // Create enhanced modal HTML
  const modalHTML = `
    <div class="modal fade enhanced-confirmation-modal" id="enhancedRedemptionModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content enhanced-modal-content">
          <div class="modal-header enhanced-modal-header">
            <div class="text-center w-100">
              <div class="modal-reward-icon">
                <i class="fas fa-gift"></i>
              </div>
              <h4 class="enhanced-modal-title">
                <i class="fas fa-shopping-cart me-2"></i>Confirm Voucher Redemption
              </h4>
            </div>
          </div>
          <div class="modal-body enhanced-modal-body">
            <div class="reward-preview-section">
              <div class="reward-value-display">${rewardData.value} EGP</div>
              <div class="reward-name-display">HyperOne Market Voucher</div>
              <p class="text-muted">Valid for use at any HyperOne store or online</p>
            </div>
            
            <div class="points-breakdown">
              <div class="points-item">
                <div class="points-label">Current Balance</div>
                <div class="points-value">${currentPoints}</div>
              </div>
              <div class="points-item">
                <div class="points-label">Cost</div>
                <div class="points-value" style="color: #dc3545;">-${
                  rewardData.points
                }</div>
              </div>
            </div>
            
            <div class="points-item" style="border: 2px solid #007bff; background: #e3f2fd;">
              <div class="points-label">New Balance</div>
              <div class="points-value" style="color: #007bff; font-size: 1.6rem;">${remainingPoints}</div>
            </div>
            
            ${
              remainingPoints < 50
                ? `
              <div class="balance-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Low Balance Warning:</strong> You'll have less than 50 points remaining after this redemption.
              </div>
            `
                : ""
            }
            
            <div class="alert alert-info mt-3">
              <i class="fas fa-info-circle me-2"></i>
              <strong>What happens next:</strong>
              <ul class="mb-0 mt-2 text-start">
                <li>A unique voucher code will be generated</li>
                <li>You'll receive the code via email</li>
                <li>Present the code at any HyperOne store</li>
                <li>Your points will be deducted immediately</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer enhanced-modal-footer">
            <button type="button" class="modal-btn-cancel" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancel
            </button>
            <button type="button" class="modal-btn-confirm" id="enhancedConfirmBtn">
              <i class="fas fa-check me-2"></i>Confirm Redemption
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // PROACTIVE CLEANUP: Remove any existing backdrop before showing new modal
  immediateModalCleanup();

  // Remove existing modal if present
  const existingModal = document.getElementById("enhancedRedemptionModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Additional proactive cleanup
  forceModalCleanupComplete();

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Initialize modal
  const modal = new bootstrap.Modal(
    document.getElementById("enhancedRedemptionModal")
  );

  // Setup confirm button
  const confirmBtn = document.getElementById("enhancedConfirmBtn");
  confirmBtn.addEventListener("click", () => {
    confirmBtn.classList.add("loading");
    confirmBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

    // Process redemption after short delay for UX
    setTimeout(() => {
      // Execute cleanup before hiding modal
      immediateModalCleanup();

      modal.hide();

      // Execute emergency cleanup after hiding modal
      emergencyModalCleanup();

      // Additional cleanup after a brief delay
      setTimeout(() => {
        forceModalCleanupComplete();
      }, 100);

      processEnhancedRedemption(rewardData, button);
    }, 1000);
  });

  // Enhanced cleanup modal when hidden
  document
    .getElementById("enhancedRedemptionModal")
    .addEventListener("hidden.bs.modal", () => {
      document.getElementById("enhancedRedemptionModal").remove();

      // Execute comprehensive modal cleanup
      emergencyModalCleanup();

      // Reset original button if modal was cancelled
      if (button && !button.classList.contains("success")) {
        resetButtonState(button);
      }
    });

  // Show modal with animation
  modal.show();

  // Add focus trap for accessibility
  setTimeout(() => {
    confirmBtn.focus();
  }, 500);
}

/**
 * Process enhanced redemption with improved feedback
 * @param {Object} rewardData - Reward data
 * @param {HTMLElement} button - Button element
 */
function processEnhancedRedemption(rewardData, button) {
  try {
    // Generate voucher code
    const voucherCode = generateVoucherCode("HYPERONE");

    // Get current points
    const currentPoints =
      parseInt(document.getElementById("totalPointsDisplay").textContent) || 0;
    const newPoints = currentPoints - rewardData.points;

    // Update points with enhanced feedback
    updatePointsWithFeedback(newPoints);

    // Add voucher to user account
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      addHyperOneVoucher(rewardData, voucherCode);

      // Update user points in localStorage
      const userData = getUserData(userEmail);
      if (userData && userData.profile) {
        userData.profile.points = newPoints;
        updateUserData(userEmail, userData);
      }
    }

    // Execute emergency cleanup before showing success
    emergencyModalCleanup();

    // Show success feedback
    showEnhancedRedemptionSuccess(rewardData, voucherCode);

    // Add global celebration effect
    addRedemptionCelebrationEffect();

    // Reset button to success state
    if (button) {
      resetButtonState(button, "success");
    }

    // Show points change indicator
    showPointsChangeIndicator(-rewardData.points);

    // Reload vouchers section
    setTimeout(() => {
      loadMyVouchers(getUserData(userEmail));
    }, 1000);
  } catch (error) {
    console.error("Error processing redemption:", error);
    showToast("Failed to process redemption. Please try again.", "error");

    if (button) {
      resetButtonState(button, "error");
    }
  }
}

/**
 * Show enhanced redemption success modal
 * @param {Object} rewardData - Reward data
 * @param {string} voucherCode - Generated voucher code
 */
function showEnhancedRedemptionSuccess(rewardData, voucherCode) {
  const successHTML = `
    <div class="modal fade" id="redemptionSuccessModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content enhanced-modal-content">
          <div class="modal-header enhanced-modal-header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            <div class="text-center w-100">
              <div class="modal-reward-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h4 class="enhanced-modal-title">
                Redemption Successful!
              </h4>
            </div>
          </div>
          <div class="modal-body enhanced-modal-body">
            <div class="reward-preview-section" style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);">
              <div class="reward-value-display" style="color: #28a745;">${rewardData.value} EGP</div>
              <div class="reward-name-display">HyperOne Market Voucher</div>
              <div class="voucher-code-section mt-3">
                <p class="text-muted">Your Voucher Code:</p>
                <div style="background: white; border: 2px dashed #28a745; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: 1.4rem; font-weight: bold; color: #28a745; letter-spacing: 2px;">
                  ${voucherCode}
                </div>
                <button class="btn btn-outline-success btn-sm mt-2" onclick="navigator.clipboard.writeText('${voucherCode}')">
                  <i class="fas fa-copy me-1"></i>Copy Code
                </button>
              </div>
            </div>
            
            <div class="alert alert-success">
              <i class="fas fa-envelope me-2"></i>
              A confirmation email with your voucher details has been sent to your registered email address.
            </div>
            
            <div class="alert alert-info">
              <i class="fas fa-store me-2"></i>
              <strong>How to use your voucher:</strong>
              <ol class="mb-0 mt-2">
                <li>Visit any HyperOne store or website</li>
                <li>Shop for your desired products</li>
                <li>Present this voucher code at checkout</li>
                <li>Enjoy your purchase!</li>
              </ol>
            </div>
          </div>
          <div class="modal-footer enhanced-modal-footer">
            <button type="button" class="modal-btn-confirm" data-bs-dismiss="modal" style="min-width: 150px;">
              <i class="fas fa-shopping-cart me-2"></i>Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // PROACTIVE CLEANUP: Clear any lingering backdrops before success modal
  immediateModalCleanup();
  forceModalCleanupComplete();

  // Add success modal to body
  document.body.insertAdjacentHTML("beforeend", successHTML);

  // Execute emergency modal cleanup before showing success modal
  emergencyModalCleanup();

  // Show success modal
  const successModal = new bootstrap.Modal(
    document.getElementById("redemptionSuccessModal")
  );
  successModal.show();

  // Enhanced cleanup when hidden - TRIPLE CLEANUP APPROACH
  document
    .getElementById("redemptionSuccessModal")
    .addEventListener("hidden.bs.modal", () => {
      // STEP 1: Immediate cleanup (synchronous)
      immediateModalCleanup();

      // STEP 2: Remove the modal element
      document.getElementById("redemptionSuccessModal").remove();

      // STEP 3: Execute comprehensive modal cleanup
      emergencyModalCleanup();

      // STEP 4: Additional safety cleanup after a delay
      setTimeout(() => {
        immediateModalCleanup();
        forceModalCleanupComplete();
      }, 100);
    });

  // Also add cleanup when the modal button is clicked
  const modalButton = document.querySelector(
    "#redemptionSuccessModal .modal-btn-confirm"
  );
  if (modalButton) {
    modalButton.addEventListener("click", () => {
      // Force cleanup immediately when button is clicked
      setTimeout(() => {
        emergencyModalCleanup();
      }, 100);
    });
  }
}

/**
 * Save profile directly - Exposed globally for the confirmation modal
 */
window.saveProfileDirectly = function () {
  // Get form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const addressLine2 = document.getElementById("addressLine2").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const zip = document.getElementById("zip").value.trim();

  // Get current user email
  const email = document.getElementById("emailAddress").value.trim();

  // Create profile object
  const profileData = {
    firstName,
    lastName,
    phone,
    address: {
      street: address,
      line2: addressLine2,
      city,
      state,
      zip,
    },
  };

  // Update user data
  if (updateUserProfile(email, profileData)) {
    // Show success message
    showToast("Profile updated successfully", "success");

    // Update profile display
    const userData = getUserData(email);
    updateProfileDisplay(userData);
  } else {
    // Show error message
    showToast("Failed to update profile", "danger");
  }
};

/**
 * Load and display points history with enhanced functionality
 */
function loadPointsHistory() {
  console.log("🔄 Loading Points History...");

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.warn("No user email found, cannot load points history.");
    showEmptyPointsHistoryMessage();
    return;
  }

  const userData = getUserData(userEmail);
  if (!userData) {
    console.warn("No user data found, cannot load points history.");
    showEmptyPointsHistoryMessage();
    return;
  }

  let pointsHistory = userData.pointsHistory || [];

  // If the user has no history, generate sample data for demonstration.
  if (pointsHistory.length === 0) {
    console.log("📝 No points history found. Generating sample data.");
    pointsHistory = generateAndSaveSampleHistory(userEmail, userData);
  }

  // Get the table body element
  const tableBody = document.getElementById("pointsHistoryTableBody");
  if (!tableBody) {
    console.error("❌ pointsHistoryTableBody element not found!");
    return;
  }

  // Clear previous content
  tableBody.innerHTML = "";

  if (pointsHistory.length === 0) {
    showEmptyPointsHistoryMessage();
    return;
  }

  // Sort history with the newest entries first
  const sortedHistory = [...pointsHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Recalculate running balance to ensure accuracy
  let runningBalance = userData.profile?.points || 0;
  const balanceCalculation = [...sortedHistory].reverse();
  let currentBalance = runningBalance;
  balanceCalculation.forEach((entry) => {
    currentBalance -= entry.points;
  });

  // Generate and append table rows
  sortedHistory.forEach((entry) => {
    currentBalance += entry.points;
    const pointClass = entry.points > 0 ? "text-success" : "text-danger";
    const pointPrefix = entry.points > 0 ? "+" : "";
    const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${entry.activity}</td>
      <td class="text-center ${pointClass}">${pointPrefix}${entry.points}</td>
      <td class="text-end">${currentBalance}</td>
    `;
    tableBody.appendChild(row);
  });

  console.log(`✅ Points history loaded with ${pointsHistory.length} entries.`);
}

/**
 * Generates and saves sample points history for a user.
 * @param {string} email - The user's email.
 * @param {object} userData - The user's data object.
 * @returns {Array} - The generated sample history.
 */
function generateAndSaveSampleHistory(email, userData) {
  const sampleHistory = [
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      activity: "Device recycling - iPhone 12",
      points: 150,
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      activity: "Welcome bonus",
      points: 50,
    },
    {
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      activity: "Redeemed HyperOne Voucher",
      points: -100,
    },
  ];

  userData.pointsHistory = sampleHistory;
  updateUserData(email, userData);
  return sampleHistory;
}

/**
 * Displays a message in the points history table when it's empty.
 */
function showEmptyPointsHistoryMessage() {
  const tableBody = document.getElementById("pointsHistoryTableBody");
  if (tableBody) {
    tableBody.innerHTML = `
      <tr class="empty-history-row">
        <td colspan="4" class="text-center py-4">
          <i class="fas fa-leaf text-muted mb-3" style="font-size: 2rem"></i>
          <p class="mb-1">No points history yet</p>
          <p class="text-muted small">Start recycling to earn points!</p>
        </td>
      </tr>
    `;
  }
}

// Debug mode
if (window.location.search.includes("debug=true")) {
  // ... (rest of the code remains unchanged)
}

/**
 * Setup redemption buttons for vouchers with enhanced functionality
 */
function setupRedeemButtons() {
  console.log("🛒 Setting up enhanced redeem buttons");

  const redeemButtons = document.querySelectorAll(".redeem-btn");
  if (redeemButtons.length === 0) {
    console.warn("No redeem buttons found");
    return;
  }

  const confirmRedeemBtn = document.getElementById("confirmRedeemBtn");
  const redeemModalElement = document.getElementById("redeemConfirmationModal");

  // Check if modal element exists
  if (!redeemModalElement) {
    console.error("Redeem confirmation modal not found");
    return;
  }

  // Get current user points
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.error("No user email found");
    return;
  }

  const userData = getUserData(userEmail);
  if (!userData) {
    console.error("No user data found");
    return;
  }

  const userPoints = userData.profile?.points || 0;
  console.log(`User has ${userPoints} points available`);

  // Process each redeem button with enhanced validation
  redeemButtons.forEach((button, index) => {
    const pointsCost = parseInt(button.getAttribute("data-points"), 10);
    const rewardName = button.getAttribute("data-reward");
    const rewardValue = button.getAttribute("data-value") || pointsCost;

    console.log(
      `Processing button ${index + 1}: ${rewardName} (${pointsCost} points)`
    );

    // Update button state based on user points
    updateRedeemButtonState(button, pointsCost, userPoints);

    // Remove any existing event listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Add enhanced click event listener
    newButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Re-check points in real-time
      const currentUserData = getUserData(userEmail);
      const currentPoints = currentUserData?.profile?.points || 0;

      if (currentPoints < pointsCost) {
        showInsufficientPointsAlert(pointsCost, currentPoints);
        return;
      }

      // Show loading state
      showButtonLoadingState(this, true);

      // Prepare redemption data
      const redemptionData = {
        points: pointsCost,
        reward: rewardName,
        value: rewardValue,
        currentPoints: currentPoints,
      };

      // Show confirmation modal with enhanced data
      showEnhancedRedemptionModal(redemptionData);

      // Reset button state
      setTimeout(() => showButtonLoadingState(this, false), 1000);
    });
  });

  // Setup enhanced confirm button
  setupEnhancedConfirmButton(confirmRedeemBtn, userEmail);
}

/**
 * Update redeem button state based on user points
 */
function updateRedeemButtonState(button, pointsCost, userPoints) {
  const canAfford = userPoints >= pointsCost;

  button.disabled = !canAfford;

  if (canAfford) {
    button.classList.remove("btn-secondary");
    button.classList.add("btn-primary");
    button.title = `Redeem for ${pointsCost} points`;
    button.innerHTML = `<i class="fas fa-exchange-alt me-1"></i> Redeem (${pointsCost} pts)`;
  } else {
    button.classList.remove("btn-primary");
    button.classList.add("btn-secondary");
    button.title = `Need ${pointsCost - userPoints} more points`;
    button.innerHTML = `<i class="fas fa-lock me-1"></i> Need ${
      pointsCost - userPoints
    } more`;
  }
}

/**
 * Show insufficient points alert
 */
function showInsufficientPointsAlert(required, available) {
  const shortage = required - available;
  showToast(
    `Insufficient points! You need ${shortage} more points to redeem this reward. Current balance: ${available} points.`,
    "warning"
  );
}

/**
 * Show button loading state
 */
function showButtonLoadingState(button, isLoading) {
  if (isLoading) {
    button.dataset.originalContent = button.innerHTML;
    button.innerHTML =
      '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalContent || button.innerHTML;
    button.disabled = false;
  }
}

/**
 * Show enhanced redemption confirmation modal
 */
function showEnhancedRedemptionModal(redemptionData) {
  const modal = document.getElementById("redeemConfirmationModal");
  if (!modal) {
    console.error("Redemption modal not found");
    return;
  }

  // Update modal content with enhanced information
  const voucherNameEl = document.getElementById("redeemVoucherName");
  const voucherPointsEl = document.getElementById("redeemVoucherPoints");
  const pointsBalanceEl = document.getElementById("pointsBalance");

  if (voucherNameEl) voucherNameEl.textContent = redemptionData.reward;
  if (voucherPointsEl) voucherPointsEl.textContent = redemptionData.points;

  if (pointsBalanceEl) {
    const remainingPoints =
      redemptionData.currentPoints - redemptionData.points;
    const balanceSpan = pointsBalanceEl.querySelector("span");
    if (balanceSpan) {
      balanceSpan.textContent = remainingPoints;
      balanceSpan.className =
        remainingPoints < 50 ? "text-warning fw-bold" : "text-success fw-bold";
    }
  }

  // Add redemption summary to modal body
  addRedemptionSummaryToModal(modal, redemptionData);

  // Store redemption data on modal for later use
  modal.dataset.redemptionData = JSON.stringify(redemptionData);

  // Show modal with animation
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Add shake animation to emphasize the action
  modal
    .querySelector(".modal-content")
    .classList.add("animate__animated", "animate__pulse");
  setTimeout(() => {
    modal
      .querySelector(".modal-content")
      .classList.remove("animate__animated", "animate__pulse");
  }, 1000);
}

/**
 * Add redemption summary to modal
 */
function addRedemptionSummaryToModal(modal, redemptionData) {
  let summaryEl = modal.querySelector(".redemption-summary");
  if (!summaryEl) {
    summaryEl = document.createElement("div");
    summaryEl.className = "redemption-summary mt-3 p-3 bg-light rounded";

    const modalBody = modal.querySelector(".modal-body");
    if (modalBody) {
      modalBody.appendChild(summaryEl);
    }
  }

  const remainingPoints = redemptionData.currentPoints - redemptionData.points;
  const percentageUsed = Math.round(
    (redemptionData.points / redemptionData.currentPoints) * 100
  );

  summaryEl.innerHTML = `
    <h6 class="text-primary mb-2">
      <i class="fas fa-info-circle me-1"></i> Redemption Summary
    </h6>
    <div class="row text-center">
      <div class="col-4">
        <div class="text-muted small">Current Balance</div>
        <div class="fw-bold text-primary">${redemptionData.currentPoints}</div>
      </div>
      <div class="col-4">
        <div class="text-muted small">Cost</div>
        <div class="fw-bold text-danger">-${redemptionData.points}</div>
      </div>
      <div class="col-4">
        <div class="text-muted small">Remaining</div>
        <div class="fw-bold ${
          remainingPoints < 50 ? "text-warning" : "text-success"
        }">${remainingPoints}</div>
      </div>
    </div>
    <div class="progress mt-2" style="height: 6px;">
      <div class="progress-bar bg-primary" style="width: ${
        100 - percentageUsed
      }%"></div>
      <div class="progress-bar bg-danger" style="width: ${percentageUsed}%"></div>
    </div>
    <small class="text-muted d-block mt-1 text-center">
      Using ${percentageUsed}% of your available points
    </small>
  `;
}

/**
 * Setup enhanced confirm button functionality
 */
function setupEnhancedConfirmButton(confirmBtn, userEmail) {
  if (!confirmBtn) return;

  // Remove any existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", function () {
    const modal = this.closest(".modal");
    if (!modal || !modal.dataset.redemptionData) {
      console.error("No redemption data found");
      showToast("Error: Missing redemption information", "danger");
      return;
    }

    try {
      const redemptionData = JSON.parse(modal.dataset.redemptionData);
      console.log("Processing redemption:", redemptionData);

      // Show processing state
      this.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
      this.disabled = true;

      // Process the redemption
      setTimeout(() => {
        const success = processEnhancedRedemption(userEmail, redemptionData);

        if (success) {
          // Hide modal
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) bsModal.hide();

          // Show success
          showRedemptionSuccess(redemptionData);
        }

        // Reset button
        this.innerHTML = '<i class="fas fa-check me-1"></i> Confirm Redemption';
        this.disabled = false;
      }, 1500);
    } catch (error) {
      console.error("Error processing redemption:", error);
      showToast("Error processing redemption. Please try again.", "danger");

      // Reset button
      this.innerHTML = '<i class="fas fa-check me-1"></i> Confirm Redemption';
      this.disabled = false;
    }
  });
}

/**
 * Process enhanced redemption with better validation and feedback
 */
function processEnhancedRedemption(userEmail, redemptionData) {
  try {
    // Get fresh user data
    const userData = getUserData(userEmail);
    if (!userData) {
      showToast("User data not found", "danger");
      return false;
    }

    // Validate points again
    const currentPoints = userData.profile?.points || 0;
    if (currentPoints < redemptionData.points) {
      showToast(
        "Insufficient points. Please refresh and try again.",
        "warning"
      );
      return false;
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode(redemptionData.reward);

    // Create new voucher object
    const newVoucher = {
      id: voucherCode,
      name: redemptionData.reward,
      value: redemptionData.value,
      points: redemptionData.points,
      dateCreated: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      platform: "hyperone",
      used: false,
      status: "active",
    };

    // Update user data
    userData.profile.points = currentPoints - redemptionData.points;

    if (!userData.vouchers) userData.vouchers = [];
    userData.vouchers.push(newVoucher);

    if (!userData.pointsHistory) userData.pointsHistory = [];
    userData.pointsHistory.push({
      date: new Date().toISOString(),
      activity: `Redeemed ${redemptionData.reward}`,
      points: -redemptionData.points,
      balance: userData.profile.points,
    });

    // Save updated data
    const saveSuccess = updateUserData(userEmail, userData);
    if (!saveSuccess) {
      showToast("Failed to save redemption. Please try again.", "danger");
      return false;
    }

    // Update UI
    updatePointsDisplays(userData.profile.points);

    // Refresh data displays
    setTimeout(() => {
      loadPointsHistory();
      loadUserVouchers();
      setupRedeemButtons(); // Refresh button states
    }, 500);

    return true;
  } catch (error) {
    console.error("Error in processEnhancedRedemption:", error);
    showToast("An error occurred during redemption", "danger");
    return false;
  }
}

/**
 * Update all points displays across the page
 */
function updatePointsDisplays(newPoints) {
  // Main points display
  const totalPointsDisplay = document.getElementById("totalPointsDisplay");
  if (totalPointsDisplay) {
    animateNumberChange(
      totalPointsDisplay,
      parseInt(totalPointsDisplay.textContent) || 0,
      newPoints
    );
  }

  // Navbar points
  const navbarPoints = document.getElementById("navbarPoints");
  if (navbarPoints) {
    navbarPoints.textContent = newPoints;
  }

  // User points in profile section
  const userPoints = document.getElementById("userPoints");
  if (userPoints) {
    userPoints.textContent = newPoints;
  }
}

/**
 * Animate number change with counting effect
 */
function animateNumberChange(element, fromValue, toValue) {
  const duration = 1000;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentValue = Math.round(
      fromValue + (toValue - fromValue) * progress
    );
    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Add celebration effect for points update
      element.parentElement?.classList.add("points-updated");
      setTimeout(() => {
        element.parentElement?.classList.remove("points-updated");
      }, 2000);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Show redemption success with enhanced feedback
 */
function showRedemptionSuccess(redemptionData) {
  // Show success toast
  showToast(
    `🎉 Successfully redeemed ${redemptionData.reward}! Check your vouchers.`,
    "success"
  );

  // Create and show celebration modal (optional)
  createCelebrationEffect();
}

/**
 * Create celebration effect for successful redemption
 */
function createCelebrationEffect() {
  // Add confetti-like effect (simple CSS animation)
  const celebration = document.createElement("div");
  celebration.className = "celebration-effect";
  celebration.innerHTML = "🎉";
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    z-index: 9999;
    animation: celebrationBounce 2s ease-out;
    pointer-events: none;
  `;

  document.body.appendChild(celebration);

  setTimeout(() => {
    celebration.remove();
  }, 2000);
}

/**
 * Redeem a voucher with points
 */
function redeemVoucher(email, points, voucherName) {
  try {
    // Get current user data
    const userData = getUserData(email) || {};

    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = { points: 0 };
    }

    // Check if enough points
    if ((userData.profile.points || 0) < points) {
      showToast("Not enough points to redeem this voucher", "warning");
      return false;
    }

    // Deduct points
    userData.profile.points = (userData.profile.points || 0) - points;

    // Create points history entry for redemption
    const historyEntry = {
      date: new Date().toISOString(),
      activity: `Redeemed ${voucherName} voucher`,
      points: -points,
    };

    // Ensure pointsHistory array exists
    if (!userData.pointsHistory) {
      userData.pointsHistory = [];
    }

    // Add entry to history
    userData.pointsHistory.push(historyEntry);

    // Generate voucher code
    const voucherCode = generateVoucherCode(voucherName);

    // Create voucher object
    const voucher = {
      id: Date.now().toString(),
      name: voucherName,
      code: voucherCode,
      points: points,
      platform: voucherName.split(" ")[0], // Extract platform name (Amazon/Noon)
      dateIssued: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isUsed: false,
    };

    // Ensure vouchers array exists
    if (!userData.vouchers) {
      userData.vouchers = [];
    }

    // Add voucher to user data
    userData.vouchers.push(voucher);

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
      loadUserVouchers();

      // Refresh redeem buttons
      setupRedeemButtons();

      // Show success message
      showToast(`Successfully redeemed ${voucherName} voucher!`, "success");
    }

    return success;
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    return false;
  }
}

/**
 * Generate a unique voucher code
 * @param {string} voucherName - The name of the voucher
 * @returns {string} - Generated voucher code
 */
function generateVoucherCode(voucherName) {
  // Create a prefix based on voucher name (first 2 chars)
  const prefix = voucherName
    .replace(/[^A-Z]/gi, "")
    .substring(0, 2)
    .toUpperCase();

  // Generate random part (8 chars)
  const randomPart =
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    Math.random().toString(36).substring(2, 6).toUpperCase();

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();

  // Combine parts with dashes for readability
  return `${prefix}-${randomPart.substring(0, 4)}-${randomPart.substring(
    4,
    8
  )}-${timestamp}`;
}

/**
 * Load and display user's vouchers and rewards with enhanced functionality
 */
function loadUserVouchers() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.warn("No user email found for vouchers");
    return;
  }

  // Get user data
  const userData = getUserData(userEmail);
  if (!userData) {
    console.warn("No user data found for vouchers");
    return;
  }

  console.log(
    "Loading vouchers and rewards with user points:",
    userData.profile ? userData.profile.points : 0
  );

  // Load both available rewards and existing vouchers
  loadAvailableRewards(userData);
  loadMyVouchers(userData);
}

/**
 * Load available rewards for redemption
 */
function loadAvailableRewards(userData) {
  // Get rewards container
  const rewardsContainer = document.querySelector(".rewards-list");
  if (!rewardsContainer) {
    console.error("Rewards container not found");
    return;
  }

  // Clear container
  rewardsContainer.innerHTML = "";

  // Define available rewards with enhanced data
  const availableRewards = [
    {
      name: "HyperOne E£50 Voucher",
      points: 50,
      platform: "hyperone",
      icon: "fa-shopping-cart",
      description: "Perfect for small purchases",
      popularity: "Most Popular",
      value: 50,
    },
    {
      name: "HyperOne E£100 Voucher",
      points: 100,
      platform: "hyperone",
      icon: "fa-shopping-bag",
      description: "Great value for everyday shopping",
      popularity: "Best Value",
      value: 100,
    },
    {
      name: "HyperOne E£150 Voucher",
      points: 150,
      platform: "hyperone",
      icon: "fa-shopping-cart",
      description: "Ideal for larger purchases",
      popularity: "Premium Choice",
      value: 150,
    },
    {
      name: "HyperOne E£200 Voucher",
      points: 200,
      platform: "hyperone",
      icon: "fa-gift",
      description: "Maximum value voucher",
      popularity: "Ultimate Reward",
      value: 200,
    },
  ];

  // User points
  const userPoints =
    userData.profile && userData.profile.points ? userData.profile.points : 0;

  // Add enhanced rewards to container
  availableRewards.forEach((reward, index) => {
    const canRedeem = userPoints >= reward.points;
    const shortage = Math.max(0, reward.points - userPoints);

    const rewardItem = document.createElement("li");
    rewardItem.className = `reward-item enhanced-reward-item ${
      reward.platform
    }-reward ${canRedeem ? "can-redeem" : "insufficient-points"}`;
    rewardItem.setAttribute("data-platform", reward.platform);
    rewardItem.setAttribute("data-points", reward.points);

    // Calculate savings percentage (mock calculation)
    const savingsPercentage = Math.round((reward.value / reward.points) * 10);

    rewardItem.innerHTML = `
      <div class="reward-card">
        <div class="reward-header">
          <div class="platform-badge ${reward.platform}">
            <i class="fas ${reward.icon} me-1"></i>
            ${reward.platform.toUpperCase()}
        </div>
          ${
            reward.popularity
              ? `<div class="popularity-badge">${reward.popularity}</div>`
              : ""
          }
        </div>
        
        <div class="reward-content">
          <div class="reward-value">E£${reward.value}</div>
          <div class="reward-name">${reward.name}</div>
          <div class="reward-description">${reward.description}</div>
          
          <div class="reward-stats">
            <div class="stat-item">
              <span class="stat-label">Cost:</span>
              <span class="stat-value">${reward.points} points</span>
        </div>
            <div class="stat-item">
              <span class="stat-label">Value:</span>
              <span class="stat-value text-success">+${savingsPercentage}% savings</span>
      </div>
          </div>
        </div>
        
        <div class="reward-footer">
          <div class="points-info">
            ${
              canRedeem
                ? '<span class="text-success"><i class="fas fa-check-circle me-1"></i>Ready to redeem</span>'
                : `<span class="text-warning"><i class="fas fa-hourglass-half me-1"></i>Need ${shortage} more points</span>`
            }
          </div>
          
          <button class="btn ${
            canRedeem ? "btn-primary" : "btn-secondary"
          } redeem-btn enhanced-redeem-btn" 
              data-points="${reward.points}" 
                  data-reward="${reward.name}"
                  data-value="${reward.value}"
                  ${!canRedeem ? "disabled" : ""}
                  title="${
                    canRedeem
                      ? `Redeem for ${reward.points} points`
                      : `Need ${shortage} more points`
                  }">
            <i class="fas ${
              canRedeem ? "fa-exchange-alt" : "fa-lock"
            } me-1"></i> 
            ${canRedeem ? "Redeem Now" : `${shortage} more needed`}
      </button>
        </div>
      </div>
    `;

    rewardsContainer.appendChild(rewardItem);

    // Add entrance animation
    setTimeout(() => {
      rewardItem.classList.add("animate-entrance");
    }, index * 100);
  });

  // Initialize redeem buttons for new items
  setupRedeemButtons();

  console.log(`Loaded ${availableRewards.length} available rewards`);
}

/**
 * Load user's existing vouchers
 * NOTE: My Vouchers section has been removed from the profile page
 */
function loadMyVouchers(userData) {
  // Skip voucher loading since the My Vouchers section has been removed
  console.log(
    "My Vouchers section has been removed - skipping voucher loading"
  );
  return;
}

/**
 * Create enhanced voucher card
 */
function createEnhancedVoucherCard(voucher, index) {
  const card = document.createElement("div");
  card.className = "voucher-card enhanced-voucher-card";
  card.setAttribute("data-voucher-id", voucher.id);

  // Calculate days until expiry
  const expiryDate = new Date(voucher.expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate - today) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  // Format created date
  const createdDate = new Date(voucher.dateCreated || voucher.dateIssued);
  const formattedDate = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Determine status and styling
  let statusClass = "active";
  let statusText = "Active";
  let statusIcon = "fas fa-check-circle";

  if (isExpired) {
    statusClass = "expired";
    statusText = "Expired";
    statusIcon = "fas fa-times-circle";
  } else if (voucher.used) {
    statusClass = "used";
    statusText = "Used";
    statusIcon = "fas fa-check-double";
  } else if (isExpiringSoon) {
    statusClass = "expiring";
    statusText = "Expiring Soon";
    statusIcon = "fas fa-exclamation-triangle";
  }

  card.innerHTML = `
    <div class="voucher-header">
      <div class="voucher-platform">
        <i class="fas fa-shopping-bag me-1"></i>
        ${voucher.platform || "HyperOne"}
      </div>
      <div class="voucher-status status-${statusClass}">
        <i class="${statusIcon} me-1"></i>
        ${statusText}
      </div>
    </div>
    
    <div class="voucher-body">
      <div class="voucher-value">
        E£${voucher.value || voucher.points}
      </div>
      <div class="voucher-name">${voucher.name}</div>
      
      <div class="voucher-code-section">
        <label class="voucher-code-label">Voucher Code:</label>
        <div class="voucher-code-display">
          <code class="voucher-code" id="voucherCode_${index}">${
    voucher.id || voucher.code
  }</code>
          <button class="btn btn-sm btn-outline-primary copy-code-btn" 
                  onclick="copyVoucherCode('voucherCode_${index}')"
                  title="Copy code">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
      
      <div class="voucher-details">
        <div class="detail-row">
          <span class="detail-label">Created:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expires:</span>
          <span class="detail-value ${
            isExpiringSoon
              ? "text-warning"
              : isExpired
              ? "text-danger"
              : "text-muted"
          }">
            ${expiryDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            ${!isExpired ? `(${daysUntilExpiry} days left)` : "(Expired)"}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Points Used:</span>
          <span class="detail-value">${voucher.points}</span>
        </div>
      </div>
    </div>
    
    <div class="voucher-footer">
      ${
        !isExpired && !voucher.used
          ? `
        <button class="btn btn-success btn-sm use-voucher-btn" onclick="useVoucher('${voucher.id}')">
          <i class="fas fa-shopping-cart me-1"></i> Use Now
        </button>
      `
          : ""
      }
      <button class="btn btn-outline-secondary btn-sm" onclick="showVoucherDetails('${
        voucher.id
      }')">
        <i class="fas fa-info-circle me-1"></i> Details
      </button>
    </div>
  `;

  // Add entrance animation
  setTimeout(() => {
    card.classList.add("animate-entrance");
  }, index * 150);

  return card;
}

/**
 * Copy voucher code to clipboard
 */
window.copyVoucherCode = function (elementId) {
  const codeElement = document.getElementById(elementId);
  if (!codeElement) return;

  const code = codeElement.textContent;

  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        showCopySuccess(codeElement);
      })
      .catch(() => {
        fallbackCopyText(code, codeElement);
      });
  } else {
    fallbackCopyText(code, codeElement);
  }
};

/**
 * Show copy success animation
 */
function showCopySuccess(element) {
  const originalText = element.textContent;
  element.textContent = "Copied!";
  element.classList.add("copied");

  setTimeout(() => {
    element.textContent = originalText;
    element.classList.remove("copied");
  }, 2000);

  showToast("Voucher code copied to clipboard!", "success");
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyText(text, element) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showCopySuccess(element);
  } catch (err) {
    console.error("Fallback copy failed:", err);
    showToast("Failed to copy code. Please copy manually.", "warning");
  }

  document.body.removeChild(textArea);
}

/**
 * Use voucher (placeholder for future implementation)
 */
window.useVoucher = function (voucherId) {
  // This would integrate with HyperOne's API in a real implementation
  showToast("Redirecting to HyperOne to use your voucher...", "info");

  // Mark voucher as used
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const userData = getUserData(userEmail);
    if (userData && userData.vouchers) {
      const voucher = userData.vouchers.find((v) => v.id === voucherId);
      if (voucher) {
        voucher.used = true;
        voucher.usedDate = new Date().toISOString();
        updateUserData(userEmail, userData);

        // Reload vouchers to reflect changes
        setTimeout(() => loadUserVouchers(), 500);
      }
    }
  }
};

/**
 * Show voucher details in modal
 */
window.showVoucherDetails = function (voucherId) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const userData = getUserData(userEmail);
  if (!userData || !userData.vouchers) return;

  const voucher = userData.vouchers.find((v) => v.id === voucherId);
  if (!voucher) return;

  // Create and show details modal
  createVoucherDetailsModal(voucher);
};

/**
 * Create voucher details modal
 */
function createVoucherDetailsModal(voucher) {
  // Remove existing modal if any
  const existingModal = document.getElementById("voucherDetailsModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "voucherDetailsModal";
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-ticket-alt me-2"></i>Voucher Details
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="voucher-details-content">
            <div class="text-center mb-4">
              <div class="voucher-value-large">E£${
                voucher.value || voucher.points
              }</div>
              <div class="voucher-name-large">${voucher.name}</div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <h6>Voucher Information</h6>
                <table class="table table-sm">
                  <tr>
                    <td>Code:</td>
                    <td><code>${voucher.id}</code></td>
                  </tr>
                  <tr>
                    <td>Platform:</td>
                    <td>${voucher.platform || "HyperOne"}</td>
                  </tr>
                  <tr>
                    <td>Points Used:</td>
                    <td>${voucher.points}</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Status & Dates</h6>
                <table class="table table-sm">
                  <tr>
                    <td>Status:</td>
                    <td><span class="badge bg-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Created:</td>
                    <td>${new Date(
                      voucher.dateCreated || voucher.dateIssued
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Expires:</td>
                    <td>${new Date(
                      voucher.expiryDate
                    ).toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="mt-4">
              <h6>How to Use</h6>
              <div class="alert alert-info">
                <ol class="mb-0">
                  <li>Visit any HyperOne Market store or their online website</li>
                  <li>Add items to your cart</li>
                  <li>At checkout, enter the voucher code: <code>${
                    voucher.id
                  }</code></li>
                  <li>The voucher value will be deducted from your total</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="copyVoucherCode('modalVoucherCode')">
            <i class="fas fa-copy me-1"></i> Copy Code
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  // Add hidden code element for copying
  const hiddenCode = document.createElement("span");
  hiddenCode.id = "modalVoucherCode";
  hiddenCode.textContent = voucher.id;
  hiddenCode.style.display = "none";
  modal.appendChild(hiddenCode);

  document.body.appendChild(modal);

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Clean up when modal is hidden
  modal.addEventListener("hidden.bs.modal", () => {
    modal.remove();
  });
}

/**
 * Setup HyperOne Market reward system (NO FILTERS)
 */
function setupHyperOneRewards() {
  console.log("🛒 Setting up HyperOne Market reward system");

  // Initialize points display
  const currentPoints = 135; // Demo value - in real app this would come from user data
  updatePointsDisplay(currentPoints);
  updateRewardButtons(currentPoints);
  setupHyperOneRedeemHandlers();
}

function updatePointsDisplay(points) {
  const totalDisplay = document.getElementById("totalPointsDisplay");
  if (totalDisplay) {
    animatePointsCount(0, points, totalDisplay);
  }

  // Update next reward progress
  const nextReward = calculateNextReward(points);
  updateRewardProgress(nextReward, points);
}

function calculateNextReward(currentPoints) {
  const rewardTiers = [100, 150, 200];
  for (let tier of rewardTiers) {
    if (currentPoints < tier) {
      return {
        value: tier,
        needed: tier - currentPoints,
        progress: Math.round((currentPoints / tier) * 100),
      };
    }
  }
  return {
    value: 200,
    needed: 0,
    progress: 100,
  };
}

function updateRewardProgress(nextReward, currentPoints) {
  const nextRewardTarget = document.getElementById("nextRewardTarget");
  const nextRewardProgressBar = document.getElementById(
    "nextRewardProgressBar"
  );
  const pointsNeeded = document.getElementById("pointsNeeded");

  if (nextRewardTarget) {
    nextRewardTarget.textContent = `${nextReward.value} EGP Voucher`;
  }

  if (nextRewardProgressBar) {
    setTimeout(() => {
      nextRewardProgressBar.style.width = `${nextReward.progress}%`;
      nextRewardProgressBar.setAttribute("aria-valuenow", nextReward.progress);
    }, 500);
  }

  if (pointsNeeded) {
    if (nextReward.needed > 0) {
      pointsNeeded.textContent = `${nextReward.needed} points needed`;
    } else {
      pointsNeeded.textContent = "All rewards unlocked! 🎉";
    }
  }
}

function animatePointsCount(start, end, element) {
  const duration = 1000;
  const increment = (end - start) / (duration / 16);
  let current = start;

  const animate = () => {
    current += increment;
    if (current >= end) {
      element.textContent = end;
      element.parentElement?.classList.add("points-updated");
      setTimeout(() => {
        element.parentElement?.classList.remove("points-updated");
      }, 600);
    } else {
      element.textContent = Math.floor(current);
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

function updateRewardButtons(currentPoints) {
  const rewardCards = document.querySelectorAll(".hyperone-reward-card");

  rewardCards.forEach((card) => {
    const requiredPoints = parseInt(card.getAttribute("data-points"));
    const button = card.querySelector(".hyperone-redeem-btn");

    if (!button) return;

    if (currentPoints >= requiredPoints) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-exchange-alt me-2"></i>Redeem Now';
      card.setAttribute("data-insufficient", "false");
    } else {
      button.disabled = true;
      button.innerHTML = `<i class="fas fa-lock me-2"></i>Need ${
        requiredPoints - currentPoints
      } more points`;
      card.setAttribute("data-insufficient", "true");
    }
  });
}

function setupHyperOneRedeemHandlers() {
  const redeemButtons = document.querySelectorAll(".hyperone-redeem-btn");

  redeemButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.disabled) return;

      const rewardData = {
        points: parseInt(this.getAttribute("data-points")),
        reward: this.getAttribute("data-reward"),
        value: parseInt(this.getAttribute("data-value")),
      };

      handleHyperOneRedemption(rewardData);
    });
  });
}

function handleHyperOneRedemption(rewardData) {
  console.log(`🎁 Redeeming HyperOne voucher:`, rewardData);

  // Get the button that triggered this redemption
  const button =
    typeof rewardData === "object" && rewardData.nodeType
      ? rewardData
      : document.querySelector(
          `[data-points="${rewardData.points}"][data-reward="${rewardData.reward}"]`
        );

  // Enhanced button loading state
  if (button) {
    button.classList.add("loading");
    button.disabled = true;
    button.innerHTML =
      '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
  }

  // Double check if user has enough points
  const currentPoints =
    parseInt(document.getElementById("totalPointsDisplay").textContent) || 0;
  if (currentPoints < rewardData.points) {
    showInsufficientPointsAlert(rewardData.points, currentPoints);

    // Reset button state
    if (button) {
      resetButtonState(button, "error");
    }
    return;
  }

  // Create enhanced confirmation modal
  showEnhancedRedemptionConfirmation(rewardData, button);
}

function confirmHyperOneRedemption(rewardData) {
  console.log("✅ Confirming HyperOne redemption:", rewardData);

  try {
    // Validate reward data
    if (!rewardData || typeof rewardData !== "object") {
      console.error("Invalid reward data:", rewardData);
      showToast("Invalid reward data. Please try again.", "danger");
      return;
    }

    // Ensure required fields exist
    if (!rewardData.points || !rewardData.value) {
      console.error("Missing required fields in reward data:", rewardData);
      showToast("Incomplete reward information. Please try again.", "danger");
      return;
    }

    // Show loading indicator
    showToast("Processing your redemption...", "info");

    // Add visual feedback
    const buttons = document.querySelectorAll(
      `[data-points="${rewardData.points}"]`
    );
    buttons.forEach((btn) => {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
      }
    });

    // Simulate redemption process
    setTimeout(() => {
      try {
        // Generate a voucher code
        const voucherCode = generateVoucherCode("HYPERONE");

        // Get current points
        const totalPointsDisplay =
          document.getElementById("totalPointsDisplay");
        if (!totalPointsDisplay) {
          throw new Error("Points display element not found");
        }

        const currentPoints = parseInt(totalPointsDisplay.textContent) || 0;

        // Ensure user has enough points
        if (currentPoints < rewardData.points) {
          showToast(
            `Not enough points. You need ${rewardData.points} points but have ${currentPoints}.`,
            "warning"
          );

          // Reset buttons
          buttons.forEach((btn) => {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = "Redeem";
            }
          });
          return;
        }

        // Calculate new points balance
        const newPoints = currentPoints - rewardData.points;
        console.log(`Updating points: ${currentPoints} -> ${newPoints}`);

        // Update points display
        updatePointsAfterRedemption(newPoints);

        // Add voucher to user's collection
        addHyperOneVoucher(rewardData, voucherCode);

        // Show success message
        showRedemptionSuccess(rewardData, voucherCode);

        // Update the user's points in localStorage
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const userData = getUserData(userEmail) || {};
          if (!userData.profile) {
            userData.profile = { points: 0 };
          }
          userData.profile.points = newPoints;
          updateUserData(userEmail, userData);
          console.log(
            "Updated user data in localStorage with new points balance"
          );
        }

        // Reset buttons after successful redemption
        buttons.forEach((btn) => {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = "Redeem";
          }
        });
      } catch (error) {
        console.error("Error during redemption:", error);
        showToast(
          "An error occurred during redemption. Please try again.",
          "danger"
        );

        // Reset buttons
        buttons.forEach((btn) => {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = "Redeem";
          }
        });
      }
    }, 1000);
  } catch (error) {
    console.error("Error in confirmHyperOneRedemption:", error);
    showToast("An unexpected error occurred. Please try again.", "danger");
  }
}

function showRedemptionSuccess(rewardData, voucherCode) {
  const successHtml = `
    <div class="modal fade" id="redemptionSuccessModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="fas fa-check-circle me-2"></i>Redemption Successful!
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="mb-3">
              <i class="fas fa-gift text-success" style="font-size: 4rem;"></i>
            </div>
            <h3 class="text-success mb-3">Congratulations! 🎉</h3>
            <p class="mb-3">Your <strong>${rewardData.value} EGP HyperOne</strong> voucher has been generated!</p>
            <div class="voucher-code-display bg-light p-3 rounded mb-3">
              <h4 class="text-dark mb-1">Voucher Code:</h4>
              <code class="fs-5 text-primary">${voucherCode}</code>
            </div>
            <div class="alert alert-success">
              <i class="fas fa-store me-2"></i>
              Present this code at any HyperOne Market location or use online.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
              <i class="fas fa-check me-2"></i>Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Execute emergency modal cleanup before showing success modal
  emergencyModalCleanup();

  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = successHtml;
  document.body.appendChild(modalContainer);

  const modal = new bootstrap.Modal(
    document.getElementById("redemptionSuccessModal")
  );
  modal.show();

  // Enhanced cleanup when hidden
  document
    .getElementById("redemptionSuccessModal")
    .addEventListener("hidden.bs.modal", () => {
      modalContainer.remove();

      // Execute comprehensive modal cleanup
      emergencyModalCleanup();
    });

  // Also add cleanup when the Got it button is clicked
  const gotItButton = document.querySelector(
    "#redemptionSuccessModal [data-bs-dismiss='modal']"
  );
  if (gotItButton) {
    gotItButton.addEventListener("click", () => {
      // Force cleanup immediately when button is clicked
      setTimeout(() => {
        emergencyModalCleanup();
      }, 100);
    });
  }
}

function updatePointsAfterRedemption(newPoints) {
  const totalDisplay = document.getElementById("totalPointsDisplay");
  if (totalDisplay) {
    totalDisplay.textContent = newPoints;
    totalDisplay.parentElement?.classList.add("points-updated");
    setTimeout(() => {
      totalDisplay.parentElement?.classList.remove("points-updated");
    }, 600);
  }

  // Update reward buttons with new points
  updateRewardButtons(newPoints);

  // Update progress
  const nextReward = calculateNextReward(newPoints);
  updateRewardProgress(nextReward, newPoints);
}

function addHyperOneVoucher(rewardData, voucherCode) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const voucher = {
    id: Date.now().toString(),
    code: voucherCode,
    value: rewardData.value,
    type: "HyperOne Market",
    dateRedeemed: new Date().toISOString(),
    status: "active",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  };

  // Get existing vouchers
  const existingVouchers = JSON.parse(
    localStorage.getItem(`vouchers_${userEmail}`) || "[]"
  );
  existingVouchers.push(voucher);

  // Save updated vouchers
  localStorage.setItem(
    `vouchers_${userEmail}`,
    JSON.stringify(existingVouchers)
  );

  // Reload vouchers display
  loadUserVouchers();
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

// Add global function for HyperOne redemption
window.handleHyperOneRedemption = function (button) {
  console.log(
    "Redeem button clicked with data:",
    button.dataset || button.attributes
  );

  try {
    // Ensure the totalPointsDisplay element exists
    const totalPointsDisplay = document.getElementById("totalPointsDisplay");
    if (!totalPointsDisplay) {
      console.error("Total points display element not found");
      showToast("Error: Could not find points display", "danger");
      return;
    }

    // Get current points (with fallback to 0)
    const currentPoints = parseInt(totalPointsDisplay.textContent) || 0;

    // Get required points (with fallback to 0)
    const requiredPoints =
      parseInt(button.getAttribute("data-points") || button.dataset?.points) ||
      0;

    console.log(
      `Points check: Current=${currentPoints}, Required=${requiredPoints}`
    );

    // Check if user has enough points
    if (currentPoints < requiredPoints) {
      // Show insufficient points message
      console.warn(`Insufficient points: ${currentPoints}/${requiredPoints}`);
      showToast(
        `Not enough points. You need ${requiredPoints} points but have ${currentPoints}.`,
        "warning"
      );
      return;
    }

    // Create reward data object
    const rewardData = {
      points: requiredPoints,
      reward:
        button.getAttribute("data-reward") ||
        button.dataset?.reward ||
        "HyperOne Voucher",
      value:
        button.getAttribute("data-value") ||
        button.dataset?.value ||
        requiredPoints,
    };

    console.log("Reward data prepared:", rewardData);

    // Call the main redemption function with try/catch for safety
    try {
      if (typeof handleHyperOneRedemption === "function") {
        handleHyperOneRedemption(rewardData);
      } else {
        console.error("handleHyperOneRedemption function not found");
        showToast("Error: Redemption function not available", "danger");
      }
    } catch (error) {
      console.error("Error calling handleHyperOneRedemption:", error);
      showToast("Error processing redemption. Please try again.", "danger");
    }
  } catch (error) {
    console.error("Error in global handleHyperOneRedemption:", error);
    showToast("An unexpected error occurred. Please try again.", "danger");
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
 * Add points to user account and record in history
 * @param {string} email - User email
 * @param {number} points - Points to add
 * @param {string} activity - Activity description
 * @returns {boolean} - Success status
 */
function addUserPoints(email, points, activity) {
  try {
    console.log(`Adding ${points} points to user ${email} for: ${activity}`);

    // Get current user data
    const userData = getUserData(email);
    if (!userData) {
      console.error("User data not found for:", email);
      return false;
    }

    // Ensure profile object exists
    if (!userData.profile) {
      userData.profile = { points: 0 };
    }

    // Add points to current balance
    const oldBalance = userData.profile.points || 0;
    userData.profile.points = oldBalance + points;

    // Create history entry
    const historyEntry = {
      date: new Date().toISOString(),
      activity: activity || "Recycling activity",
      points: points,
      balance: userData.profile.points,
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
      console.log(
        `Successfully added ${points} points. New balance: ${userData.profile.points}`
      );

      // Update points display elements if they exist
      const totalPointsDisplay = document.getElementById("totalPointsDisplay");
      if (totalPointsDisplay) {
        totalPointsDisplay.textContent = userData.profile.points;
      }

      const userPoints = document.getElementById("userPoints");
      if (userPoints) {
        userPoints.textContent = userData.profile.points;
      }

      // Update navbar points display
      const navbarPoints = document.getElementById("navbarPoints");
      if (navbarPoints) {
        navbarPoints.textContent = userData.profile.points;
      }

      // Reload points history to show the new entry
      if (typeof loadPointsHistory === "function") {
        setTimeout(() => loadPointsHistory(), 100);
      }
    } else {
      console.error("Failed to save user data after adding points");
    }

    return success;
  } catch (error) {
    console.error("Error adding user points:", error);
    return false;
  }
}

/**
 * Set up the quotes filter functionality
 */
function setupQuotesFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (!filterButtons.length) {
    console.warn("No filter buttons found");
    return; // Exit if no filter buttons found
  }

  console.log(`Found ${filterButtons.length} filter buttons`);

  filterButtons.forEach((button) => {
    // Remove any existing listeners by cloning
    const newButton = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(newButton, button);
    }

    newButton.addEventListener("click", function (e) {
      console.log(`Filter button clicked: ${this.getAttribute("data-filter")}`);

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

  // Initial count update
  updateQuoteFilterCounts();

  // Initial filter (show all by default)
  filterQuotes("all");
}

/**
 * Filter quotes based on status
 * @param {string} status - The status to filter by ('all' or specific status)
 */
function filterQuotes(status) {
  // Get all quote rows - select the correct table
  const quoteRows = document.querySelectorAll("#quotesTableBody tr");
  let visibleCount = 0;

  if (!quoteRows.length) {
    // If there's an empty state element, show it
    const emptyState = document.querySelector(".quotes-empty-state");
    if (emptyState) {
      emptyState.classList.remove("d-none");
    }
    return;
  }

  console.log(
    `Filtering quotes by status: ${status}, found ${quoteRows.length} rows`
  );

  quoteRows.forEach((row) => {
    const rowStatus = row.getAttribute("data-status");
    console.log(`Row status: ${rowStatus}`);

    // Remove any previous highlight
    row.classList.remove("row-highlight");

    if (status === "all" || rowStatus === status) {
      row.classList.remove("d-none");

      // Add highlight animation
      row.classList.add("row-highlight");

      visibleCount++;
    } else {
      row.style.display = "none";
      row.classList.add("d-none");
    }
  });

  console.log(`Visible rows after filtering: ${visibleCount}`);

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
  const quoteRows = document.querySelectorAll("#quotesTableBody tr");
  const statusCounts = {
    all: 0,
    Pending: 0,
    Quoted: 0,
    Accepted: 0,
    Completed: 0,
    Rejected: 0,
  };

  // First count the total rows (all)
  statusCounts.all = quoteRows.length;

  // Then count rows by status
  quoteRows.forEach((row) => {
    const status = row.getAttribute("data-status");
    if (status && statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  console.log("Quote counts:", statusCounts);

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
  console.log(`🔍 Showing details for quote ID: ${quoteId}`);

  // Get the quote data from the table row
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (!quoteRow) {
    console.error(`❌ Quote with ID ${quoteId} not found`);
    // Show fallback modal with basic info
    showFallbackQuoteModal(quoteId);
    return;
  }

  // Extract data from table cells with correct indices
  const cells = quoteRow.querySelectorAll("td");
  if (cells.length < 5) {
    console.error("❌ Insufficient table cells found");
    showFallbackQuoteModal(quoteId);
    return;
  }

  try {
    // Extract device type from first cell (Type - index 0)
    const typeText = cells[0].textContent.trim();
    const type = typeText
      .replace(/^\s+|\s+$/g, "")
      .split(/\s+/)
      .pop();

    // Extract device name from second cell (Device - index 1)
    const device = cells[1].textContent.trim();

    // Extract date from third cell (Request Date - index 2)
    const date = cells[2].textContent.trim();

    // Extract status from fourth cell (Status - index 3)
    const statusElement = cells[3].querySelector(".badge");
    const status =
      quoteRow.getAttribute("data-status") ||
      (statusElement
        ? statusElement.textContent.trim().split(/\s+/).pop()
        : "Unknown");

    // Extract points from fifth cell (Points Value - index 4)
    const pointsText = cells[4].textContent.trim();
    let amount = 0;
    if (pointsText !== "--" && pointsText !== "") {
      const pointsMatch = pointsText.match(/(\d+)/);
      amount = pointsMatch ? parseInt(pointsMatch[1]) : 0;
    }

    console.log("✅ Extracted quote data:", {
      quoteId,
      type,
      device,
      date,
      status,
      amount,
    });

    // Show enhanced modal with extracted data
    showEnhancedQuoteModal({
      id: quoteId,
      type,
      device,
      date,
      status,
      amount,
      pointsText,
    });
  } catch (error) {
    console.error("❌ Error extracting data from row:", error);
    showFallbackQuoteModal(quoteId);
  }

  // Enhanced quote data simulation (keeping for compatibility)
  const quoteData = generateEnhancedQuoteData(
    quoteId,
    status || "Unknown",
    date || "N/A",
    device || "Unknown Device",
    amount || 0
  );

  // Populate basic quote information
  populateBasicQuoteInfo(quoteData);

  // Populate environmental impact data
  populateEnvironmentalImpact(quoteData);

  // Populate pricing breakdown
  populatePricingBreakdown(quoteData);

  // Populate pickup and processing info
  populatePickupInfo(quoteData);

  // Populate device specifications
  populateDeviceSpecs(quoteData);

  // Populate processing timeline
  populateProcessingTimeline(quoteData);

  // Populate condition assessment
  populateConditionAssessment(quoteData);

  // Set enhanced notes
  document.getElementById("modal-quote-notes").innerHTML = `
    <i class="fas fa-sticky-note me-2"></i> 
    <strong>Important Information:</strong> ${quoteData.notes}
  `;

  // Show/hide action buttons based on status
  const acceptBtn = document.getElementById("modal-accept-btn");
  const rejectBtn = document.getElementById("modal-reject-btn");

  if (status === "Quoted") {
    acceptBtn.classList.remove("d-none");
    rejectBtn.classList.remove("d-none");

    // Set quote ID for reference
    acceptBtn.setAttribute("data-quote-id", quoteId);
    rejectBtn.setAttribute("data-quote-id", quoteId);

    acceptBtn.onclick = () => {
      if (typeof acceptQuoteEnhanced === "function") {
        acceptQuoteEnhanced(quoteId);
      } else {
        acceptQuote(quoteId);
      }
    };
    rejectBtn.onclick = () => {
      if (typeof rejectQuoteEnhanced === "function") {
        rejectQuoteEnhanced(quoteId);
      } else {
        rejectQuote(quoteId);
      }
    };
  } else {
    acceptBtn.classList.add("d-none");
    rejectBtn.classList.add("d-none");
  }

  // Show the modal with animation
  const modal = new bootstrap.Modal(
    document.getElementById("quoteDetailsModal")
  );
  modal.show();

  // Animate progress bars after modal is shown
  setTimeout(() => animateProgressBars(), 300);
}

function generateEnhancedQuoteData(quoteId, status, date, device, amount) {
  // Simulate comprehensive quote data
  const deviceTypes = {
    "iPhone 13": {
      type: "Smartphone",
      brand: "Apple",
      storage: "128GB",
      color: "Blue",
    },
    "Samsung Galaxy S22": {
      type: "Smartphone",
      brand: "Samsung",
      storage: "256GB",
      color: "Black",
    },
    "MacBook Pro": {
      type: "Laptop",
      brand: "Apple",
      storage: "512GB SSD",
      color: "Space Gray",
    },
    "Dell XPS 15": {
      type: "Laptop",
      brand: "Dell",
      storage: "1TB SSD",
      color: "Silver",
    },
  };

  const deviceInfo = deviceTypes[device] || {
    type: "Device",
    brand: "Unknown",
    storage: "N/A",
    color: "N/A",
  };

  return {
    id: quoteId,
    status: status,
    date: date,
    device: device,
    deviceInfo: deviceInfo,
    amount: amount,
    version: Math.floor(Math.random() * 3) + 1,
    processingTime: "2-3 business days",

    // Environmental impact
    co2Saved: (amount * 0.5).toFixed(1) + " kg",
    materialsRecovered: (amount * 0.02).toFixed(0) + " g metals",
    impactScore: Math.min(95, Math.max(65, amount * 2)),

    // Pricing breakdown
    baseValue: (amount * 0.7).toFixed(2),
    conditionBonus: (amount * 0.2).toFixed(2),
    marketAdjustment: (amount * 0.1).toFixed(2),

    // Pickup information
    pickupMethod: amount > 50 ? "Free Home Pickup" : "Drop-off Center",
    pickupDate: getPickupDate(),
    processingFee: amount > 30 ? "FREE" : "$5.00",

    // Device specifications
    specs: generateDeviceSpecs(deviceInfo),

    // Condition assessment
    condition: generateConditionAssessment(amount),

    // Timeline
    timeline: generateTimeline(status, date),

    // Notes
    notes: generateQuoteNotes(deviceInfo, amount, status),
  };
}

function populateBasicQuoteInfo(data) {
  document.getElementById("modal-quote-id").textContent = data.id;
  document.getElementById("modal-quote-date").textContent = data.date;
  document.getElementById(
    "modal-quote-version"
  ).textContent = `v${data.version}.0`;
  document.getElementById("modal-processing-time").textContent =
    data.processingTime;

  // Set expiry date (14 days from submitted date)
  const submittedDate = new Date(data.date);
  const expiryDate = new Date(submittedDate);
  expiryDate.setDate(expiryDate.getDate() + 14);
  document.getElementById("modal-quote-expiry").textContent =
    expiryDate.toLocaleDateString();

  // Set status badge
  const statusBadge = document.getElementById("modal-quote-status");
  statusBadge.textContent = data.status;
  statusBadge.className = "badge " + getStatusBadgeClass(data.status);
}

function populateEnvironmentalImpact(data) {
  document.getElementById("modal-co2-saved").textContent = data.co2Saved;
  document.getElementById("modal-materials").textContent =
    data.materialsRecovered;

  const impactBar = document.getElementById("modal-impact-bar");
  const impactText = document.getElementById("modal-impact-text");

  impactBar.style.setProperty("--target-width", data.impactScore + "%");
  impactText.textContent = `Environmental Impact: ${data.impactScore}/100 (Excellent)`;
}

function populatePricingBreakdown(data) {
  document.getElementById("modal-quote-amount").textContent = `$${data.amount}`;
  document.getElementById(
    "modal-base-value"
  ).textContent = `$${data.baseValue}`;
  document.getElementById(
    "modal-condition-bonus"
  ).textContent = `+$${data.conditionBonus}`;
  document.getElementById(
    "modal-market-adj"
  ).textContent = `+$${data.marketAdjustment}`;
  document.getElementById("modal-final-amount").textContent = `$${data.amount}`;
}

function populatePickupInfo(data) {
  document.getElementById("modal-pickup-method").textContent =
    data.pickupMethod;
  document.getElementById("modal-pickup-date").textContent = data.pickupDate;
  document.getElementById("modal-processing-fee").textContent =
    data.processingFee;
}

function populateDeviceSpecs(data) {
  const specsContainer = document.getElementById("modal-device-specs");
  specsContainer.innerHTML = "";

  Object.entries(data.specs).forEach(([category, specs]) => {
    const specGroup = document.createElement("div");
    specGroup.className = "col-md-6 mb-3";
    specGroup.innerHTML = `
      <div class="spec-group">
        <h6><i class="${getSpecIcon(category)}"></i>${category}</h6>
        ${Object.entries(specs)
          .map(
            ([key, value]) => `
          <div class="spec-item">
            <span class="spec-label">${key}:</span>
            <span class="spec-value">${value}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
    specsContainer.appendChild(specGroup);
  });
}

function populateProcessingTimeline(data) {
  const timelineContainer = document.getElementById("modal-timeline");
  timelineContainer.innerHTML = "";

  data.timeline.forEach((step) => {
    const timelineStep = document.createElement("div");
    timelineStep.className = "timeline-step";
    timelineStep.innerHTML = `
      <div class="timeline-icon ${step.status}">
        <i class="${step.icon}"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-title">${step.title}</div>
        <div class="timeline-description">${step.description}</div>
        ${step.date ? `<div class="timeline-date">${step.date}</div>` : ""}
      </div>
    `;
    timelineContainer.appendChild(timelineStep);
  });
}

function populateConditionAssessment(data) {
  const conditions = data.condition;

  // Update physical condition
  document.getElementById("modal-physical-condition").textContent =
    conditions.physical.label;
  document.getElementById(
    "modal-physical-condition"
  ).className = `badge ${conditions.physical.badge}`;
  document.getElementById("modal-physical-bar").style.width =
    conditions.physical.percentage + "%";

  // Update functional status
  document.getElementById("modal-functional-status").textContent =
    conditions.functional.label;
  document.getElementById(
    "modal-functional-status"
  ).className = `badge ${conditions.functional.badge}`;
  document.getElementById("modal-functional-bar").style.width =
    conditions.functional.percentage + "%";

  // Update battery health
  document.getElementById("modal-battery-health").textContent =
    conditions.battery.label;
  document.getElementById(
    "modal-battery-health"
  ).className = `badge ${conditions.battery.badge}`;
  document.getElementById("modal-battery-bar").style.width =
    conditions.battery.percentage + "%";

  // Update market value
  document.getElementById("modal-market-value").textContent =
    conditions.market.label;
  document.getElementById(
    "modal-market-value"
  ).className = `badge ${conditions.market.badge}`;
  document.getElementById("modal-market-bar").style.width =
    conditions.market.percentage + "%";
}

function generateDeviceSpecs(deviceInfo) {
  const baseSpecs = {
    General: {
      "Device Type": deviceInfo.type,
      Brand: deviceInfo.brand,
      Storage: deviceInfo.storage,
      Color: deviceInfo.color,
    },
  };

  if (deviceInfo.type === "Smartphone") {
    baseSpecs["Hardware"] = {
      "Screen Size": "6.1 inches",
      Camera: "12MP Dual",
      Battery: "3240mAh",
      "Water Resistance": "IP68",
    };
    baseSpecs["Software"] = {
      "OS Version": "iOS 16.2",
      Security: "Face ID",
      Connectivity: "5G, WiFi 6",
      Condition: "Factory Reset",
    };
  } else if (deviceInfo.type === "Laptop") {
    baseSpecs["Hardware"] = {
      "Screen Size": "15.6 inches",
      Processor: "Intel i7",
      RAM: "16GB",
      Graphics: "Intel Iris",
    };
    baseSpecs["Software"] = {
      "Operating System": "macOS Monterey",
      "Office Suite": "Not Included",
      Security: "FileVault Encrypted",
      Condition: "Data Wiped",
    };
  }

  return baseSpecs;
}

function generateConditionAssessment(amount) {
  // Generate realistic condition scores based on quote amount
  const qualityFactor = Math.min(1, amount / 100);

  return {
    physical: {
      label: amount > 80 ? "Excellent" : amount > 50 ? "Good" : "Fair",
      badge:
        amount > 80 ? "bg-success" : amount > 50 ? "bg-info" : "bg-warning",
      percentage: Math.round(70 + qualityFactor * 25),
    },
    functional: {
      label:
        amount > 70 ? "Working" : amount > 40 ? "Minor Issues" : "Not Working",
      badge: amount > 70 ? "bg-info" : amount > 40 ? "bg-warning" : "bg-danger",
      percentage: Math.round(65 + qualityFactor * 30),
    },
    battery: {
      label: amount > 60 ? "Good" : amount > 30 ? "Average" : "Poor",
      badge:
        amount > 60 ? "bg-warning" : amount > 30 ? "bg-secondary" : "bg-danger",
      percentage: Math.round(60 + qualityFactor * 35),
    },
    market: {
      label: amount > 75 ? "High" : amount > 45 ? "Medium" : "Low",
      badge:
        amount > 75 ? "bg-primary" : amount > 45 ? "bg-info" : "bg-secondary",
      percentage: Math.round(55 + qualityFactor * 40),
    },
  };
}

function generateTimeline(status, submitDate) {
  const timeline = [
    {
      title: "Quote Submitted",
      description:
        "Your recycling request has been received and is being reviewed.",
      icon: "fas fa-paper-plane",
      status: "completed",
      date: submitDate,
    },
    {
      title: "Assessment in Progress",
      description:
        "Our experts are evaluating your device condition and market value.",
      icon: "fas fa-search",
      status: status === "Pending" ? "current" : "completed",
      date: status !== "Pending" ? getDateAfter(submitDate, 1) : null,
    },
    {
      title: "Quote Generated",
      description: "Your personalized quote is ready for review.",
      icon: "fas fa-file-invoice-dollar",
      status: ["Quoted", "Accepted", "Completed"].includes(status)
        ? "completed"
        : "pending",
      date: ["Quoted", "Accepted", "Completed"].includes(status)
        ? getDateAfter(submitDate, 2)
        : null,
    },
  ];

  if (status === "Accepted" || status === "Completed") {
    timeline.push({
      title: "Quote Accepted",
      description: "You have accepted our offer. Pickup is being scheduled.",
      icon: "fas fa-handshake",
      status: "completed",
      date: getDateAfter(submitDate, 3),
    });
  }

  if (status === "Completed") {
    timeline.push({
      title: "Processing Complete",
      description:
        "Your device has been processed and payment has been issued.",
      icon: "fas fa-check-circle",
      status: "completed",
      date: getDateAfter(submitDate, 7),
    });
  }

  return timeline;
}

function generateQuoteNotes(deviceInfo, amount, status) {
  const notes = [];

  if (amount > 80) {
    notes.push("This is a high-value device with excellent resale potential.");
  }

  if (deviceInfo.type === "Smartphone") {
    notes.push(
      "Please ensure all personal data is backed up and the device is signed out of all accounts before pickup."
    );
  } else if (deviceInfo.type === "Laptop") {
    notes.push(
      "Our secure data wiping service will ensure complete data destruction according to DOD standards."
    );
  }

  if (status === "Quoted") {
    notes.push(
      "This quote is valid for 14 days. Accept now to lock in this price."
    );
  }

  notes.push(
    "All recycling is done in compliance with environmental regulations and industry best practices."
  );

  return notes.join(" ");
}

// Helper functions
function getStatusBadgeClass(status) {
  const statusClasses = {
    Pending: "bg-warning",
    Quoted: "bg-info",
    Accepted: "bg-success",
    Completed: "bg-primary",
    Rejected: "bg-danger",
  };
  return statusClasses[status] || "bg-secondary";
}

function getSpecIcon(category) {
  const iconMap = {
    General: "fas fa-info-circle",
    Hardware: "fas fa-microchip",
    Software: "fas fa-code",
  };
  return iconMap[category] || "fas fa-cog";
}

function getPickupDate() {
  const pickup = new Date();
  pickup.setDate(pickup.getDate() + Math.floor(Math.random() * 5) + 2);
  return pickup.toLocaleDateString();
}

function getDateAfter(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString();
}

function animateProgressBars() {
  // Animate environmental impact bar
  const impactBar = document.getElementById("modal-impact-bar");
  const targetWidth = impactBar.style.getPropertyValue("--target-width");
  if (targetWidth) {
    impactBar.style.width = targetWidth;
  }

  // Animate condition assessment bars
  ["physical", "functional", "battery", "market"].forEach((type) => {
    const bar = document.getElementById(`modal-${type}-bar`);
    if (bar && bar.style.width) {
      const currentWidth = bar.style.width;
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = currentWidth;
      }, 100);
    }
  });
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
  console.log(
    `⚠️ Legacy acceptQuote called, redirecting to enhanced version for: ${quoteId}`
  );

  // Redirect to enhanced version if available
  if (typeof acceptQuoteEnhanced === "function") {
    return acceptQuoteEnhanced(quoteId);
  }

  console.log(`Accepting quote ID: ${quoteId}`);

  // In a real app, this would send a request to the server
  // For now, we'll just update the UI
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (quoteRow) {
    // Update status
    quoteRow.setAttribute("data-status", "Accepted");

    // Fixed: Use correct cell index for status (4th cell = index 3)
    const statusCell =
      quoteRow.querySelector("td:nth-child(4) span") ||
      quoteRow.querySelector("td:nth-child(4)");
    if (statusCell) {
      if (statusCell.tagName === "SPAN") {
        statusCell.textContent = "Accepted";
        statusCell.className = "badge bg-success";
      } else {
        statusCell.innerHTML = '<span class="badge bg-success">Accepted</span>';
      }
    }

    // Hide accept/reject buttons in the row
    const actionCell = quoteRow.querySelector("td:last-child");
    const acceptBtn = actionCell?.querySelector(".accept-quote-btn");
    const rejectBtn = actionCell?.querySelector(".reject-quote-btn");

    if (acceptBtn) acceptBtn.classList.add("d-none");
    if (rejectBtn) rejectBtn.classList.add("d-none");

    // Show success message - Fixed: Use correct cell index for device name (2nd cell = index 1)
    const deviceName =
      quoteRow.querySelector("td:nth-child(2)")?.textContent || "device";
    const alert = document.createElement("div");
    alert.className = "alert alert-success alert-dismissible fade show mt-3";
    alert.innerHTML = `
      <i class="fas fa-check-circle me-2"></i> 
      You've successfully accepted the quote for ${deviceName}.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const quotesTab =
      document.querySelector("#quotesTab .tab-pane") ||
      document.querySelector(".quotes-section");
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
  console.log(
    `⚠️ Legacy rejectQuote called, redirecting to enhanced version for: ${quoteId}`
  );

  // Redirect to enhanced version if available
  if (typeof rejectQuoteEnhanced === "function") {
    return rejectQuoteEnhanced(quoteId);
  }

  console.log(`Rejecting quote ID: ${quoteId}`);

  // In a real app, this would send a request to the server
  // For now, we'll just update the UI
  const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

  if (quoteRow) {
    // Update status
    quoteRow.setAttribute("data-status", "Rejected");

    // Fixed: Use correct cell index for status (4th cell = index 3)
    const statusCell =
      quoteRow.querySelector("td:nth-child(4) span") ||
      quoteRow.querySelector("td:nth-child(4)");
    if (statusCell) {
      if (statusCell.tagName === "SPAN") {
        statusCell.textContent = "Rejected";
        statusCell.className = "badge bg-danger";
      } else {
        statusCell.innerHTML = '<span class="badge bg-danger">Rejected</span>';
      }
    }

    // Hide accept/reject buttons in the row
    const actionCell = quoteRow.querySelector("td:last-child");
    const acceptBtn = actionCell?.querySelector(".accept-quote-btn");
    const rejectBtn = actionCell?.querySelector(".reject-quote-btn");

    if (acceptBtn) acceptBtn.classList.add("d-none");
    if (rejectBtn) rejectBtn.classList.add("d-none");

    // Show rejection message - Fixed: Use correct cell index for device name (2nd cell = index 1)
    const deviceName =
      quoteRow.querySelector("td:nth-child(2)")?.textContent || "device";
    const alert = document.createElement("div");
    alert.className = "alert alert-info alert-dismissible fade show mt-3";
    alert.innerHTML = `
      <i class="fas fa-info-circle me-2"></i> 
      You've rejected the quote for ${deviceName}.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const quotesTab =
      document.querySelector("#quotesTab .tab-pane") ||
      document.querySelector(".quotes-section");
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
  console.log("Initializing quotes functionality");

  // Set up the filter functionality
  setupQuotesFilter();

  // Set up the action buttons
  setupViewDetailsButtons();
  setupQuoteActionButtons();

  // Set the "All" filter as active by default
  const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allFilterBtn) {
    allFilterBtn.classList.add("active");
  }

  // Initial count update
  updateQuoteFilterCounts();

  // Run initial filter to show all quotes
  filterQuotes("all");
}

/**
 * ====================================================
 * RETECH PROFILE PAGE - RESPONSIVE MOBILE OPTIMIZATION
 * ====================================================
 */

class ResponsiveProfileManager {
  constructor() {
    this.isInitialized = false;
    this.currentFilter = "all";
    this.quotesData = [];
    this.resizeDebounceTimer = null;

    // DOM Elements
    this.quotesTable = null;
    this.quotesCardsContainer = null;
    this.mobileFilter = null;
    this.filterButtons = null;
    this.emptyState = null;

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.initializeElements();
    this.extractQuotesData();
    this.generateMobileCards();
    this.setupEventListeners();
    this.updateFilterCounts();
    this.handleResize();

    this.isInitialized = true;
    console.log("✅ Responsive Profile Manager initialized");
  }

  initializeElements() {
    this.quotesTable = document.getElementById("quotesTable");
    this.quotesCardsContainer = document.getElementById("quotesCardsContainer");
    this.mobileFilter = document.getElementById("mobileQuoteFilter");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.emptyState = document.querySelector(".quotes-empty-state");

    if (!this.quotesTable || !this.quotesCardsContainer) {
      console.error("❌ Required elements not found");
      return false;
    }

    return true;
  }

  extractQuotesData() {
    const tableRows = this.quotesTable.querySelectorAll("tbody tr");
    this.quotesData = [];

    tableRows.forEach((row) => {
      const data = this.extractRowData(row);
      if (data) {
        this.quotesData.push(data);
      }
    });

    console.log(`📊 Extracted ${this.quotesData.length} quotes from table`);
  }

  extractRowData(row) {
    try {
      const cells = row.querySelectorAll("td");
      if (cells.length < 6) return null;

      // Extract device type and icon
      const deviceTypeElement = cells[0].querySelector(".device-type");
      const deviceIcon =
        deviceTypeElement?.querySelector("i")?.className || "fas fa-device";
      const deviceType = deviceTypeElement?.textContent.trim() || "Unknown";

      // Extract device name
      const deviceName = cells[1].textContent.trim();

      // Extract date
      const requestDate = cells[2].textContent.trim();

      // Extract status
      const statusBadge = cells[3].querySelector(".badge");
      const statusIcon = statusBadge?.querySelector("i")?.className || "";
      const statusText = statusBadge?.textContent.trim() || "Unknown";
      const statusClass = statusBadge?.className || "";

      // Extract points value
      const pointsElement = cells[4];
      const pointsText = pointsElement.textContent.trim();
      const isPointsEmpty = pointsText === "--" || pointsText === "";

      // Extract actions
      const actionButtons = cells[5].querySelectorAll(".btn");
      const actions = Array.from(actionButtons).map((btn) => ({
        text: btn.textContent.trim(),
        class: btn.className,
        title: btn.getAttribute("title"),
        dataId: btn.getAttribute("data-id"),
        icon: btn.querySelector("i")?.className || "",
      }));

      return {
        id: row.getAttribute("data-id") || `quote-${Date.now()}`,
        status: row.getAttribute("data-status") || "Unknown",
        deviceType,
        deviceIcon,
        deviceName,
        requestDate,
        statusText,
        statusIcon,
        statusClass,
        pointsText,
        isPointsEmpty,
        actions,
        row, // Keep reference to original row
      };
    } catch (error) {
      console.error("❌ Error extracting row data:", error);
      return null;
    }
  }

  generateMobileCards() {
    if (!this.quotesCardsContainer) return;

    this.quotesCardsContainer.innerHTML = "";

    if (this.quotesData.length === 0) {
      this.showEmptyState();
      return;
    }

    this.quotesData.forEach((quote) => {
      const card = this.createQuoteCard(quote);
      this.quotesCardsContainer.appendChild(card);
    });

    this.hideEmptyState();
    console.log(`📱 Generated ${this.quotesData.length} mobile cards`);
  }

  createQuoteCard(quote) {
    const card = document.createElement("div");
    card.className = "quote-card";
    card.setAttribute("data-status", quote.status);
    card.setAttribute("data-id", quote.id);

    // Generate actions HTML with improved layout for 3 buttons
    let actionsHTML = "";
    if (quote.actions.length === 3) {
      // Special handling for 3 buttons (View, Accept, Reject)
      const viewAction = quote.actions.find(
        (action) =>
          action.text.includes("View") ||
          action.class.includes("view-details-btn")
      );
      const acceptAction = quote.actions.find(
        (action) =>
          action.text.includes("Accept") ||
          action.class.includes("accept-quote-btn")
      );
      const rejectAction = quote.actions.find(
        (action) =>
          action.text.includes("Reject") ||
          action.class.includes("reject-quote-btn")
      );

      // View button on first row
      if (viewAction) {
        const buttonClass = viewAction.class.replace("btn-sm", "");
        actionsHTML += `
          <button 
            class="${buttonClass}" 
            title="${viewAction.title || ""}"
            ${viewAction.dataId ? `data-id="${viewAction.dataId}"` : ""}
          >
            ${viewAction.icon ? `<i class="${viewAction.icon} me-1"></i>` : ""}
            ${viewAction.text}
          </button>
        `;
      }

      // Accept and Reject buttons in a row container
      if (acceptAction && rejectAction) {
        actionsHTML += `<div class="action-row">`;

        // Accept button
        const acceptButtonClass = acceptAction.class.replace("btn-sm", "");
        actionsHTML += `
          <button 
            class="${acceptButtonClass}" 
            title="${acceptAction.title || ""}"
            ${acceptAction.dataId ? `data-id="${acceptAction.dataId}"` : ""}
          >
            ${
              acceptAction.icon
                ? `<i class="${acceptAction.icon} me-1"></i>`
                : ""
            }
            ${acceptAction.text}
          </button>
        `;

        // Reject button
        const rejectButtonClass = rejectAction.class.replace("btn-sm", "");
        actionsHTML += `
          <button 
            class="${rejectButtonClass}" 
            title="${rejectAction.title || ""}"
            ${rejectAction.dataId ? `data-id="${rejectAction.dataId}"` : ""}
          >
            ${
              rejectAction.icon
                ? `<i class="${rejectAction.icon} me-1"></i>`
                : ""
            }
            ${rejectAction.text}
          </button>
        `;

        actionsHTML += `</div>`;
      }
    } else {
      // Standard handling for 1 or 2 buttons
      actionsHTML = quote.actions
        .map((action) => {
          const buttonClass = action.class.replace("btn-sm", "");
          return `
          <button 
            class="${buttonClass}" 
            title="${action.title || ""}"
            ${action.dataId ? `data-id="${action.dataId}"` : ""}
          >
            ${action.icon ? `<i class="${action.icon} me-1"></i>` : ""}
            ${action.text}
          </button>
        `;
        })
        .join("");
    }

    card.innerHTML = `
      <div class="quote-card-header">
        <div class="device-info">
          <h6 class="device-name mb-1">${quote.deviceName}</h6>
          <div class="device-type mb-2">
            <i class="${quote.deviceIcon} me-2 text-primary"></i>
            ${quote.deviceType}
          </div>
        </div>
        <span class="${quote.statusClass} quote-status">
          ${quote.statusIcon ? `<i class="${quote.statusIcon}"></i>` : ""} 
          ${quote.statusText}
        </span>
      </div>
      <div class="quote-card-body">
        <div class="row">
          <div class="col-6">
            <small class="text-muted">Request Date</small>
            <div class="fw-bold">${quote.requestDate}</div>
          </div>
          <div class="col-6 text-end">
            <small class="text-muted">Points Value</small>
            <div class="fw-bold ${
              quote.isPointsEmpty ? "text-muted" : "text-success"
            }">
              ${quote.pointsText}
            </div>
          </div>
        </div>
      </div>
      <div class="quote-card-actions${
        quote.actions.length === 3 ? " three-buttons" : ""
      }">
        ${actionsHTML}
      </div>
    `;

    // Add event listeners to buttons
    this.addCardEventListeners(card);

    return card;
  }

  addCardEventListeners(card) {
    const buttons = card.querySelectorAll(".btn");
    buttons.forEach((button) => {
      // Determine button type and add appropriate event listener
      this.addDirectEventListener(button, card);

      // Add touch-friendly interactions
      this.addTouchInteractions(button);
    });
  }

  addDirectEventListener(button, card) {
    const buttonText = button.textContent.trim();
    const quoteId = card.getAttribute("data-id");

    // Determine button action based on class and text content
    if (
      button.classList.contains("view-details-btn") ||
      buttonText.includes("View")
    ) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleViewDetails(quoteId);
      });

      // Add touch event for mobile
      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.handleViewDetails(quoteId);
      });
    } else if (
      button.classList.contains("accept-quote-btn") ||
      buttonText.includes("Accept")
    ) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleAcceptQuote(quoteId, card);
      });

      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.handleAcceptQuote(quoteId, card);
      });
    } else if (
      button.classList.contains("reject-quote-btn") ||
      buttonText.includes("Reject")
    ) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRejectQuote(quoteId, card);
      });

      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.handleRejectQuote(quoteId, card);
      });
    }
  }

  handleViewDetails(quoteId) {
    console.log(`🔍 Mobile card: Opening details for quote ${quoteId}`);

    // Add visual feedback to show the button is working
    const activeButton = document.querySelector(
      `[data-id="${quoteId}"] .view-details-btn, .quote-card[data-id="${quoteId}"] .view-details-btn`
    );
    if (activeButton) {
      const originalBg = activeButton.style.backgroundColor;
      const originalColor = activeButton.style.color;
      const originalContent = activeButton.innerHTML;

      activeButton.style.backgroundColor = "#28a745";
      activeButton.style.color = "white";
      activeButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Loading...';

      // Reset button after a short delay
      setTimeout(() => {
        activeButton.style.backgroundColor = originalBg;
        activeButton.style.color = originalColor;
        activeButton.innerHTML = originalContent;
      }, 1500);
    }

    // Call the global showQuoteDetails function
    if (typeof showQuoteDetails === "function") {
      showQuoteDetails(quoteId);
    } else {
      console.error("❌ showQuoteDetails function not available");
      // Fallback: show basic modal with quote ID
      if (typeof showFallbackQuoteModal === "function") {
        showFallbackQuoteModal(quoteId);
      } else {
        // Last resort alert
        alert(
          `Quote Details\n\nQuote ID: ${quoteId}\n\nThe quote details modal is not available. Please refresh the page and try again.`
        );
      }
    }
  }

  handleAcceptQuote(quoteId, card) {
    console.log(`✅ Mobile card: Accepting quote ${quoteId}`);

    // Call the enhanced acceptQuote function
    if (typeof acceptQuoteEnhanced === "function") {
      acceptQuoteEnhanced(quoteId);
      // Update the mobile card as well
      this.updateCardStatus(card, "Accepted");
    } else if (typeof acceptQuote === "function") {
      acceptQuote(quoteId);
      // Update the mobile card as well
      this.updateCardStatus(card, "Accepted");
    } else {
      console.error("❌ acceptQuote function not available");
    }
  }

  handleRejectQuote(quoteId, card) {
    console.log(`❌ Mobile card: Rejecting quote ${quoteId}`);

    // Call the enhanced rejectQuote function
    if (typeof rejectQuoteEnhanced === "function") {
      rejectQuoteEnhanced(quoteId);
      // Update the mobile card as well
      this.updateCardStatus(card, "Rejected");
    } else if (typeof rejectQuote === "function") {
      rejectQuote(quoteId);
      // Update the mobile card as well
      this.updateCardStatus(card, "Rejected");
    } else {
      console.error("❌ rejectQuote function not available");
    }
  }

  updateCardStatus(card, newStatus) {
    // Update card status attribute
    card.setAttribute("data-status", newStatus);

    // Update status badge
    const statusBadge = card.querySelector(".quote-status");
    if (statusBadge) {
      statusBadge.className = "quote-status badge";

      switch (newStatus) {
        case "Accepted":
          statusBadge.classList.add("bg-success");
          statusBadge.innerHTML = '<i class="fas fa-handshake"></i> Accepted';
          break;
        case "Rejected":
          statusBadge.classList.add("bg-danger");
          statusBadge.innerHTML =
            '<i class="fas fa-times-circle"></i> Rejected';
          break;
      }
    }

    // Update action buttons
    const actionsContainer = card.querySelector(".quote-card-actions");
    if (
      actionsContainer &&
      (newStatus === "Accepted" || newStatus === "Rejected")
    ) {
      // Only show view button for accepted/rejected quotes
      actionsContainer.innerHTML = `
        <button class="btn btn-outline-primary view-details-btn" data-id="${card.getAttribute(
          "data-id"
        )}">
          <i class="fas fa-eye me-1"></i> View
        </button>
      `;

      // Re-add event listener to the new view button
      const newViewButton = actionsContainer.querySelector(".view-details-btn");
      if (newViewButton) {
        this.addDirectEventListener(newViewButton, card);
        this.addTouchInteractions(newViewButton);
      }
    }
  }

  addTouchInteractions(button) {
    // Add touch feedback with transition
    button.style.transition = "transform 0.1s ease";

    let touchStartTime = 0;
    let hasTouchEvent = false;

    button.addEventListener("touchstart", (e) => {
      touchStartTime = Date.now();
      hasTouchEvent = true;
      button.style.transform = "scale(0.95)";
      button.classList.add("touch-active");
    });

    button.addEventListener("touchend", (e) => {
      button.style.transform = "";
      button.classList.remove("touch-active");

      // Only prevent click if this was a quick tap (not a long press)
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 500) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Reset flag after a delay to allow click events to work normally
      setTimeout(() => {
        hasTouchEvent = false;
      }, 300);
    });

    button.addEventListener("touchcancel", () => {
      button.style.transform = "";
      button.classList.remove("touch-active");
      hasTouchEvent = false;
    });

    // Prevent click events if a touch event just occurred
    button.addEventListener("click", (e) => {
      if (hasTouchEvent) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  setupEventListeners() {
    // Desktop filter buttons
    this.filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const filter = e.currentTarget.getAttribute("data-filter");
        this.setActiveFilter(filter);
        this.applyFilter(filter);
      });
    });

    // Mobile filter dropdown
    if (this.mobileFilter) {
      this.mobileFilter.addEventListener("change", (e) => {
        const filter = e.target.value;
        this.setActiveDesktopFilter(filter);
        this.applyFilter(filter);
      });
    }

    // Global event delegation for mobile card buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".quotes-cards-container")) {
        const button = e.target.closest(".btn");
        if (button) {
          const card = button.closest(".quote-card");
          if (card) {
            const quoteId = card.getAttribute("data-id");
            const buttonText = button.textContent.trim();

            // Prevent double execution if this was already handled
            if (e.detail > 1) return;

            if (
              button.classList.contains("view-details-btn") ||
              buttonText.includes("View")
            ) {
              e.preventDefault();
              e.stopPropagation();
              this.handleViewDetails(quoteId);
            }
          }
        }
      }
    });

    // Global touch event delegation for mobile
    document.addEventListener("touchend", (e) => {
      if (e.target.closest(".quotes-cards-container")) {
        const button = e.target.closest(".btn");
        if (button && !button.hasAttribute("data-touch-handled")) {
          const card = button.closest(".quote-card");
          if (card) {
            const quoteId = card.getAttribute("data-id");
            const buttonText = button.textContent.trim();

            // Mark as handled to prevent double execution
            button.setAttribute("data-touch-handled", "true");
            setTimeout(
              () => button.removeAttribute("data-touch-handled"),
              1000
            );

            if (
              button.classList.contains("view-details-btn") ||
              buttonText.includes("View")
            ) {
              e.preventDefault();
              e.stopPropagation();
              this.handleViewDetails(quoteId);
            }
          }
        }
      }
    });

    // Resize handler
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Orientation change handler
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleResize();
      }, 500);
    });
  }

  setActiveFilter(filter) {
    this.currentFilter = filter;

    // Update desktop buttons
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter") === filter) {
        btn.classList.add("active");
      }
    });

    // Update mobile dropdown
    if (this.mobileFilter) {
      this.mobileFilter.value = filter;
    }
  }

  setActiveDesktopFilter(filter) {
    this.currentFilter = filter;

    // Update desktop buttons
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter") === filter) {
        btn.classList.add("active");
      }
    });
  }

  applyFilter(filter) {
    // Filter table rows
    this.filterTableRows(filter);

    // Filter mobile cards
    this.filterMobileCards(filter);

    // Update counts
    this.updateFilterCounts();

    console.log(`🔍 Applied filter: ${filter}`);
  }

  filterTableRows(filter) {
    const rows = this.quotesTable.querySelectorAll("tbody tr");
    let visibleCount = 0;

    rows.forEach((row) => {
      const status = row.getAttribute("data-status");
      const shouldShow = filter === "all" || status === filter;

      if (shouldShow) {
        row.style.display = "";
        row.classList.remove("d-none");
        visibleCount++;
      } else {
        row.style.display = "none";
        row.classList.add("d-none");
      }
    });

    return visibleCount;
  }

  filterMobileCards(filter) {
    if (!this.quotesCardsContainer) return;

    const cards = this.quotesCardsContainer.querySelectorAll(".quote-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const status = card.getAttribute("data-status");
      const shouldShow = filter === "all" || status === filter;

      if (shouldShow) {
        card.style.display = "";
        card.classList.remove("d-none");
        visibleCount++;
      } else {
        card.style.display = "none";
        card.classList.add("d-none");
      }
    });

    // Show/hide empty state
    if (visibleCount === 0) {
      this.showEmptyState();
    } else {
      this.hideEmptyState();
    }

    return visibleCount;
  }

  updateFilterCounts() {
    const counts = this.calculateFilterCounts();

    // Update desktop filter buttons
    this.filterButtons.forEach((button) => {
      const filter = button.getAttribute("data-filter");
      const countElement = button.querySelector(".filter-count");
      const count = counts[filter] || 0;

      if (countElement) {
        countElement.textContent = count;
      }
    });

    // Update mobile dropdown options
    if (this.mobileFilter) {
      const options = this.mobileFilter.querySelectorAll("option");
      options.forEach((option) => {
        const filter = option.value;
        const count = counts[filter] || 0;
        const baseText = option.textContent.split(" (")[0];
        option.textContent = `${baseText} (${count})`;
      });
    }
  }

  calculateFilterCounts() {
    const counts = {
      all: this.quotesData.length,
      Pending: 0,
      Quoted: 0,
      Accepted: 0,
      Completed: 0,
      Rejected: 0,
    };

    this.quotesData.forEach((quote) => {
      if (counts.hasOwnProperty(quote.status)) {
        counts[quote.status]++;
      }
    });

    return counts;
  }

  showEmptyState() {
    if (this.emptyState) {
      this.emptyState.classList.remove("d-none");
    }
  }

  hideEmptyState() {
    if (this.emptyState) {
      this.emptyState.classList.add("d-none");
    }
  }

  handleResize() {
    // Force regeneration of cards if switching between mobile/desktop
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Ensure cards are up to date
      this.extractQuotesData();
      this.generateMobileCards();
      this.applyFilter(this.currentFilter);
    }

    console.log(`📱 Resize handled - Mobile: ${isMobile}`);
  }

  // Public API methods
  refresh() {
    this.extractQuotesData();
    this.generateMobileCards();
    this.updateFilterCounts();
    this.applyFilter(this.currentFilter);
    console.log("🔄 Profile data refreshed");
  }

  addQuote(quoteData) {
    // Add to table first (assuming external function handles this)
    // Then refresh mobile cards
    this.refresh();
  }

  removeQuote(quoteId) {
    // Remove from table first (assuming external function handles this)
    // Then refresh mobile cards
    this.refresh();
  }

  updateQuote(quoteId, newData) {
    // Update table first (assuming external function handles this)
    // Then refresh mobile cards
    this.refresh();
  }
}

// ====================================================
// PERFORMANCE OPTIMIZATIONS
// ====================================================

// Intersection Observer for lazy loading (future enhancement)
class LazyLoadObserver {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: "50px 0px",
          threshold: 0.1,
        }
      );
    }
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Future: Load card images or additional data
        this.observer.unobserve(entry.target);
      }
    });
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }
}

// ====================================================
// INITIALIZATION
// ====================================================

// Initialize when DOM is ready
let profileManager = null;
let lazyLoader = null;

document.addEventListener("DOMContentLoaded", () => {
  profileManager = new ResponsiveProfileManager();
  lazyLoader = new LazyLoadObserver();
});

// Expose global functions for external use
window.refreshProfileData = () => {
  if (profileManager) {
    profileManager.refresh();
  }
};

window.addProfileQuote = (quoteData) => {
  if (profileManager) {
    profileManager.addQuote(quoteData);
  }
};

window.removeProfileQuote = (quoteId) => {
  if (profileManager) {
    profileManager.removeQuote(quoteId);
  }
};

window.updateProfileQuote = (quoteId, newData) => {
  if (profileManager) {
    profileManager.updateQuote(quoteId, newData);
  }
};

// Debug mode
if (window.location.search.includes("debug=true")) {
  window.profileManager = profileManager;
  console.log("🐛 Debug mode enabled - profileManager available on window");
}

/**
 * Handle HyperOne redemption - Exposed globally for HTML onclick handlers
 * @param {HTMLElement|Object} rewardData - Button element or reward data object
 */
window.handleHyperOneRedemption = function (rewardData) {
  try {
    console.log("HyperOne redemption handler called");

    // Extract data from button or use object directly
    let pointsCost, rewardName, rewardValue;

    if (rewardData instanceof HTMLElement) {
      // It's a button element
      pointsCost = parseInt(rewardData.getAttribute("data-points"), 10);
      rewardName = rewardData.getAttribute("data-reward");
      rewardValue = rewardData.getAttribute("data-value");
    } else {
      // It's a data object
      pointsCost = rewardData.points;
      rewardName = rewardData.name;
      rewardValue = rewardData.value;
    }

    console.log("Redemption data:", { pointsCost, rewardName, rewardValue });

    // Get current user's points
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      showToast("Please log in to redeem rewards", "warning");
      return;
    }

    const userData = getUserData(userEmail);
    if (!userData || !userData.profile) {
      showToast("User profile not found", "warning");
      return;
    }

    const currentPoints = userData.profile.points || 0;

    // Check if user has enough points
    if (currentPoints < pointsCost) {
      showToast(
        `Not enough points. You need ${pointsCost} points to redeem this reward.`,
        "warning"
      );
      return;
    }

    // Prepare data for confirmation
    const redemptionData = {
      points: pointsCost,
      name: rewardName,
      value: rewardValue,
      email: userEmail,
      currentPoints: currentPoints,
    };

    // Show confirmation modal
    showRedemptionConfirmation(redemptionData);
  } catch (error) {
    console.error("Error in handleHyperOneRedemption:", error);
    showToast("An unexpected error occurred. Please try again.", "danger");
  }
};

/**
 * Show redemption confirmation modal
 * @param {Object} redemptionData - Data for the redemption
 */
function showRedemptionConfirmation(redemptionData) {
  try {
    console.log("Showing redemption confirmation for:", redemptionData);

    // Get modal elements
    const modal = document.getElementById("redeemConfirmationModal");
    const redeemVoucherName = document.getElementById("redeemVoucherName");
    const redeemVoucherPoints = document.getElementById("redeemVoucherPoints");
    const pointsBalance = document
      .getElementById("pointsBalance")
      ?.querySelector("span");
    const confirmRedeemBtn = document.getElementById("confirmRedeemBtn");

    if (
      !modal ||
      !redeemVoucherName ||
      !redeemVoucherPoints ||
      !pointsBalance ||
      !confirmRedeemBtn
    ) {
      console.error("Missing modal elements:", {
        modal: !!modal,
        redeemVoucherName: !!redeemVoucherName,
        redeemVoucherPoints: !!redeemVoucherPoints,
        pointsBalance: !!pointsBalance,
        confirmRedeemBtn: !!confirmRedeemBtn,
      });
      showToast("Unable to show confirmation. Please try again.", "danger");
      return;
    }

    // Populate modal
    redeemVoucherName.textContent = redemptionData.name;
    redeemVoucherPoints.textContent = redemptionData.points;

    // Calculate remaining points
    const remainingPoints =
      redemptionData.currentPoints - redemptionData.points;
    pointsBalance.textContent = remainingPoints;

    // Set up confirm button
    // Remove any existing event listeners by replacing the button
    const newConfirmBtn = confirmRedeemBtn.cloneNode(true);
    confirmRedeemBtn.parentNode.replaceChild(newConfirmBtn, confirmRedeemBtn);

    // Add click handler with safety checks
    newConfirmBtn.addEventListener("click", function () {
      try {
        console.log("Confirm redemption clicked");

        // Process redemption first before hiding modal to avoid UI issues
        processRedemption(redemptionData);

        // Hide modal safely
        try {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            // Fallback if getInstance fails
            $(modal).modal("hide");
          }
        } catch (modalError) {
          console.error("Error hiding modal:", modalError);
          // Use jQuery as fallback if bootstrap fails
          try {
            if (typeof $ !== "undefined") {
              $(modal).modal("hide");
            } else {
              // Last resort - add hidden class manually
              modal.classList.add("fade");
              modal.style.display = "none";
              document.body.classList.remove("modal-open");
              const backdrop = document.querySelector(".modal-backdrop");
              if (backdrop) backdrop.remove();
            }
          } catch (fallbackError) {
            console.error("Modal fallback failed:", fallbackError);
          }
        }
      } catch (clickError) {
        console.error("Error in confirm button click handler:", clickError);
        showToast("Error processing redemption. Please try again.", "danger");
      }
    });

    // Show modal safely
    try {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    } catch (modalError) {
      console.error("Error showing modal with Bootstrap:", modalError);
      // Fallback using jQuery if available
      try {
        if (typeof $ !== "undefined") {
          $(modal).modal("show");
        } else {
          // Manual fallback
          modal.classList.add("show");
          modal.style.display = "block";
          document.body.classList.add("modal-open");

          // Create backdrop
          const backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop fade show";
          document.body.appendChild(backdrop);
        }
      } catch (fallbackError) {
        console.error("Modal fallback failed:", fallbackError);
        // Skip the modal and process directly as last resort
        processRedemption(redemptionData);
      }
    }
  } catch (error) {
    console.error("Error showing redemption confirmation:", error);
    showToast("Unable to show confirmation. Processing directly.", "warning");
    // Try to process directly as fallback
    processRedemption(redemptionData);
  }
}

/**
 * Process the redemption after confirmation
 * @param {Object} redemptionData - Data for the redemption
 */
function processRedemption(redemptionData) {
  console.log("Processing redemption:", redemptionData);

  try {
    // Generate voucher code
    const voucherCode = generateVoucherCode(redemptionData.name);
    console.log("Generated voucher code:", voucherCode);

    // Deduct points from user
    const userEmail = redemptionData.email;
    const newPoints = redemptionData.currentPoints - redemptionData.points;

    // Get user data
    let userData = getUserData(userEmail);
    if (!userData) {
      console.error("User data not found for:", userEmail);
      showToast("User data not found", "danger");
      return;
    }

    // Create a copy of user data to avoid reference issues
    userData = JSON.parse(JSON.stringify(userData));

    // Update points
    if (!userData.profile) userData.profile = {};
    userData.profile.points = newPoints;

    // Add voucher to user data
    if (!userData.vouchers) userData.vouchers = [];

    const newVoucher = {
      id: voucherCode,
      name: redemptionData.name,
      value: redemptionData.value,
      points: redemptionData.points,
      dateCreated: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      platform: "hyperone",
      used: false,
    };

    userData.vouchers.push(newVoucher);

    // Add to points history
    if (!userData.pointsHistory) userData.pointsHistory = [];

    userData.pointsHistory.push({
      date: new Date().toISOString(),
      activity: `Redeemed ${redemptionData.name}`,
      points: -redemptionData.points,
      balance: newPoints,
    });

    console.log("Saving updated user data:", userData);

    // Save user data - do this before UI updates
    localStorage.setItem(`userData_${userEmail}`, JSON.stringify(userData));

    // Show success message first
    showToast(`Successfully redeemed ${redemptionData.name}!`, "success");

    // Update UI displays with setTimeout to prevent UI blocking
    setTimeout(() => {
      try {
        // Update points display
        if (typeof updatePointsDisplay === "function") {
          updatePointsDisplay(newPoints);
        }

        // Load user vouchers
        if (typeof loadUserVouchers === "function") {
          loadUserVouchers();
        }

        // Load points history
        if (typeof loadPointsHistory === "function") {
          loadPointsHistory();
        }

        // Update navbar points display
        if (typeof updatePointsDisplayInNavbar === "function") {
          updatePointsDisplayInNavbar(userEmail);
        } else if (typeof window.updatePointsDisplayInNavbar === "function") {
          window.updatePointsDisplayInNavbar(userEmail);
        }

        console.log("UI updates completed successfully");
      } catch (uiError) {
        console.error("Error updating UI after redemption:", uiError);
      }
    }, 100);
  } catch (error) {
    console.error("Error processing redemption:", error);
    showToast(
      "An error occurred during redemption. Please try again.",
      "danger"
    );
  }
}

/**
 * Show enhanced quote details modal with proper data
 */
function showEnhancedQuoteModal(quoteData) {
  const { id, type, device, date, status, amount, pointsText } = quoteData;

  // Update basic quote information
  document.getElementById("modal-device-name").textContent = device;
  document.getElementById("modal-quote-id").textContent = id;
  document.getElementById("modal-quote-date").textContent = date;

  // Set status badge with proper styling
  const statusBadge = document.getElementById("modal-quote-status");
  statusBadge.textContent = status;
  statusBadge.className = "badge " + getBadgeClassByStatus(status);

  // Set amount or points
  const amountElement = document.getElementById("modal-quote-amount");
  if (amount > 0) {
    amountElement.textContent = `${amount} Points`;
    amountElement.className = "text-success fw-bold mb-0";
  } else {
    amountElement.textContent = "Pending Quote";
    amountElement.className = "text-muted fw-bold mb-0";
  }

  // Set expiry date (14 days from request date)
  try {
    const requestDate = new Date(date);
    const expiryDate = new Date(requestDate);
    expiryDate.setDate(expiryDate.getDate() + 14);
    document.getElementById("modal-quote-expiry").textContent =
      expiryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  } catch (e) {
    document.getElementById("modal-quote-expiry").textContent = "N/A";
  }

  // Populate device details
  populateDeviceDetails(type, device);

  // Show/hide action buttons based on status
  const acceptBtn = document.getElementById("modal-accept-btn");
  const rejectBtn = document.getElementById("modal-reject-btn");

  if (status === "Quoted") {
    acceptBtn.classList.remove("d-none");
    rejectBtn.classList.remove("d-none");

    // Set quote ID on buttons for reference
    acceptBtn.setAttribute("data-quote-id", id);
    rejectBtn.setAttribute("data-quote-id", id);

    acceptBtn.onclick = () => {
      if (typeof acceptQuoteEnhanced === "function") {
        acceptQuoteEnhanced(id);
      } else {
        acceptQuote(id);
      }
    };
    rejectBtn.onclick = () => {
      if (typeof rejectQuoteEnhanced === "function") {
        rejectQuoteEnhanced(id);
      } else {
        rejectQuote(id);
      }
    };
  } else {
    acceptBtn.classList.add("d-none");
    rejectBtn.classList.add("d-none");
  }

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("quoteDetailsModal")
  );
  modal.show();

  console.log("✅ Quote details modal displayed successfully");
}

/**
 * Populate device details in the modal
 */
function populateDeviceDetails(type, device) {
  const deviceList = document.getElementById("modal-device-list");

  // Generate device specifications based on type and device name
  const specs = generateDeviceSpecifications(type, device);

  let specsHtml = "";
  Object.entries(specs).forEach(([key, value]) => {
    specsHtml += `
      <tr>
        <td class="text-muted" style="width: 40%;">${key}:</td>
        <td class="fw-medium">${value}</td>
      </tr>
    `;
  });

  deviceList.innerHTML = specsHtml;
}

/**
 * Generate device specifications based on type and device name
 */
function generateDeviceSpecifications(type, device) {
  const specs = {
    "Device Type": type,
    Model: device,
  };

  // Add type-specific specifications
  switch (type.toLowerCase()) {
    case "phone":
      specs["Category"] = "Mobile Device";
      specs["Storage"] = device.includes("Pro") ? "256GB" : "128GB";
      specs["Condition"] = "Good";
      if (device.includes("iPhone")) {
        specs["Brand"] = "Apple";
        specs["Operating System"] = "iOS";
      } else if (device.includes("Galaxy") || device.includes("Samsung")) {
        specs["Brand"] = "Samsung";
        specs["Operating System"] = "Android";
      } else if (device.includes("Pixel")) {
        specs["Brand"] = "Google";
        specs["Operating System"] = "Android";
      }
      break;

    case "laptop":
      specs["Category"] = "Computer";
      specs["Storage"] = "512GB SSD";
      specs["RAM"] = "16GB";
      specs["Condition"] = "Excellent";
      if (device.includes("MacBook")) {
        specs["Brand"] = "Apple";
        specs["Operating System"] = "macOS";
      } else if (device.includes("Dell")) {
        specs["Brand"] = "Dell";
        specs["Operating System"] = "Windows";
      }
      break;

    case "electronics":
      specs["Category"] = "Electronics";
      if (device.includes("PlayStation")) {
        specs["Brand"] = "Sony";
        specs["Type"] = "Gaming Console";
        specs["Storage"] = "825GB SSD";
      } else if (device.includes("iPad")) {
        specs["Brand"] = "Apple";
        specs["Type"] = "Tablet";
        specs["Storage"] = "64GB";
      } else if (device.includes("Nintendo")) {
        specs["Brand"] = "Nintendo";
        specs["Type"] = "Gaming Console";
        specs["Storage"] = "32GB";
      }
      break;

    case "kitchen":
      specs["Category"] = "Appliance";
      if (device.includes("LG")) {
        specs["Brand"] = "LG";
        specs["Type"] = "Smart Refrigerator";
      } else if (device.includes("Dyson")) {
        specs["Brand"] = "Dyson";
        specs["Type"] = "Vacuum Cleaner";
      }
      break;
  }

  return specs;
}

/**
 * Show fallback modal when data extraction fails
 */
function showFallbackQuoteModal(quoteId) {
  console.log("📋 Showing fallback modal for quote:", quoteId);

  // Set basic information
  document.getElementById("modal-device-name").textContent = "Quote Details";
  document.getElementById("modal-quote-id").textContent = quoteId;
  document.getElementById("modal-quote-date").textContent = "N/A";
  document.getElementById("modal-quote-status").textContent = "Unknown";
  document.getElementById("modal-quote-status").className =
    "badge bg-secondary";
  document.getElementById("modal-quote-amount").textContent = "Processing...";
  document.getElementById("modal-quote-expiry").textContent = "N/A";

  // Clear device details
  document.getElementById("modal-device-list").innerHTML = `
    <tr>
      <td class="text-muted">Quote ID:</td>
      <td class="fw-medium">${quoteId}</td>
    </tr>
    <tr>
      <td class="text-muted">Status:</td>
      <td class="fw-medium">Loading details...</td>
    </tr>
  `;

  // Hide action buttons
  document.getElementById("modal-accept-btn").classList.add("d-none");
  document.getElementById("modal-reject-btn").classList.add("d-none");

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("quoteDetailsModal")
  );
  modal.show();
}

/**
 * Ensure the responsive profile manager is properly initialized
 */
function ensureResponsiveProfileManager() {
  console.log("🔧 Ensuring responsive profile manager is initialized...");

  // Check if we have any quotes data
  const quotesTable = document.getElementById("quotesTable");
  const cardsContainer = document.getElementById("quotesCardsContainer");

  if (!quotesTable || !cardsContainer) {
    console.log(
      "❌ Required elements not found for responsive profile manager"
    );
    return;
  }

  // Initialize or reinitialize the responsive profile manager
  try {
    // Create a new instance
    const profileManager = new ResponsiveProfileManager();
    profileManager.init();

    // Store globally for debugging
    window.profileManager = profileManager;

    console.log("✅ Responsive profile manager initialized successfully");

    // Force a refresh to ensure mobile cards are generated
    setTimeout(() => {
      if (window.innerWidth < 768) {
        profileManager.refresh();
      }
    }, 500);
  } catch (error) {
    console.error("❌ Error initializing responsive profile manager:", error);
  }
}

/**
 * Add event listeners to quote action buttons (Accept/Reject)
 */
function addQuoteActionListeners() {
  console.log("🔧 Setting up quote action button listeners");

  // Get all accept and reject buttons in the table
  const acceptButtons = document.querySelectorAll(".accept-quote-btn");
  const rejectButtons = document.querySelectorAll(".reject-quote-btn");

  console.log(
    `Found ${acceptButtons.length} accept buttons and ${rejectButtons.length} reject buttons`
  );

  // Set up accept buttons
  acceptButtons.forEach((button) => {
    // Remove any existing event listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log("Accept button clicked");

      // Get quote ID from the button's data-id or from the parent row
      let quoteId = this.getAttribute("data-id");

      if (!quoteId) {
        const row = this.closest("tr");
        if (row) {
          quoteId = row.getAttribute("data-id");
        }
      }

      if (quoteId) {
        console.log(`Accepting quote: ${quoteId}`);
        acceptQuoteEnhanced(quoteId);
      } else {
        console.error("Could not find quote ID for accept button");
        showToast("Error: Could not identify the quote to accept", "danger");
      }
    });
  });

  // Set up reject buttons
  rejectButtons.forEach((button) => {
    // Remove any existing event listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log("Reject button clicked");

      // Get quote ID from the button's data-id or from the parent row
      let quoteId = this.getAttribute("data-id");

      if (!quoteId) {
        const row = this.closest("tr");
        if (row) {
          quoteId = row.getAttribute("data-id");
        }
      }

      if (quoteId) {
        console.log(`Rejecting quote: ${quoteId}`);
        rejectQuoteEnhanced(quoteId);
      } else {
        console.error("Could not find quote ID for reject button");
        showToast("Error: Could not identify the quote to reject", "danger");
      }
    });
  });

  // Also set up modal accept/reject buttons if they exist
  setupModalActionButtons();
}

/**
 * Setup action buttons in modals
 */
function setupModalActionButtons() {
  const modalAcceptBtn = document.getElementById("modal-accept-btn");
  const modalRejectBtn = document.getElementById("modal-reject-btn");

  if (modalAcceptBtn) {
    // Remove existing listeners
    const newAcceptBtn = modalAcceptBtn.cloneNode(true);
    modalAcceptBtn.parentNode.replaceChild(newAcceptBtn, modalAcceptBtn);

    // Add new listener
    newAcceptBtn.addEventListener("click", function () {
      const quoteId =
        this.getAttribute("data-quote-id") ||
        document.getElementById("modal-quote-id")?.textContent;

      if (quoteId) {
        acceptQuoteEnhanced(quoteId);
      }
    });
  }

  if (modalRejectBtn) {
    // Remove existing listeners
    const newRejectBtn = modalRejectBtn.cloneNode(true);
    modalRejectBtn.parentNode.replaceChild(newRejectBtn, modalRejectBtn);

    // Add new listener
    newRejectBtn.addEventListener("click", function () {
      const quoteId =
        this.getAttribute("data-quote-id") ||
        document.getElementById("modal-quote-id")?.textContent;

      if (quoteId) {
        rejectQuoteEnhanced(quoteId);
      }
    });
  }
}

/**
 * Enhanced Accept Quote function with proper error handling and data persistence
 * @param {string} quoteId - The ID of the quote to accept
 */
function acceptQuoteEnhanced(quoteId) {
  console.log(`🟢 Enhanced Accept: Processing quote ID: ${quoteId}`);

  if (!quoteId) {
    console.error("No quote ID provided");
    if (typeof showToast === "function") {
      showToast("Error: No quote ID provided", "danger");
    } else {
      alert("Error: No quote ID provided");
    }
    return;
  }

  try {
    // Show loading state
    showToast("Processing quote acceptance...", "info");

    // Find the quote row in the table
    const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

    if (!quoteRow) {
      console.error(`Quote row not found for ID: ${quoteId}`);
      showToast("Error: Quote not found", "danger");
      return;
    }

    // Extract current quote data using correct cell indices
    const cells = quoteRow.querySelectorAll("td");
    if (cells.length < 6) {
      console.error("Insufficient table cells found");
      showToast("Error: Invalid table structure", "danger");
      return;
    }

    // Extract data using the correct indices (Type=0, Device=1, Date=2, Status=3, Points=4, Actions=5)
    const deviceType = cells[0].textContent.trim().split(/\s+/).pop();
    const deviceName = cells[1].textContent.trim();
    const requestDate = cells[2].textContent.trim();
    const currentStatus = cells[3].textContent.trim().split(/\s+/).pop();
    const pointsText = cells[4].textContent.trim();

    console.log("Extracted quote data:", {
      deviceType,
      deviceName,
      requestDate,
      currentStatus,
      pointsText,
    });

    // Check if quote can be accepted
    if (currentStatus !== "Quoted") {
      showToast(`Cannot accept quote with status: ${currentStatus}`, "warning");
      return;
    }

    // Extract points value
    let pointsValue = 0;
    if (pointsText !== "--" && pointsText !== "") {
      const pointsMatch = pointsText.match(/(\d+)/);
      pointsValue = pointsMatch ? parseInt(pointsMatch[1]) : 0;
    }

    // Update the row status
    quoteRow.setAttribute("data-status", "Accepted");

    // Update status cell (4th cell - index 3)
    const statusCell = cells[3];
    const statusBadge =
      statusCell.querySelector(".badge") || statusCell.querySelector("span");

    if (statusBadge) {
      statusBadge.textContent = "Accepted";
      statusBadge.className = "badge bg-success";
      statusBadge.innerHTML = '<i class="fas fa-handshake me-1"></i> Accepted';
    } else {
      statusCell.innerHTML =
        '<span class="badge bg-success"><i class="fas fa-handshake me-1"></i> Accepted</span>';
    }

    // Update action buttons in the last cell (Actions - index 5)
    const actionCell = cells[5];
    if (actionCell) {
      // Hide accept/reject buttons and show only view button
      const acceptBtn = actionCell.querySelector(".accept-quote-btn");
      const rejectBtn = actionCell.querySelector(".reject-quote-btn");

      if (acceptBtn) acceptBtn.style.display = "none";
      if (rejectBtn) rejectBtn.style.display = "none";

      // Make sure view button is visible
      const viewBtn = actionCell.querySelector(".view-details-btn");
      if (viewBtn) {
        viewBtn.style.display = "";
        viewBtn.classList.remove("d-none");
      }
    }

    // Add points to user account
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail && pointsValue > 0) {
      console.log(`Attempting to add ${pointsValue} points to user account`);
      const success = addUserPoints(
        userEmail,
        pointsValue,
        `Accepted quote for ${deviceName}`
      );
      if (success) {
        console.log(
          `✅ Successfully added ${pointsValue} points to user account`
        );
      } else {
        console.error(`❌ Failed to add ${pointsValue} points to user account`);
        showToast(
          "Warning: Points may not have been credited properly",
          "warning"
        );
      }
    } else if (!userEmail) {
      console.error("❌ No user email found - cannot add points");
    } else if (pointsValue <= 0) {
      console.log("ℹ️ No points to add (pointsValue = 0)");
    }

    // Update the user's recycling requests data if it exists
    if (userEmail) {
      try {
        updateUserQuoteStatus(userEmail, quoteId, "Accepted", pointsValue);
        console.log("✅ Updated user quote status in data");
      } catch (error) {
        console.error("❌ Error updating user quote status:", error);
        // Don't fail the entire operation if this fails
      }
    }

    // Close modal if open
    try {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("quoteDetailsModal")
      );
      if (modal) {
        modal.hide();
        console.log("✅ Closed quote details modal");
      }
    } catch (error) {
      console.error("❌ Error closing modal:", error);
      // Continue with success operations even if modal fails to close
    }

    // Show success message with points
    const successMessage =
      pointsValue > 0
        ? `Successfully accepted quote for ${deviceName}! +${pointsValue} points earned.`
        : `Successfully accepted quote for ${deviceName}!`;

    showToast(successMessage, "success");

    // Update UI elements with error handling
    try {
      updateQuoteFilterCounts();
      console.log("✅ Updated filter counts");
    } catch (error) {
      console.error("❌ Error updating filter counts:", error);
    }

    try {
      if (window.profileManager) {
        window.profileManager.refresh();
        console.log("✅ Refreshed responsive profile manager");
      }
    } catch (error) {
      console.error("❌ Error refreshing profile manager:", error);
    }

    try {
      checkLoginStatusAndUpdateNavbar();
      console.log("✅ Updated navbar display");
    } catch (error) {
      console.error("❌ Error updating navbar:", error);
    }

    console.log("✅ Quote accepted successfully");
  } catch (error) {
    console.error("❌ Error accepting quote:", error);
    showToast(
      "An error occurred while accepting the quote. Please try again.",
      "danger"
    );
  }
}

/**
 * Enhanced Reject Quote function with proper error handling and data persistence
 * @param {string} quoteId - The ID of the quote to reject
 */
function rejectQuoteEnhanced(quoteId) {
  console.log(`🔴 Enhanced Reject: Processing quote ID: ${quoteId}`);

  if (!quoteId) {
    console.error("No quote ID provided");
    showToast("Error: No quote ID provided", "danger");
    return;
  }

  try {
    // Show loading state
    showToast("Processing quote rejection...", "info");

    // Find the quote row in the table
    const quoteRow = document.querySelector(`tr[data-id="${quoteId}"]`);

    if (!quoteRow) {
      console.error(`Quote row not found for ID: ${quoteId}`);
      showToast("Error: Quote not found", "danger");
      return;
    }

    // Extract current quote data using correct cell indices
    const cells = quoteRow.querySelectorAll("td");
    if (cells.length < 6) {
      console.error("Insufficient table cells found");
      showToast("Error: Invalid table structure", "danger");
      return;
    }

    const deviceName = cells[1].textContent.trim();
    const currentStatus = cells[3].textContent.trim().split(/\s+/).pop();

    console.log("Processing rejection for:", { deviceName, currentStatus });

    // Check if quote can be rejected
    if (currentStatus !== "Quoted") {
      showToast(`Cannot reject quote with status: ${currentStatus}`, "warning");
      return;
    }

    // Update the row status
    quoteRow.setAttribute("data-status", "Rejected");

    // Update status cell (4th cell - index 3)
    const statusCell = cells[3];
    const statusBadge =
      statusCell.querySelector(".badge") || statusCell.querySelector("span");

    if (statusBadge) {
      statusBadge.textContent = "Rejected";
      statusBadge.className = "badge bg-danger";
      statusBadge.innerHTML =
        '<i class="fas fa-times-circle me-1"></i> Rejected';
    } else {
      statusCell.innerHTML =
        '<span class="badge bg-danger"><i class="fas fa-times-circle me-1"></i> Rejected</span>';
    }

    // Update action buttons in the last cell (Actions - index 5)
    const actionCell = cells[5];
    if (actionCell) {
      // Hide accept/reject buttons and show only view button
      const acceptBtn = actionCell.querySelector(".accept-quote-btn");
      const rejectBtn = actionCell.querySelector(".reject-quote-btn");

      if (acceptBtn) acceptBtn.style.display = "none";
      if (rejectBtn) rejectBtn.style.display = "none";

      // Make sure view button is visible
      const viewBtn = actionCell.querySelector(".view-details-btn");
      if (viewBtn) {
        viewBtn.style.display = "";
        viewBtn.classList.remove("d-none");
      }
    }

    // Update the user's recycling requests data if it exists
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      updateUserQuoteStatus(userEmail, quoteId, "Rejected", 0);
    }

    // Close modal if open
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("quoteDetailsModal")
    );
    if (modal) {
      modal.hide();
    }

    // Show success message
    showToast(`Quote for ${deviceName} has been rejected.`, "info");

    // Update filter counts
    updateQuoteFilterCounts();

    // Update mobile cards if responsive manager exists
    if (window.profileManager) {
      window.profileManager.refresh();
    }

    console.log("✅ Quote rejected successfully");
  } catch (error) {
    console.error("❌ Error rejecting quote:", error);
    showToast(
      "An error occurred while rejecting the quote. Please try again.",
      "danger"
    );
  }
}

/**
 * Update user quote status in localStorage
 * @param {string} userEmail - User email
 * @param {string} quoteId - Quote ID
 * @param {string} newStatus - New status
 * @param {number} pointsValue - Points value if accepted
 */
function updateUserQuoteStatus(userEmail, quoteId, newStatus, pointsValue) {
  try {
    const userData = getUserData(userEmail);
    if (!userData || !userData.recycleRequests) {
      console.log("No user recycling requests data found");
      return;
    }

    // Find and update the quote in user data
    const quoteIndex = userData.recycleRequests.findIndex(
      (req) => req.id === quoteId
    );
    if (quoteIndex !== -1) {
      userData.recycleRequests[quoteIndex].status = newStatus;
      userData.recycleRequests[quoteIndex].updatedAt = new Date().toISOString();

      if (newStatus === "Accepted" && pointsValue > 0) {
        userData.recycleRequests[quoteIndex].pointsEarned = pointsValue;
      }

      // Save updated user data
      updateUserData(userEmail, userData);
      console.log(
        `Updated quote ${quoteId} status to ${newStatus} in user data`
      );
    }
  } catch (error) {
    console.error("Error updating user quote status:", error);
  }
}

function initializeHistoryViewPreference() {
  const savedView = localStorage.getItem("pointsHistoryView") || "table";
  let preferredView = savedView;

  // Auto-switch to cards view on small screens for better mobile UX
  if (window.innerWidth < 768 && preferredView === "table") {
    preferredView = "cards";
  }

  toggleHistoryView(preferredView);
}

document.addEventListener("DOMContentLoaded", () => {
  const updatePasswordBtn = document.getElementById("updatePasswordBtn");
  if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener("click", handlePasswordUpdate);
  }
});

async function handlePasswordUpdate() {
  const currentPasswordEl = document.getElementById("currentPassword");
  const newPasswordEl = document.getElementById("newPassword");
  const confirmPasswordEl = document.getElementById("confirmPassword");

  const currentPassword = currentPasswordEl.value;
  const newPassword = newPasswordEl.value;
  const confirmPassword = confirmPasswordEl.value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showPasswordChangeAlert("Please fill in all password fields.", "danger");
    return;
  }

  if (newPassword !== confirmPassword) {
    showPasswordChangeAlert("New passwords do not match.", "danger");
    return;
  }

  if (newPassword.length < 8) {
    showPasswordChangeAlert(
      "New password must be at least 8 characters long.",
      "danger"
    );
    return;
  }

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    showPasswordChangeAlert("User not logged in.", "danger");
    return;
  }

  try {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const userData = users[userEmail];

    if (!userData || userData.password !== currentPassword) {
      showPasswordChangeAlert("Incorrect current password.", "danger");
      return;
    }

    // Update password
    users[userEmail].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    // Close the modal
    const modalElement = document.getElementById("passwordChangeModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    showPasswordChangeAlert("Password updated successfully!", "success");

    // Clear the form
    currentPasswordEl.value = "";
    newPasswordEl.value = "";
    confirmPasswordEl.value = "";
  } catch (error) {
    console.error("Error updating password:", error);
    showPasswordChangeAlert(
      "An error occurred while updating the password.",
      "danger"
    );
  }
}

function showPasswordChangeAlert(message, type) {
  const modalElement = document.getElementById("passwordChangeResultModal");
  if (!modalElement) return;

  let modal = bootstrap.Modal.getInstance(modalElement);
  if (!modal) {
    modal = new bootstrap.Modal(modalElement);
  }

  const modalHeader = document.getElementById(
    "passwordChangeResultModalHeader"
  );
  const modalIcon = document.getElementById("passwordChangeResultIcon");
  const modalMessage = document.getElementById("passwordChangeResultMessage");
  const modalTitle = document.getElementById("passwordChangeResultModalLabel");

  // Reset classes
  modalHeader.className = "modal-header";
  modalIcon.className = "fas fa-4x mb-3";
  const closeButton = modalHeader.querySelector(".btn-close");
  if (closeButton) closeButton.classList.remove("btn-close-white");

  if (type === "success") {
    modalTitle.textContent = "Success";
    modalHeader.classList.add("bg-success", "text-white");
    modalIcon.classList.add("fa-check-circle", "text-success");
    if (closeButton) closeButton.classList.add("btn-close-white");
  } else {
    // 'danger'
    modalTitle.textContent = "Error";
    modalHeader.classList.add("bg-danger", "text-white");
    modalIcon.classList.add("fa-times-circle", "text-danger");
    if (closeButton) closeButton.classList.add("btn-close-white");
  }

  modalMessage.textContent = message;

  modal.show();
}
