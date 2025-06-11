// Quotes Management Functions

// Add custom styles for the quote action buttons
const quoteActionButtonsStyle = document.createElement("style");
quoteActionButtonsStyle.textContent = `
  .btn-user-action {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    transition: all 0.3s ease;
    border: none;
    background: #f8f9fa;
    color: #6c757d;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .btn-user-action:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .btn-user-action:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }
  
  .view-action {
    background: linear-gradient(145deg, #e6f7ff, #ccefff);
    color: #0099ff;
  }
  
  .view-action:hover {
    background: linear-gradient(145deg, #ccefff, #b3e6ff);
    color: #007acc;
  }
  
  .quote-action {
    background: linear-gradient(145deg, #fff9e6, #fff2cc);
    color: #ffaa00;
  }
  
  .quote-action:hover {
    background: linear-gradient(145deg, #fff2cc, #ffeab3);
    color: #cc8800;
  }
  
  .actions-cell {
    white-space: nowrap;
    display: flex;
    align-items: center;
  }
  
  .btn-user-action i {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    .btn-user-action {
      width: 32px;
      height: 32px;
      margin-right: 5px;
    }
    
    .btn-user-action i {
      font-size: 0.875rem;
    }
  }
`;
document.head.appendChild(quoteActionButtonsStyle);

// Track the current filter globally
let currentQuotesFilter = "all";

function loadAllQuotes(statusFilter = null) {
  const tableBody = document.getElementById("allQuotesTableBody");
  const cardContainer = document.getElementById("allQuotesCardContainer");

  if (!tableBody) return;

  // Use the provided filter or the last used one
  if (statusFilter !== null) {
    currentQuotesFilter = statusFilter;
  }
  const filterToUse = currentQuotesFilter;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Clear card container if it exists
  if (cardContainer) {
    cardContainer.innerHTML = "";
  }

  // Get all quotes from all users
  let allQuotes = getAllQuotes();

  // Apply filter if not 'all'
  if (filterToUse && filterToUse !== "all") {
    const normalized = filterToUse.toLowerCase();
    allQuotes = allQuotes.filter(
      (q) => (q.status || "").toLowerCase() === normalized
    );
  }

  // Sort by date (newest first)
  allQuotes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Add rows to table
  allQuotes.forEach((quote) => {
    const row = createQuoteTableRow(quote, false);
    tableBody.appendChild(row);

    // Create cards for mobile view if container exists
    if (cardContainer && typeof createQuoteCard === "function") {
      cardContainer.appendChild(createQuoteCard(quote));
    }
  });

  // Initialize DataTable if jQuery is available
  if (typeof $ !== "undefined") {
    if ($.fn.dataTable.isDataTable("#allQuotesTable")) {
      $("#allQuotesTable").DataTable().destroy();
    }
    $("#allQuotesTable").DataTable({
      order: [[2, "desc"]], // Order by date column descending
      pageLength: 10,
      responsive: true,
      language: {
        search: "<i class='fas fa-search'></i> Search:",
        lengthMenu: "Show _MENU_ quotes",
        info: "Showing _START_ to _END_ of _TOTAL_ quotes",
        paginate: {
          first: "<i class='fas fa-angle-double-left'></i>",
          last: "<i class='fas fa-angle-double-right'></i>",
          next: "<i class='fas fa-angle-right'></i>",
          previous: "<i class='fas fa-angle-left'></i>",
        },
      },
      // Do NOT call initializeQuoteFilters here!
    });
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
  }
}

// Only call this ONCE on page load
function initializeQuoteFilters() {
  console.log("Initializing quote filters");
  // Update filter counts first
  updateFilterCounts();
  // Then set up the filter buttons
  setupQuoteStatusFilter();
  // Set the current filter as active
  setTimeout(() => {
    applyQuotesFilter(currentQuotesFilter);
  }, 100);
}

