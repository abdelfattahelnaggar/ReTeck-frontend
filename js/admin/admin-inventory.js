// Admin Inventory Management Functions

// Add custom styles for the device details button
const deviceDetailsButtonStyle = document.createElement('style');
deviceDetailsButtonStyle.textContent = `
  .device-details-btn {
    border-radius: 20px !important;
    padding: 4px 12px !important;
    transition: all 0.3s ease !important;
    border: 1px solid #4361ee !important;
    color: #4361ee !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  
  .device-details-btn:hover {
    background: linear-gradient(135deg, #4361ee, #3a0ca3) !important;
    color: white !important;
    box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3) !important;
    transform: translateY(-2px);
  }
  
  .device-details-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(67, 97, 238, 0.3) !important;
  }
  
  .device-details-btn i {
    margin-right: 4px;
  }
`;
document.head.appendChild(deviceDetailsButtonStyle);

// Load inventory data
function loadInventory() {
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get all devices (using dummy data for now)
  const devices = getDummyDevices();

  // Add rows to table
  devices.forEach((device) => {
    const row = createDeviceTableRow(device);
    tableBody.appendChild(row);
  });

  // Initialize inventory filters
  initializeInventoryFilters();

  // Update inventory statistics
  updateInventoryStats(devices);

  // Initialize DataTable if jQuery is available
  if (typeof $ !== "undefined") {
    if ($.fn.dataTable.isDataTable("#inventoryTable")) {
      $("#inventoryTable").DataTable().destroy();
    }
    
    $("#inventoryTable").DataTable({
      order: [[3, "desc"]], // Order by received date
      responsive: true,
      language: {
        search: "<i class='fas fa-search'></i>",
        searchPlaceholder: "Search devices...",
        paginate: {
          next: '<i class="fas fa-chevron-right"></i>',
          previous: '<i class="fas fa-chevron-left"></i>'
        }
      }
    });
  }

  // Update filter counts (showing numbers in the filter buttons)
  updateInventoryFilterCounts();
}

// Initialize inventory filters
function initializeInventoryFilters() {
  const filterButtons = document.querySelectorAll(".inventory-filter");
  
  filterButtons.forEach(button => {
    button.addEventListener("click", function() {
      const filterValue = this.getAttribute("data-filter");
      
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      
      // Apply the filter
      applyInventoryFilter(filterValue);
      
      // Update the filter counts
      updateInventoryFilterCounts();
    });
  });
  
  // Set "All" filter as active by default
  const allFilterBtn = document.querySelector('.inventory-filter[data-filter="all"]');
  if (allFilterBtn) {
    allFilterBtn.classList.add("active");
  }
}

// Create table row for a device
function createDeviceTableRow(device) {
  const row = document.createElement("tr");
  row.setAttribute("data-device-id", device.id);
  row.setAttribute("data-device-type", device.type);
  
  const deviceIcon = getDeviceIcon(device.type);
  const categoryBadgeClass = getCategoryBadgeClass(device.type);
  const conditionBadgeClass = getConditionBadgeClass(device.condition);
  
  // Format date to display nicely
  const receivedDate = new Date(device.receivedDate);
  const formattedDate = receivedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  row.innerHTML = `
    <td>
      <div class="d-flex align-items-center">
        <i class="${deviceIcon} me-2 text-primary"></i>
        <div>
          <div class="fw-bold">${device.brand} ${device.model}</div>
          <div class="small text-muted">${device.specs.storage || 'N/A'}</div>
        </div>
      </div>
    </td>
    <td><span class="badge ${categoryBadgeClass}">${device.type}</span></td>
    <td><span class="badge ${conditionBadgeClass}">${device.condition}</span></td>
    <td>${formattedDate}</td>
    <td>
      <div class="d-flex align-items-center">
        <div class="user-avatar small me-2">
          <div class="avatar-text">${device.user.firstName.charAt(0)}${device.user.lastName.charAt(0)}</div>
        </div>
        <div>
          <div class="small fw-bold">${device.user.firstName} ${device.user.lastName}</div>
          <div class="small text-muted">${device.user.email}</div>
        </div>
      </div>
    </td>
    <td>
      <div class="btn-group">
        <button class="btn btn-sm device-details-btn" onclick="showDeviceDetails('${device.id}')">
          <i class="fas fa-eye"></i> View
        </button>
      </div>
    </td>
  `;
  
  return row;
}

