/**
 * Inventory Management System JavaScript
 * Handles all functionality for the inventory store page
 */

// Inventory state management
let currentFilters = {
  deviceTypes: [],
  conditions: [],
  brands: [],
  maxPrice: 1000,
};
let currentSort = "newest";
let currentPage = 1;
const itemsPerPage = 6;

// DOM Elements
const inventoryItemsContainer = document.getElementById("inventoryItems");
const resultCountElement = document.getElementById("resultCount");
const currentSortElement = document.getElementById("currentSort");
const paginationElement = document.querySelector(".pagination");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Load user data
  loadUserData();

  // Setup event listeners
  setupEventListeners();

  // Load initial inventory
  loadInventory();
});

// Setup event listeners
function setupEventListeners() {
  // Filter application
  document
    .getElementById("applyFilters")
    .addEventListener("click", applyFilters);

  // Reset filters
  document
    .getElementById("resetFilters")
    .addEventListener("click", resetFilters);

  // Search functionality
  document
    .getElementById("searchButton")
    .addEventListener("click", searchInventory);

  // Add event listener for Enter key in search field
  document
    .getElementById("inventorySearch")
    .addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        searchInventory();
      }
    });

  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    const logoutModal = new bootstrap.Modal(
      document.getElementById("logoutConfirmModal")
    );
    logoutModal.show();
  });

  document
    .getElementById("confirmLogoutBtn")
    .addEventListener("click", function () {
      logout();
    });

  // Sort dropdown functionality
  const sortLinks = document.querySelectorAll("[data-sort]");
  sortLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      currentSort = this.dataset.sort;
      currentSortElement.textContent = this.textContent;
      loadInventory();
    });
  });

  // Price range display update
  const priceRange = document.getElementById("priceRange");
  const priceRangeValue = document.getElementById("priceRangeValue");
  priceRange.addEventListener("input", function () {
    priceRangeValue.textContent = "$" + this.value;
  });
}

// Load user data from localStorage
function loadUserData() {
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  // Check if user is logged in
  if (!userEmail || !localStorage.getItem("isLoggedIn") === "true") {
    console.log("Not logged in - redirecting to login");
    window.location.href =
      "login.html?redirect=inventory-store.html&message=Please log in to access the inventory store";
    return;
  }

  // Check if user has company role
  if (userRole !== "company") {
    console.log("Not a company account - redirecting to home");
    window.location.href =
      "index.html?access=denied&message=Only recycling companies can access the inventory store";
    return;
  }

  // User is logged in as a company, proceed to load their data
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const companyData = users[userEmail];

  if (companyData) {
    // Update UI with company data
    document.getElementById("companyName").textContent =
      companyData.profile?.company || "Company";
    document.getElementById("dropdownCompanyName").textContent =
      companyData.profile?.company || "Company";
    document.getElementById("dropdownCompanyEmail").textContent =
      userEmail || "company@recycling.com";

    // Update company logo in navbar and dropdown
    const logoUrl = companyData.profile?.logo;
    if (logoUrl) {
      const navLogo = document.getElementById("navCompanyLogo");
      const navIcon = document.getElementById("navCompanyIcon");
      const dropdownLogo = document.getElementById("dropdownCompanyLogo");
      const dropdownIcon = document.getElementById("dropdownCompanyIcon");

      if (navLogo && navIcon) {
        navLogo.src = logoUrl;
        navLogo.style.display = "block";
        navIcon.style.display = "none";
      }
      if (dropdownLogo && dropdownIcon) {
        dropdownLogo.src = logoUrl;
        dropdownLogo.style.display = "block";
        dropdownIcon.style.display = "none";
      }
    }
  }

  console.log("Company user authenticated successfully");

  // Return the user data for other functions to use if needed
  return companyData;
}

// Apply the selected filters
function applyFilters() {
  // Get all the selected device types
  currentFilters.deviceTypes = Array.from(
    document.querySelectorAll('input[name="deviceType"]:checked')
  ).map((checkbox) => checkbox.value);

  // Get all the selected conditions
  currentFilters.conditions = Array.from(
    document.querySelectorAll('input[name="condition"]:checked')
  ).map((checkbox) => checkbox.value);

  // Get all the selected brands
  currentFilters.brands = Array.from(
    document.querySelectorAll('input[name="brand"]:checked')
  ).map((checkbox) => checkbox.value);

  // Get the price range
  currentFilters.maxPrice = document.getElementById("priceRange").value;

  // Reset to first page when filtering
  currentPage = 1;

  // Load filtered inventory
  loadInventory();
}

// Reset all filters to default
function resetFilters() {
  // Reset checkboxes to their default values
  document.querySelectorAll(".form-check-input").forEach((checkbox) => {
    if (
      checkbox.id === "filterSmartphones" ||
      checkbox.id === "filterLaptops" ||
      checkbox.id === "filterTablets" ||
      checkbox.id === "filterNew" ||
      checkbox.id === "filterLikeNew" ||
      checkbox.id === "filterGood" ||
      checkbox.id === "filterApple" ||
      checkbox.id === "filterSamsung"
    ) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });

  // Reset price range
  const priceRange = document.getElementById("priceRange");
  const priceRangeValue = document.getElementById("priceRangeValue");
  priceRange.value = 500;
  priceRangeValue.textContent = "$500";

  // Apply reset filters
  applyFilters();
}

// Search inventory
function searchInventory() {
  console.log("Search function triggered");

  // Get the search query
  const searchQuery = document.getElementById("inventorySearch").value.trim();
  console.log("Search query:", searchQuery);

  // Reset to first page when searching
  currentPage = 1;

  // Load inventory, which will apply the search query along with other filters
  loadInventory();
}

