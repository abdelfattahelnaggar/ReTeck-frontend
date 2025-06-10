/**
 * RETECH - Recycling Company Dashboard JavaScript
 *
 * This file contains the logic for the recycling company dashboard,
 * including device listing, filtering, cart functionality, and more.
 */

// Global variables
let allDevices = [];
let filteredDevices = [];
let cart = [];
let currentPage = 1;
const devicesPerPage = 10;

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the dashboard
  initializeDashboard();

  // Set up event listeners
  setupEventListeners();

  // Load cart from localStorage
  loadCart();

  // Update UI elements
  updateCartCount();
  updateStatistics();
});

/**
 * Initialize the dashboard with data and setup
 */
function initializeDashboard() {
  // Load sample devices for testing
  loadSampleDevices();

  // Apply initial filters
  applyFilters();

  // Render the devices list
  renderDevicesList();

  // Display toast notification if redirected from cart or orders page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("success") && urlParams.has("message")) {
    showNotification(urlParams.get("message"), "Success");
  }
}

/**
 * Load sample devices for testing
 */
function loadSampleDevices() {
  // Check if devices already exist in localStorage
  const storedDevices = localStorage.getItem("recyclingDevices");

  if (storedDevices) {
    allDevices = JSON.parse(storedDevices);
    return;
  }

  // Sample devices data
  allDevices = [
    {
      id: 1,
      name: "Apple iPhone 12 Pro",
      type: "phone",
      image: "../images/placeholder-image.jpg",
      brand: "Apple",
      model: "iPhone 12 Pro",
      condition: "Good - Minor wear",
      storage: "128GB",
      accessories: ["Charger", "Original Box"],
      customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "555-123-4567",
      },
      shippingMethod: "pickup",
      location: "123 Main St, Eco City, EC 12345",
      dateReceived: "2023-06-15T10:30:00",
      status: "received",
      description:
        "This iPhone 12 Pro is in good condition with minor scratches on the back glass. The device has been factory reset and is ready for recycling. All features are working properly.",
    },
    {
      id: 2,
      name: "Dell XPS 15",
      type: "laptop",
      image: "../images/placeholder-image.jpg",
      brand: "Dell",
      model: "XPS 15",
      condition: "Excellent - Like new",
      storage: "512GB SSD",
      processor: "Intel i7",
      ram: "16GB",
      accessories: ["Charger", "Original Box", "Case"],
      customer: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "555-987-6543",
      },
      shippingMethod: "visit",
      location: "RETECH Service Center",
      dateReceived: "2023-06-12T14:15:00",
      status: "received",
      description:
        "The Dell XPS 15 is in excellent condition, like new. It has minimal signs of use and all functions work perfectly. The laptop has been reset to factory settings.",
    },
    {
      id: 3,
      name: "Samsung Refrigerator",
      type: "kitchen",
      image: "../images/placeholder-image.jpg",
      brand: "Samsung",
      model: "RF28R7551SR",
      condition: "Fair - Works but has issues",
      accessories: [],
      customer: {
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        phone: "555-555-5555",
      },
      shippingMethod: "pickup",
      location: "456 Green Ave, Eco City, EC 12345",
      dateReceived: "2023-06-10T09:00:00",
      status: "pending",
      description:
        "The Samsung refrigerator is in fair condition. The cooling function works properly, but the ice maker is not functioning. The exterior has some scratches and dents.",
    },
    {
      id: 4,
      name: 'Sony BRAVIA 55" TV',
      type: "electronics",
      image: "../images/placeholder-image.jpg",
      brand: "Sony",
      model: "BRAVIA XR-55A80J",
      condition: "Good - Works well",
      accessories: ["Remote", "Power Cable", "Wall Mount"],
      customer: {
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        phone: "555-111-2222",
      },
      shippingMethod: "pickup",
      location: "789 Oak St, Eco City, EC 12345",
      dateReceived: "2023-06-08T13:45:00",
      status: "received",
      description:
        "The Sony BRAVIA TV is in good working condition. The screen has no dead pixels or burn-in issues. The remote control works perfectly and all ports are functional.",
    },
    {
      id: 5,
      name: "HP LaserJet Printer",
      type: "electronics",
      image: "../images/placeholder-image.jpg",
      brand: "HP",
      model: "LaserJet Pro M404dn",
      condition: "Fair - Works but has issues",
      accessories: ["Power Cable", "USB Cable"],
      customer: {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        phone: "555-333-4444",
      },
      shippingMethod: "visit",
      location: "RETECH Service Center",
      dateReceived: "2023-06-05T10:00:00",
      status: "received",
      description:
        "The HP LaserJet printer is functioning but shows some paper feed issues. The toner level is low but still printing. Some scratches on the exterior.",
    },
    {
      id: 6,
      name: "Samsung Galaxy S21",
      type: "phone",
      image: "../images/placeholder-image.jpg",
      brand: "Samsung",
      model: "Galaxy S21",
      condition: "Excellent - Like new",
      storage: "256GB",
      accessories: ["Charger", "Earbuds", "Original Box"],
      customer: {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "555-777-8888",
      },
      shippingMethod: "pickup",
      location: "321 Pine St, Eco City, EC 12345",
      dateReceived: "2023-06-03T15:30:00",
      status: "pending",
      description:
        "The Samsung Galaxy S21 is in excellent condition with no visible scratches or dents. The battery health is at 95%. The device has been factory reset and is ready for recycling.",
    },
  ];

  // Save devices to localStorage
  localStorage.setItem("recyclingDevices", JSON.stringify(allDevices));
}

