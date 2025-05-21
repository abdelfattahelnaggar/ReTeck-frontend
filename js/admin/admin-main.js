// Admin Main Script - Initializes all admin modules

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin dashboard loaded");

  // Check if user is logged in as admin
  checkAdminAuth();

  // Initialize the dashboard
  initDashboard();

  // Load all quotes for quotes section
  loadAllQuotes();

  // Load inventory data for inventory section
  loadInventory();
  
  // Load users data for users section
  loadUsers();

  // Set up navigation
  setupNavigation();

  // Set up logout functionality
  setupLogout();
}); 