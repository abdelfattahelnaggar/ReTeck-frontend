/**
 * Market Page JavaScript
 * Handles product loading, filtering, and purchase functionality
 */

// Mock data for products
const productData = [
  {
    id: "p001",
    name: "Fresh Milk",
    category: "food",
    price: "E£25.99",
    image: "../images/market/milk.jpg",
    description:
      "Fresh cow milk, pasteurized and homogenized. Rich in calcium and vitamin D.",
    vouchersRequired: 1,
    isNew: true,
  },
  {
    id: "p002",
    name: "Organic Eggs (12-pack)",
    category: "food",
    price: "E£45.50",
    image: "../images/market/eggs.jpg",
    description:
      "Farm-fresh organic eggs from free-range chickens. No hormones or antibiotics.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p003",
    name: "Whole Grain Bread",
    category: "food",
    price: "E£18.75",
    image: "../images/market/bread.jpg",
    description:
      "Freshly baked whole grain bread made with natural ingredients and no preservatives.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p004",
    name: "Premium Coffee Beans",
    category: "beverages",
    price: "E£89.99",
    image: "../images/market/coffee.jpg",
    description:
      "Premium Arabica coffee beans, medium roast with rich flavor and aromatic notes.",
    vouchersRequired: 2,
    isNew: true,
  },
  {
    id: "p005",
    name: "Herbal Tea Collection",
    category: "beverages",
    price: "E£65.50",
    image: "../images/market/tea.jpg",
    description:
      "Assorted herbal teas including chamomile, peppermint, and lemon ginger.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p006",
    name: "Fresh Orange Juice",
    category: "beverages",
    price: "E£35.25",
    image: "../images/market/juice.jpg",
    description:
      "Freshly squeezed orange juice with no added sugar or preservatives.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p007",
    name: "Eco-Friendly Dish Soap",
    category: "household",
    price: "E£42.99",
    image: "../images/market/dish-soap.jpg",
    description:
      "Plant-based dish soap that is tough on grease but gentle on the environment.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p008",
    name: "Bamboo Paper Towels",
    category: "household",
    price: "E£55.75",
    image: "../images/market/paper-towels.jpg",
    description:
      "Sustainable bamboo paper towels that are reusable and biodegradable.",
    vouchersRequired: 1,
    isNew: true,
  },
  {
    id: "p009",
    name: "Natural Laundry Detergent",
    category: "household",
    price: "E£79.50",
    image: "../images/market/detergent.jpg",
    description:
      "Hypoallergenic laundry detergent made from natural ingredients, free from harsh chemicals.",
    vouchersRequired: 2,
    isNew: false,
  },
  {
    id: "p010",
    name: "Organic Shampoo",
    category: "personal",
    price: "E£62.25",
    image: "../images/market/shampoo.jpg",
    description:
      "Organic shampoo with natural oils that nourish and strengthen hair.",
    vouchersRequired: 1,
    isNew: false,
  },
  {
    id: "p011",
    name: "Natural Moisturizer",
    category: "personal",
    price: "E£85.99",
    image: "../images/market/moisturizer.jpg",
    description:
      "Hydrating moisturizer made with aloe vera and essential oils for all skin types.",
    vouchersRequired: 2,
    isNew: true,
  },
  {
    id: "p012",
    name: "Bamboo Toothbrushes (4-pack)",
    category: "personal",
    price: "E£45.50",
    image: "../images/market/toothbrushes.jpg",
    description:
      "Eco-friendly bamboo toothbrushes with soft bristles for gentle cleaning.",
    vouchersRequired: 1,
    isNew: false,
  },
];

