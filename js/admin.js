// Admin Dashboard Script
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin dashboard loaded");

  // Check if user is logged in as admin
  checkAdminAuth();

  // Initialize the dashboard
  initDashboard();

  // Set up navigation
  setupNavigation();

  // Set up logout functionality
  setupLogout();
});

// Check if user is logged in as admin
function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isLoggedIn || userRole !== "admin") {
    // Redirect to login page if not logged in as admin
    window.location.href = "login.html";
    return;
  }

  // Update admin info in navbar
  updateAdminInfo();
}

// Update admin information in the navbar
function updateAdminInfo() {
  const userEmail = localStorage.getItem("userEmail");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const adminUser = users[userEmail];

  if (adminUser) {
    const firstName = adminUser.profile?.firstName || "Admin";
    const lastName = adminUser.profile?.lastName || "User";
    const fullName = `${firstName} ${lastName}`;
    const initials = getInitials(adminUser.profile);

    // Update header elements
    document.getElementById("adminName").textContent = firstName;
    document.getElementById("adminInitials").textContent = initials;

    // Update dropdown elements
    document.getElementById("dropdownAdminName").textContent = fullName;
    document.getElementById("dropdownAdminEmail").textContent = userEmail;
    document.getElementById("dropdownAdminInitials").textContent = initials;

    // Update settings form if it exists
    const adminNameInput = document.getElementById("adminNameInput");
    const adminEmailInput = document.getElementById("adminEmailInput");

    if (adminNameInput) {
      adminNameInput.value = fullName;
    }

    if (adminEmailInput) {
      adminEmailInput.value = userEmail;
    }
  }
}

// Get user initials for avatar
function getInitials(profile) {
  if (!profile) return "A";

  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  } else if (firstName) {
    return firstName.charAt(0);
  } else {
    return "A";
  }
}

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

// Load all quotes for quotes section
function loadAllQuotes() {
  const tableBody = document.getElementById("allQuotesTableBody");
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get all quotes from all users
  const allQuotes = getAllQuotes();

  // Sort by date (newest first)
  allQuotes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Add rows to table
  allQuotes.forEach((quote) => {
    const row = createQuoteTableRow(quote, false);
    tableBody.appendChild(row);
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
          previous: "<i class='fas fa-angle-left'></i>"
        }
      },
      // Callback when DataTable is fully initialized
      initComplete: function() {
        console.log("DataTable initialization complete");
        initializeQuoteFilters();
      }
    });
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
  } else {
    // No jQuery/DataTables, initialize filters directly
    initializeQuoteFilters();
  }
}

// Initialize quote filters after quotes are loaded
function initializeQuoteFilters() {
  console.log("Initializing quote filters");
  
  // Update filter counts first
  updateFilterCounts();
  
  // Then set up the filter buttons
  setupQuoteStatusFilter();
  
  // Set the "All" filter as active initially
  const allFilterBtn = document.querySelector('.quote-filter[data-filter="all"]');
  if (allFilterBtn) {
    // Add active class
    document.querySelectorAll('.quote-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    allFilterBtn.classList.add('active');
    
    // Apply the "all" filter
    setTimeout(() => {
      applyQuotesFilter('all');
    }, 100);
  }
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
        "Storage": "256GB",
        "Color": "Sierra Blue",
        "Screen Condition": "Excellent, no scratches",
        "Battery Health": "92%",
        "Accessories": "Original charger and box"
      },
      images: [
        "../images/placeholder-device.jpg"
      ]
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
        "Processor": "M1 Pro",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Display": "14-inch Liquid Retina XDR",
        "Condition Notes": "Like new, minimal use"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 8500,
        date: "2023-09-09T10:30:00",
        validDays: 7,
        note: "Excellent condition MacBook with original packaging and all accessories."
      }
    },
    {
      id: "QUO_003",
      type: "Tablet",
      device: "iPad Air 4th Gen",
      brand: "Apple",
      condition: "Fair",
      date: "2023-09-05T11:45:00",
      status: "Accepted",
      customerEmail: "david.wilson@example.com",
      customerName: "David Wilson",
      phone: "555-234-5678",
      specs: {
        "Storage": "64GB",
        "Color": "Space Gray",
        "Screen": "10.9-inch",
        "Issues": "Minor scratches on back, screen in good condition",
        "Accessories": "Charger only, no box"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 2200,
        date: "2023-09-06T09:15:00",
        validDays: 14,
        note: "Fair condition due to scratches on back, but fully functional."
      }
    },
    {
      id: "QUO_004",
      type: "Smartphone",
      device: "Galaxy S21",
      brand: "Samsung",
      condition: "Good",
      date: "2023-09-03T16:20:00",
      status: "Completed",
      customerEmail: "emily.johnson@example.com",
      customerName: "Emily Johnson",
      phone: "555-345-6789",
      specs: {
        "Storage": "128GB",
        "Color": "Phantom Black",
        "Screen": "6.2-inch Dynamic AMOLED",
        "Battery Health": "88%",
        "Included": "Phone only, no accessories"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 2800,
        date: "2023-09-04T13:45:00",
        validDays: 7,
        note: "Good condition overall with some minor wear."
      },
      completedDate: "2023-09-10T11:30:00"
    },
    {
      id: "QUO_005",
      type: "Laptop",
      device: "Dell XPS 15",
      brand: "Dell",
      condition: "Excellent",
      date: "2023-09-01T09:10:00",
      status: "Quoted",
      customerEmail: "michael.brown@example.com",
      customerName: "Michael Brown",
      phone: "555-456-7890",
      specs: {
        "Processor": "Intel Core i7-11800H",
        "RAM": "32GB",
        "Storage": "1TB SSD",
        "Display": "15.6-inch 4K OLED",
        "Graphics": "NVIDIA GeForce RTX 3050 Ti"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 7500,
        date: "2023-09-02T15:20:00",
        validDays: 10,
        note: "High-performance laptop in excellent condition."
      }
    },
    {
      id: "QUO_006",
      type: "Smartphone",
      device: "iPhone 12 Mini",
      brand: "Apple",
      condition: "Fair",
      date: "2023-08-29T13:40:00",
      status: "Rejected",
      customerEmail: "jennifer.davis@example.com",
      customerName: "Jennifer Davis",
      phone: "555-567-8901",
      specs: {
        "Storage": "64GB",
        "Color": "Product RED",
        "Screen": "Cracked, still functional",
        "Battery Health": "79%",
        "Accessories": "No accessories"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      rejectionReason: "Device has significant damage and low battery health."
    },
    {
      id: "QUO_007",
      type: "Tablet",
      device: "Samsung Galaxy Tab S7",
      brand: "Samsung",
      condition: "Good",
      date: "2023-08-27T10:15:00",
      status: "Quoted",
      customerEmail: "robert.taylor@example.com",
      customerName: "Robert Taylor",
      phone: "555-678-9012",
      specs: {
        "Storage": "128GB",
        "Color": "Mystic Black",
        "Screen": "11-inch TFT LCD",
        "Accessories": "S Pen and charger included"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 3200,
        date: "2023-08-28T11:30:00",
        validDays: 7,
        note: "Good condition tablet with all accessories."
      }
    },
    {
      id: "QUO_008",
      type: "Laptop",
      device: "HP Spectre x360",
      brand: "HP",
      condition: "Good",
      date: "2023-08-25T15:50:00",
      status: "Pending",
      customerEmail: "lisa.martinez@example.com",
      customerName: "Lisa Martinez",
      phone: "555-789-0123",
      specs: {
        "Processor": "Intel Core i5-1135G7",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Display": "13.3-inch FHD Touchscreen",
        "Features": "2-in-1 convertible design"
      },
      images: [
        "../images/placeholder-device.jpg"
      ]
    },
    {
      id: "QUO_009",
      type: "Smartphone",
      device: "Google Pixel 6",
      brand: "Google",
      condition: "Excellent",
      date: "2023-08-22T09:30:00",
      status: "Completed",
      customerEmail: "kevin.anderson@example.com",
      customerName: "Kevin Anderson",
      phone: "555-890-1234",
      specs: {
        "Storage": "128GB",
        "Color": "Stormy Black",
        "Screen": "6.4-inch OLED",
        "Battery Health": "95%",
        "Accessories": "Original charger and case"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 3500,
        date: "2023-08-23T14:15:00",
        validDays: 7,
        note: "Excellent condition Pixel 6 with case and all accessories."
      },
      completedDate: "2023-08-30T10:45:00"
    },
    {
      id: "QUO_010",
      type: "Laptop",
      device: "Lenovo ThinkPad X1 Carbon",
      brand: "Lenovo",
      condition: "Good",
      date: "2023-08-20T11:20:00",
      status: "Accepted",
      customerEmail: "patricia.white@example.com",
      customerName: "Patricia White",
      phone: "555-901-2345",
      specs: {
        "Processor": "Intel Core i7-1165G7",
        "RAM": "16GB",
        "Storage": "1TB SSD",
        "Display": "14-inch 4K UHD",
        "Features": "Fingerprint reader, backlit keyboard"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 6800,
        date: "2023-08-21T09:45:00",
        validDays: 10,
        note: "Business-class laptop in good condition with premium features."
      }
    },
    {
      id: "QUO_011",
      type: "Smartphone",
      device: "OnePlus 9 Pro",
      brand: "OnePlus",
      condition: "Excellent",
      date: "2023-08-18T14:05:00",
      status: "Quoted",
      customerEmail: "thomas.jackson@example.com",
      customerName: "Thomas Jackson",
      phone: "555-012-3456",
      specs: {
        "Storage": "256GB",
        "Color": "Morning Mist",
        "Screen": "6.7-inch Fluid AMOLED",
        "Battery Health": "90%",
        "Accessories": "Original box, charger, and case"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 4000,
        date: "2023-08-19T16:30:00",
        validDays: 7,
        note: "Premium Android phone in excellent condition with all accessories."
      }
    },
    {
      id: "QUO_012",
      type: "Tablet",
      device: "Microsoft Surface Pro 8",
      brand: "Microsoft",
      condition: "Good",
      date: "2023-08-15T10:40:00",
      status: "Pending",
      customerEmail: "jessica.harris@example.com",
      customerName: "Jessica Harris",
      phone: "555-123-4567",
      specs: {
        "Processor": "Intel Core i5-1135G7",
        "RAM": "8GB",
        "Storage": "256GB SSD",
        "Display": "13-inch PixelSense Flow",
        "Accessories": "Type Cover and Surface Pen"
      },
      images: [
        "../images/placeholder-device.jpg"
      ]
    },
    {
      id: "QUO_013",
      type: "Smartphone",
      device: "iPhone SE (2022)",
      brand: "Apple",
      condition: "Fair",
      date: "2023-08-12T13:25:00",
      status: "Rejected",
      customerEmail: "richard.clark@example.com",
      customerName: "Richard Clark",
      phone: "555-234-5678",
      specs: {
        "Storage": "64GB",
        "Color": "Midnight",
        "Screen": "4.7-inch Retina HD",
        "Battery Health": "76%",
        "Issues": "Significant scratches on back, weak battery"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      rejectionReason: "Device shows too much wear and has poor battery health."
    },
    {
      id: "QUO_014",
      type: "Laptop",
      device: "ASUS ROG Zephyrus G14",
      brand: "ASUS",
      condition: "Excellent",
      date: "2023-08-10T09:15:00",
      status: "Completed",
      customerEmail: "susan.wilson@example.com",
      customerName: "Susan Wilson",
      phone: "555-345-6789",
      specs: {
        "Processor": "AMD Ryzen 9 5900HS",
        "RAM": "32GB",
        "Storage": "1TB SSD",
        "Display": "14-inch QHD 120Hz",
        "Graphics": "NVIDIA GeForce RTX 3060"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 9200,
        date: "2023-08-11T14:30:00",
        validDays: 7,
        note: "High-end gaming laptop in excellent condition with all original accessories."
      },
      completedDate: "2023-08-18T11:20:00"
    },
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
        "Storage": "256GB",
        "Color": "Space Gray",
        "Display": "12.9-inch Liquid Retina XDR",
        "Accessories": "Apple Pencil 2nd gen and Smart Keyboard Folio"
      },
      images: [
        "../images/placeholder-device.jpg"
      ],
      quote: {
        amount: 7800,
        date: "2023-08-09T10:15:00",
        validDays: 10,
        note: "Premium tablet with accessories, some minor wear on the edges."
      }
    }
  ];
}

