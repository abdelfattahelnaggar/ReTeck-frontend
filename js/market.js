/**
 * Market Page JavaScript
 * Handles product loading, filtering, and purchase functionality
 */

// Sample product data - in a real application, this would come from an API
let allProducts = [];

// Global variables
let currentUser = null;
let userVouchers = []; // Will store actual voucher objects
let userVoucherBalance = 0; // Total monetary value of available vouchers
let selectedProduct = null;
let currentCategory = "all";
let cart = JSON.parse(localStorage.getItem("marketCart")) || [];

/**
 * Initialize the market page
 */
function initializeMarket() {
  console.log("Market page initialized");
  // This function was missing and is now implemented as a stub
  // Any market initialization code should go here
}

/**
 * Enhanced voucher discount calculation for flexible partial discount system
 * @param {number} cartTotal - Total amount of cart
 * @param {number} voucherValue - Available voucher balance
 * @param {string} voucherCode - Voucher code for tracking
 * @returns {Object} Discount calculation result
 */
function calculateVoucherDiscount(cartTotal, voucherValue, voucherCode = "") {
  const discountResult = {
    voucherCode: voucherCode,
    originalCartTotal: cartTotal,
    voucherValue: voucherValue,
    discountApplied: 0,
    remainingCartAmount: 0,
    remainingVoucherBalance: 0,
    canProceedToPurchase: true, // Always true in flexible system
  };

  if (cartTotal <= voucherValue) {
    // Cart total is less than or equal to voucher value
    discountResult.discountApplied = cartTotal;
    discountResult.remainingCartAmount = 0;
    discountResult.remainingVoucherBalance = voucherValue - cartTotal;
  } else {
    // Cart total exceeds voucher value
    discountResult.discountApplied = voucherValue;
    discountResult.remainingCartAmount = cartTotal - voucherValue;
    discountResult.remainingVoucherBalance = 0;
  }

  return discountResult;
}

// DOM Elements
const productsContainer = document.getElementById("productsContainer");
const userVoucherBalanceEl = document.getElementById("userVoucherBalance");
const voucherCountEl = document.getElementById("voucherCount");
const rewardsCountEl = document.getElementById("rewardsCount");
const noVouchersMessage = document.getElementById("noVouchersMessage");
const categoryFilters = document.querySelectorAll(".category-filter");

// Cart Elements
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItems = document.getElementById("cartItems");
const cartEmptyMessage = document.getElementById("cartEmptyMessage");
const cartBadgeCount = document.getElementById("cartBadgeCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartVoucherBalance = document.getElementById("cartVoucherBalance");
const cartRemainingBalance = document.getElementById("cartRemainingBalance");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

// Modal Elements
const productModal = new bootstrap.Modal(
  document.getElementById("productModal")
);
const confirmPurchaseModal = new bootstrap.Modal(
  document.getElementById("confirmPurchaseModal")
);
const purchaseSuccessModal = new bootstrap.Modal(
  document.getElementById("purchaseSuccessModal")
);
const nonCustomerModal = new bootstrap.Modal(
  document.getElementById("nonCustomerModal")
);
const checkoutConfirmModal = new bootstrap.Modal(
  document.getElementById("checkoutConfirmModal")
);

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Load products from the centralized data source
  allProducts = productData;

  // Initialize the market page
  initializeMarket();

  // Check if user is logged in and has the customer role
  checkUserAccess();

  // Initialize filters
  initFilters();

  // Load products
  loadProducts();

  // Initialize cart
  initCart();

  // Initialize dev test button if in development mode
  initDevTestMode();

  // Set up confirm checkout button
  const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
  if (confirmCheckoutBtn) {
    confirmCheckoutBtn.addEventListener("click", function () {
      checkoutConfirmModal.hide();
      processCartPurchase();
    });
  }
});

/**
 * Check if the user has access to the market page
 */
function checkUserAccess() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "customer";
  const userEmail = localStorage.getItem("userEmail");

  if (!isLoggedIn) {
    // Redirect to login page
    window.location.href = "login.html";
    return;
  }

  if (userRole !== "customer") {
    // Show non-customer modal
    nonCustomerModal.show();
    return;
  }

  // Get user data
  currentUser = userEmail;
  loadUserVouchers(userEmail);
}

/**
 * Load user vouchers from localStorage
 */
function loadUserVouchers(email) {
  if (!email) return;

  try {
    // Try to get user-specific data
    const userData = JSON.parse(
      localStorage.getItem(`userData_${email}`) || "{}"
    );

    // Reset vouchers
    userVouchers = [];
    userVoucherBalance = 0;

    // Check if user has rewards
    if (userData && userData.rewards) {
      // Get unused vouchers
      userVouchers = userData.rewards.filter(
        (reward) => reward.type === "voucher" && !reward.used
      );

      // Calculate total voucher balance
      userVoucherBalance = userVouchers.reduce((total, voucher) => {
        return total + parseInt(voucher.value || 0);
      }, 0);
    }

    // Update voucher display in UI
    updateVoucherDisplay();
  } catch (error) {
    console.error("Error loading user vouchers:", error);
    userVouchers = [];
    userVoucherBalance = 0;
    updateVoucherDisplay();
  }
}

/**
 * Update voucher display in UI
 */