/**
 * Set up event listeners for the dashboard
 */
function setupEventListeners() {
  // Filter checkboxes
  document
    .querySelectorAll('.filter-group input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", applyFilters);
    });

  // Reset filters button
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }

  // Search button and input
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      applyFilters();
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyFilters();
      }
    });
  }

  // Modal Add to Cart button
  const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener("click", () => {
      const deviceId = modalAddToCartBtn.getAttribute("data-device-id");
      if (deviceId) {
        addToCart(parseInt(deviceId));

        // Close the modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("deviceDetailsModal")
        );
        if (modal) {
          modal.hide();
        }
      }
    });
  }

  // Device details modal event
  const deviceDetailsModal = document.getElementById("deviceDetailsModal");
  if (deviceDetailsModal) {
    deviceDetailsModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const deviceId = button.getAttribute("data-device-id");

      if (deviceId) {
        populateDeviceModal(parseInt(deviceId));
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Add event delegation for "Add to Cart" buttons
  document
    .getElementById("devicesList")
    .addEventListener("click", function (event) {
      if (
        event.target.classList.contains("add-to-cart-btn") ||
        (event.target.parentElement &&
          event.target.parentElement.classList.contains("add-to-cart-btn"))
      ) {
        const button = event.target.classList.contains("add-to-cart-btn")
          ? event.target
          : event.target.parentElement;

        const deviceId = button.getAttribute("data-device-id");
        if (deviceId) {
          addToCart(parseInt(deviceId));
        }
      }
    });
}

/**
 * Apply filters to the devices list
 */
function applyFilters() {
  // Get search query
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  // Get selected device types
  const selectedTypes = [];
  document
    .querySelectorAll('input[type="checkbox"][id$="Filter"]:checked')
    .forEach((checkbox) => {
      if (
        checkbox.id.includes("phone") ||
        checkbox.id.includes("laptop") ||
        checkbox.id.includes("kitchen") ||
        checkbox.id.includes("electronics")
      ) {
        selectedTypes.push(checkbox.value);
      }
    });

  // Get selected shipping methods
  const selectedMethods = [];
  document
    .querySelectorAll('input[type="checkbox"][id$="Filter"]:checked')
    .forEach((checkbox) => {
      if (checkbox.id.includes("pickup") || checkbox.id.includes("visit")) {
        selectedMethods.push(checkbox.value);
      }
    });

  // Get selected statuses
  const selectedStatuses = [];
  document
    .querySelectorAll('input[type="checkbox"][id$="Filter"]:checked')
    .forEach((checkbox) => {
      if (checkbox.id.includes("received") || checkbox.id.includes("pending")) {
        selectedStatuses.push(checkbox.value);
      }
    });

  // Filter devices
  filteredDevices = allDevices.filter((device) => {
    // Check if device is already in cart
    const isInCart = cart.some((item) => item.id === device.id);
    if (isInCart) return false;

    // Search query filter
    if (searchQuery && !deviceMatchesSearch(device, searchQuery)) {
      return false;
    }

    // Device type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(device.type)) {
      return false;
    }

    // Shipping method filter
    if (
      selectedMethods.length > 0 &&
      !selectedMethods.includes(device.shippingMethod)
    ) {
      return false;
    }

    // Status filter
    if (
      selectedStatuses.length > 0 &&
      !selectedStatuses.includes(device.status)
    ) {
      return false;
    }

    return true;
  });

  // Reset to first page and render
  currentPage = 1;
  renderDevicesList();
  updateStatistics();
}

