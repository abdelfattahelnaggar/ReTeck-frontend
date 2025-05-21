// Dashboard Functions

// Initialize the dashboard
function initDashboard() {
  console.log("Initializing dashboard");
  
  // Load dashboard statistics
  loadDashboardStats();

  // Load recent quotes
  loadRecentQuotes();

  // Load all quotes for quotes section
  loadAllQuotes();

  // Load users for users section
  loadUsers();

  // Load inventory for inventory section
  loadInventory();

  // Set up quote form submission
  setupQuoteForm();

  // Set up settings form
  setupSettingsForm();
  
  // Force update of statistics after a small delay to ensure counters are set
  setTimeout(() => {
    console.log("Performing additional stats update with delay to ensure correct data");
    const users = getDummyUsers();
    const devices = getAllDevices();
    
    // Count active users
    const activeUsers = users.filter(u => u.role !== "admin" && u.status === "active").length;
    
    // Calculate total points
    const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);
    
    // Count total devices
    const totalDevices = devices.length;
    
    // Device counts by type
    const phonesCount = devices.filter(d => d.type === 'Smartphone').length;
    const laptopsCount = devices.filter(d => d.type === 'Laptop').length;
    const tabletsCount = devices.filter(d => d.type === 'Tablet').length;
    const otherCount = devices.filter(d => d.type === 'Other').length;
    
    console.log("Final stats update - Active Users:", activeUsers, "Total Points:", totalPoints, "Total Devices:", totalDevices);
    console.log("Device counts - Phones:", phonesCount, "Laptops:", laptopsCount, "Tablets:", tabletsCount, "Other:", otherCount);
    
    // Update both types of stats
    updateUserStats(activeUsers, totalPoints, totalDevices);
    updateInventoryStats(devices);
  }, 800);
}

// Load dashboard statistics
function loadDashboardStats() {
  // Static dashboard stats for demo
  const pendingCount = 4;   // Pending requests
  const quotedCount = 5;    // Quoted requests
  const completedCount = 3; // Completed requests
  const totalUsers = 10;    // Total users

  // Update dashboard counters with animations
  animateCounter(document.getElementById("pendingRequestsCount"), 0, pendingCount);
  animateCounter(document.getElementById("quotedRequestsCount"), 0, quotedCount);
  animateCounter(document.getElementById("completedRequestsCount"), 0, completedCount);
  animateCounter(document.getElementById("totalUsersCount"), 0, totalUsers);
  
  // Optionally update other dashboard elements
  updateDashboardCharts();
}

// Update dashboard charts and visualizations
function updateDashboardCharts() {
  // This function could be expanded to add charts using Chart.js or similar
  console.log("Dashboard charts updated");
  
  // Add chart initialization code here if needed
  
  // For now, just add a pulse animation to the dashboard cards to draw attention
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  dashboardCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('pulse-animation');
      setTimeout(() => {
        card.classList.remove('pulse-animation');
      }, 1000);
    }, index * 200);
  });
}

// Load recent quotes for dashboard
function loadRecentQuotes() {
  const tableBody = document.getElementById("recentQuotesTableBody");
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get all quotes from all users
  const allQuotes = getAllQuotes();

  // Sort by date (newest first) and take only the first 5
  const recentQuotes = allQuotes
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Add rows to table
  recentQuotes.forEach((quote) => {
    const row = createQuoteTableRow(quote, true);
    tableBody.appendChild(row);
  });
}

// Export functions
window.initDashboard = initDashboard;
window.loadDashboardStats = loadDashboardStats;
window.updateDashboardCharts = updateDashboardCharts;
window.loadRecentQuotes = loadRecentQuotes; 