function updateVoucherDisplay() {
  if (userVoucherBalanceEl) {
    userVoucherBalanceEl.textContent = userVoucherBalance;
  }

  if (voucherCountEl) {
    voucherCountEl.textContent = userVouchers.length;
  }

  if (rewardsCountEl) {
    rewardsCountEl.textContent = userVouchers.length;

    // Hide badge if no rewards
    if (userVouchers.length === 0) {
      rewardsCountEl.classList.add("d-none");
    } else {
      rewardsCountEl.classList.remove("d-none");
    }
  }

  // Show no vouchers message if needed
  if (noVouchersMessage) {
    if (userVoucherBalance === 0) {
      noVouchersMessage.classList.remove("d-none");
    } else {
      noVouchersMessage.classList.add("d-none");
    }
  }
}

/**
 * Initialize category filters
 */
function initFilters() {
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      // Remove active class from all filters
      categoryFilters.forEach((f) => f.classList.remove("active"));

      // Add active class to clicked filter
      this.classList.add("active");

      // Get category
      const category = this.getAttribute("data-category");
      currentCategory = category;

      // Filter products
      filterProducts(category);
    });
  });
}

/**
 * Filter products by category
 */
function filterProducts(category) {
  // Show loading spinner
  productsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Filtering products...</p>
    </div>
  `;

  // Short timeout to show loading state
  setTimeout(() => {
    const filteredProducts =
      category === "all"
        ? allProducts
        : allProducts.filter((product) => product.category === category);

    renderProducts(filteredProducts);
  }, 300);
}

/**
 * Load products and render them
 */
function loadProducts() {
  // Check for product images and use placeholders if needed
  checkProductImagesFolder();

  // Simulate loading delay
  setTimeout(() => {
    renderProducts(allProducts);
  }, 800);
}

/**
 * Render products in the container
 */
function renderProducts(products) {
  // Clear container
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    // No products found
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h4>No products found</h4>
        <p class="text-muted">Try a different category or check back later.</p>
      </div>
    `;
    return;
  }

  // Render each product
  products.forEach((product) => {
    // Extract price value without currency
    const priceValue = parseFloat(product.price.replace("E£", "").trim());

    // Calculate discount that would be applied for this product
    const discountInfo = calculateVoucherDiscount(
      priceValue,
      userVoucherBalance
    );

    // Create product card (never disabled in flexible system)
    const productCard = document.createElement("div");
    productCard.className = `col-lg-3 col-md-4 col-sm-6 mb-4`;

    // Determine discount info text
    let discountText = "";
    if (discountInfo.discountApplied === priceValue) {
      discountText = "Full voucher coverage";
    } else if (discountInfo.discountApplied > 0) {
      discountText = `E£${discountInfo.discountApplied.toFixed(
        0
      )} voucher discount`;
    } else {
      discountText = "No voucher discount available";
    }

    productCard.innerHTML = `
      <div class="card product-card ${product.isNew ? "new-product" : ""}">
        ${product.isNew ? '<span class="new-badge">New</span>' : ""}
        <div class="product-card-img-container">
          <img src="${product.image}" alt="${
      product.name
    }" class="product-card-img">
        </div>
        <div class="product-card-body">
          <h5 class="product-card-title">${product.name}</h5>
          <p class="product-card-category">${product.category}</p>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="product-card-price">${product.price}</span>
            <span class="voucher-required-tag">
              <i class="fas fa-ticket-alt me-1"></i> ${discountText}
            </span>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-success btn-view flex-grow-1" data-product-id="${
              product.id
            }">
              <i class="fas fa-eye me-1"></i> View
            </button>
            <button class="btn btn-success btn-add-to-cart" data-product-id="${
              product.id
            }">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add product card to container
    productsContainer.appendChild(productCard);

    // Add click event to view button
    const viewButton = productCard.querySelector(".btn-view");
    viewButton.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      openProductDetails(productId);
    });

    // Add click event to add to cart button
    const addToCartButton = productCard.querySelector(".btn-add-to-cart");
    addToCartButton.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      addToCart(productId);
    });
  });
}

/**
 * Open product details modal
 */
function openProductDetails(productId) {
  try {
    // Find product by id
    const product = allProducts.find((p) => p.id === productId);
    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      showNotification("Product not found", "danger");
      return;
    }

    // Save selected product
    selectedProduct = product;

    // Extract price value without currency
    const priceValue = parseFloat(product.price.replace("E£", "").trim());

    // Check if modal elements exist
    const modalProductImage = document.getElementById("modalProductImage");
    const modalProductName = document.getElementById("modalProductName");
    const modalProductCategory = document.getElementById(
      "modalProductCategory"
    );
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductDescription = document.getElementById(
      "modalProductDescription"
    );
    const modalVoucherRequired = document.getElementById(
      "modalVoucherRequired"
    );

    if (
      !modalProductImage ||
      !modalProductName ||
      !modalProductCategory ||
      !modalProductPrice ||
      !modalProductDescription ||
      !modalVoucherRequired
    ) {
      console.error("One or more modal elements not found");
      showNotification("Error loading product details", "danger");
      return;
    }

    // Update modal content
    modalProductImage.src = product.image;
    modalProductName.textContent = product.name;
    modalProductCategory.textContent = product.category;
    modalProductPrice.textContent = product.price;
    modalProductDescription.textContent = product.description;

    // Calculate discount information
    const discountInfo = calculateVoucherDiscount(
      priceValue,
      userVoucherBalance
    );

    // Update voucher information with flexible discount details
    if (discountInfo.discountApplied === priceValue) {
      modalVoucherRequired.textContent = `E£${priceValue} - Full voucher coverage available`;
    } else if (discountInfo.discountApplied > 0) {
      modalVoucherRequired.textContent = `E£${discountInfo.discountApplied.toFixed(
        2
      )} voucher discount available, E£${discountInfo.remainingCartAmount.toFixed(
        2
      )} to pay separately`;
    } else {
      modalVoucherRequired.textContent = `E£${priceValue} - No voucher discount available, full amount to pay separately`;
    }

    // Purchase button is always enabled in flexible system
    const purchaseButton = document.getElementById("purchaseButton");
    if (!purchaseButton) {
      console.error("Purchase button not found");
    } else {
      purchaseButton.disabled = false;
      purchaseButton.innerHTML = `<i class="fas fa-shopping-cart me-1"></i> Purchase Product`;

      // Setup purchase button click (always works in flexible system)
      purchaseButton.onclick = function () {
        openConfirmPurchase(product);
      };
    }

    // Add "Add to Cart" button to the modal footer
    const modalFooter = document.querySelector("#productModal .modal-footer");
    if (!modalFooter) {
      console.error("Modal footer not found");
    } else {
      // Remove existing add to cart button if it exists
      const existingAddToCartBtn = document.getElementById("modalAddToCartBtn");
      if (existingAddToCartBtn) {
        existingAddToCartBtn.remove();
      }

      // Create add to cart button
      const addToCartBtn = document.createElement("button");
      addToCartBtn.type = "button";
      addToCartBtn.className = "btn btn-primary me-auto";
      addToCartBtn.id = "modalAddToCartBtn";
      addToCartBtn.innerHTML =
        '<i class="fas fa-cart-plus me-1"></i> Add to Cart';

      // Always enable the Add to Cart button in the flexible system
      addToCartBtn.disabled = false;

      // Add click event
      addToCartBtn.addEventListener("click", function () {
        addToCart(product.id);
        productModal.hide();
      });

      // Insert at the beginning of modal footer
      modalFooter.insertBefore(addToCartBtn, modalFooter.firstChild);
    }

    // Show the modal
    productModal.show();
    console.log(
      `Successfully opened product details for "${product.name}" (ID: ${product.id})`
    );
  } catch (error) {
    console.error("Error in openProductDetails:", error);
    showNotification("Error opening product details", "danger");
  }
}

/**
 * Open confirm purchase modal with flexible discount information
 */
function openConfirmPurchase(product) {
  // Hide product details modal
  productModal.hide();

  // Extract price value without currency
  const priceValue = parseFloat(product.price.replace("E£", "").trim());

  // Calculate discount information
  const discountInfo = calculateVoucherDiscount(priceValue, userVoucherBalance);

  // Update confirmation modal content with discount breakdown
  document.getElementById("confirmProductName").textContent = product.name;
  document.getElementById(
    "confirmCurrentVouchers"
  ).textContent = `E£${userVoucherBalance}`;
  document.getElementById(
    "confirmRequiredVouchers"
  ).textContent = `E£${discountInfo.discountApplied} (voucher discount) + E£${discountInfo.remainingCartAmount} (to pay separately)`;
  document.getElementById(
    "confirmRemainingVouchers"
  ).textContent = `E£${discountInfo.remainingVoucherBalance}`;

  // Setup confirm button
  document.getElementById("confirmPurchaseButton").onclick = function () {
    completePurchase(product);
  };

  // Show confirmation modal
  confirmPurchaseModal.show();
}

/**
 * Complete purchase with flexible voucher discount
 */
function completePurchase(product) {
  // Hide confirmation modal
  confirmPurchaseModal.hide();

  // Extract price value without currency
  const priceValue = parseFloat(product.price.replace("E£", "").trim());

  // Calculate discount information
  const discountInfo = calculateVoucherDiscount(priceValue, userVoucherBalance);

  // Generate voucher code
  const voucherCode = generateVoucherCode();

  // Update user vouchers with only the discount amount used
  const voucherAmountUsed = discountInfo.discountApplied;

  if (voucherAmountUsed > 0) {
    updateUserVouchers(voucherAmountUsed, voucherCode, product.name);
  }

  // Show success modal with enhanced information
  purchaseSuccessModal.show();

  // Show notification with discount information
  if (discountInfo.remainingCartAmount > 0) {
    showNotification(
      `Purchase completed! Voucher discount: E£${discountInfo.discountApplied.toFixed(
        2
      )}, Pay separately: E£${discountInfo.remainingCartAmount.toFixed(2)}`,
      "success"
    );
  } else {
    showNotification(
      "Purchase completed with full voucher coverage!",
      "success"
    );
  }
}

/**
 * Update user vouchers after purchase
 */
function updateUserVouchers(priceValue, voucherCode, productName) {
  if (!currentUser) return;

  try {
    // Get user data
    const userData = JSON.parse(
      localStorage.getItem(`userData_${currentUser}`) || "{}"
    );

    // Initialize rewards array if needed
    if (!userData.rewards) {
      userData.rewards = [];
    }

    // Initialize purchases array if needed
    if (!userData.purchases) {
      userData.purchases = [];
    }

    // Create a new purchase record
    userData.purchases.push({
      id: "purchase_" + Date.now(),
      product: productName,
      price: `E£${priceValue}`,
      voucherAmountUsed: priceValue,
      voucherCode: voucherCode,
      date: new Date().toISOString(),
    });

    // Deduct the price from vouchers, starting with the oldest vouchers first
    let remainingPrice = priceValue;

    // First, sort vouchers by issue date (oldest first)
    userVouchers.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));

    // Track which vouchers in userData.rewards need to be updated
    const updatedVoucherIds = [];

    for (let i = 0; i < userVouchers.length && remainingPrice > 0; i++) {
      const voucher = userVouchers[i];

      if (!voucher.used) {
        const voucherValue = parseInt(voucher.value);

        if (remainingPrice >= voucherValue) {
          // Use entire voucher
          voucher.used = true;
          voucher.usedFor = productName;
          voucher.usedDate = new Date().toISOString();
          remainingPrice -= voucherValue;

          // Add to updated IDs list
          updatedVoucherIds.push(voucher.id);
        } else if (remainingPrice > 0) {
          // Partially use voucher
          const remainingValue = voucherValue - remainingPrice;

          // Mark original voucher as used
          voucher.used = true;
          voucher.usedFor = productName;
          voucher.partiallyUsed = true;
          voucher.amountUsed = remainingPrice;
          voucher.usedDate = new Date().toISOString();

          // Add to updated IDs list
          updatedVoucherIds.push(voucher.id);

          // Create new voucher with remaining value
          const newVoucher = {
            id: "reward_" + Date.now(),
            type: "voucher",
            value: remainingValue.toString(),
            description: `E£${remainingValue} HyperOne Voucher (Remaining)`,
            issueDate: new Date().toISOString(),
            expiryDate: voucher.expiryDate,
            used: false,
          };

          userData.rewards.push(newVoucher);
          remainingPrice = 0;
        }
      }
    }

    // Update the vouchers in userData.rewards based on the changes in userVouchers
    updatedVoucherIds.forEach((id) => {
      const updatedVoucher = userVouchers.find((v) => v.id === id);
      const rewardIndex = userData.rewards.findIndex((r) => r.id === id);

      if (updatedVoucher && rewardIndex !== -1) {
        userData.rewards[rewardIndex] = updatedVoucher;
      }
    });

    // Save updated user data
    localStorage.setItem(`userData_${currentUser}`, JSON.stringify(userData));

    // Reload vouchers to update balance
    loadUserVouchers(currentUser);

    // Refresh products to update disabled state
    filterProducts(currentCategory);
  } catch (error) {
    console.error("Error updating user vouchers:", error);
    throw error; // Re-throw to allow the calling function to handle it
  }
}

/**
 * Generate a random voucher code
 */
function generateVoucherCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  // Generate 4 groups of 4 characters
  for (let group = 0; group < 4; group++) {
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (group < 3) code += "-";
  }

  return code;
}

/**
 * Check if the DOM images folder exists and create it if not
 */
function checkProductImagesFolder() {
  // This is a mock function since we can't directly check the file system
  // In a real app, you would create this folder if needed

  // For now, we'll create image placeholders
  allProducts.forEach((product) => {
    // Use a placeholder image if product image is missing
    if (!product.image || product.image.includes("market/")) {
      let category = product.category;
      switch (category) {
        case "food":
          product.image =
            "https://via.placeholder.com/300x200/e9f5db/333333?text=Food";
          break;
        case "beverages":
          product.image =
            "https://via.placeholder.com/300x200/d7e3fc/333333?text=Beverage";
          break;
        case "household":
          product.image =
            "https://via.placeholder.com/300x200/f5e6cc/333333?text=Household";
          break;
        case "personal":
          product.image =
            "https://via.placeholder.com/300x200/ffe5ec/333333?text=Personal+Care";
          break;
        default:
          product.image =
            "https://via.placeholder.com/300x200/eeeeee/333333?text=Product";
      }
    }
  });
}

/**
 * Add test vouchers to the current user account
 * @param {Array} values - Array of voucher values to add
 */
function addTestVouchers(values = [100, 150, 200]) {
  // Get current user email from localStorage (more reliable than currentUser variable)
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    console.error("No user logged in. Please log in first.");
    showNotification("Please log in first to add test vouchers.", "warning");
    return false;
  }

  try {
    // Get user data with fallback to empty object
    let userData = {};
    try {
      userData = JSON.parse(
        localStorage.getItem(`userData_${userEmail}`) || "{}"
      );
    } catch (parseError) {
      console.error("Error parsing user data:", parseError);
      userData = {};
    }

    // Initialize rewards array if needed
    if (!userData.rewards) {
      userData.rewards = [];
    }

    // Add test vouchers with unique IDs
    const timestamp = Date.now();
    values.forEach((value, index) => {
      userData.rewards.push({
        id: `test_reward_${timestamp}_${index}`,
        type: "voucher",
        value: value.toString(),
        description: `E£${value} HyperOne Test Voucher`,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        used: false,
      });
    });

    // Save updated user data
    localStorage.setItem(`userData_${userEmail}`, JSON.stringify(userData));

    // Update currentUser variable to match localStorage
    currentUser = userEmail;

    // Reload user vouchers to update UI
    loadUserVouchers(userEmail);

    // Refresh products to update disabled state
    filterProducts(currentCategory || "all");

    // Also update cart UI if it exists
    if (typeof updateCartUI === "function") {
      updateCartUI();
    }

    // Calculate total value added
    const totalValue = values.reduce((sum, val) => sum + val, 0);

    // Show success notification instead of alert
    showNotification(
      `Added E£${totalValue} in test vouchers successfully! Balance: E£${userVoucherBalance}`,
      "success"
    );

    console.log(`Added ${values.length} test vouchers to account ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error adding test vouchers:", error);
    showNotification(
      "Failed to add test vouchers. See console for details.",
      "danger"
    );
    return false;
  }
}