// Show device details in modal
function showDeviceDetails(deviceId) {
  // Find the device in our data
  const devices = getDummyDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) {
    console.error("Device not found:", deviceId);
    return;
  }
  
  // Populate modal with device information
  document.getElementById("modalDeviceType").textContent = device.type;
  document.getElementById("modalDeviceModel").textContent = `${device.brand} ${device.model}`;
  document.getElementById("modalDeviceCondition").textContent = device.condition;
  
  // Format received date
  const receivedDate = new Date(device.receivedDate);
  document.getElementById("modalDeviceDate").textContent = receivedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  // User information
  document.getElementById("modalDeviceUser").textContent = `${device.user.firstName} ${device.user.lastName}`;
  document.getElementById("modalDeviceUserEmail").textContent = device.user.email;
  
  // Device specifications
  const specsElement = document.getElementById("modalDeviceSpecs");
  specsElement.innerHTML = "";
  
  if (device.specs) {
    const specsList = document.createElement("ul");
    specsList.className = "list-group list-group-flush mb-3";
    
    for (const [key, value] of Object.entries(device.specs)) {
      if (value) {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        
        // Format spec name with proper capitalization
        const specName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        
        listItem.innerHTML = `
          <span class="spec-name"><i class="fas fa-microchip me-2"></i>${specName}</span>
          <span class="spec-value badge bg-light text-dark">${value}</span>
        `;
        
        specsList.appendChild(listItem);
      }
    }
    
    specsElement.appendChild(specsList);
  }
  
  // Device images (if any)
  const imageGallery = document.getElementById("modalDeviceImageGallery");
  imageGallery.innerHTML = "";
  
  if (device.images && device.images.length > 0) {
    device.images.forEach(imageSrc => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "device-image-thumbnail";
      imgContainer.innerHTML = `
        <img src="${imageSrc}" alt="${device.brand} ${device.model}" onclick="enlargeImage('${imageSrc}')">
      `;
      imageGallery.appendChild(imgContainer);
    });
  } else {
    imageGallery.innerHTML = '<div class="text-center text-muted">No images available</div>';
  }
  
  // Value information
  document.getElementById("modalDeviceValue").textContent = device.value || "0.00";
  document.getElementById("modalDevicePoints").textContent = device.pointsAwarded || 0;
  document.getElementById("modalDeviceId").textContent = device.id;
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("deviceDetailsModal"));
  modal.show();
}

// Update inventory statistics
function updateInventoryStats(devices) {
  // Count devices by type
  const phonesCount = devices.filter(d => d.type === "Smartphone").length;
  const laptopsCount = devices.filter(d => d.type === "Laptop").length;
  const tabletsCount = devices.filter(d => d.type === "Tablet").length;
  const otherCount = devices.filter(d => !["Smartphone", "Laptop", "Tablet"].includes(d.type)).length;
  
  // Update count elements
  const phoneCountEl = document.getElementById("phonesCount");
  const laptopCountEl = document.getElementById("laptopsCount");
  const tabletCountEl = document.getElementById("tabletsCount");
  const otherCountEl = document.getElementById("otherDevicesCount");
  
  if (phoneCountEl) animateCounter(phoneCountEl, 0, phonesCount);
  if (laptopCountEl) animateCounter(laptopCountEl, 0, laptopsCount);
  if (tabletCountEl) animateCounter(tabletCountEl, 0, tabletsCount);
  if (otherCountEl) animateCounter(otherCountEl, 0, otherCount);
}