// Filter inventory based on current filters
function filterInventory() {
  let filteredItems = getInventoryData();
  const searchTerm = document
    .getElementById("inventorySearch")
    .value.toLowerCase();

  // Filter by search query
  if (searchTerm) {
    filteredItems = filteredItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by device type
  if (currentFilters.deviceTypes.length > 0) {
    filteredItems = filteredItems.filter((item) => {
      return currentFilters.deviceTypes.includes(item.type.toLowerCase());
    });
  }

  // Filter by condition
  if (currentFilters.conditions.length > 0) {
    filteredItems = filteredItems.filter((item) => {
      return currentFilters.conditions.some((condition) => {
        if (condition === "likeNew") {
          return item.condition === "like-new";
        }
        return item.condition === condition;
      });
    });
  }

  // Filter by brand
  if (currentFilters.brands.length > 0) {
    const mainBrands = ["apple", "samsung", "dell", "hp"];
    const selectsOther = currentFilters.brands.includes("other");

    filteredItems = filteredItems.filter((item) => {
      const itemBrand = item.brand.toLowerCase();
      if (currentFilters.brands.includes(itemBrand)) {
        return true;
      }
      if (selectsOther && !mainBrands.includes(itemBrand)) {
        return true;
      }
      return false;
    });
  }

  // Filter by price
  if (currentFilters.maxPrice) {
    filteredItems = filteredItems.filter(
      (item) => item.price <= currentFilters.maxPrice
    );
  }

  return filteredItems;
}

// Sort inventory based on current sort
function sortInventory(items) {
  const sortedItems = [...items];

  switch (currentSort) {
    case "newest":
      sortedItems.sort((a, b) => b.dateAdded - a.dateAdded);
      break;
    case "oldest":
      sortedItems.sort((a, b) => a.dateAdded - b.dateAdded);
      break;
    case "price-asc":
      sortedItems.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sortedItems.sort((a, b) => b.price - a.price);
      break;
    case "condition":
      const conditionOrder = {
        new: 0,
        "like-new": 1,
        good: 2,
        fair: 3,
        poor: 4,
      };
      sortedItems.sort(
        (a, b) => conditionOrder[a.condition] - conditionOrder[b.condition]
      );
      break;
    default:
      sortedItems.sort((a, b) => b.dateAdded - a.dateAdded);
  }

  return sortedItems;
}

// Load and display inventory
function loadInventory() {
  // Filter items
  const filteredItems = filterInventory();

  // Sort items
  const sortedItems = sortInventory(filteredItems);

  // Render items with pagination
  renderInventoryItems(sortedItems);
}

// Render inventory items
function renderInventoryItems(items) {
  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Update result count
  resultCountElement.textContent = items.length;

  // Clear current items
  inventoryItemsContainer.innerHTML = "";

  // Handle empty results
  if (items.length === 0) {
    inventoryItemsContainer.innerHTML = `
      <div class="empty-result" style="grid-column: 1 / -1;">
        <i class="fas fa-search"></i>
        <h3>No items found</h3>
        <p>We couldn't find any items matching your criteria. Try adjusting your filters or search query.</p>
        <button class="btn btn-primary mt-3" id="clearSearchButton">Clear Search & Filters</button>
      </div>
    `;

    document
      .getElementById("clearSearchButton")
      .addEventListener("click", function () {
        // Clear the search input
        document.getElementById("inventorySearch").value = "";
        // Reset all filters to default
        resetFilters();
      });

    // Hide pagination
    paginationElement.style.display = "none";
    return;
  }

  // Show pagination
  paginationElement.style.display = "flex";

  // Render each item
  paginatedItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "inventory-grid-item";

    // Create condition badge class
    const conditionClass = `badge-${item.condition.replace("-", "-")}`;

    // Create stock badge class
    const stockClass = item.stock <= 2 ? "low" : "";

    itemElement.innerHTML = `
      <div class="card inventory-card position-relative">
        <span class="stock-badge ${stockClass}">In Stock: ${item.stock}</span>
        <img src="${item.image}" class="card-img-top" alt="${item.name}">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <h6 class="card-subtitle">${item.brand}</h6>
          <p class="card-text">${item.description}</p>
          <div class="badge-container">
            <span class="badge inventory-badge ${conditionClass}">${formatCondition(
      item.condition
    )}</span>
            <span class="badge inventory-badge bg-secondary">${formatDeviceType(
              item.type
            )}</span>
          </div>
          <div class="card-actions">
            <div class="inventory-price">$${item.price.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;

    inventoryItemsContainer.appendChild(itemElement);
  });

  // Update pagination
  updatePagination(totalPages);
}

// Format condition for display
function formatCondition(condition) {
  switch (condition) {
    case "new":
      return "New";
    case "like-new":
      return "Like New";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
    case "poor":
      return "Poor";
    default:
      return condition;
  }
}

// Format device type for display
function formatDeviceType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Update pagination controls
function updatePagination(totalPages) {
  let paginationHTML = "";

  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${
        currentPage - 1
      }" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Next button
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${
        currentPage + 1
      }" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;

  paginationElement.innerHTML = paginationHTML;

  // Add event listeners to pagination links
  document.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.dataset.page);

      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadInventory();

        // Scroll to top of inventory section
        document
          .querySelector(".inventory-header")
          .scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// Logout function
function logout() {
  // Clear all session-related data
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("recyclingCart"); // Clear cart on logout

  // Redirect to the login page
  window.location.href = "login.html";
}