/**
 * Test the purchase flow with a specific product
 * @param {string} productId - ID of the product to purchase
 */
function testPurchase(productId) {
  // Find the product
  const product = allProducts.find((p) => p.id === productId);
  if (!product) {
    console.error(`Product with ID ${productId} not found`);
    return;
  }

  // Log the current voucher balance
  console.log(`Current voucher balance: E£${userVoucherBalance}`);

  // Open the product details
  openProductDetails(productId);

  // Log guidance
  console.log(`Product "${product.name}" opened for purchase.`);
  console.log(`Price: ${product.price}`);
  console.log("You can now complete the purchase manually through the UI");
}

/**
 * Initialize development test mode
 * Shows test controls if in development environment
 */
function initDevTestMode() {
  // Check if we're in a development environment
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.search.includes("devmode=true");

  const devTestBtn = document.getElementById("devTestBtn");
  if (!devTestBtn) return;

  if (isDev) {
    // Show the test button
    devTestBtn.classList.remove("d-none");

    // Add click event
    devTestBtn.addEventListener("click", function () {
      // Add test vouchers
      if (addTestVouchers()) {
        // Show success message
        alert(
          `Test vouchers added successfully!\n\nCurrent balance: E£${userVoucherBalance}\nVoucher count: ${userVouchers.length}`
        );
      } else {
        // Show error message
        alert("Failed to add test vouchers. See console for details.");
      }
    });

    // Log instructions to console
    console.log(
      "%c Development Test Mode Enabled",
      "background: #fc0; color: #000; padding: 4px; font-weight: bold;"
    );
    console.log("Available test functions:");
    console.log(
      "- addTestVouchers([values]) - Add test vouchers with specified values"
    );
    console.log(
      "- testPurchase(productId) - Test purchasing a specific product"
    );
    console.log(
      "- checkVoucherBalance() - Check current voucher balance and details"
    );
    console.log(
      "- testVoucherDiscountScenarios() - Test the enhanced flexible discount scenarios"
    );
  }
}