// Create a table row for a quote
function createQuoteTableRow(quote, isCompact) {
  const row = document.createElement("tr");

  // Create customer cell
  const customerCell = document.createElement("td");
  customerCell.textContent = quote.customerName || quote.customerEmail;
  row.appendChild(customerCell);

  // Create device cell
  const deviceCell = document.createElement("td");
  deviceCell.textContent = quote.device || "Unknown Device";
  row.appendChild(deviceCell);

  // Create date cell
  const dateCell = document.createElement("td");
  const quoteDate = new Date(quote.date);
  dateCell.textContent = quoteDate.toLocaleDateString();
  row.appendChild(dateCell);

  // Create status cell
  const statusCell = document.createElement("td");
  const statusBadge = document.createElement("span");
  statusBadge.className = `badge badge-${quote.status.toLowerCase()}`;
  statusBadge.textContent = quote.status;
  statusCell.appendChild(statusBadge);
  row.appendChild(statusCell);

  // Create actions cell
  const actionsCell = document.createElement("td");
  actionsCell.className = "actions-cell";

  // View details button
  const viewBtn = document.createElement("button");
  viewBtn.className = "btn-user-action view-action";
  viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
  viewBtn.setAttribute("data-bs-toggle", "tooltip");
  viewBtn.setAttribute("title", "View Details");
  viewBtn.addEventListener("click", () => showQuoteDetails(quote));
  actionsCell.appendChild(viewBtn);

  // Add quote button (only for pending requests)
  if (quote.status === "Pending") {
    const quoteBtn = document.createElement("button");
    quoteBtn.className = "btn-user-action quote-action";
    quoteBtn.innerHTML = '<i class="fas fa-coins"></i>';
    quoteBtn.setAttribute("data-bs-toggle", "tooltip");
    quoteBtn.setAttribute("title", "Provide Points Offer");
    quoteBtn.addEventListener("click", () => showProvideQuoteModal(quote));
    actionsCell.appendChild(quoteBtn);
  }

  row.appendChild(actionsCell);

  return row;
}

// Get all quotes from all users
function getAllQuotes() {
  console.log("Getting all quotes");

  // Static dummy data for testing
  return [
    {
      id: "QUO_001",
      type: "Smartphone",
      device: "iPhone 13 Pro",
      brand: "Apple",
      condition: "Good",
      date: "2023-09-10T08:30:00",
      status: "Pending",
      customerEmail: "john.doe@example.com",
      customerName: "John Doe",
      phone: "555-123-4567",
      specs: {
        Storage: "256GB",
        Color: "Sierra Blue",
        "Screen Condition": "Excellent, no scratches",
        "Battery Health": "92%",
        Accessories: "Original charger and box",
      },
      images: ["../images/placeholder-device.jpg"],
    },
    {
      id: "QUO_002",
      type: "Laptop",
      device: "MacBook Pro 14-inch",
      brand: "Apple",
      condition: "Excellent",
      date: "2023-09-08T14:15:00",
      status: "Quoted",
      customerEmail: "sarah.miller@example.com",
      customerName: "Sarah Miller",
      phone: "555-987-6543",
      specs: {
        Processor: "M1 Pro",
        RAM: "16GB",
        Storage: "512GB SSD",
        Display: "14-inch Liquid Retina XDR",
        "Condition Notes": "Like new, minimal use",
      },
      images: ["../images/placeholder-device.jpg"],
      quote: {
        amount: 8500,
        date: "2023-09-09T10:30:00",
        validDays: 7,
        note: "Excellent condition MacBook with original packaging and all accessories.",
      },
    },
    // Additional quotes would be here...
    {
      id: "QUO_015",
      type: "Tablet",
      device: "iPad Pro 12.9-inch (2021)",
      brand: "Apple",
      condition: "Good",
      date: "2023-08-08T15:30:00",
      status: "Quoted",
      customerEmail: "daniel.rodriguez@example.com",
      customerName: "Daniel Rodriguez",
      phone: "555-456-7890",
      specs: {
        Storage: "256GB",
        Color: "Space Gray",
        Display: "12.9-inch Liquid Retina XDR",
        Accessories: "Apple Pencil 2nd gen and Smart Keyboard Folio",
      },
      images: ["../images/placeholder-device.jpg"],
      quote: {
        amount: 7800,
        date: "2023-08-09T10:15:00",
        validDays: 10,
        note: "Premium tablet with accessories, some minor wear on the edges.",
      },
    },
  ];
}