/**
 * Check if a device matches the search query
 */
function deviceMatchesSearch(device, query) {
  return (
    device.name.toLowerCase().includes(query) ||
    device.brand.toLowerCase().includes(query) ||
    device.model.toLowerCase().includes(query) ||
    device.type.toLowerCase().includes(query) ||
    device.condition.toLowerCase().includes(query) ||
    device.customer.name.toLowerCase().includes(query) ||
    device.location.toLowerCase().includes(query)
  );
}

/**
 * Reset all filters to their default state
 */
function resetFilters() {
  // Reset search input
  document.getElementById("searchInput").value = "";

  // Reset all checkboxes to checked
  document
    .querySelectorAll('.filter-group input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = true;
    });

  // Apply filters
  applyFilters();
}

/**
 * Render the devices list with pagination
 */
function renderDevicesList() {
  const devicesList = document.getElementById("devicesList");
  const startIndex = (currentPage - 1) * devicesPerPage;
  const endIndex = startIndex + devicesPerPage;
  const devicesToShow = filteredDevices.slice(startIndex, endIndex);

  // Clear the list
  devicesList.innerHTML = "";

  // If no devices match the filters
  if (devicesToShow.length === 0) {
    devicesList.innerHTML = `
      <div class="text-center py-5">
        <div class="display-6 text-muted mb-3">
          <i class="fas fa-search"></i>
        </div>
        <h4>No devices found</h4>
        <p class="text-muted">Try adjusting your filters or search query</p>
        <button type="button" class="btn btn-outline-primary" id="resetFiltersBtn">
          <i class="fas fa-undo me-2"></i>Reset Filters
        </button>
      </div>
    `;

    // Re-attach event listener for the reset button
    const resetBtn = document.getElementById("resetFiltersBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    return;
  }

  // Create and append device cards
  devicesToShow.forEach((device) => {
    const deviceCard = createDeviceCard(device);
    devicesList.appendChild(deviceCard);
  });

  // Update pagination
  updatePagination();
}

/**
 * Create a device card element
 */
function createDeviceCard(device) {
  // Create the card container
  const card = document.createElement("div");
  card.className = "device-card";

  // Format date for display
  const dateReceived = new Date(device.dateReceived);
  const formattedDate = dateReceived.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateReceived.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine badge class based on shipping method
  const badgeClass =
    device.shippingMethod === "pickup" ? "badge-pickup" : "badge-dropoff";
  const badgeText = device.shippingMethod === "pickup" ? "Pickup" : "Drop-off";

  // Set the HTML content
  card.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title">${device.name}</h5>
      <span class="device-badge ${badgeClass}">${badgeText}</span>
    </div>
    <div class="card-body">
      <div class="device-info">
        <div class="device-info-label">Type:</div>
        <div class="device-info-value">${capitalizeFirstLetter(
          device.type
        )}</div>
      </div>
      <div class="device-info">
        <div class="device-info-label">Condition:</div>
        <div class="device-info-value">${device.condition}</div>
      </div>
      <div class="device-info">
        <div class="device-info-label">Customer:</div>
        <div class="device-info-value">${device.customer.name}</div>
      </div>
      <div class="device-info">
        <div class="device-info-label">Location:</div>
        <div class="device-info-value">${device.location}</div>
      </div>
      <div class="device-info">
        <div class="device-info-label">Date Received:</div>
        <div class="device-info-value">${formattedDate} - ${formattedTime}</div>
      </div>
      <div class="device-info">
        <div class="device-info-label">Status:</div>
        <div class="device-info-value">
          <span class="badge ${
            device.status === "pending" ? "bg-warning text-dark" : "bg-success"
          }">${capitalizeFirstLetter(device.status)}</span>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deviceDetailsModal" data-device-id="${
          device.id
        }">
          <i class="fas fa-info-circle me-1"></i>View Details
        </button>
        <button type="button" class="btn btn-primary btn-sm add-to-cart-btn" data-device-id="${
          device.id
        }">
          <i class="fas fa-cart-plus me-1"></i>Add to Cart
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Update the pagination controls
 */