/**
 * Test the enhanced voucher discount scenarios
 */
function testVoucherDiscountScenarios() {
  console.log("=== Testing Enhanced Voucher Discount Scenarios ===");

  const testScenarios = [
    {
      scenario: "Cart less than voucher",
      cartTotal: 75,
      voucherValue: 100,
      expected: {
        discountApplied: 75,
        remainingCartAmount: 0,
        remainingVoucherBalance: 25,
      },
    },
    {
      scenario: "Cart equals voucher",
      cartTotal: 100,
      voucherValue: 100,
      expected: {
        discountApplied: 100,
        remainingCartAmount: 0,
        remainingVoucherBalance: 0,
      },
    },
    {
      scenario: "Cart exceeds voucher",
      cartTotal: 250,
      voucherValue: 150,
      expected: {
        discountApplied: 150,
        remainingCartAmount: 100,
        remainingVoucherBalance: 0,
      },
    },
  ];

  testScenarios.forEach((test, index) => {
    console.log(`\n--- Test ${index + 1}: ${test.scenario} ---`);
    console.log(
      `Cart Total: E£${test.cartTotal}, Voucher Value: E£${test.voucherValue}`
    );

    const result = calculateVoucherDiscount(
      test.cartTotal,
      test.voucherValue,
      `TEST-${index + 1}`
    );

    console.log("Expected:", test.expected);
    console.log("Actual  :", {
      discountApplied: result.discountApplied,
      remainingCartAmount: result.remainingCartAmount,
      remainingVoucherBalance: result.remainingVoucherBalance,
    });

    // Verify results
    const passed =
      result.discountApplied === test.expected.discountApplied &&
      result.remainingCartAmount === test.expected.remainingCartAmount &&
      result.remainingVoucherBalance ===
        test.expected.remainingVoucherBalance &&
      result.canProceedToPurchase === true;

    console.log(`Result: ${passed ? "✅ PASSED" : "❌ FAILED"}`);

    if (!passed) {
      console.error("Test failed! Expected values don't match actual values.");
    }
  });

  console.log("\n=== Voucher Discount Test Complete ===");
}