// Show quote details in modal
function showQuoteDetails(quote) {
  // Populate the modal with quote details
  const modal = document.getElementById("quoteDetailsModal");

  // Customer Info
  const customerNameEl = modal.querySelector("#modalCustomerName");
  if (customerNameEl) {
    const avatar = `<div class="user-avatar me-3" style="background-color: ${getAvatarColor(
      quote.customerName
    )};">${getInitials(quote.customerName)}</div>`;
    customerNameEl.innerHTML = `${avatar}<div><div class="fw-bold">${
      quote.customerName || "N/A"
    }</div><div class="text-muted small">${
      quote.customerEmail || ""
    }</div></div>`;
  }

  // Device Info
  const deviceNameEl = modal.querySelector("#modalDeviceName");
  if (deviceNameEl) {
    const deviceIcon = `<i class="${getDeviceIcon(
      quote.deviceCategory
    )} fa-fw me-2 text-primary"></i>`;
    deviceNameEl.innerHTML = `${deviceIcon}${quote.device || "N/A"}`;
  }
  const deviceConditionEl = modal.querySelector("#modalDeviceCondition");
  if (deviceConditionEl)
    deviceConditionEl.textContent = quote.condition || "N/A";

  // Request Info
  const requestDateEl = modal.querySelector("#modalRequestDate");
  if (requestDateEl)
    requestDateEl.textContent = new Date(quote.date).toLocaleString();
  const requestStatusEl = modal.querySelector("#modalRequestStatus");
  if (requestStatusEl) requestStatusEl.innerHTML = getStatusBadge(quote.status);

  // Device Specs
  const specsContainer = modal.querySelector("#modalDeviceSpecs");
  if (specsContainer) {
    specsContainer.innerHTML = ""; // Clear old specs
    if (quote.specs && Object.keys(quote.specs).length > 0) {
      const list = document.createElement("ul");
      list.className = "list-group list-group-flush";
      for (const [key, value] of Object.entries(quote.specs)) {
        const item = document.createElement("li");
        item.className =
          "list-group-item d-flex justify-content-between align-items-center";
        item.innerHTML = `<span>${key.replace(
          /([A-Z])/g,
          " $1"
        )}</span><span class="badge bg-light text-dark">${value}</span>`;
        list.appendChild(item);
      }
      specsContainer.appendChild(list);
    } else {
      specsContainer.innerHTML =
        '<p class="text-muted">No specifications provided.</p>';
    }
  }

  // Device Images
  const imagesContainer = modal.querySelector("#modalDeviceImages");
  if (imagesContainer) {
    imagesContainer.innerHTML = ""; // Clear old images
    if (quote.images && quote.images.length > 0) {
      quote.images.forEach((imgSrc) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = "img-thumbnail me-2 mb-2";
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.cursor = "pointer";
        img.onclick = () => enlargeImage(imgSrc);
        imagesContainer.appendChild(img);
      });
    } else {
      imagesContainer.innerHTML =
        '<p class="text-muted">No images provided.</p>';
    }
  }

  // Handle quote form visibility and pre-filling
  const quoteFormSection = modal.querySelector("#quoteFormSection");
  const existingQuoteSection = modal.querySelector("#existingQuoteSection");
  const markCompletedBtn = modal.querySelector("#markCompletedBtn");

  if (quote.status === "Pending") {
    if (quoteFormSection) quoteFormSection.classList.remove("d-none");
    if (existingQuoteSection) existingQuoteSection.classList.add("d-none");
    if (markCompletedBtn) markCompletedBtn.classList.add("d-none");

    const quoteAmountInput = modal.querySelector("#quoteAmount");
    if (quoteAmountInput) quoteAmountInput.value = "";
    const quoteNotesInput = modal.querySelector("#quoteNotes");
    if (quoteNotesInput) quoteNotesInput.value = "";

    // Setup submit button
    const submitBtn = modal.querySelector("#submitQuoteBtn");
    if (submitBtn) {
      submitBtn.onclick = () =>
        submitQuote(quote.id, quote.customerEmail, quoteAmountInput.value);
    }
  } else {
    if (quoteFormSection) quoteFormSection.classList.add("d-none");
    if (existingQuoteSection) existingQuoteSection.classList.remove("d-none");

    // Populate existing quote details
    modal.querySelector("#modalExistingAmount").textContent =
      quote.points || "N/A";
    modal.querySelector("#modalQuoteDate").textContent = quote.quoteDate
      ? new Date(quote.quoteDate).toLocaleString()
      : "N/A";
    modal.querySelector("#modalValidUntil").textContent = "N/A"; // Not in data
    modal.querySelector("#modalExistingNotes").textContent =
      quote.notes || "No notes.";

    if (quote.status === "Accepted") {
      if (markCompletedBtn) {
        markCompletedBtn.classList.remove("d-none");
        markCompletedBtn.onclick = () =>
          markAsCompleted(quote.id, quote.customerEmail);
      }
    } else {
      if (markCompletedBtn) markCompletedBtn.classList.add("d-none");
    }
  }

  // Show the modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Show provide quote modal