// Global variables
let currentUser = null;
let userVouchers = []; // Will store actual voucher objects
let userVoucherBalance = 0; // Total monetary value of available vouchers
let selectedProduct = null;
let currentCategory = "all";
let cart = []; // Shopping cart items

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
        ? productData
        : productData.filter((product) => product.category === category);

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
    renderProducts(productData);
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

    // Check if user has enough voucher balance for this product
    const hasEnoughBalance = userVoucherBalance >= priceValue;

    // Create product card
    const productCard = document.createElement("div");
    productCard.className = `col-lg-3 col-md-4 col-sm-6 mb-4 ${
      hasEnoughBalance ? "" : "disabled"
    }`;

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
              <i class="fas fa-ticket-alt me-1"></i> ${
                hasEnoughBalance ? "Affordable" : "Not enough balance"
              }
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
            }" ${hasEnoughBalance ? "" : "disabled"}>
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
  // Find product by id
  const product = productData.find((p) => p.id === productId);
  if (!product) return;

  // Save selected product
  selectedProduct = product;

  // Extract price value without currency
  const priceValue = parseFloat(product.price.replace("E£", "").trim());

  // Update modal content
  document.getElementById("modalProductImage").src = product.image;
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductCategory").textContent =
    product.category;
  document.getElementById("modalProductPrice").textContent = product.price;
  document.getElementById("modalProductDescription").textContent =
    product.description;
  document.getElementById(
    "modalVoucherRequired"
  ).textContent = `E£${priceValue} will be deducted from your voucher balance`;

  // Check if user has enough voucher balance
  const purchaseButton = document.getElementById("purchaseButton");
  const hasEnoughBalance = userVoucherBalance >= priceValue;

  if (hasEnoughBalance) {
    purchaseButton.disabled = false;
    purchaseButton.innerHTML = `<i class="fas fa-shopping-cart me-1"></i> Purchase with Voucher`;
  } else {
    purchaseButton.disabled = true;
    purchaseButton.innerHTML = `<i class="fas fa-times-circle me-1"></i> Insufficient Voucher Balance`;
  }

  // Setup purchase button click
  purchaseButton.onclick = function () {
    if (userVoucherBalance >= priceValue) {
      openConfirmPurchase(product);
    }
  };

  // Add "Add to Cart" button to the modal footer
  const modalFooter = document.querySelector("#productModal .modal-footer");

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
  addToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-1"></i> Add to Cart';
  addToCartBtn.disabled = !hasEnoughBalance;

  // Add click event
  addToCartBtn.addEventListener("click", function () {
    addToCart(product.id);
    productModal.hide();
  });

  // Insert at the beginning of modal footer
  modalFooter.insertBefore(addToCartBtn, modalFooter.firstChild);

  // Show modal
  productModal.show();
}

/**
 * Open confirm purchase modal
 */
function openConfirmPurchase(product) {
  // Hide product details modal
  productModal.hide();

  // Extract price value without currency
  const priceValue = parseFloat(product.price.replace("E£", "").trim());

  // Update confirmation modal content
  document.getElementById("confirmProductName").textContent = product.name;
  document.getElementById(
    "confirmCurrentVouchers"
  ).textContent = `E£${userVoucherBalance}`;
  document.getElementById(
    "confirmRequiredVouchers"
  ).textContent = `E£${priceValue}`;
  document.getElementById("confirmRemainingVouchers").textContent = `E£${
    userVoucherBalance - priceValue
  }`;

  // Setup confirm button
  document.getElementById("confirmPurchaseButton").onclick = function () {
    completePurchase(product);
  };

  // Show confirmation modal
  confirmPurchaseModal.show();
}

/**
 * Complete purchase
 */