// Make functions available globally for testing
window.addTestVouchers = addTestVouchers;
window.testPurchase = testPurchase;
window.testVoucherDiscountScenarios = testVoucherDiscountScenarios;
window.checkVoucherBalance = function () {
  console.log(`Current voucher balance: E£${userVoucherBalance}`);
  console.log(`Number of vouchers: ${userVouchers.length}`);
  console.log("Voucher details:", userVouchers);
};

/**
 * Initialize cart functionality
 */
function initCart() {
  // Load cart from localStorage if exists
  loadCart();

  // Update cart UI
  updateCartUI();

  // Setup cart button click
  if (cartBtn) {
    cartBtn.addEventListener("click", toggleCart);
  }

  // Setup close cart button
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", toggleCart);
  }

  // Setup cart overlay click to close
  if (cartOverlay) {
    cartOverlay.addEventListener("click", toggleCart);
  }

  // Setup clear cart button
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  // Setup checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", processCheckout);
  }
}

/**
 * Toggle cart sidebar with animation
 */
function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");
  const body = document.body;

  if (cartSidebar.classList.contains("active")) {
    // Close cart
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
    body.classList.remove("overflow-hidden");

    // Allow time for animation to complete
    setTimeout(() => {
      if (!cartSidebar.classList.contains("active")) {
        // Re-enable scrolling only if cart is still closed
        body.style.removeProperty("padding-right");
      }
    }, 400);
  } else {
    // Open cart
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.paddingRight = `${scrollbarWidth}px`;

    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
    body.classList.add("overflow-hidden");
  }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
  if (!currentUser) return;

  try {
    const savedCart = localStorage.getItem(`cart_${currentUser}`);
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
  if (!currentUser) return;

  try {
    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

/**
 * Add product to cart with animation
 */
function addToCart(productId) {
  // Find product
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  // Check if product is already in cart
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    // Increment quantity
    existingItem.quantity += 1;

    // Update UI to highlight the item in cart
    const cartItemElement = document.querySelector(
      `.cart-item-quantity input[data-product-id="${productId}"]`
    );
    if (cartItemElement) {
      // Cart is currently open, animate the quantity change
      cartItemElement.classList.add("highlight-change");
      setTimeout(
        () => cartItemElement.classList.remove("highlight-change"),
        1000
      );
    }
  } else {
    // Add new item
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      priceValue: parseFloat(product.price.replace("E£", "").trim()),
      image: product.image,
      quantity: 1,
    });

    // If cart is closed, open it to show the new item (but don't auto-close it)
    const cartSidebar = document.getElementById("cartSidebar");
    if (!cartSidebar.classList.contains("active")) {
      toggleCart(); // Open cart and keep it open
    }
  }

  // Save cart
  saveCart();

  // Update cart UI
  updateCartUI();

  // Animate the cart button
  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.classList.add("pulse-animation");
    setTimeout(() => {
      cartBtn.classList.remove("pulse-animation");
    }, 1000);
  }

  // Show notification
  showNotification(`${product.name} added to cart`, "success");
}