// Update inventory filter counts (showing numbers in filter buttons)
function updateInventoryFilterCounts() {
  const devices = getDummyDevices();
  
  // Count devices by type
  const allCount = devices.length;
  const phonesCount = devices.filter(d => d.type === "Smartphone").length;
  const laptopsCount = devices.filter(d => d.type === "Laptop").length;
  const tabletsCount = devices.filter(d => d.type === "Tablet").length;
  const otherCount = devices.filter(d => !["Smartphone", "Laptop", "Tablet"].includes(d.type)).length;
  
  // Update the filter buttons with count badges
  const filterButtons = document.querySelectorAll(".inventory-filter");
  
  filterButtons.forEach(button => {
    const filterType = button.getAttribute("data-filter");
    let count = 0;
    
    switch (filterType) {
      case "all":
        count = allCount;
        break;
      case "Smartphone":
        count = phonesCount;
        break;
      case "Laptop":
        count = laptopsCount;
        break;
      case "Tablet":
        count = tabletsCount;
        break;
      case "Other":
        count = otherCount;
        break;
    }
    
    // Check if button already has a count element
    let countElement = button.querySelector(".filter-count");
    
    if (!countElement) {
      // Create count element if it doesn't exist
      countElement = document.createElement("span");
      countElement.className = "filter-count ms-1";
      button.appendChild(countElement);
    }
    
    // Update count and add/remove empty class
    if (count === 0) {
      countElement.classList.add("empty");
    } else {
      countElement.classList.remove("empty");
    }
    
    // Add animation class if count changed
    const currentCount = parseInt(countElement.textContent) || 0;
    if (currentCount !== count) {
      countElement.classList.add("count-changed");
      setTimeout(() => {
        countElement.classList.remove("count-changed");
      }, 500);
    }
    
    countElement.textContent = count;
  });
}