function completePurchase(product) {
  // Hide confirmation modal
  confirmPurchaseModal.hide();

  // Generate voucher code
  const voucherCode = generateVoucherCode();

  // Extract price value without currency
  const priceValue = parseFloat(product.price.replace("E£", "").trim());

  // Update user data
  updateUserVouchers(priceValue, voucherCode, product.name);

  // Show success modal
  document.getElementById("voucherCode").textContent = voucherCode;
  purchaseSuccessModal.show();
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
  productData.forEach((product) => {
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
  if (!currentUser) {
    console.error("No user logged in. Please log in first.");
    return false;
  }

  try {
    // Get user data
    const userData = JSON.parse(
      localStorage.getItem(`userData_${currentUser}`) || "{}"
    );

    // Initialize rewards array if needed
    if (!userData.rewards) {
      userData.rewards = [];
    }

    // Add test vouchers with specified values
    values.forEach((value, index) => {
      userData.rewards.push({
        id: `test_reward_${Date.now()}_${index}`,
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
    localStorage.setItem(`userData_${currentUser}`, JSON.stringify(userData));

    // Reload user vouchers to update UI
    loadUserVouchers(currentUser);

    // Refresh products to update disabled state
    filterProducts(currentCategory);

    console.log(
      `Added ${values.length} test vouchers to account ${currentUser}`
    );
    return true;
  } catch (error) {
    console.error("Error adding test vouchers:", error);
    return false;
  }
}

/**
 * Test the purchase flow with a specific product
 * @param {string} productId - ID of the product to purchase
 */
function testPurchase(productId) {
  // Find the product
  const product = productData.find((p) => p.id === productId);
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
  }
}

// Make functions available globally for testing
window.addTestVouchers = addTestVouchers;
window.testPurchase = testPurchase;
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
 * Toggle cart sidebar
 */
function toggleCart() {
  cartSidebar.classList.toggle("active");
  cartOverlay.classList.toggle("active");
  document.body.classList.toggle("overflow-hidden");
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
 * Add product to cart
 */
function addToCart(productId) {
  // Find product
  const product = productData.find((p) => p.id === productId);
  if (!product) return;

  // Check if product is already in cart
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    // Increment quantity
    existingItem.quantity += 1;
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
  }

  // Save cart
  saveCart();

  // Update cart UI
  updateCartUI();

  // Show notification
  showNotification(`${product.name} added to cart`);
}

/**
 * Remove item from cart
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
  showNotification(`${item.name} removed from cart`);
}

/**
 * Update item quantity in cart
 */
function updateCartItemQuantity(productId, quantity) {
  // Validate quantity
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) quantity = 1;

  // Find item
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  // Update quantity
  item.quantity = quantity;

  // Save cart
  saveCart();

  // Update cart UI
  updateCartUI();
}

/**
 * Clear all items from cart
 */
function clearCart() {
  // Confirm before clearing
  if (
    cart.length === 0 ||
    confirm("Are you sure you want to clear your cart?")
  ) {
    cart = [];
    saveCart();
    updateCartUI();
    showNotification("Cart cleared");
  }
}

/**
 * Calculate cart total
 */
function calculateCartTotal() {
  return cart.reduce((total, item) => {
    return total + item.priceValue * item.quantity;
  }, 0);
}

/**
 * Update cart UI
 */
function updateCartUI() {
  // Update cart badge count
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadgeCount.textContent = totalItems;

  // Toggle empty cart message
  if (cart.length === 0) {
    cartEmptyMessage.classList.remove("d-none");
    cartItems.classList.add("d-none");
    checkoutBtn.disabled = true;
  } else {
    cartEmptyMessage.classList.add("d-none");
    cartItems.classList.remove("d-none");

    // Calculate cart total
    const cartTotal = calculateCartTotal();

    // Update subtotal
    cartSubtotal.textContent = `E£${cartTotal.toFixed(2)}`;

    // Update voucher balance
    cartVoucherBalance.textContent = `E£${userVoucherBalance}`;

    // Update remaining balance
    const remainingBalance = userVoucherBalance - cartTotal;
    cartRemainingBalance.textContent = `E£${remainingBalance.toFixed(2)}`;

    // Enable/disable checkout button based on balance
    checkoutBtn.disabled = cartTotal <= 0 || cartTotal > userVoucherBalance;

    // Render cart items
    renderCartItems();
  }
}

/**
 * Render cart items
 */
function renderCartItems() {
  // Clear items container
  cartItems.innerHTML = "";

  // Render each item
  cart.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
        <div class="cart-item-quantity">
          <button class="qty-btn-minus" data-product-id="${item.id}">-</button>
          <input type="number" min="1" value="${item.quantity}" class="qty-input" data-product-id="${item.id}">
          <button class="qty-btn-plus" data-product-id="${item.id}">+</button>
          <span class="cart-item-remove" data-product-id="${item.id}">
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
      updateCartItemQuantity(productId, this.value);
    });

    removeBtn.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      removeFromCart(productId);
    });
  });
}