/**
 * Remove item from cart with animation
 */
function removeFromCart(productId) {
  // Find item index
  const itemIndex = cart.findIndex((item) => item.id === productId);
  if (itemIndex === -1) return;

  // Get item for notification
  const item = cart[itemIndex];

  // Remove item
  cart.splice(itemIndex, 1);

  // Save cart
  saveCart();

  // Update cart UI
  updateCartUI();

  // Show notification
  showNotification(`${item.name} removed from cart`, "warning");
}

/**
 * Update item quantity in cart with animation
 */
function updateCartItemQuantity(productId, quantity) {
  // Validate quantity
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) quantity = 1;

  // Find item
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  // Get previous quantity for animation
  const previousQuantity = item.quantity;

  // Update quantity
  item.quantity = quantity;

  // Save cart
  saveCart();

  // Update cart UI
  updateCartUI();

  // Find and animate the updated quantity in the DOM
  const qtyInput = document.querySelector(
    `.qty-input[data-product-id="${productId}"]`
  );
  if (qtyInput) {
    // Add highlight animation
    qtyInput.classList.add("highlight-change");

    // Remove the class after animation completes
    setTimeout(() => {
      qtyInput.classList.remove("highlight-change");
    }, 500);
  }

  // Show feedback if quantity increased
  if (quantity > previousQuantity) {
    showNotification(`Added another ${item.name} to cart`, "success");
  }
}

/**
 * Update cart UI with animation and format numbers properly
 */