// Apply filter to inventory table
function applyInventoryFilter(filterValue) {
  const rows = document.querySelectorAll("#inventoryTableBody tr");
  
  rows.forEach(row => {
    const deviceType = row.getAttribute("data-device-type");
    
    if (filterValue === "all" || deviceType === filterValue || 
        (filterValue === "Other" && !["Smartphone", "Laptop", "Tablet"].includes(deviceType))) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Helper function for device icons
function getDeviceIcon(type) {
  switch (type) {
    case "Smartphone": return "fas fa-mobile-alt";
    case "Laptop": return "fas fa-laptop";
    case "Tablet": return "fas fa-tablet-alt";
    default: return "fas fa-microchip";
  }
}

// Helper function for category badges
function getCategoryBadgeClass(type) {
  switch (type) {
    case "Smartphone": return "bg-primary";
    case "Laptop": return "bg-info";
    case "Tablet": return "bg-success";
    default: return "bg-secondary";
  }
}

// Helper function for condition badges
function getConditionBadgeClass(condition) {
  switch (condition) {
    case "Excellent": return "bg-success";
    case "Good": return "bg-info";
    case "Fair": return "bg-warning";
    case "Poor": return "bg-danger";
    default: return "bg-secondary";
  }
}

// Get dummy devices data for testing
function getDummyDevices() {
  return [
    {
      id: "REC12345",
      type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13 Pro",
      condition: "Excellent",
      receivedDate: "2023-10-15",
      value: "350.00",
      pointsAwarded: 3500,
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com"
      },
      specs: {
        color: "Sierra Blue",
        storage: "256GB",
        processor: "A15 Bionic",
        ram: "6GB",
        screen: "6.1-inch Super Retina XDR",
        battery: "3095 mAh"
      },
      images: [
        "https://placehold.co/400x600?text=iPhone+13+Pro+Front",
        "https://placehold.co/400x600?text=iPhone+13+Pro+Back"
      ]
    },
    {
      id: "REC12346",
      type: "Laptop",
      brand: "Dell",
      model: "XPS 15",
      condition: "Good",
      receivedDate: "2023-09-28",
      value: "650.00",
      pointsAwarded: 6500,
      user: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com"
      },
      specs: {
        processor: "Intel Core i7-11800H",
        ram: "16GB DDR4",
        storage: "512GB SSD",
        screen: "15.6-inch 4K OLED",
        graphics: "NVIDIA GeForce RTX 3050 Ti",
        battery: "6-cell 86Wh"
      },
      images: [
        "https://placehold.co/600x400?text=Dell+XPS+15+Front",
        "https://placehold.co/600x400?text=Dell+XPS+15+Side"
      ]
    },
    {
      id: "REC12347",
      type: "Tablet",
      brand: "Samsung",
      model: "Galaxy Tab S7+",
      condition: "Excellent",
      receivedDate: "2023-10-05",
      value: "450.00",
      pointsAwarded: 4500,
      user: {
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.j@example.com"
      },
      specs: {
        processor: "Snapdragon 865+",
        ram: "8GB",
        storage: "256GB",
        screen: "12.4-inch Super AMOLED",
        battery: "10,090 mAh"
      },
      images: [
        "https://placehold.co/600x400?text=Galaxy+Tab+S7+Front"
      ]
    },
    {
      id: "REC12348",
      type: "Smartphone",
      brand: "Samsung",
      model: "Galaxy S22 Ultra",
      condition: "Good",
      receivedDate: "2023-10-10",
      value: "400.00",
      pointsAwarded: 4000,
      user: {
        firstName: "Emily",
        lastName: "Wilson",
        email: "emily.w@example.com"
      },
      specs: {
        color: "Phantom Black",
        storage: "512GB",
        processor: "Exynos 2200",
        ram: "12GB",
        screen: "6.8-inch Dynamic AMOLED 2X",
        battery: "5000 mAh"
      },
      images: [
        "https://placehold.co/400x600?text=Galaxy+S22+Ultra"
      ]
    },
    {
      id: "REC12349",
      type: "Laptop",
      brand: "Apple",
      model: "MacBook Pro M1",
      condition: "Excellent",
      receivedDate: "2023-09-15",
      value: "800.00",
      pointsAwarded: 8000,
      user: {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.b@example.com"
      },
      specs: {
        processor: "Apple M1 Pro",
        ram: "16GB",
        storage: "1TB SSD",
        screen: "14-inch Liquid Retina XDR",
        battery: "70Wh"
      },
      images: [
        "https://placehold.co/600x400?text=MacBook+Pro+Front",
        "https://placehold.co/600x400?text=MacBook+Pro+Side"
      ]
    },
    {
      id: "REC12350",
      type: "Other",
      brand: "Apple",
      model: "Apple Watch Series 7",
      condition: "Fair",
      receivedDate: "2023-10-02",
      value: "180.00",
      pointsAwarded: 1800,
      user: {
        firstName: "Sarah",
        lastName: "Davis",
        email: "sarah.d@example.com"
      },
      specs: {
        size: "45mm",
        connectivity: "GPS + Cellular",
        color: "Midnight",
        display: "Always-On Retina LTPO OLED",
        battery: "18 hours"
      },
      images: [
        "https://placehold.co/400x400?text=Apple+Watch+Series+7"
      ]
    },
    {
      id: "REC12351",
      type: "Tablet",
      brand: "Apple",
      model: "iPad Pro 12.9",
      condition: "Good",
      receivedDate: "2023-09-20",
      value: "700.00",
      pointsAwarded: 7000,
      user: {
        firstName: "David",
        lastName: "Miller",
        email: "david.m@example.com"
      },
      specs: {
        processor: "Apple M1",
        ram: "8GB",
        storage: "256GB",
        screen: "12.9-inch Liquid Retina XDR",
        battery: "40.88Wh"
      },
      images: [
        "https://placehold.co/600x400?text=iPad+Pro+12.9"
      ]
    },
    {
      id: "REC12352",
      type: "Other",
      brand: "Sony",
      model: "PlayStation 5",
      condition: "Excellent",
      receivedDate: "2023-10-01",
      value: "350.00",
      pointsAwarded: 3500,
      user: {
        firstName: "Kevin",
        lastName: "Taylor",
        email: "kevin.t@example.com"
      },
      specs: {
        processor: "Custom AMD Zen 2",
        gpu: "Custom RDNA 2",
        ram: "16GB GDDR6",
        storage: "825GB SSD",
        resolution: "4K"
      },
      images: [
        "https://placehold.co/600x400?text=PlayStation+5"
      ]
    },
    {
      id: "REC12353",
      type: "Smartphone",
      brand: "Google",
      model: "Pixel 6 Pro",
      condition: "Fair",
      receivedDate: "2023-09-25",
      value: "280.00",
      pointsAwarded: 2800,
      user: {
        firstName: "Jessica",
        lastName: "Martinez",
        email: "jessica.m@example.com"
      },
      specs: {
        color: "Stormy Black",
        storage: "128GB",
        processor: "Google Tensor",
        ram: "12GB",
        screen: "6.7-inch LTPO OLED",
        battery: "5003 mAh"
      },
      images: [
        "https://placehold.co/400x600?text=Pixel+6+Pro"
      ]
    },
    {
      id: "REC12354",
      type: "Laptop",
      brand: "HP",
      model: "Spectre x360",
      condition: "Good",
      receivedDate: "2023-10-12",
      value: "550.00",
      pointsAwarded: 5500,
      user: {
        firstName: "Thomas",
        lastName: "Anderson",
        email: "thomas.a@example.com"
      },
      specs: {
        processor: "Intel Core i7-1165G7",
        ram: "16GB",
        storage: "1TB SSD",
        screen: "13.5-inch OLED Touch",
        graphics: "Intel Iris Xe",
        battery: "66Wh"
      },
      images: [
        "https://placehold.co/600x400?text=HP+Spectre+x360"
      ]
    }
  ];
}

// Print device information (for the print button)
function printDeviceInfo(device) {
  const printWindow = window.open('', '_blank');
  
  // Create the print content with proper styling
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Device Details - ${device.brand} ${device.model}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid #4361ee;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #4361ee;
        }
        .print-heading {
          font-size: 20px;
          margin: 15px 0;
          color: #4361ee;
        }
        .detail-section {
          margin-bottom: 20px;
        }
        .detail-row {
          display: flex;
          border-bottom: 1px solid #eee;
          padding: 8px 0;
        }
        .detail-label {
          flex: 0 0 200px;
          font-weight: bold;
        }
        .detail-value {
          flex: 1;
        }
        .specs-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .specs-list li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .device-id {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        @media print {
          @page { margin: 0.5cm; }
          body { font-size: 12pt; }
          .print-header { margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <div class="company-name">RETECH</div>
        <div>Recycled Electronics Technology</div>
      </div>
      
      <h2 class="print-heading">Device Information</h2>
      <div class="detail-section">
        <div class="detail-row">
          <div class="detail-label">Category:</div>
          <div class="detail-value">${device.type}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Brand & Model:</div>
          <div class="detail-value">${device.brand} ${device.model}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Condition:</div>
          <div class="detail-value">${device.condition}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Received Date:</div>
          <div class="detail-value">${new Date(device.receivedDate).toLocaleDateString()}</div>
        </div>
      </div>
      
      <h2 class="print-heading">Recycled By</h2>
      <div class="detail-section">
        <div class="detail-row">
          <div class="detail-label">User:</div>
          <div class="detail-value">${device.user.firstName} ${device.user.lastName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email:</div>
          <div class="detail-value">${device.user.email}</div>
        </div>
      </div>
      
      <h2 class="print-heading">Device Specifications</h2>
      <div class="detail-section">
        <ul class="specs-list">
          ${Object.entries(device.specs).map(([key, value]) => {
            if (value) {
              const specName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              return `<li><div class="detail-row">
                <div class="detail-label">${specName}:</div>
                <div class="detail-value">${value}</div>
              </div></li>`;
            }
            return '';
          }).join('')}
        </ul>
      </div>
      
      <h2 class="print-heading">Value & Recycling Info</h2>
      <div class="detail-section">
        <div class="detail-row">
          <div class="detail-label">Quoted Value:</div>
          <div class="detail-value">$${device.value || "0.00"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Points Awarded:</div>
          <div class="detail-value">${device.pointsAwarded || 0}</div>
        </div>
      </div>
      
      <div class="device-id">
        Recycling ID: ${device.id}
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

// Initialize print functionality
document.addEventListener('DOMContentLoaded', function() {
  const printButton = document.getElementById('printDeviceDetailsBtn');
  if (printButton) {
    printButton.addEventListener('click', function() {
      const deviceId = document.getElementById('modalDeviceId').textContent;
      const devices = getDummyDevices();
      const device = devices.find(d => d.id === deviceId);
      
      if (device) {
        printDeviceInfo(device);
      }
    });
  }
}); 