// Show quote details in modal
function showQuoteDetails(quote) {
  // Get modal elements
  const modal = document.getElementById("quoteDetailsModal");
  const modalCustomerName = document.getElementById("modalCustomerName");
  const modalCustomerEmail = document.getElementById("modalCustomerEmail");
  const modalCustomerPhone = document.getElementById("modalCustomerPhone");
  const modalDeviceCategory = document.getElementById("modalDeviceCategory");
  const modalDeviceName = document.getElementById("modalDeviceName");
  const modalDeviceCondition = document.getElementById("modalDeviceCondition");
  const modalRequestStatus = document.getElementById("modalRequestStatus");
  const modalRequestDate = document.getElementById("modalRequestDate");
  const modalDeviceSpecs = document.getElementById("modalDeviceSpecs");
  const modalDeviceImages = document.getElementById("modalDeviceImages");

  // Clear previous images
  if (modalDeviceImages) {
    modalDeviceImages.innerHTML = "";
  }

  if (modalDeviceSpecs) {
    modalDeviceSpecs.innerHTML = "";
  }

  // Set customer information
  if (modalCustomerName)
    modalCustomerName.textContent = quote.customerName || "N/A";
  if (modalCustomerEmail)
    modalCustomerEmail.textContent = quote.customerEmail || "N/A";
  if (modalCustomerPhone) modalCustomerPhone.textContent = quote.phone || "N/A";

  // Set device information
  if (modalDeviceCategory)
    modalDeviceCategory.textContent = quote.type || "N/A";
  if (modalDeviceName) modalDeviceName.textContent = quote.device || "N/A";
  if (modalDeviceCondition)
    modalDeviceCondition.textContent = quote.condition || "N/A";

  // Set request information
  if (modalRequestStatus) {
    modalRequestStatus.textContent = quote.status;
    modalRequestStatus.className = `badge badge-${quote.status.toLowerCase()}`;
  }

  if (modalRequestDate) {
    const requestDate = new Date(quote.date).toLocaleDateString();
    modalRequestDate.textContent = requestDate;
  }

  // Add device specs if available
  if (modalDeviceSpecs && quote.specs) {
    const specsList = document.createElement("div");
    specsList.className = "specs-list mt-3";

    Object.entries(quote.specs).forEach(([key, value]) => {
      if (value) {
        const specItem = document.createElement("div");
        specItem.className = "detail-item";

        const specLabel = document.createElement("div");
        specLabel.className = "detail-label";
        specLabel.textContent = key + ":";

        const specValue = document.createElement("div");
        specValue.className = "detail-value";
        specValue.textContent = value;

        specItem.appendChild(specLabel);
        specItem.appendChild(specValue);
        specsList.appendChild(specItem);
      }
    });

    modalDeviceSpecs.appendChild(specsList);
  }

  // Add device images if available
  if (modalDeviceImages && quote.images && quote.images.length > 0) {
    const imageGallery = document.createElement("div");
    imageGallery.className = "row mt-3";

    quote.images.forEach((image, index) => {
      const col = document.createElement("div");
      col.className = "col-md-3 col-6 mb-3";

      const imgContainer = document.createElement("div");
      imgContainer.className = "device-image-thumbnail";
      imgContainer.style.cursor = "pointer";
      imgContainer.onclick = () => enlargeImage(image);

      const img = document.createElement("img");
      img.src = image;
      img.alt = `Device image ${index + 1}`;
      img.className = "img-fluid rounded";
      img.loading = "lazy"; // Add lazy loading

      imgContainer.appendChild(img);
      col.appendChild(imgContainer);
      imageGallery.appendChild(col);
    });

    modalDeviceImages.appendChild(imageGallery);
  }

  // Handle quote sections based on status
  const quoteFormSection = document.getElementById("quoteFormSection");
  const existingQuoteSection = document.getElementById("existingQuoteSection");
  const markCompletedBtn = document.getElementById("markCompletedBtn");

  // Hide both sections initially
  if (quoteFormSection) quoteFormSection.classList.add("d-none");
  if (existingQuoteSection) existingQuoteSection.classList.add("d-none");
  if (markCompletedBtn) markCompletedBtn.classList.add("d-none");

  if (quote.status === "Pending") {
    // Show quote form for pending requests
    if (quoteFormSection) quoteFormSection.classList.remove("d-none");

    // Set the quote request ID in the form
    const quoteAmount = document.getElementById("quoteAmount");
    const quoteNotes = document.getElementById("quoteNotes");
    const submitQuoteBtn = document.getElementById("submitQuoteBtn");

    if (submitQuoteBtn) {
      // Remove any existing event listeners
      const newSubmitBtn = submitQuoteBtn.cloneNode(true);
      submitQuoteBtn.parentNode.replaceChild(newSubmitBtn, submitQuoteBtn);

      // Add new event listener
      newSubmitBtn.addEventListener("click", function (e) {
        e.preventDefault();

        if (
          !quoteAmount ||
          !quoteAmount.value ||
          parseFloat(quoteAmount.value) <= 0
        ) {
          alert("Please enter a valid points amount");
          return;
        }

        // Submit quote logic here
        submitQuote(
          quote.id,
          quote.customerEmail,
          parseFloat(quoteAmount.value),
          quoteNotes ? quoteNotes.value : ""
        );
      });
    }
  } else if (quote.quote) {
    // Show existing quote information
    if (existingQuoteSection) existingQuoteSection.classList.remove("d-none");

    const modalExistingAmount = document.getElementById("modalExistingAmount");
    const modalQuoteDate = document.getElementById("modalQuoteDate");
    const modalValidUntil = document.getElementById("modalValidUntil");
    const modalExistingNotes = document.getElementById("modalExistingNotes");

    if (modalExistingAmount)
      modalExistingAmount.textContent = Math.round(quote.quote.amount);

    if (modalQuoteDate && quote.quote.date) {
      modalQuoteDate.textContent = new Date(
        quote.quote.date
      ).toLocaleDateString();
    }

    if (modalValidUntil && quote.quote.date && quote.quote.validDays) {
      const validUntil = new Date(quote.quote.date);
      validUntil.setDate(validUntil.getDate() + quote.quote.validDays);
      modalValidUntil.textContent = validUntil.toLocaleDateString();
    }

    if (modalExistingNotes)
      modalExistingNotes.textContent = quote.quote.note || "No notes provided";

    // Show mark as completed button for accepted quotes
    if (quote.status === "Accepted" && markCompletedBtn) {
      markCompletedBtn.classList.remove("d-none");

      // Remove any existing event listeners
      const newMarkCompletedBtn = markCompletedBtn.cloneNode(true);
      markCompletedBtn.parentNode.replaceChild(
        newMarkCompletedBtn,
        markCompletedBtn
      );

      // Add new event listener
      newMarkCompletedBtn.addEventListener("click", function () {
        markAsCompleted(quote.id, quote.customerEmail);
      });
    }
  }

  // Show modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
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
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get the modal element and show it
  const modal = document.getElementById("provideQuoteModal");
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  
  // Add event listener for form submission
  const submitBtn = document.getElementById("submitQuoteBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
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
  const modal = bootstrap.Modal.getInstance(document.getElementById("provideQuoteModal"));
  if (modal) {
    modal.hide();
  }
}

// Setup quote form submission
function setupQuoteForm() {
  console.log("Setting up quote form");

  // Listen for any existing or future submit buttons
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'submitQuoteBtn') {
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
  const filterContainer = document.querySelector('.btn-filter-container');
  
  if (filterContainer) {
    // Check if we need to add the Rejected filter button
    const rejectedFilterBtn = document.querySelector('.quote-filter[data-filter="Rejected"]');
    if (!rejectedFilterBtn) {
      // Add the Rejected filter button if it doesn't exist
      const btnGroup = filterContainer.querySelector('.btn-group');
      if (btnGroup) {
        const rejectedBtn = document.createElement('button');
        rejectedBtn.className = 'btn btn-sm quote-filter';
        rejectedBtn.setAttribute('data-filter', 'Rejected');
        rejectedBtn.innerHTML = '<i class="fas fa-times me-1"></i>Rejected';
        btnGroup.appendChild(rejectedBtn);
        
        console.log("Added missing Rejected filter button");
      }
    }
  }
  
  // Now get all filter buttons including any newly added ones
  const filterButtons = document.querySelectorAll('.quote-filter');
  
  if (filterButtons.length > 0) {
    console.log(`Found ${filterButtons.length} filter buttons`);
    
    // Add click event listeners to all filter buttons
    filterButtons.forEach(btn => {
      // Remove any existing event listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add event listener to the cloned button
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const filterValue = this.getAttribute('data-filter');
        console.log(`Filter button clicked: ${filterValue}`);
        
        // Remove active class from all buttons
        console.log(`Filtering quotes by: ${filterValue}`);
        
        // Apply filter
        applyQuotesFilter(filterValue);
        
        // Add animation to the button
        this.classList.add('pulse-animation');
        setTimeout(() => {
          this.classList.remove('pulse-animation');
        }, 1000);
      });
    });
    
    // Initialize with "All" filter
    const allFilterBtn = document.querySelector('.quote-filter[data-filter="all"]');
    if (allFilterBtn) {
      allFilterBtn.classList.add('active');
      // Make sure we apply the "all" filter initially
      setTimeout(() => {
        applyQuotesFilter('all');
      }, 100);
    }
  } else {
    console.warn("No filter buttons found with class 'quote-filter'");
    // Fallback to old select-based filter
  const filterSelect = document.getElementById("quoteStatusFilter");

  if (filterSelect) {
      filterSelect.addEventListener("change", function() {
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

  // Normalize the filter value to ensure consistent casing
  const normalizedFilter = filterValue === 'all' ? 'all' : filterValue;

      // If DataTable is initialized, use its filtering
  if (typeof $ !== "undefined" && $.fn.dataTable.isDataTable("#allQuotesTable")) {
        const table = $("#allQuotesTable").DataTable();

    if (normalizedFilter === "all") {
      // Clear all filters
      table.search("").columns().search("").draw();
        } else {
      // Create a regex that matches the exact status name
      const exactMatch = `^${normalizedFilter}$`;
      // Apply filter to status column (using regex for exact match)
      table.column(3).search(exactMatch, true, false).draw();
        }
      } else {
    // Manual filtering for when DataTables is not available
        const rows = document.querySelectorAll("#allQuotesTableBody tr");

        rows.forEach((row) => {
      // The status is in the 4th column (4th td element)
      const statusCell = row.querySelector("td:nth-child(4)");
      if (!statusCell) return;
      
      // Look for the status text inside the badge span
      const statusBadge = statusCell.querySelector(".badge");
      const statusText = statusBadge ? statusBadge.textContent.trim() : statusCell.textContent.trim();
      
      if (normalizedFilter === "all" || statusText === normalizedFilter) {
            row.style.display = "";
        // Add a smooth fade-in effect
        row.style.opacity = "0";
        setTimeout(() => {
          row.style.opacity = "1";
          row.style.transition = "opacity 0.3s ease-in-out";
        }, 50);
          } else {
            row.style.display = "none";
          }
        });
  }
  
  // Update the header title to show current filter
  updateFilterTitle(normalizedFilter);
  
  // Update the filter counts to reflect the current state
  updateFilterCounts();
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
    Rejected: 0
  };
  
  // Count each status
  allQuotes.forEach(quote => {
    if (counts.hasOwnProperty(quote.status)) {
      counts[quote.status]++;
    }
  });
  
  console.log("Quote counts by status:", counts);
  
  // Update filter buttons with counts if they have count elements
  Object.keys(counts).forEach(status => {
    const filterBtn = document.querySelector(`.quote-filter[data-filter="${status}"]`);
    if (filterBtn) {
      console.log(`Updating count for ${status} filter: ${counts[status]}`);
      
      // Check if there's a count badge
      let countBadge = filterBtn.querySelector('.filter-count');
      
      // If not, create one
      if (!countBadge) {
        countBadge = document.createElement('span');
        countBadge.className = 'filter-count ms-1';
        filterBtn.appendChild(countBadge);
      }
      
      // Update the count with animation if it changed
      const oldCount = parseInt(countBadge.textContent) || 0;
      if (oldCount !== counts[status]) {
        countBadge.classList.add('count-changed');
        setTimeout(() => {
          countBadge.classList.remove('count-changed');
        }, 500);
      }
      
      // Update the count
      countBadge.textContent = counts[status];
      
      // Add a special class if count is 0
      if (counts[status] === 0) {
        countBadge.classList.add('empty');
      } else {
        countBadge.classList.remove('empty');
      }
    }
  });
}

// Update the quotes section title based on filter
function updateFilterTitle(filterValue) {
  const titleElement = document.querySelector('#quotesSection .card-header h5');
  if (!titleElement) return;
  
  // Update the title based on filter
  if (filterValue === 'all') {
    titleElement.innerHTML = '<i class="fas fa-file-invoice-dollar"></i> All Quote Requests';
  } else {
    const iconClass = getStatusIconClass(filterValue);
    titleElement.innerHTML = `<i class="${iconClass}"></i> ${filterValue} Quote Requests`;
  }
}

// Get appropriate icon class for status
function getStatusIconClass(status) {
  switch (status) {
    case 'Pending': return 'fas fa-clock';
    case 'Quoted': return 'fas fa-dollar-sign';
    case 'Accepted': return 'fas fa-check';
    case 'Completed': return 'fas fa-check-double';
    case 'Rejected': return 'fas fa-times';
    default: return 'fas fa-file-invoice-dollar';
  }
}

// Load users for users section
function loadUsers() {
  console.log("Loading users data...");
  
  const tableBody = document.getElementById("usersTableBody");
  if (!tableBody) {
    console.error("usersTableBody element not found!");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get list of dummy users
  const users = getDummyUsers();
  console.log("Retrieved", users.length, "users");
  
  // Get all inventory devices
  const allDevices = getAllDevices();
  console.log("Retrieved", allDevices.length, "devices for user stats");

  // Add users to table
  users.forEach((user) => {
    const row = document.createElement("tr");

    // User info cell
    const userInfoCell = document.createElement("td");
    userInfoCell.className = "user-row-info";

    // Avatar
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "user-avatar";
    
    if (user.profileImage) {
      avatarDiv.innerHTML = `<img src="${user.profileImage}" alt="${user.name}" class="rounded-circle" width="40" height="40">`;
    } else {
      const initials = getInitialsFromName(user.firstName, user.lastName);
      avatarDiv.innerHTML = `
        <div class="avatar-text">${initials}</div>
        <div class="avatar-shine"></div>
      `;
    }
    
    // User name and email
    const userNameInfo = document.createElement("div");
    userNameInfo.className = "user-name-info";
    
    const userName = document.createElement("div");
    userName.className = "user-display-name";
    userName.textContent = `${user.firstName} ${user.lastName}`;
    
    const userEmail = document.createElement("div");
    userEmail.className = "user-email";
    userEmail.textContent = user.email;
    
    userNameInfo.appendChild(userName);
    userNameInfo.appendChild(userEmail);
    
    userInfoCell.appendChild(avatarDiv);
    userInfoCell.appendChild(userNameInfo);
    row.appendChild(userInfoCell);

    // Recycled devices cell
    const recycledCell = document.createElement("td");
    const recycledCount = document.createElement("span");
    recycledCount.className = "recycled-count";
    recycledCount.textContent = user.recycledDevices || 0;
    recycledCell.appendChild(recycledCount);
    row.appendChild(recycledCell);

    // Role cell
    const roleCell = document.createElement("td");
    const roleBadge = document.createElement("span");
    roleBadge.className = `user-role ${user.role.toLowerCase()}`;
    roleBadge.textContent = user.role === "admin" ? "Admin" : "Customer";
    roleCell.appendChild(roleBadge);
    row.appendChild(roleCell);

    // Requests cell
    const requestsCell = document.createElement("td");
    const requestsCount = document.createElement("span");
    requestsCount.className = "recycled-count";
    requestsCount.textContent = user.requestsCount || 0;
    requestsCell.appendChild(requestsCount);
    row.appendChild(requestsCell);

    // Points cell
    const pointsCell = document.createElement("td");
    const pointsCount = document.createElement("span");
    pointsCount.className = "user-points";
    pointsCount.innerHTML = `<i class="fas fa-coins me-1"></i>${user.points.toLocaleString()}`;
    pointsCell.appendChild(pointsCount);
    row.appendChild(pointsCell);

    // Actions cell
    const actionsCell = document.createElement("td");
    actionsCell.className = "actions-cell";

    // View details button
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn-user-action view-action";
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.setAttribute("data-bs-toggle", "tooltip");
    viewBtn.setAttribute("title", "View Details");
    viewBtn.addEventListener("click", () => viewUserDetails(user.email));
    actionsCell.appendChild(viewBtn);

    // Message button
    const messageBtn = document.createElement("button");
    messageBtn.className = "btn-user-action message-action";
    messageBtn.innerHTML = '<i class="fas fa-envelope"></i>';
    messageBtn.setAttribute("data-bs-toggle", "tooltip");
    messageBtn.setAttribute("title", "Send Message");
    messageBtn.addEventListener("click", () => messageUser(user.email));
    actionsCell.appendChild(messageBtn);

    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });

  // Initialize tooltips
  if (typeof bootstrap !== "undefined") {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Calculate user stats from user data
  const activeUsers = users.filter(u => u.role !== "admin" && u.status === "active").length;
  
  // Calculate stats from inventory data
  const totalDevices = allDevices.length;
  
  // Calculate total points from all devices
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);
  
  // Count devices by type for detailed stats
  const phoneCount = allDevices.filter(d => d.type === 'Smartphone').length;
  const laptopCount = allDevices.filter(d => d.type === 'Laptop').length;
  const tabletCount = allDevices.filter(d => d.type === 'Tablet').length;
  const otherCount = allDevices.filter(d => d.type === 'Other').length;
  
  console.log("User stats calculated:", {
    activeUsers,
    totalPoints,
    totalDevices,
    deviceTypes: {
      phones: phoneCount,
      laptops: laptopCount,
      tablets: tabletCount,
      other: otherCount
    }
  });

  // Update dashboard stats with values from both users and inventory
  updateUserStats(activeUsers, totalPoints, totalDevices);
}

// Get dummy users for testing
function getDummyUsers() {
  return [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "customer",
      recycledDevices: 3,
      requestsCount: 5,
      points: 2800,
      joinDate: "2023-05-12T09:30:00",
      lastActive: "2023-09-10T14:45:00",
      status: "active"
    },
    {
      firstName: "Sarah",
      lastName: "Miller",
      email: "sarah.miller@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 1200,
      joinDate: "2023-06-18T11:15:00",
      lastActive: "2023-09-08T10:30:00",
      status: "active"
    },
    {
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      role: "customer",
      recycledDevices: 2,
      requestsCount: 3,
      points: 2200,
      joinDate: "2023-04-22T15:45:00",
      lastActive: "2023-09-05T16:20:00",
      status: "active"
    },
    {
      firstName: "Emily",
      lastName: "Johnson",
      email: "emily.johnson@example.com",
      role: "customer",
      recycledDevices: 4,
      requestsCount: 6,
      points: 4100,
      joinDate: "2023-02-14T08:50:00",
      lastActive: "2023-09-09T13:15:00",
      status: "active"
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 900,
      joinDate: "2023-07-30T14:20:00",
      lastActive: "2023-09-01T11:40:00",
      status: "active"
    },
    {
      firstName: "Jennifer",
      lastName: "Davis",
      email: "jennifer.davis@example.com",
      role: "customer",
      recycledDevices: 0,
      requestsCount: 1,
      points: 0,
      joinDate: "2023-08-29T09:10:00",
      lastActive: "2023-08-29T15:35:00",
      status: "active"
    },
    {
      firstName: "Robert",
      lastName: "Taylor",
      email: "robert.taylor@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 1,
      points: 0,
      joinDate: "2023-08-15T10:30:00",
      lastActive: "2023-08-27T12:45:00",
      status: "active"
    },
    {
      firstName: "Lisa",
      lastName: "Martinez",
      email: "lisa.martinez@example.com",
      role: "customer",
      recycledDevices: 0,
      requestsCount: 1,
      points: 0,
      joinDate: "2023-08-20T13:25:00",
      lastActive: "2023-08-25T16:50:00",
      status: "active"
    },
    {
      firstName: "Kevin",
      lastName: "Anderson",
      email: "kevin.anderson@example.com",
      role: "customer",
      recycledDevices: 2,
      requestsCount: 3,
      points: 3500,
      joinDate: "2023-05-05T11:20:00",
      lastActive: "2023-08-30T09:15:00",
      status: "active"
    },
    {
      firstName: "Patricia",
      lastName: "White",
      email: "patricia.white@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 900,
      joinDate: "2023-07-12T14:10:00",
      lastActive: "2023-08-21T13:40:00",
      status: "active"
    },
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@retech.com",
      role: "admin",
      recycledDevices: 0,
      requestsCount: 0,
      points: 0,
      joinDate: "2023-01-01T09:00:00",
      lastActive: "2023-09-10T16:30:00",
      status: "active"
    }
  ];
}

// Helper function to get user initials
function getInitialsFromName(firstName, lastName) {
  if (!firstName && !lastName) return "U";
  
  let initials = "";
  if (firstName) initials += firstName.charAt(0).toUpperCase();
  if (lastName) initials += lastName.charAt(0).toUpperCase();
  
  return initials || "U";
}

// Placeholder functions for user actions (to be implemented)
function editUser(email) {
  // Show modal or navigate to edit page
  console.log(`Edit user: ${email}`);
  alert(`Edit functionality for ${email} will be implemented soon.`);
}

function messageUser(email) {
  // Open default email client with the user's email address
  const subject = "Message from RETECH Admin";
  const body = "Hello,\n\nWe're contacting you regarding your RETECH account.\n\nRegards,\nRETECH Admin Team";
  
  // Encode the subject and body for URL
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  // Create mailto link and open it
  const mailtoLink = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  window.open(mailtoLink, '_blank');
}

// View user details
function viewUserDetails(email) {
  // Get user data
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const userData = JSON.parse(localStorage.getItem(`userData_${email}`) || "{}");
  
  // Merge user data
  const user = { ...users[email], ...userData };
  
  // Create or get modal
  let userModal = document.getElementById("userDetailsModal");
  
  // Create modal if it doesn't exist
  if (!userModal) {
    const modalHTML = `
      <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-labelledby="userDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));">
              <h5 class="modal-title text-white" id="userDetailsModalLabel">
                <i class="fas fa-user-circle me-2"></i>User Details
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="user-details-container">
                <div class="row mb-4">
                  <div class="col-md-3 text-center">
                    <div class="user-profile-avatar" id="userModalAvatar"></div>
                    <div class="user-profile-role mt-2" id="userModalRole"></div>
                  </div>
                  <div class="col-md-9">
                    <h3 id="userModalName" class="mb-1"></h3>
                    <p id="userModalEmail" class="text-muted mb-3"></p>
                    <div class="user-profile-stats">
                      <div class="user-stat">
                        <div class="stat-icon"><i class="fas fa-coins"></i></div>
                        <div class="stat-content">
                          <div class="stat-value" id="userModalPoints">0</div>
                          <div class="stat-label">Points</div>
                        </div>
                      </div>
                      <div class="user-stat">
                        <div class="stat-icon"><i class="fas fa-recycle"></i></div>
                        <div class="stat-content">
                          <div class="stat-value" id="userModalRecycled">0</div>
                          <div class="stat-label">Items Recycled</div>
                        </div>
                      </div>
                      <div class="user-stat">
                        <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                        <div class="stat-content">
                          <div class="stat-value" id="userModalJoined">N/A</div>
                          <div class="stat-label">Joined</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="user-detail-tabs">
                  <ul class="nav nav-tabs" id="userDetailsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab">
                        <i class="fas fa-id-card me-2"></i>Profile
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link" id="recycling-tab" data-bs-toggle="tab" data-bs-target="#recycling-tab-pane" type="button" role="tab">
                        <i class="fas fa-recycle me-2"></i>Recycling History
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link" id="points-tab" data-bs-toggle="tab" data-bs-target="#points-tab-pane" type="button" role="tab">
                        <i class="fas fa-coins me-2"></i>Points History
                      </button>
                    </li>
                  </ul>
                  <div class="tab-content p-3 border border-top-0 rounded-bottom" id="userDetailsTabContent">
                    <div class="tab-pane fade show active" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab">
                      <div class="user-profile-info" id="userProfileInfo">
                        <div class="info-row">
                          <div class="info-label"><i class="fas fa-phone me-2"></i>Phone</div>
                          <div class="info-value" id="userModalPhone">N/A</div>
                        </div>
                        <div class="info-row">
                          <div class="info-label"><i class="fas fa-map-marker-alt me-2"></i>Address</div>
                          <div class="info-value" id="userModalAddress">N/A</div>
                        </div>
                      </div>
                    </div>
                    <div class="tab-pane fade" id="recycling-tab-pane" role="tabpanel" aria-labelledby="recycling-tab">
                      <div class="table-responsive">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Device</th>
                              <th>Status</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody id="userRecyclingHistory">
                            <tr><td colspan="4" class="text-center">No recycling history found</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div class="tab-pane fade" id="points-tab-pane" role="tabpanel" aria-labelledby="points-tab">
                      <div class="table-responsive">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Description</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody id="userPointsHistory">
                            <tr><td colspan="3" class="text-center">No points history found</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-primary" id="messageUserBtn">
                <i class="fas fa-envelope me-1"></i>Message User
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add custom styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .user-profile-avatar {
        width: 100px;
        height: 100px;
        background-color: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: white;
        margin: 0 auto;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .user-profile-avatar:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%);
        top: 0;
        left: 0;
        pointer-events: none;
      }
      
      .user-profile-role {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: 500;
        color: white;
        background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .user-profile-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-top: 1rem;
      }
      
      .user-stat {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
      }
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.2;
        color: var(--dark-color);
      }
      
      .stat-label {
        font-size: 0.8rem;
        color: var(--muted-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .user-detail-tabs {
        margin-top: 1.5rem;
      }
      
      .nav-tabs .nav-link {
        color: var(--dark-color);
        border-radius: 0;
        padding: 0.75rem 1.25rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .nav-tabs .nav-link:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      .nav-tabs .nav-link.active {
        color: var(--primary-color);
        border-color: #dee2e6 #dee2e6 #fff;
        background-color: white;
        font-weight: 600;
      }
      
      .info-row {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .info-row:last-child {
        border-bottom: none;
      }
      
      .info-label {
        width: 140px;
        font-weight: 500;
        color: var(--muted-color);
      }
      
      .info-value {
        flex: 1;
        color: var(--dark-color);
      }
      
      @keyframes countUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-count {
        animation: countUp 0.5s ease forwards;
      }
      
      #userDetailsModal .modal-content {
        border: none;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      }
      
      @media (max-width: 768px) {
        .user-profile-stats {
          flex-direction: column;
          gap: 1rem;
        }
        
        .info-row {
          flex-direction: column;
        }
        
        .info-label {
          width: 100%;
          margin-bottom: 0.25rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Get the modal object
    userModal = document.getElementById("userDetailsModal");
    
    // Set up message button click event
    document.getElementById("messageUserBtn").addEventListener("click", function() {
      const userEmail = this.getAttribute("data-email");
      if (userEmail) {
        messageUser(userEmail);
      }
    });
  }
  
  // Get elements to populate
  const userModalName = document.getElementById("userModalName");
  const userModalEmail = document.getElementById("userModalEmail");
  const userModalAvatar = document.getElementById("userModalAvatar");
  const userModalRole = document.getElementById("userModalRole");
  const userModalPoints = document.getElementById("userModalPoints");
  const userModalRecycled = document.getElementById("userModalRecycled");
  const userModalJoined = document.getElementById("userModalJoined");
  const userModalPhone = document.getElementById("userModalPhone");
  const userModalAddress = document.getElementById("userModalAddress");
  const userRecyclingHistory = document.getElementById("userRecyclingHistory");
  const userPointsHistory = document.getElementById("userPointsHistory");
  const messageUserBtn = document.getElementById("messageUserBtn");
  
  // Set user email data attribute for message button
  if (messageUserBtn) {
    messageUserBtn.setAttribute("data-email", email);
  }
  
  // Extract user info
  const firstName = user.profile?.firstName || "";
  const lastName = user.profile?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown User";
  const initials = getInitialsFromName(firstName, lastName);
  const role = user.role || "customer";
  const points = user.profile?.points || 0;
  const phone = user.profile?.phone || "Not provided";
  const address = user.profile?.address || "Not provided";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";
  
  // Get recycling history
  const recyclingHistory = user.recycleHistory || [];
  const recycleRequests = user.recycleRequests || [];
  const pointsHistory = user.pointsHistory || [];
  
  // Populate basic info
  if (userModalName) userModalName.textContent = fullName;
  if (userModalEmail) userModalEmail.textContent = email;
  if (userModalAvatar) userModalAvatar.textContent = initials;
  if (userModalRole) userModalRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  if (userModalPhone) userModalPhone.textContent = phone;
  if (userModalAddress) userModalAddress.textContent = address;
  if (userModalJoined) userModalJoined.textContent = createdAt;
  
  // Animate the stats counters
  if (userModalPoints) {
    animateCounter(userModalPoints, 0, points);
  }
  
  if (userModalRecycled) {
    const totalRecycled = recyclingHistory.length + recycleRequests.filter(req => req.status === "Completed").length;
    animateCounter(userModalRecycled, 0, totalRecycled);
  }
  
  // Populate recycling history
  if (userRecyclingHistory) {
    userRecyclingHistory.innerHTML = "";
    
    // Combine and sort all recycling activity
    const allRecycling = [
      ...recyclingHistory.map(item => ({
        ...item,
        date: new Date(item.date),
        source: 'history'
      })),
      ...recycleRequests.map(item => ({
        id: item.id,
        type: item.type,
        device: item.device,
        date: new Date(item.date),
        status: item.status,
        points: item.quote?.amount * 10 || 0,
        source: 'requests'
      }))
    ].sort((a, b) => b.date - a.date);
    
    if (allRecycling.length > 0) {
      allRecycling.forEach((item, index) => {
        const row = document.createElement("tr");
        
        // Date cell
        const dateCell = document.createElement("td");
        dateCell.textContent = item.date.toLocaleDateString();
        row.appendChild(dateCell);
        
        // Device cell
        const deviceCell = document.createElement("td");
        deviceCell.textContent = `${item.type}: ${item.device || item.model || 'Unknown'}`;
        row.appendChild(deviceCell);
        
        // Status cell
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `badge badge-${item.status?.toLowerCase() || 'completed'}`;
        statusBadge.textContent = item.status || "Completed";
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Points cell
        const pointsCell = document.createElement("td");
        pointsCell.textContent = (item.points || 0).toLocaleString();
        row.appendChild(pointsCell);
        
        // Add animation delay by row
        row.style.opacity = "0";
        row.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
        
        userRecyclingHistory.appendChild(row);
      });
    } else {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 4;
      emptyCell.className = "text-center";
      emptyCell.textContent = "No recycling history found";
      emptyRow.appendChild(emptyCell);
      userRecyclingHistory.appendChild(emptyRow);
    }
  }
  
  // Populate points history
  if (userPointsHistory && pointsHistory.length > 0) {
    userPointsHistory.innerHTML = "";
    
    // Sort points history by date (newest first)
    const sortedPointsHistory = [...pointsHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedPointsHistory.forEach((item, index) => {
      const row = document.createElement("tr");
      
      // Date cell
      const dateCell = document.createElement("td");
      dateCell.textContent = new Date(item.date).toLocaleDateString();
      row.appendChild(dateCell);
      
      // Reason cell
      const reasonCell = document.createElement("td");
      reasonCell.textContent = item.reason || "Points transaction";
      row.appendChild(reasonCell);
      
      // Points cell
      const pointsCell = document.createElement("td");
      pointsCell.textContent = item.amount.toLocaleString();
      pointsCell.style.fontWeight = "bold";
      if (item.amount > 0) {
        pointsCell.classList.add("text-success");
        pointsCell.textContent = "+" + pointsCell.textContent;
      } else {
        pointsCell.classList.add("text-danger");
      }
      row.appendChild(pointsCell);
      
      // Add animation delay by row
      row.style.opacity = "0";
      row.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
      
      userPointsHistory.appendChild(row);
    });
  } else if (userPointsHistory) {
    userPointsHistory.innerHTML = `<tr><td colspan="3" class="text-center">No points history found</td></tr>`;
  }
  
  // Show the modal
  const modal = new bootstrap.Modal(userModal);
  modal.show();
}

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

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-menu a[data-section]");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");

  console.log("Setting up navigation with links:", navLinks.length, "and sections:", sections.length);

  // Map available sections for debugging
  const availableSections = Array.from(sections).map(section => section.id);
  console.log("Available sections:", availableSections);
  
  // Add a helper class to make navigation links more visible
  navLinks.forEach(link => {
    link.classList.add('nav-link-interactive');
  });

  navLinks.forEach((link) => {
    const sectionId = link.getAttribute("data-section");
    console.log("Setting up listener for:", sectionId);
    
    // Check if the target section exists
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (!targetSection) {
      console.warn(`Warning: Target section "${sectionId}Section" not found in the DOM`);
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
            pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
          }

          // If quotes section is shown, refresh the quotes table
          if (sectionId === "quotes") {
            console.log("Refreshing quotes data");
            loadAllQuotes();
          }
          
          // If users section is shown, refresh the users table
          if (sectionId === "users") {
            console.log("Refreshing users data");
            loadUsers();
          }
          
          // If inventory section is shown, refresh the inventory data
          if (sectionId === "inventory") {
            console.log("Refreshing inventory data");
            loadInventory();
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

  // Handle "View All" button for quotes
  const viewAllQuotesBtn = document.getElementById("viewAllQuotesBtn");
  if (viewAllQuotesBtn) {
    viewAllQuotesBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Find and click the quotes navigation link
      const quotesLink = document.querySelector(
        '.sidebar-menu a[data-section="quotes"]'
      );
      if (quotesLink) {
        quotesLink.click();
        console.log("Navigated to quotes section via View All button");
      } else {
        console.error("Quotes navigation link not found");
      }
    });
  }

  // Check for URL hash to determine initial section
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1); // Remove the # character
    const sectionLink = document.querySelector(`.sidebar-menu a[data-section="${sectionId}"]`);
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

// Setup logout functionality
function setupLogout() {
  // Select all logout buttons by their IDs and any elements with logout data-action
  const logoutBtns = document.querySelectorAll(
    "#adminLogoutBtn, #sidebarLogoutBtn, [data-action='logout']"
  );

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Logout clicked"); // Debug log

      // Clear auth data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("loginTimestamp");

      // Redirect to login page
      window.location.href = "login.html";
    });
  });
}

// Simple password validation helper
function validatePassword(password, hash) {
  return hashPassword(password) === hash;
}

// Simple hash function (for demo purposes only)
function hashPassword(password) {
  // In a real app, use a secure hashing algorithm with salt
  // This is just a simple hash for demonstration
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Function to enlarge image when clicked
function enlargeImage(imageSrc) {
  console.log("Enlarging image:", imageSrc);
  
  // Create modal for showing enlarged image if it doesn't exist
  let modal = document.getElementById('imageModal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Device Image</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <img id="enlargedImage" src="" alt="Enlarged device image" class="img-fluid" style="max-height: 70vh;">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Set the image source
  const enlargedImage = document.getElementById('enlargedImage');
  if (enlargedImage) {
    enlargedImage.src = imageSrc;
    
    // Add onload handler to ensure image is properly sized
    enlargedImage.onload = function() {
      // Force a reflow to ensure the modal adjusts to the image size
      modal.offsetHeight;
    };
  }
  
  // Initialize and open the modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Make the enlargeImage function globally available
window.enlargeImage = enlargeImage;

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

// Update user stats displays
function updateUserStats(activeUsers, totalPoints, recycledItems) {
  console.log("Updating user stats: Active Users:", activeUsers, "Total Points:", totalPoints, "Recycled Items:", recycledItems);
  
  // Get counter elements
  const activeUsersCount = document.getElementById("activeUsersCount");
  const totalPointsAwarded = document.getElementById("totalPointsAwarded");
  const recycleItemsCount = document.getElementById("recycleItemsCount");
  
  // Debug element existence
  if (!activeUsersCount) console.warn("activeUsersCount element not found");
  if (!totalPointsAwarded) console.warn("totalPointsAwarded element not found");
  if (!recycleItemsCount) console.warn("recycleItemsCount element not found");
  
  // Use a staggered delay for each counter for better visual effect
  if (activeUsersCount) {
    // Reset any existing animation classes
    activeUsersCount.classList.remove('animate-count');
    setTimeout(() => {
      // Get previous value if available, otherwise start from 0
      const prevValue = parseInt(activeUsersCount.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(activeUsersCount, prevValue, activeUsers);
    }, 100);
  }
  
  if (totalPointsAwarded) {
    totalPointsAwarded.classList.remove('animate-count');
    setTimeout(() => {
      const prevValue = parseInt(totalPointsAwarded.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(totalPointsAwarded, prevValue, totalPoints);
    }, 300); // Delay for staggered effect
  }
  
  if (recycleItemsCount) {
    recycleItemsCount.classList.remove('animate-count');
    setTimeout(() => {
      const prevValue = parseInt(recycleItemsCount.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(recycleItemsCount, prevValue, recycledItems);
    }, 500); // Delay for staggered effect
  }
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
  console.log(`Animating counter from ${start} to ${end} for element:`, element.id || element);
  
  // Reset the counter to start value immediately
  element.textContent = start.toLocaleString();
  
  // Add animation class
  element.classList.add('animate-count');
  
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
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = 'countUp 0.3s ease forwards';
      console.log(`Counter animation completed for ${element.id || element}: ${end}`);
    }
    
    // Update the display with thousands separators
    element.textContent = current.toLocaleString();
  }, duration / steps);
}

// Load inventory for inventory section
function loadInventory() {
  console.log("Loading inventory data...");
  
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) {
    console.error("inventoryTableBody element not found!");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get all devices from all users
  const allDevices = getAllDevices();
  console.log("Retrieved", allDevices.length, "devices for inventory");

  // Sort by date (newest first) - but use receivedDate instead of date
  allDevices.sort((a, b) => {
    const dateA = new Date(a.receivedDate || a.date || 0);
    const dateB = new Date(b.receivedDate || b.date || 0);
    return dateB - dateA;
  });

  // Add rows to table
  allDevices.forEach((device) => {
    const row = createDeviceTableRow(device);
    tableBody.appendChild(row);
  });

  // Initialize DataTable if jQuery is available
  if (typeof $ !== "undefined") {
    if ($.fn.dataTable.isDataTable("#inventoryTable")) {
      $("#inventoryTable").DataTable().destroy();
    }
    
    $("#inventoryTable").DataTable({
      pageLength: 10,
      responsive: true,
      language: {
        search: "<i class='fas fa-search'></i> Search:",
        lengthMenu: "Show _MENU_ devices",
        info: "Showing _START_ to _END_ of _TOTAL_ devices",
        paginate: {
          first: "<i class='fas fa-angle-double-left'></i>",
          last: "<i class='fas fa-angle-double-right'></i>",
          next: "<i class='fas fa-angle-right'></i>",
          previous: "<i class='fas fa-angle-left'></i>"
        }
      },
      // Callback when DataTable is fully initialized
      initComplete: function() {
        console.log("DataTable initialization complete");
        initializeInventoryFilters();
      }
    });
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
  } else {
    // No jQuery/DataTables, initialize filters directly
    initializeInventoryFilters();
  }

  // Update inventory stats with a slight delay to ensure DOM is ready
  setTimeout(() => {
    updateInventoryStats(allDevices);
  }, 100);
}

// Initialize inventory filters after inventory is loaded
function initializeInventoryFilters() {
  console.log("Initializing inventory filters");
  
  // Update filter counts first
  updateInventoryFilterCounts();
  
  // Then set up the filter buttons
  setupInventoryTypeFilter();
  
  // Set the "All" filter as active initially
  const allFilterBtn = document.querySelector('.inventory-filter[data-filter="all"]');
  if (allFilterBtn) {
    // Add active class
    document.querySelectorAll('.inventory-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    allFilterBtn.classList.add('active');
    
    // Apply the "all" filter
    setTimeout(() => {
      applyInventoryFilter('all');
    }, 100);
  }
}

// Print device information
function printDeviceInfo(device) {
  console.log("Printing device information:", device);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert("Please allow popups to print device information");
    return;
  }
  
  // Get the device details
  const brand = device.brand || "";
  const model = device.model || device.device || "Unknown Device";
  const deviceName = brand ? `${brand} ${model}` : model;
  const deviceType = device.type || "Unknown";
  const deviceCondition = device.condition || "Unknown";
  const deviceDate = new Date(device.receivedDate || device.date || device.completedDate || device.recycledDate || new Date()).toLocaleDateString();
  const deviceUser = device.userName || "Unknown User";
  const deviceEmail = device.userEmail || "N/A";
  const deviceValue = device.quote ? `$${device.quote.amount.toFixed(2)}` : "$0.00";
  const devicePoints = device.points || (device.quote ? Math.floor(device.quote.amount * 10) : 0);
  const deviceId = device.id || "N/A";
  
  // Generate specs HTML
  let specsHtml = '<p class="text-muted">No specific details available for this device.</p>';
  
  if (device.specs && Object.keys(device.specs).length > 0) {
    specsHtml = '<table class="specs-table">';
    
    Object.entries(device.specs).forEach(([key, value]) => {
      if (value) {
        specsHtml += `
          <tr>
            <td class="spec-label">${key}:</td>
            <td class="spec-value">${value}</td>
          </tr>
        `;
      }
    });
    
    specsHtml += '</table>';
  }
  
  // Generate images HTML
  let imagesHtml = '<p class="text-muted">No images available for this device.</p>';
  
  if (device.images && device.images.length > 0) {
    imagesHtml = '<div class="images-container">';
    
    device.images.forEach((image, index) => {
      imagesHtml += `
        <div class="image-item">
          <img src="${image}" alt="Device image ${index + 1}" style="max-width: 200px; max-height: 200px; margin: 5px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
        </div>
      `;
    });
    
    imagesHtml += '</div>';
  }
  
  // Create the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Device Details - ${deviceName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .print-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4361ee;
          margin-bottom: 20px;
        }
        .print-header h1 {
          color: #4361ee;
          margin: 0 0 10px 0;
        }
        .print-header p {
          color: #666;
          margin: 0;
        }
        .device-info {
          margin-bottom: 30px;
        }
        .section-title {
          color: #4361ee;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-top: 25px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .specs-table td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        .spec-label {
          font-weight: bold;
          color: #555;
          width: 30%;
        }
        .images-container {
          display: flex;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>RETECH Device Information</h1>
        <p>Recycled Electronics Technology</p>
      </div>
      
      <button class="no-print" style="padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer; float: right;" onclick="window.print();">
        Print Document
      </button>
      
      <div class="device-info">
        <h2 class="section-title">Device Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Device:</div>
            <div>${deviceName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Category:</div>
            <div>${deviceType}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Condition:</div>
            <div>${deviceCondition}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Received Date:</div>
            <div>${deviceDate}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Recycling ID:</div>
            <div>${deviceId}</div>
          </div>
        </div>
        
        <h2 class="section-title">Recycled By</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Name:</div>
            <div>${deviceUser}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email:</div>
            <div>${deviceEmail}</div>
          </div>
        </div>
        
        <h2 class="section-title">Value Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Quoted Value:</div>
            <div>${deviceValue}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Points Awarded:</div>
            <div>${devicePoints}</div>
          </div>
        </div>
        
        <h2 class="section-title">Device Specifications</h2>
        ${specsHtml}
        
        <h2 class="section-title">Device Images</h2>
        ${imagesHtml}
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()} | RETECH - Recycled Electronics Technology</p>
      </div>
      
      <script>
        // Auto-print when loaded
        window.onload = function() {
          // Give a small delay for images to load
          setTimeout(function() {
            // Show print dialog
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  // Finish the document
  printWindow.document.close();
}

// Get all recycled devices from all users
function getAllDevices() {
  console.log("Getting all devices");
  
  // Static dummy data for testing
  return [
    {
      id: "DEV_001",
      type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13 Pro",
      condition: "Good",
      receivedDate: "2023-09-10T08:30:00",
      specs: {
        "Storage": "256GB",
        "Color": "Sierra Blue",
        "Screen Condition": "Excellent, no scratches",
        "Battery Health": "92%",
        "Accessories": "Original charger and box"
      },
      customerEmail: "john.doe@example.com",
      customerName: "John Doe",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Device has been factory reset and tested. All functions working properly."
    },
    {
      id: "DEV_002",
      type: "Laptop",
      brand: "Apple",
      model: "MacBook Pro 14-inch",
      condition: "Excellent",
      receivedDate: "2023-09-08T14:15:00",
      specs: {
        "Processor": "M1 Pro",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Display": "14-inch Liquid Retina XDR",
        "Condition Notes": "Like new, minimal use"
      },
      customerEmail: "sarah.miller@example.com",
      customerName: "Sarah Miller",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "High-end MacBook in excellent condition. Battery cycle count under 50."
    },
    {
      id: "DEV_003",
      type: "Tablet",
      brand: "Apple",
      model: "iPad Air 4th Gen",
      condition: "Fair",
      receivedDate: "2023-09-05T11:45:00",
      specs: {
        "Storage": "64GB",
        "Color": "Space Gray",
        "Screen": "10.9-inch",
        "Issues": "Minor scratches on back, screen in good condition",
        "Accessories": "Charger only, no box"
      },
      customerEmail: "david.wilson@example.com",
      customerName: "David Wilson",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Tablet functions normally despite cosmetic wear on the back casing."
    },
    {
      id: "DEV_004",
      type: "Smartphone",
      brand: "Samsung",
      model: "Galaxy S21",
      condition: "Good",
      receivedDate: "2023-09-03T16:20:00",
      specs: {
        "Storage": "128GB",
        "Color": "Phantom Black",
        "Screen": "6.2-inch Dynamic AMOLED",
        "Battery Health": "88%",
        "Included": "Phone only, no accessories"
      },
      customerEmail: "emily.johnson@example.com",
      customerName: "Emily Johnson",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Factory reset completed. Minor wear around the charging port but otherwise in good condition."
    },
    {
      id: "DEV_005",
      type: "Laptop",
      brand: "Dell",
      model: "XPS 15",
      condition: "Excellent",
      receivedDate: "2023-09-01T09:10:00",
      specs: {
        "Processor": "Intel Core i7-11800H",
        "RAM": "32GB",
        "Storage": "1TB SSD",
        "Display": "15.6-inch 4K OLED",
        "Graphics": "NVIDIA GeForce RTX 3050 Ti"
      },
      customerEmail: "michael.brown@example.com",
      customerName: "Michael Brown",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "High-performance laptop in excellent condition. Includes original packaging and all accessories."
    },
    {
      id: "DEV_006",
      type: "Smartphone",
      brand: "Apple",
      model: "iPhone 12 Mini",
      condition: "Fair",
      receivedDate: "2023-08-29T13:40:00",
      specs: {
        "Storage": "64GB",
        "Color": "Product RED",
        "Screen": "Cracked but functional",
        "Battery Health": "79%",
        "Accessories": "No accessories"
      },
      customerEmail: "jennifer.davis@example.com",
      customerName: "Jennifer Davis",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Screen has a crack across the bottom right corner but all functions work normally. Battery health is below optimal levels."
    },
    {
      id: "DEV_007",
      type: "Tablet",
      brand: "Samsung",
      model: "Galaxy Tab S7",
      condition: "Good",
      receivedDate: "2023-08-27T10:15:00",
      specs: {
        "Storage": "128GB",
        "Color": "Mystic Black",
        "Screen": "11-inch TFT LCD",
        "Accessories": "S Pen and charger included"
      },
      customerEmail: "robert.taylor@example.com",
      customerName: "Robert Taylor",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Tablet is in good condition with some light scratches on the screen protector (not on actual screen). S Pen works perfectly."
    },
    {
      id: "DEV_008",
      type: "Laptop",
      brand: "HP",
      model: "Spectre x360",
      condition: "Good",
      receivedDate: "2023-08-25T15:50:00",
      specs: {
        "Processor": "Intel Core i5-1135G7",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Display": "13.3-inch FHD Touchscreen",
        "Features": "2-in-1 convertible design"
      },
      customerEmail: "lisa.martinez@example.com",
      customerName: "Lisa Martinez",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Convertible laptop with touchscreen capability. Some wear on the keyboard but all keys function properly."
    },
    {
      id: "DEV_009",
      type: "Smartphone",
      brand: "Google",
      model: "Pixel 6",
      condition: "Excellent",
      receivedDate: "2023-08-22T09:30:00",
      specs: {
        "Storage": "128GB",
        "Color": "Stormy Black",
        "Screen": "6.4-inch OLED",
        "Battery Health": "95%",
        "Accessories": "Original charger and case"
      },
      customerEmail: "kevin.anderson@example.com",
      customerName: "Kevin Anderson",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Phone is in near-perfect condition with original accessories. Factory reset completed and battery health is excellent."
    },
    {
      id: "DEV_010",
      type: "Laptop",
      brand: "Lenovo",
      model: "ThinkPad X1 Carbon",
      condition: "Good",
      receivedDate: "2023-08-20T11:20:00",
      specs: {
        "Processor": "Intel Core i7-1165G7",
        "RAM": "16GB",
        "Storage": "1TB SSD",
        "Display": "14-inch 4K UHD",
        "Features": "Fingerprint reader, backlit keyboard"
      },
      customerEmail: "patricia.white@example.com",
      customerName: "Patricia White",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Business-class laptop in good condition. Includes power adapter and has minimal wear on the keyboard and trackpad."
    },
    {
      id: "DEV_011",
      type: "Smartphone",
      brand: "OnePlus",
      model: "9 Pro",
      condition: "Excellent",
      receivedDate: "2023-08-18T14:05:00",
      specs: {
        "Storage": "256GB",
        "Color": "Morning Mist",
        "Screen": "6.7-inch Fluid AMOLED",
        "Battery Health": "90%",
        "Accessories": "Original box, charger, and case"
      },
      customerEmail: "thomas.jackson@example.com",
      customerName: "Thomas Jackson",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Premium Android phone in excellent condition with all original accessories included. Factory reset completed."
    },
    {
      id: "DEV_012",
      type: "Tablet",
      brand: "Microsoft",
      model: "Surface Pro 8",
      condition: "Good",
      receivedDate: "2023-08-15T10:40:00",
      specs: {
        "Processor": "Intel Core i5-1135G7",
        "RAM": "8GB",
        "Storage": "256GB SSD",
        "Display": "13-inch PixelSense Flow",
        "Accessories": "Type Cover and Surface Pen"
      },
      customerEmail: "jessica.harris@example.com",
      customerName: "Jessica Harris",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Microsoft Surface tablet with keyboard cover and pen. Light wear on the Type Cover but tablet itself is in excellent condition."
    },
    {
      id: "DEV_013",
      type: "Other",
      brand: "Nintendo",
      model: "Switch OLED",
      condition: "Excellent",
      receivedDate: "2023-08-10T09:15:00",
      specs: {
        "Storage": "64GB",
        "Color": "White",
        "Screen": "7-inch OLED",
        "Accessories": "Dock, Joy-Cons, all cables",
        "Included": "Two physical games"
      },
      customerEmail: "susan.wilson@example.com",
      customerName: "Susan Wilson",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Gaming console in excellent condition with minimal use. Includes dock, controllers, and charging cables."
    },
    {
      id: "DEV_014",
      type: "Other",
      brand: "Sony",
      model: "PlayStation 5",
      condition: "Good",
      receivedDate: "2023-08-08T15:30:00",
      specs: {
        "Storage": "1TB SSD",
        "Version": "Disc Edition",
        "Controllers": "1 DualSense controller",
        "Accessories": "Power cable, HDMI cable",
        "Additional": "Stand included"
      },
      customerEmail: "daniel.rodriguez@example.com",
      customerName: "Daniel Rodriguez",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Console in good condition with some light scratches on the glossy center panel. All functions work properly."
    },
    {
      id: "DEV_015",
      type: "Other",
      brand: "Apple",
      model: "AirPods Pro",
      condition: "Good",
      receivedDate: "2023-08-05T13:25:00",
      specs: {
        "Generation": "1st Gen",
        "Case": "Wireless charging case",
        "Battery Health": "Approximately 4 hours of listening time",
        "Accessories": "All ear tips included",
        "Issues": "Minor scratches on case"
      },
      customerEmail: "richard.clark@example.com",
      customerName: "Richard Clark",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Wireless earbuds in good working condition. Charging case has some cosmetic wear but functions properly."
    },
    {
      id: "DEV_016",
      type: "Laptop",
      brand: "Asus",
      model: "ROG Zephyrus G14",
      condition: "Excellent",
      receivedDate: "2023-08-03T11:20:00",
      specs: {
        "Processor": "AMD Ryzen 9 5900HS",
        "RAM": "32GB",
        "Storage": "1TB NVMe SSD",
        "Display": "14-inch QHD 120Hz",
        "Graphics": "NVIDIA GeForce RTX 3060 6GB"
      },
      customerEmail: "alex.morgan@example.com",
      customerName: "Alex Morgan",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "High-performance gaming laptop in excellent condition. All original accessories included."
    },
    {
      id: "DEV_017",
      type: "Smartphone",
      brand: "Xiaomi",
      model: "Mi 11 Ultra",
      condition: "Good",
      receivedDate: "2023-08-01T15:40:00",
      specs: {
        "Storage": "256GB",
        "Color": "Ceramic White",
        "Screen": "6.81-inch AMOLED",
        "Battery": "5000mAh",
        "Camera": "50MP main + 48MP ultra-wide + 48MP telephoto"
      },
      customerEmail: "jason.lee@example.com",
      customerName: "Jason Lee",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Premium Android phone with excellent camera system. Minor wear on frame but screen is pristine."
    },
    {
      id: "DEV_018",
      type: "Tablet",
      brand: "Samsung",
      model: "Galaxy Tab S8 Ultra",
      condition: "Excellent",
      receivedDate: "2023-07-28T09:15:00",
      specs: {
        "Processor": "Snapdragon 8 Gen 1",
        "RAM": "16GB",
        "Storage": "512GB",
        "Display": "14.6-inch Super AMOLED",
        "Battery": "11200mAh"
      },
      customerEmail: "amanda.carter@example.com",
      customerName: "Amanda Carter",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Premium tablet in excellent condition with S Pen and keyboard cover. No visible wear."
    },
    {
      id: "DEV_019",
      type: "Other",
      brand: "Microsoft",
      model: "Xbox Series X",
      condition: "Good",
      receivedDate: "2023-07-25T14:10:00",
      specs: {
        "Storage": "1TB SSD",
        "Color": "Black",
        "Controllers": "2 wireless controllers",
        "Accessories": "HDMI cable, power cable",
        "Additional": "3 games included"
      },
      customerEmail: "brian.smith@example.com",
      customerName: "Brian Smith",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Console in good condition with minimal signs of use. All original accessories included plus extra controller."
    },
    {
      id: "DEV_020",
      type: "Laptop",
      brand: "Apple",
      model: "MacBook Air M2",
      condition: "Excellent",
      receivedDate: "2023-07-20T10:30:00",
      specs: {
        "Processor": "Apple M2",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Display": "13.6-inch Liquid Retina",
        "Color": "Midnight"
      },
      customerEmail: "michelle.zhang@example.com",
      customerName: "Michelle Zhang",
      images: [
        "../images/placeholder-device.jpg"
      ],
      notes: "Latest model MacBook Air in pristine condition. Less than 20 battery cycles. All original packaging included."
    }
  ];
}

// Create a table row for a device
function createDeviceTableRow(device) {
  const row = document.createElement("tr");
  row.dataset.id = device.id;
  row.dataset.type = device.type;
  
  // Determine display name
  const brand = device.brand || "";
  const model = device.model || device.device || "Unknown Device";
  const deviceName = brand ? `${brand} ${model}` : model;
  
  // Format date - Use the appropriate date field (receivedDate instead of date)
  const date = new Date(device.receivedDate || device.date || new Date()).toLocaleDateString();
  
  // Create cells
  row.innerHTML = `
    <td>
      <div class="d-flex align-items-center">
        <div class="me-3">
          <i class="${getDeviceIcon(device.type)} fa-lg text-primary"></i>
        </div>
        <div>
          <div class="fw-bold">${deviceName}</div>
          <div class="small text-muted">${device.id}</div>
        </div>
      </div>
    </td>
    <td>
      <span class="badge ${getCategoryBadgeClass(device.type)}">${device.type}</span>
    </td>
    <td>
      <span class="badge ${getConditionBadgeClass(device.condition)}">${device.condition}</span>
    </td>
    <td>${date}</td>
    <td>
      <div class="d-flex align-items-center">
        <div class="user-avatar small me-2">
          <span>${getInitialsFromName(device.customerName?.split(' ')[0] || '', device.customerName?.split(' ')[1] || '')}</span>
        </div>
        <div>
          <div class="small fw-bold">${device.customerName || 'Unknown'}</div>
          <div class="small text-muted">${device.customerEmail || 'N/A'}</div>
        </div>
      </div>
    </td>
    <td>
      <div class="btn-group">
        <button class="device-details-btn" data-id="${device.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button class="device-print-btn" data-id="${device.id}" title="Print Info">
          <i class="fas fa-print"></i>
        </button>
      </div>
    </td>
  `;
  
  // Add event listeners
  const detailsBtn = row.querySelector('.device-details-btn');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', function() {
      showDeviceDetails(device);
    });
  }
  
  const printBtn = row.querySelector('.device-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      printDeviceInfo(device);
    });
  }
  
  return row;
}

// Show device details in a modal
function showDeviceDetails(device) {
  console.log("Showing details for device:", device);
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('deviceDetailsModal');
  if (!modal) {
    const modalHTML = `
      <div class="modal fade device-details-modal" id="deviceDetailsModal" tabindex="-1" aria-labelledby="deviceDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="deviceDetailsModalLabel">Device Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="detail-section device-info">
                <h6><i class="fas fa-info-circle me-2"></i>Device Information</h6>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Device ID</div>
                      <div class="detail-value" id="deviceId"></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Type</div>
                      <div class="detail-value" id="deviceType"></div>
                    </div>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Brand</div>
                      <div class="detail-value" id="deviceBrand"></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Model</div>
                      <div class="detail-value" id="deviceModel"></div>
                    </div>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Condition</div>
                      <div class="detail-value" id="deviceCondition"></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Received Date</div>
                      <div class="detail-value" id="deviceDate"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="detail-section user-info">
                <h6><i class="fas fa-user me-2"></i>Recycled By</h6>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Name</div>
                      <div class="detail-value" id="userName"></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Email</div>
                      <div class="detail-value" id="userEmail"></div>
                    </div>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Notes</div>
                      <div class="detail-value" id="deviceNotes"></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="detail-item">
                      <div class="detail-label">Value</div>
                      <div class="detail-value" id="deviceValue"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="detail-section specs-info">
                <h6><i class="fas fa-microchip me-2"></i>Device Specifications</h6>
                <div id="specsContainer">
                  <p class="text-muted">No specific details available for this device.</p>
                </div>
              </div>
              
              <div class="detail-section images-info">
                <h6><i class="fas fa-images me-2"></i>Device Images</h6>
                <div id="imagesContainer" class="device-images">
                  <p class="text-muted">No images available for this device.</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="printDeviceBtn">
                <i class="fas fa-print me-1"></i> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('deviceDetailsModal');
    
    // Add print button event listener
    document.getElementById('printDeviceBtn').addEventListener('click', function() {
      printDeviceInfo(device);
    });
  }
  
  // Populate modal with device data
  const deviceId = document.getElementById('deviceId');
  const deviceType = document.getElementById('deviceType');
  const deviceBrand = document.getElementById('deviceBrand');
  const deviceModel = document.getElementById('deviceModel');
  const deviceCondition = document.getElementById('deviceCondition');
  const deviceDate = document.getElementById('deviceDate');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const deviceNotes = document.getElementById('deviceNotes');
  const deviceValue = document.getElementById('deviceValue');
  const specsContainer = document.getElementById('specsContainer');
  const imagesContainer = document.getElementById('imagesContainer');
  
  // Update content
  if (deviceId) deviceId.textContent = device.id || 'N/A';
  if (deviceType) deviceType.textContent = device.type || 'Unknown';
  if (deviceBrand) deviceBrand.textContent = device.brand || 'N/A';
  if (deviceModel) deviceModel.textContent = device.model || device.device || 'Unknown';
  if (deviceCondition) {
    const conditionText = device.condition || 'Unknown';
    deviceCondition.innerHTML = `<span class="badge ${getConditionBadgeClass(device.condition)}">${conditionText}</span>`;
  }
  if (deviceDate) deviceDate.textContent = new Date(device.receivedDate || device.date || new Date()).toLocaleDateString();
  if (userName) userName.textContent = device.customerName || 'Unknown';
  if (userEmail) userEmail.textContent = device.customerEmail || 'N/A';
  if (deviceNotes) deviceNotes.textContent = device.notes || 'No notes available';
  
  // Set device value
  if (deviceValue) {
    deviceValue.textContent = 'Estimated value: Not evaluated';
  }
  
  // Update specs
  if (specsContainer) {
    if (device.specs && Object.keys(device.specs).length > 0) {
      let specsHTML = '<div class="specs-grid">';
      
      Object.entries(device.specs).forEach(([key, value]) => {
        specsHTML += `
          <div class="spec-item">
            <div class="spec-label">${key}</div>
            <div class="spec-value">${value}</div>
          </div>
        `;
      });
      
      specsHTML += '</div>';
      specsContainer.innerHTML = specsHTML;
    } else {
      specsContainer.innerHTML = '<p class="text-muted">No specific details available for this device.</p>';
    }
  }
  
  // Update images
  if (imagesContainer) {
    if (device.images && device.images.length > 0) {
      let imagesHTML = '';
      
      device.images.forEach(image => {
        imagesHTML += `
          <div class="device-image-thumbnail" onclick="enlargeImage('${image}')">
            <img src="${image}" alt="Device image" loading="lazy">
          </div>
        `;
      });
      
      imagesContainer.innerHTML = imagesHTML;
    } else {
      imagesContainer.innerHTML = '<p class="text-muted">No images available for this device.</p>';
    }
  }
  
  // Show modal
  const modalElement = new bootstrap.Modal(modal);
  modalElement.show();
}

// Update inventory stats
function updateInventoryStats(devices) {
  console.log("Updating inventory stats with", devices.length, "devices");
  
  // Count devices by type
  const phonesCount = devices.filter(d => d.type === 'Smartphone').length;
  const laptopsCount = devices.filter(d => d.type === 'Laptop').length;
  const tabletsCount = devices.filter(d => d.type === 'Tablet').length;
  const otherCount = devices.filter(d => d.type === 'Other').length;
  
  console.log("Device counts - Phones:", phonesCount, "Laptops:", laptopsCount, "Tablets:", tabletsCount, "Other:", otherCount);
  
  // Update the count displays with staggered animations
  const phoneDisplay = document.getElementById('phonesCount');
  const laptopDisplay = document.getElementById('laptopsCount');
  const tabletDisplay = document.getElementById('tabletsCount');
  const otherDisplay = document.getElementById('otherDevicesCount');
  
  // Debug element existence
  if (!phoneDisplay) console.warn("phonesCount element not found");
  if (!laptopDisplay) console.warn("laptopsCount element not found");
  if (!tabletDisplay) console.warn("tabletsCount element not found");
  if (!otherDisplay) console.warn("otherDevicesCount element not found");
  
  // Reset all counter animations before starting new ones
  if (phoneDisplay) phoneDisplay.classList.remove('animate-count');
  if (laptopDisplay) laptopDisplay.classList.remove('animate-count');
  if (tabletDisplay) tabletDisplay.classList.remove('animate-count');
  if (otherDisplay) otherDisplay.classList.remove('animate-count');
  
  // Add a small delay between each counter animation for better visual effect
  setTimeout(() => {
    if (phoneDisplay) {
      const prevValue = parseInt(phoneDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(phoneDisplay, prevValue, phonesCount);
    }
  }, 0);
  
  setTimeout(() => {
    if (laptopDisplay) {
      const prevValue = parseInt(laptopDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(laptopDisplay, prevValue, laptopsCount);
    }
  }, 300);
  
  setTimeout(() => {
    if (tabletDisplay) {
      const prevValue = parseInt(tabletDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(tabletDisplay, prevValue, tabletsCount);
    }
  }, 600);
  
  setTimeout(() => {
    if (otherDisplay) {
      const prevValue = parseInt(otherDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
      animateCounter(otherDisplay, prevValue, otherCount);
    }
  }, 900);
  
  // Update filter counts
  setTimeout(() => {
    updateInventoryFilterCounts();
  }, 1200);
}

// Update counts on filter buttons
function updateInventoryFilterCounts() {
  // Get all devices
  const devices = getAllDevices();
  
  // Count by type
  const counts = {
    all: devices.length,
    Smartphone: devices.filter(d => d.type === 'Smartphone').length,
    Laptop: devices.filter(d => d.type === 'Laptop').length,
    Tablet: devices.filter(d => d.type === 'Tablet').length,
    Other: devices.filter(d => d.type === 'Other').length
  };
  
  // Update the filter buttons
  document.querySelectorAll('.inventory-filter').forEach(button => {
    const filter = button.dataset.filter;
    const countBadge = button.querySelector('.filter-count');
    
    if (countBadge) {
      // Update existing badge
      const oldCount = parseInt(countBadge.textContent);
      const newCount = counts[filter];
      
      if (oldCount !== newCount) {
        countBadge.textContent = newCount;
        countBadge.classList.add('count-changed');
        
        // Remove animation class after animation completes
        setTimeout(() => {
          countBadge.classList.remove('count-changed');
        }, 1000);
      }
    } else {
      // Create new badge
      const badge = document.createElement('span');
      badge.className = 'filter-count ms-2';
      badge.textContent = counts[filter];
      button.appendChild(badge);
    }
    
    // Add "empty" class if count is zero
    const badge = button.querySelector('.filter-count');
    if (badge) {
      if (counts[filter] === 0) {
        badge.classList.add('empty');
      } else {
        badge.classList.remove('empty');
      }
    }
  });
}

// Setup inventory type filter
function setupInventoryTypeFilter() {
  const filterButtons = document.querySelectorAll('.inventory-filter');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Apply filter
      const filter = this.dataset.filter;
      applyInventoryFilter(filter);
    });
  });
  
  // Set initial active state
  const allFilterBtn = document.querySelector('.inventory-filter[data-filter="all"]');
  if (allFilterBtn) {
    allFilterBtn.classList.add('active');
  }
}

// Apply inventory filter
function applyInventoryFilter(filterValue) {
  console.log("Applying inventory filter:", filterValue);
  
  if (typeof $ !== "undefined" && $.fn.dataTable) {
    // If DataTables is available, use its search/filter
    const table = $('#inventoryTable').DataTable();
    
    if (filterValue === 'all') {
      table.search('').columns(1).search('').draw();
    } else {
      table.search('').columns(1).search(filterValue).draw();
    }
  } else {
    // Fallback to manual filtering
    const rows = document.querySelectorAll('#inventoryTableBody tr');
    
    rows.forEach(row => {
      if (filterValue === 'all' || row.dataset.type === filterValue) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
}

// Helper functions for device display

// Get icon for device type
function getDeviceIcon(type) {
  switch (type) {
    case 'Smartphone': return 'fas fa-mobile-alt';
    case 'Laptop': return 'fas fa-laptop';
    case 'Tablet': return 'fas fa-tablet-alt';
    case 'Other': return 'fas fa-microchip';
    default: return 'fas fa-cube';
  }
}

// Get badge class for device category
function getCategoryBadgeClass(type) {
  switch (type) {
    case 'Smartphone': return 'bg-primary';
    case 'Laptop': return 'bg-info';
    case 'Tablet': return 'bg-success';
    case 'Other': return 'bg-warning';
    default: return 'bg-secondary';
  }
}

// Get badge class for device condition
function getConditionBadgeClass(condition) {
  switch (condition) {
    case 'Excellent': return 'bg-success';
    case 'Good': return 'bg-info';
    case 'Fair': return 'bg-warning';
    case 'Poor': return 'bg-danger';
    default: return 'bg-secondary';
  }
}