/**
 * Process checkout
 */
function processCheckout() {
  // Check if cart is empty
  if (cart.length === 0) {
    showNotification("Your cart is empty", "warning");
    return;
  }

  // Calculate cart total
  const cartTotal = calculateCartTotal();

  // Check if user has enough balance
  if (cartTotal > userVoucherBalance) {
    showNotification("Insufficient voucher balance", "danger");
    return;
  }

  // Show checkout confirmation modal instead of default confirm
  document.getElementById(
    "checkoutTotalAmount"
  ).textContent = `E£${cartTotal.toFixed(2)}`;
  document.getElementById(
    "checkoutCurrentBalance"
  ).textContent = `E£${userVoucherBalance.toFixed(2)}`;
  document.getElementById("checkoutRemainingBalance").textContent = `E£${(
    userVoucherBalance - cartTotal
  ).toFixed(2)}`;

  // Get cart item count
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("checkoutItemCount").textContent = itemCount;

  // Show modal
  checkoutConfirmModal.show();
}

/**
 * Process cart purchase
 */
function processCartPurchase() {
  // Generate voucher code
  const voucherCode = generateVoucherCode();

  // Create concatenated product name for the record
  const productNames = cart
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(", ");

  // Calculate total
  const cartTotal = calculateCartTotal();

  // Store the previous balance for display
  const previousBalance = userVoucherBalance;

  try {
    // Update user vouchers with the total purchase
    updateUserVouchers(cartTotal, voucherCode, productNames);

    // Clear cart after successful purchase
    cart = [];
    saveCart();
    updateCartUI();

    // Close cart sidebar if open
    if (cartSidebar.classList.contains("active")) {
      toggleCart();
    }

    // Update success modal with transaction details
    document.getElementById("voucherCode").textContent = voucherCode;

    // Update transaction summary with animations
    const summaryTotal = document.getElementById("summaryTotal");
    const summaryPrevBalance = document.getElementById("summaryPrevBalance");
    const summaryRemBalance = document.getElementById("summaryRemBalance");
    const transactionDate = document.getElementById("transactionDate");

    summaryTotal.textContent = `E£${cartTotal.toFixed(2)}`;
    summaryPrevBalance.textContent = `E£${previousBalance.toFixed(2)}`;
    summaryRemBalance.textContent = `E£${(previousBalance - cartTotal).toFixed(
      2
    )}`;

    // Set transaction date with formatted date
    const now = new Date();
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    transactionDate.textContent = now.toLocaleDateString("en-US", options);

    // Add highlight animation class
    const transactionSummary = document.querySelector(".transaction-summary");
    transactionSummary.classList.add("highlight-animation");

    // Remove the animation class after it completes
    setTimeout(() => {
      transactionSummary.classList.remove("highlight-animation");
    }, 2000);

    // Show success modal
    purchaseSuccessModal.show();

    // Log success to console
    console.log("Purchase completed successfully!");
    console.log(`Previous balance: E£${previousBalance}`);
    console.log(`Amount spent: E£${cartTotal}`);
    console.log(`New balance: E£${userVoucherBalance}`);

    // Show a notification as well
    showNotification("Purchase completed successfully!", "success");
  } catch (error) {
    console.error("Error processing purchase:", error);
    showNotification("Error processing purchase", "danger");
  }
}

/**
 * Show notification
 */
function showNotification(message, type = "success") {
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

  // Add to body
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