function showProvideQuoteModal(quote) {
  console.log("Opening provide quote modal for:", quote.id);

  // Reset form first
  const quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.reset();
  } else {
    console.error("Quote form not found");
  }

  // Get the form input fields
  const quoteRequestId = document.getElementById("quoteRequestId");
  const quoteAmount = document.getElementById("quoteAmount");
  const quoteNote = document.getElementById("quoteNote");
  const quoteValidDays = document.getElementById("quoteValidDays");

  // Set request ID if the element exists
  if (quoteRequestId) {
    quoteRequestId.value = typeof quote === "string" ? quote : quote.id;
  } else {
    console.error("quoteRequestId element not found");
  }

  // Store the customer email in a data attribute for later use
  const submitBtn = document.getElementById("submitQuoteBtn");
  if (submitBtn) {
    submitBtn.setAttribute("data-customer-email", quote.customerEmail);
  }

  // Get the provide quote modal
  const modal = document.getElementById("provideQuoteModal");

  if (!modal) {
    // Modal doesn't exist, create it
    createProvideQuoteModal(quote);
  } else {
    // Modal exists, show it
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }
}

// Create provide quote modal if it doesn't exist
function createProvideQuoteModal(quote) {
  // Create the HTML for the modal
  const modalHTML = `
    <div class="modal fade" id="provideQuoteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Provide Points Offer</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="quoteForm">
              <input type="hidden" id="quoteRequestId" value="${quote.id}">
              
              <div class="mb-3">
                <label for="quoteAmount" class="form-label">Points to Offer</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-coins"></i></span>
                  <input
                    type="number"
                    class="form-control"
                    id="quoteAmount"
                    placeholder="Enter points amount"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <div class="form-text">Enter the number of points to offer for this device</div>
              </div>
              
              <div class="mb-3">
                <label for="quoteNote" class="form-label">Note</label>
                <textarea
                  class="form-control"
                  id="quoteNote"
                  rows="3"
                  placeholder="Enter any notes about this points offer"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="quoteValidDays" class="form-label">Valid for (days)</label>
                <input
                  type="number"
                  class="form-control"
                  id="quoteValidDays"
                  value="30"
                  min="1"
                  max="90"
                  required
                />
                <div class="form-text">Number of days this offer will remain valid</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="submitQuoteBtn" data-customer-email="${quote.customerEmail}">
              <i class="fas fa-coins me-1"></i> Submit Points Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add the modal to the document
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Get the modal element and show it
  const modal = document.getElementById("provideQuoteModal");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Add event listener for form submission
  const submitBtn = document.getElementById("submitQuoteBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function () {
      handleQuoteFormSubmission(this);
    });
  }
}

// Handle the quote form submission
function handleQuoteFormSubmission(submitButton) {
  // Get customer email from button's data attribute
  const customerEmail = submitButton.getAttribute("data-customer-email");
  const requestId = document.getElementById("quoteRequestId").value;
  const amount = parseFloat(document.getElementById("quoteAmount").value);
  const note = document.getElementById("quoteNote").value;

  if (!requestId || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid points amount");
    return;
  }

  if (!customerEmail) {
    alert("Customer email not found. Please try again.");
    return;
  }

  // Submit the quote
  submitQuote(requestId, customerEmail, amount, note);

  // Close the modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("provideQuoteModal")
  );
  if (modal) {
    modal.hide();
  }
}

// Setup quote form submission
function setupQuoteForm() {
  console.log("Setting up quote form");

  // Listen for any existing or future submit buttons
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "submitQuoteBtn") {
      e.preventDefault();
      handleQuoteFormSubmission(e.target);
    }
  });
}

// Mark a request as completed
function markAsCompleted(requestId, customerEmail) {
  if (!requestId || !customerEmail) return;

  // Get user data
  const userData = JSON.parse(
    localStorage.getItem(`userData_${customerEmail}`) || "{}"
  );
  const requests = userData.recycleRequests || [];

  // Find the request
  const request = requests.find((req) => req.id === requestId);
  if (!request) {
    alert("Request not found");
    return;
  }

  // Get points directly from quote amount (no conversion needed anymore)
  const pointsToAdd = request.quote?.amount || 0;

  // Update request status
  const updatedRequests = requests.map((req) => {
    if (req.id === requestId) {
      return {
        ...req,
        status: "Completed",
        completedDate: new Date().toISOString(),
      };
    }
    return req;
  });

  // Update user points
  userData.points = (userData.points || 0) + pointsToAdd;

  // Add to points history
  if (!userData.pointsHistory) {
    userData.pointsHistory = [];
  }

  userData.pointsHistory.push({
    date: new Date().toISOString(),
    amount: pointsToAdd,
    reason: `Recycling ${request.type}: ${request.device}`,
    requestId: requestId,
  });

  // Update user data
  userData.recycleRequests = updatedRequests;
  localStorage.setItem(`userData_${customerEmail}`, JSON.stringify(userData));

  // Refresh data
  loadDashboardStats();
  loadRecentQuotes();
  loadAllQuotes();

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("quoteDetailsModal")
  );
  modal.hide();

  // Show success message
  alert(
    `Request marked as completed. ${pointsToAdd} points added to customer account.`
  );
}

// Setup quote status filter
function setupQuoteStatusFilter() {
  console.log("Setting up quote filters");

  // First ensure we have all the filter buttons with correct data attributes
  const filterContainer = document.querySelector(".btn-filter-container");

  if (filterContainer) {
    // Check if we need to add the Rejected filter button
    const rejectedFilterBtn = document.querySelector(
      '.quote-filter[data-filter="Rejected"]'
    );
    if (!rejectedFilterBtn) {
      // Add the Rejected filter button if it doesn't exist
      const btnGroup = filterContainer.querySelector(".btn-group");
      if (btnGroup) {
        const rejectedBtn = document.createElement("button");
        rejectedBtn.className = "btn btn-sm quote-filter";
        rejectedBtn.setAttribute("data-filter", "Rejected");
        rejectedBtn.innerHTML = '<i class="fas fa-times me-1"></i>Rejected';
        btnGroup.appendChild(rejectedBtn);

        console.log("Added missing Rejected filter button");
      }
    }
  }

  // Now get all filter buttons including any newly added ones
  const filterButtons = document.querySelectorAll(".quote-filter");

  if (filterButtons.length > 0) {
    console.log(`Found ${filterButtons.length} filter buttons`);

    // Add click event listeners to all filter buttons
    filterButtons.forEach((btn) => {
      // Remove any existing event listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Add event listener to the cloned button
      newBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const filterValue = this.getAttribute("data-filter");
        console.log(`Filter button clicked: ${filterValue}`);

        // Remove active class from all buttons
        document.querySelectorAll(".quote-filter").forEach((btn) => {
          btn.classList.remove("active");
        });

        // Add active class to clicked button
        this.classList.add("active");

        console.log(`Filtering quotes by: ${filterValue}`);

        // Apply filter
        applyQuotesFilter(filterValue);

        // Add animation to the button
        this.classList.add("pulse-animation");
        setTimeout(() => {
          this.classList.remove("pulse-animation");
        }, 1000);
      });
    });

    // Initialize with "All" filter
    const allFilterBtn = document.querySelector(
      '.quote-filter[data-filter="all"]'
    );
    if (allFilterBtn) {
      allFilterBtn.classList.add("active");
      // Make sure we apply the "all" filter initially
      setTimeout(() => {
        applyQuotesFilter("all");
      }, 100);
    }
  } else {
    console.warn("No filter buttons found with class 'quote-filter'");
    // Fallback to old select-based filter
    const filterSelect = document.getElementById("quoteStatusFilter");

    if (filterSelect) {
      filterSelect.addEventListener("change", function () {
        const status = this.value;
        applyQuotesFilter(status);
      });
    } else {
      console.warn("No filter select found with id 'quoteStatusFilter'");
    }
  }

  // Update filter counts
  updateFilterCounts();
}

// Apply filter to quotes table
function applyQuotesFilter(filterValue) {
  console.log("Applying filter:", filterValue);
  // Always reload the table with the filtered data
  loadAllQuotes(filterValue);
  // Update the header title to show current filter
  updateFilterTitle(filterValue);
  // Update the filter counts to reflect the current state
  updateFilterCounts();
  // Update active state on filter buttons
  document.querySelectorAll(".quote-filter").forEach((btn) => {
    if (btn.getAttribute("data-filter") === filterValue) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Update filter counts
function updateFilterCounts() {
  console.log("Updating filter counts");

  // Get all quotes
  const allQuotes = getAllQuotes();

  // Count by status
  const counts = {
    all: allQuotes.length,
    Pending: 0,
    Quoted: 0,
    Accepted: 0,
    Completed: 0,
    Rejected: 0,
  };

  // Count each status
  allQuotes.forEach((quote) => {
    if (counts.hasOwnProperty(quote.status)) {
      counts[quote.status]++;
    }
  });

  console.log("Quote counts by status:", counts);

  // Update filter buttons with counts if they have count elements
  Object.keys(counts).forEach((status) => {
    const filterBtn = document.querySelector(
      `.quote-filter[data-filter="${status}"]`
    );
    if (filterBtn) {
      console.log(`Updating count for ${status} filter: ${counts[status]}`);

      // Check if there's a count badge
      let countBadge = filterBtn.querySelector(".filter-count");

      // If not, create one
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "filter-count ms-1";
        filterBtn.appendChild(countBadge);
      }

      // Update the count with animation if it changed
      const oldCount = parseInt(countBadge.textContent) || 0;
      if (oldCount !== counts[status]) {
        countBadge.classList.add("count-changed");
        setTimeout(() => {
          countBadge.classList.remove("count-changed");
        }, 500);
      }

      // Update the count
      countBadge.textContent = counts[status];

      // Add a special class if count is 0
      if (counts[status] === 0) {
        countBadge.classList.add("empty");
      } else {
        countBadge.classList.remove("empty");
      }
    }
  });
}

// Update the quotes section title based on filter
function updateFilterTitle(filterValue) {
  const titleElement = document.querySelector("#quotesSection .card-header h5");
  if (!titleElement) return;

  // Update the title based on filter
  if (filterValue === "all") {
    titleElement.innerHTML =
      '<i class="fas fa-file-invoice-dollar"></i> All Quote Requests';
  } else {
    const iconClass = getStatusIconClass(filterValue);
    titleElement.innerHTML = `<i class="${iconClass}"></i> ${filterValue} Quote Requests`;
  }
}

// Get appropriate icon class for status
function getStatusIconClass(status) {
  switch (status) {
    case "Pending":
      return "fas fa-clock";
    case "Quoted":
      return "fas fa-dollar-sign";
    case "Accepted":
      return "fas fa-check";
    case "Completed":
      return "fas fa-check-double";
    case "Rejected":
      return "fas fa-times";
    default:
      return "fas fa-file-invoice-dollar";
  }
}

// Submit quote for a recycling request
function submitQuote(requestId, customerEmail, amount, note) {
  if (!requestId || !customerEmail || isNaN(amount) || amount <= 0) {
    console.error("Invalid quote parameters");
    return;
  }

  console.log(
    `Submitting points offer for request ${requestId} to ${customerEmail}: ${amount} points`
  );

  // Get user data
  const userData = JSON.parse(
    localStorage.getItem(`userData_${customerEmail}`) || "{}"
  );
  const requests = userData.recycleRequests || [];

  // Find the request
  const requestIndex = requests.findIndex((req) => req.id === requestId);
  if (requestIndex === -1) {
    console.error("Request not found");
    return;
  }

  // Create quote object
  const quote = {
    amount: amount, // This is now points directly, not dollars
    note: note,
    date: new Date().toISOString(),
    validDays: parseInt(
      document.getElementById("quoteValidDays")?.value || "30"
    ),
  };

  // Update request with quote and change status
  requests[requestIndex].quote = quote;
  requests[requestIndex].status = "Quoted";

  // Save updated user data
  userData.recycleRequests = requests;
  localStorage.setItem(`userData_${customerEmail}`, JSON.stringify(userData));

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("quoteDetailsModal")
  );
  if (modal) {
    modal.hide();
  }

  // Refresh quotes data
  loadAllQuotes();
  loadRecentQuotes();
  loadDashboardStats();

  // Show success message
  alert("Points offer submitted successfully!");
}

// Create a mobile-friendly card for a quote
function createQuoteCard(quote) {
  // Create card wrapper
  const card = document.createElement("div");
  card.className = "quote-card";
  card.setAttribute("data-status", quote.status);

  // Format date
  const quoteDate = new Date(quote.date);
  const formattedDate = quoteDate.toLocaleDateString();

  // Get initials for avatar
  const customerName = quote.customerName || quote.customerEmail || "Unknown";
  const initials = getInitialsFromName(
    customerName.charAt(0),
    customerName.split(" ").length > 1
      ? customerName.split(" ")[1].charAt(0)
      : ""
  );

  // Create card HTML structure
  card.innerHTML = `
    <div class="quote-card-header">
      <div class="quote-card-device">
        <i class="fas fa-mobile-alt me-2"></i>${
          quote.device || "Unknown Device"
        }
      </div>
      <span class="badge badge-${quote.status.toLowerCase()}">${
    quote.status
  }</span>
    </div>
    <div class="quote-card-body">
      <div class="quote-card-customer">
        <div class="quote-card-customer-avatar">${initials}</div>
        <div class="quote-card-customer-name">${customerName}</div>
      </div>
      <div class="quote-card-info">
        <div class="quote-card-date">
          <i class="far fa-calendar-alt me-1"></i>${formattedDate}
        </div>
      </div>
    </div>
    <div class="quote-card-footer">
      <div class="quote-card-actions">
        <button class="btn btn-sm btn-outline-primary" onclick="showQuoteDetails('${
          quote.id
        }')">
          <i class="fas fa-eye me-1"></i>View
        </button>
        ${
          quote.status === "Pending"
            ? `
          <button class="btn btn-sm btn-outline-success" onclick="showProvideQuoteModal('${quote.id}')">
            <i class="fas fa-coins me-1"></i>Quote
          </button>
        `
            : ""
        }
      </div>
    </div>
  `;

  return card;
}

// Export functions
window.loadAllQuotes = loadAllQuotes;
window.initializeQuoteFilters = initializeQuoteFilters;
window.createQuoteTableRow = createQuoteTableRow;
window.getAllQuotes = getAllQuotes;
window.showQuoteDetails = showQuoteDetails;
window.showProvideQuoteModal = showProvideQuoteModal;
window.createProvideQuoteModal = createProvideQuoteModal;
window.handleQuoteFormSubmission = handleQuoteFormSubmission;
window.setupQuoteForm = setupQuoteForm;
window.markAsCompleted = markAsCompleted;
window.setupQuoteStatusFilter = setupQuoteStatusFilter;
window.applyQuotesFilter = applyQuotesFilter;
window.updateFilterCounts = updateFilterCounts;
window.updateFilterTitle = updateFilterTitle;
window.getStatusIconClass = getStatusIconClass;
window.submitQuote = submitQuote;
window.createQuoteCard = createQuoteCard;