function updatePagination() {
  const totalPages = Math.ceil(filteredDevices.length / devicesPerPage);

  // If there's only one page, hide pagination
  if (totalPages <= 1) {
    document
      .querySelector('nav[aria-label="Devices pagination"]')
      .classList.add("d-none");
    return;
  } else {
    document
      .querySelector('nav[aria-label="Devices pagination"]')
      .classList.remove("d-none");
  }

  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  // Previous button
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevItem.innerHTML = `
    <a class="page-link" href="#" tabindex="-1" aria-disabled="${
      currentPage === 1 ? "true" : "false"
    }">Previous</a>
  `;
  prevItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderDevicesList();
    }
  });
  pagination.appendChild(prevItem);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderDevicesList();
    });
    pagination.appendChild(pageItem);
  }

  // Next button
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextItem.innerHTML = `
    <a class="page-link" href="#" aria-disabled="${
      currentPage === totalPages ? "true" : "false"
    }">Next</a>
  `;
  nextItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderDevicesList();
    }
  });
  pagination.appendChild(nextItem);
}

/**
 * Populate the device details modal
 */
function populateDeviceModal(deviceId) {
  const device = allDevices.find((d) => d.id === deviceId);
  if (!device) return;

  // Set the modal title
  document.getElementById("deviceDetailsModalLabel").textContent = device.name;

  // Set device information
  document.getElementById("deviceBrand").textContent = device.brand;
  document.getElementById("deviceModel").textContent = device.model;
  document.getElementById("deviceType").textContent = capitalizeFirstLetter(
    device.type
  );
  document.getElementById("deviceCondition").textContent = device.condition;

  // Set storage information if available
  const storageElement = document.getElementById("deviceStorage");
  if (storageElement) {
    storageElement.textContent = device.storage || "N/A";
  }

  // Set accessories information
  const accessoriesElement = document.getElementById("deviceAccessories");
  if (accessoriesElement) {
    accessoriesElement.textContent =
      device.accessories && device.accessories.length > 0
        ? device.accessories.join(", ")
        : "None";
  }

  // Set collection information
  document.getElementById("collectionMethod").textContent =
    device.shippingMethod === "pickup" ? "Pickup" : "Drop-off";
  document.getElementById("customerName").textContent = device.customer.name;
  document.getElementById("customerContact").textContent =
    device.customer.email;
  document.getElementById("deviceLocation").textContent = device.location;

  // Format and set date
  const dateReceived = new Date(device.dateReceived);
  const formattedDate = dateReceived.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateReceived.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  document.getElementById(
    "dateReceived"
  ).textContent = `${formattedDate} - ${formattedTime}`;

  // Set status badge
  const statusElement = document.getElementById("deviceStatus");
  statusElement.innerHTML = `<span class="badge ${
    device.status === "pending" ? "bg-warning text-dark" : "bg-success"
  }">${capitalizeFirstLetter(device.status)}</span>`;

  // Set device description
  document.getElementById("deviceDescription").textContent = device.description;

  // Set the "Add to Cart" button's device ID
  const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
  modalAddToCartBtn.setAttribute("data-device-id", device.id);

  // Check if device is already in cart and update button
  const isInCart = cart.some((item) => item.id === device.id);
  if (isInCart) {
    modalAddToCartBtn.disabled = true;
    modalAddToCartBtn.innerHTML = '<i class="fas fa-check me-1"></i>In Cart';
  } else {
    modalAddToCartBtn.disabled = false;
    modalAddToCartBtn.innerHTML =
      '<i class="fas fa-cart-plus me-1"></i>Add to Cart';
  }

  // Update device images
  const deviceImagesContainer = document.getElementById("deviceImages");
  deviceImagesContainer.innerHTML = ""; // Clear existing images

  // Just add placeholder images for demo
  for (let i = 0; i < 3; i++) {
    const imgCol = document.createElement("div");
    imgCol.className = "col-md-3 mb-3";
    imgCol.innerHTML = `<img src="../images/placeholder-image.jpg" class="img-fluid rounded" alt="Device image ${
      i + 1
    }">`;
    deviceImagesContainer.appendChild(imgCol);
  }
}

