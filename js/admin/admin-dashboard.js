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
  const cardContainer = document.getElementById("recentQuotesCardContainer");

  if (!tableBody || !cardContainer) return;

  // Clear existing content
  tableBody.innerHTML = "";
  cardContainer.innerHTML = "";

  // Get all quotes from all users
  const allQuotes = getAllQuotes();

  // Sort by date (newest first) and take only the first 5
  const recentQuotes = allQuotes
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Add rows to table for desktop view
  recentQuotes.forEach((quote) => {
    const row = createQuoteTableRow(quote, true);
    tableBody.appendChild(row);
  });

  // Add cards for mobile view
  recentQuotes.forEach((quote) => {
    cardContainer.appendChild(createQuoteCard(quote));
  });
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
  const initials = getInitials(customerName);

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
      </div>
    </div>
  `;

  return card;
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
window.createQuoteCard = createQuoteCard;
