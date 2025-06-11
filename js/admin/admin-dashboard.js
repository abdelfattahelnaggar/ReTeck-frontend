// Dashboard Functions

// Initialize the dashboard
function initDashboard() {
  console.log("Initializing dashboard");

  // Load dashboard statistics
  loadDashboardStats();

  // Load recent quotes
  loadRecentQuotes();

  // Set up quote form submission
  setupQuoteForm();

  // Set up settings form
  setupSettingsForm();

  // Force update of statistics after a small delay to ensure counters are set
  setTimeout(() => {
    console.log(
      "Performing additional stats update with delay to ensure correct data"
    );
    const devices = typeof getDevices === "function" ? getDevices() : [];

    // Count total devices
    const totalDevices = devices.length;

    // Device counts by type
    const phonesCount = devices.filter((d) => d.type === "Smartphone").length;
    const laptopsCount = devices.filter((d) => d.type === "Laptop").length;
    const tabletsCount = devices.filter((d) => d.type === "Tablet").length;
    const otherCount = devices.filter((d) => d.type === "Other").length;

    console.log("Final stats update - Total Devices:", totalDevices);
    console.log(
      "Device counts - Phones:",
      phonesCount,
      "Laptops:",
      laptopsCount,
      "Tablets:",
      tabletsCount,
      "Other:",
      otherCount
    );

    // Update both types of stats
    updateInventoryStats(devices);
  }, 800);
}

// Load dashboard statistics
function loadDashboardStats() {
  // Static dashboard stats for demo
  const pendingCount = 4; // Pending requests
  const quotedCount = 5; // Quoted requests
  const completedCount = 3; // Completed requests

  // Update dashboard counters with animations
  animateCounter(
    document.getElementById("pendingRequestsCount"),
    0,
    pendingCount
  );
  animateCounter(
    document.getElementById("quotedRequestsCount"),
    0,
    quotedCount
  );
  animateCounter(
    document.getElementById("completedRequestsCount"),
    0,
    completedCount
  );

  // Optionally update other dashboard elements
  updateDashboardCharts();
}

// Update dashboard charts and visualizations
function updateDashboardCharts() {
  // This function could be expanded to add charts using Chart.js or similar
  console.log("Dashboard charts updated");

  // Add chart initialization code here if needed

  // For now, just add a pulse animation to the dashboard cards to draw attention
  const dashboardCards = document.querySelectorAll(".dashboard-card");
  dashboardCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("pulse-animation");
      setTimeout(() => {
        card.classList.remove("pulse-animation");
      }, 1000);
    }, index * 200);
  });
}

// Load recent quotes for dashboard
function loadRecentQuotes() {
  const tableBody = document.getElementById("recentQuotesTableBody");

  if (!tableBody) return;

  // Clear existing content
  tableBody.innerHTML = "";

  // Get all quotes from all users
  const allQuotes = getAllQuotes();

  // Sort by date (newest first) and take only the first 5
  const recentQuotes = allQuotes
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentQuotes.length === 0) {
    const emptyMessage = `
      <div class="col-12">
        <div class="empty-state text-center py-5">
          <i class="fas fa-file-invoice-dollar fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No Recent Quotes</h5>
          <p class="text-muted">New quote requests will appear here.</p>
        </div>
      </div>
    `;
    tableBody.innerHTML = `<tr><td colspan="5">${emptyMessage}</td></tr>`;
    return;
  }

  // Add rows to table for desktop view
  recentQuotes.forEach((quote) => {
    const row = createQuoteTableRow(quote, true);
    tableBody.appendChild(row);
  });
}

// Create a table row for a quote
function createQuoteTableRow(quote, isDashboard = false) {
  const formattedDate = new Date(quote.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const statusBadge = getStatusBadge(quote.status);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="align-middle">
        <div class="d-flex align-items-center">
            <div class="user-avatar me-3" style="background-color: ${getAvatarColor(
              quote.customerName
            )};">
                ${getInitials(quote.customerName)}
            </div>
            <div>
                <div class="fw-bold">${
                  quote.customerName || "Unknown User"
                }</div>
                <div class="text-muted small">${quote.customerEmail || ""}</div>
            </div>
        </div>
    </td>
    <td class="align-middle">
        <i class="${getDeviceIcon(quote.deviceCategory)} me-2 text-muted"></i>
        ${quote.device || "N/A"}
    </td>
    <td class="align-middle">${formattedDate}</td>
    <td class="align-middle">${statusBadge}</td>
    <td class="align-middle text-end">
        <button class="btn btn-sm btn-outline-primary view-quote-btn" onclick="showQuoteDetails('${
          quote.id
        }')">
            <i class="fas fa-eye me-1"></i>Details
        </button>
    </td>
  `;
  return row;
}

// Helper function to get initials from name
function getInitials(name) {
  if (!name || name === "Unknown") return "?";

  const parts = name.split(" ");
  if (parts.length === 1) return name.charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Export functions
window.initDashboard = initDashboard;
window.loadDashboardStats = loadDashboardStats;
window.updateDashboardCharts = updateDashboardCharts;
window.loadRecentQuotes = loadRecentQuotes;