function updateCartUI() {
  // Update cart badge count
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartBadgeCount = document.getElementById("cartBadgeCount");

  if (cartBadgeCount) {
    // Animate count change
    if (cartBadgeCount.textContent !== totalItems.toString()) {
      cartBadgeCount.classList.add("scale-animation");
      setTimeout(() => cartBadgeCount.classList.remove("scale-animation"), 500);
    }
    cartBadgeCount.textContent = totalItems;
  }

  // Toggle empty cart message
  const cartEmptyMessage = document.getElementById("cartEmptyMessage");
  const cartItems = document.getElementById("cartItems");

  if (cartEmptyMessage && cartItems) {
    if (cart.length === 0) {
      cartEmptyMessage.classList.remove("d-none");
      cartItems.classList.add("d-none");
    } else {
      cartEmptyMessage.classList.add("d-none");
      cartItems.classList.remove("d-none");
    }
  }

  // Calculate cart total
  const cartTotal = calculateCartTotal();

  // Calculate voucher discount using flexible system
  const discountResult = calculateVoucherDiscount(
    cartTotal,
    userVoucherBalance
  );

  // Update subtotal with proper formatting
  const cartSubtotal = document.getElementById("cartSubtotal");
  if (cartSubtotal) {
    cartSubtotal.textContent = `E£${formatCurrency(cartTotal)}`;
  }

  // Update voucher balance
  const cartVoucherBalance = document.getElementById("cartVoucherBalance");
  if (cartVoucherBalance) {
    cartVoucherBalance.textContent = `E£${formatCurrency(userVoucherBalance)}`;
  }

  // Update voucher discount applied
  const cartVoucherDiscount = document.getElementById("cartVoucherDiscount");
  if (cartVoucherDiscount) {
    cartVoucherDiscount.textContent = `E£${formatCurrency(
      discountResult.discountApplied
    )}`;
  }

  // Update remaining balance
  const cartRemainingBalance = document.getElementById("cartRemainingBalance");
  if (cartRemainingBalance) {
    cartRemainingBalance.textContent = `E£${formatCurrency(
      discountResult.remainingCartAmount
    )}`;

    // Highlight if the amount changes
    cartRemainingBalance.classList.add("highlight-change");
    setTimeout(
      () => cartRemainingBalance.classList.remove("highlight-change"),
      500
    );
  }

  // Enable/disable checkout button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.disabled = cartTotal <= 0;
  }

  // Render cart items
  renderCartItems();
}

/**
 * Format currency with 2 decimal places
 * @param {number} value - The value to format
 * @returns {string} Formatted value
 */
function formatCurrency(value) {
  return value.toFixed(2);
}

/**
 * Clear all items from cart with confirmation
 */