/**
 * Add a device to the cart
 */
function addToCart(deviceId) {
  console.log("Adding device to cart, ID:", deviceId);

  const device = allDevices.find((d) => d.id === deviceId);
  if (!device) {
    console.error("Device not found with ID:", deviceId);
    return;
  }

  console.log("Found device:", device);

  // Check if device is already in cart
  if (cart.some((item) => item.id === deviceId)) {
    console.log("Device already in cart");
    showNotification("This device is already in your cart.", "Info");
    return;
  }

  // Add to cart
  cart.push(device);
  console.log("Device added to cart. New cart:", cart);

  // Save cart to localStorage
  saveCart();
  console.log("Cart saved to localStorage");

  // Update cart count in navbar
  updateCartCount();

  // Update devices list to remove added device
  applyFilters();

  // Show notification
  showNotification("Device added to cart successfully!", "Success");
}

/**
 * Save cart to localStorage
 */
function saveCart() {
  try {
    const cartString = JSON.stringify(cart);
    localStorage.setItem("recyclingCart", cartString);
    console.log("Cart saved to localStorage successfully:", {
      cartSize: cart.length,
      cartString,
    });
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
  try {
    const savedCart = localStorage.getItem("recyclingCart");
    console.log("Loading cart from localStorage:", savedCart);

    if (savedCart) {
      cart = JSON.parse(savedCart);

      // Ensure cart is an array
      if (!Array.isArray(cart)) {
        console.error("Cart is not an array, resetting:", cart);
        cart = [];
      }

      console.log("Cart loaded successfully:", { cartSize: cart.length, cart });
    } else {
      console.log("No cart found in localStorage, initializing empty cart");
      cart = [];
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    cart = [];
  }
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
  const cartCountElements = document.querySelectorAll(".cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = cart.length;
  });
}

/**
 * Update dashboard statistics
 */
function updateStatistics() {
  // Update available devices count
  document.getElementById("availableDevicesCount").textContent =
    filteredDevices.length;

  // Update cart items count
  document.getElementById("cartItemsCount").textContent = cart.length;

  // Count orders from localStorage
  const orders = JSON.parse(localStorage.getItem("recyclingOrders") || "[]");
  document.getElementById("ordersCount").textContent = orders.length;

  // Count pickups (devices with shipping method 'pickup')
  const pickups = allDevices.filter(
    (device) => device.shippingMethod === "pickup"
  ).length;
  document.getElementById("pickupsCount").textContent = pickups;
}

/**
 * Show a notification toast
 */
function showNotification(message, title = "Notification") {
  const toastElement = document.getElementById("notificationToast");
  const titleElement = document.getElementById("toastTitle");
  const messageElement = document.getElementById("toastMessage");

  titleElement.textContent = title;
  messageElement.textContent = message;

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

/**
 * Logout function
 */
function logout() {
  // Remove authentication data
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");

  // Redirect to login page
  window.location.href = "login.html";
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