function clearCart() {
  // Check if cart has items first
  if (cart.length === 0) {
    showNotification("Your cart is already empty", "info");
    return;
  }

  // Create or get confirmation modal
  let confirmModal = document.getElementById("clearCartConfirmModal");

  if (!confirmModal) {
    // Create modal if it doesn't exist
    const modalHTML = `
      <div class="modal fade" id="clearCartConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title">Clear Cart</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
              <i class="fas fa-trash-alt fa-3x text-warning mb-3"></i>
              <h5>Are you sure you want to clear your cart?</h5>
              <p class="text-muted mb-0">This will remove all items from your cart.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-warning" id="confirmClearCartBtn">Clear Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    confirmModal = document.getElementById("clearCartConfirmModal");

    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(confirmModal);

    // Add event listener to confirm button
    document
      .getElementById("confirmClearCartBtn")
      .addEventListener("click", function () {
        // Actually clear the cart
        cart = [];
        saveCart();
        updateCartUI();

        // Hide modal
        bsModal.hide();

        // Show notification
        showNotification("Cart cleared successfully", "success");
      });
  } else {
    // Initialize Bootstrap modal if it already exists
    const bsModal = new bootstrap.Modal(confirmModal);
    bsModal.show();
  }
}

/**
 * Process checkout with flexible voucher discount system
 */
function processCheckout() {
  // Check if cart is empty
  if (cart.length === 0) {
    showNotification("Your cart is empty", "warning");
    return;
  }

  // Calculate cart total
  const cartTotal = calculateCartTotal();

  // Calculate voucher discount using flexible system
  const discountResult = calculateVoucherDiscount(
    cartTotal,
    userVoucherBalance
  );

  // Show checkout confirmation modal with discount breakdown
  document.getElementById(
    "checkoutTotalAmount"
  ).textContent = `E£${cartTotal.toFixed(2)}`;
  document.getElementById(
    "checkoutCurrentBalance"
  ).textContent = `E£${userVoucherBalance.toFixed(2)}`;

  // Show voucher discount applied
  const checkoutVoucherDiscount = document.getElementById(
    "checkoutVoucherDiscount"
  );
  if (checkoutVoucherDiscount) {
    checkoutVoucherDiscount.textContent = `E£${discountResult.discountApplied.toFixed(
      2
    )}`;
  }

  // Show amount to pay after voucher discount
  document.getElementById(
    "checkoutRemainingBalance"
  ).textContent = `E£${discountResult.remainingCartAmount.toFixed(2)}`;

  // Get cart item count
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("checkoutItemCount").textContent = itemCount;

  // Show modal
  checkoutConfirmModal.show();
}

/**
 * Process cart purchase with flexible voucher discount system
 */
function processCartPurchase() {
  // Calculate total
  const cartTotal = calculateCartTotal();

  // Calculate voucher discount
  const discountResult = calculateVoucherDiscount(
    cartTotal,
    userVoucherBalance
  );

  // Generate voucher code
  const voucherCode = generateVoucherCode();

  // Create concatenated product name for the record
  const productNames = cart
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(", ");

  // Store the previous balance for display
  const previousBalance = userVoucherBalance;

  try {
    // Update user vouchers with only the discount amount used (not full cart total)
    const voucherAmountUsed = discountResult.discountApplied;

    if (voucherAmountUsed > 0) {
      updateUserVouchers(voucherAmountUsed, voucherCode, productNames);
    }

    // Clear cart after successful purchase
    cart = [];
    saveCart();
    updateCartUI();

    // Close cart sidebar if open
    if (cartSidebar.classList.contains("active")) {
      toggleCart();
    }

    // Show success modal
    purchaseSuccessModal.show();

    // Log success to console with enhanced details
    console.log("Purchase completed successfully!");
    console.log(`Cart Total: E£${cartTotal}`);
    console.log(`Previous Voucher Balance: E£${previousBalance}`);
    console.log(
      `Voucher Discount Applied: E£${discountResult.discountApplied}`
    );
    console.log(
      `Amount to Pay Separately: E£${discountResult.remainingCartAmount}`
    );
    console.log(
      `Remaining Voucher Balance: E£${discountResult.remainingVoucherBalance}`
    );

    // Show enhanced notification
    if (discountResult.remainingCartAmount > 0) {
      showNotification(
        `Purchase completed! Voucher discount: E£${discountResult.discountApplied.toFixed(
          2
        )}, Pay separately: E£${discountResult.remainingCartAmount.toFixed(2)}`,
        "success"
      );
    } else {
      showNotification(
        `Purchase completed with full voucher coverage!`,
        "success"
      );
    }
  } catch (error) {
    console.error("Error processing purchase:", error);
    showNotification("Error processing purchase", "danger");
  }
}

/**
 * Show notification
 * @param {string} message - Message to show
 * @param {string} type - Notification type (success, warning, danger)
 */
function showNotification(message, type = "success") {
  // Clean up any existing notifications to prevent stacking
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => {
    notif.classList.remove("show");
    setTimeout(() => {
      if (notif.parentNode) {
        notif.parentNode.removeChild(notif);
      }
    }, 300);
  });

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "warning"
          ? "fa-exclamation-triangle"
          : "fa-times-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  // Ensure notification is on top of other elements
  notification.style.zIndex = "9999";

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = `<i class="fas fa-times"></i>`;
  closeButton.className = "notification-close";
  closeButton.style.background = "transparent";
  closeButton.style.border = "none";
  closeButton.style.color = "inherit";
  closeButton.style.opacity = "0.7";
  closeButton.style.marginLeft = "10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.padding = "0";
  closeButton.onclick = function () {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };

  notification.querySelector(".notification-content").appendChild(closeButton);

  // Add to body
  document.body.appendChild(notification);

  // Trigger animation after a short delay to ensure proper rendering
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000); // Increased to 5 seconds for better readability
}

/**
 * Render cart items with animation
 */
function renderCartItems() {
  // Get the cart items container
  const cartItems = document.getElementById("cartItemsList");

  if (!cartItems) return;

  // Clear items container
  cartItems.innerHTML = "";

  // Render each item with staggered animation delay
  cart.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.style.animationDelay = `${index * 0.1}s`;

    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
        <div class="cart-item-quantity">
          <button class="qty-btn-minus" data-product-id="${item.id}">−</button>
          <input type="number" min="1" value="${item.quantity}" class="qty-input" data-product-id="${item.id}">
          <button class="qty-btn-plus" data-product-id="${item.id}">+</button>
          <span class="cart-item-remove" data-product-id="${item.id}" title="Remove item">
            <i class="fas fa-trash-alt"></i>
          </span>
        </div>
      </div>
    `;

    // Add to container
    cartItems.appendChild(itemElement);

    // Add event listeners for quantity buttons
    const minusBtn = itemElement.querySelector(".qty-btn-minus");
    const plusBtn = itemElement.querySelector(".qty-btn-plus");
    const qtyInput = itemElement.querySelector(".qty-input");
    const removeBtn = itemElement.querySelector(".cart-item-remove");

    minusBtn.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      const item = cart.find((item) => item.id === productId);
      if (item && item.quantity > 1) {
        updateCartItemQuantity(productId, item.quantity - 1);
      }
    });

    plusBtn.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      const item = cart.find((item) => item.id === productId);
      if (item) {
        updateCartItemQuantity(productId, item.quantity + 1);
      }
    });

    qtyInput.addEventListener("change", function () {
      const productId = this.getAttribute("data-product-id");
      const newQuantity = parseInt(this.value);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        updateCartItemQuantity(productId, newQuantity);
      } else {
        // Reset to 1 if invalid value
        this.value = 1;
        updateCartItemQuantity(productId, 1);
      }
    });

    removeBtn.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");

      // Add remove animation
      this.closest(".cart-item").classList.add("removing");

      // Wait for animation before actually removing
      setTimeout(() => {
        removeFromCart(productId);
      }, 300);
    });
  });

  // Add "Browse Products" button event
  const browseProductsBtn = document.getElementById("browseProductsBtn");
  if (browseProductsBtn) {
    browseProductsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      toggleCart(); // Close the cart

      // Scroll to products with animation
      setTimeout(() => {
        const productsSection = document.querySelector("#productsContainer");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    });
  }
}

/**
 * Calculate cart total
 * @returns {number} Total cart value
 */
function calculateCartTotal() {
  return cart.reduce((total, item) => {
    return total + item.priceValue * item.quantity;
  }, 0);
}
