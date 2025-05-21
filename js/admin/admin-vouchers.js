// admin-vouchers.js
// Vouchers management module for admin dashboard

console.log("[VOUCHERS] admin-vouchers.js loaded");

const VOUCHERS_KEY = "adminVouchers";

// Dummy data fallback
const dummyVouchers = [
  { market: "Amazon", value: 5000, discount: 25, currency: "$" },
  { market: "Starbucks", value: 2000, discount: 10, currency: "$" },
  { market: "Walmart", value: 3000, discount: 15, currency: "$" },
  { market: "Best Buy", value: 8000, discount: 50, currency: "$" },
  { market: "Target", value: 4500, discount: 20, currency: "$" },
  { market: "Uber", value: 3500, discount: 15, currency: "$" },
  { market: "Spotify", value: 1800, discount: 9.99, currency: "$" },
  { market: "Apple Store", value: 10000, discount: 100, currency: "$" },
  { market: "Steam", value: 2500, discount: 30, currency: "$" },
  { market: "Nintendo eShop", value: 4000, discount: 35, currency: "$" },
];

function getVouchers() {
  const stored = localStorage.getItem(VOUCHERS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return [...dummyVouchers]; // Return dummy data if array is empty
    } catch {
      return [...dummyVouchers];
    }
  }
  return [...dummyVouchers];
}

function saveVouchers(vouchers) {
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
}

// Initialize vouchers data if not present
function initializeVouchers() {
  const stored = localStorage.getItem(VOUCHERS_KEY);
  if (!stored) {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(dummyVouchers));
    console.log("Initialized vouchers with dummy data");
  }
}

// Clean up vouchers in localStorage if any are missing required fields
function cleanUpVouchers() {
  let vouchers = getVouchers();
  let changed = false;
  vouchers = vouchers.map((v) => {
    // If any field is missing, set a default
    if (typeof v.value !== "number" || isNaN(v.value)) {
      v.value = 0;
      changed = true;
    }
    if (typeof v.discount !== "number" || isNaN(v.discount)) {
      v.discount = 0;
      changed = true;
    }
    if (!v.currency) {
      v.currency = "$";
      changed = true;
    }
    if (!v.market) {
      v.market = "Unknown";
      changed = true;
    }
    return v;
  });
  if (changed) {
    saveVouchers(vouchers);
    console.log("[VOUCHERS] Cleaned up vouchers in localStorage");
  }
}

// Call cleanUpVouchers on load
cleanUpVouchers();

function renderVouchersTable() {
  console.log("[VOUCHERS] renderVouchersTable called");
  const tbody = document.getElementById("vouchersTableBody");
  if (!tbody) {
    console.error("[VOUCHERS] vouchersTableBody not found");
    return;
  }
  tbody.innerHTML = "";
  const vouchers = getVouchers();
  if (vouchers.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="text-center text-muted">No vouchers available.</td>`;
    tbody.appendChild(row);
    return;
  }
  vouchers.forEach((voucher, idx) => {
    // Defensive: fallback to 0 if value/discount is missing
    const value =
      typeof voucher.value === "number" && !isNaN(voucher.value)
        ? voucher.value
        : 0;
    const discount =
      typeof voucher.discount === "number" && !isNaN(voucher.discount)
        ? voucher.discount
        : 0;
    const currency = voucher.currency || "$";
    const market = voucher.market || "Unknown";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${market}</td>
      <td><span class="badge bg-primary">${value.toLocaleString()} pts</span></td>
      <td><span class="badge bg-success">${currency}${discount.toLocaleString()}</span></td>
      <td>
        <button class="btn btn-outline-danger btn-sm delete-voucher-btn" data-idx="${idx}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  // Attach delete handlers
  tbody.querySelectorAll(".delete-voucher-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.getAttribute("data-idx"));
      deleteVoucher(idx);
    });
  });
}

function addVoucher(market, value, discount, currency) {
  console.log("[VOUCHERS] addVoucher called with:", {
    market,
    value,
    discount,
    currency,
  });
  // Validate inputs again for safety
  if (!market || typeof market !== "string" || market.trim() === "") {
    console.error("[VOUCHERS] Market name is invalid:", market);
    throw new Error("Market name is required");
  }

  if (isNaN(value) || value <= 0) {
    console.error("[VOUCHERS] Points value is invalid:", value);
    throw new Error("Points value must be a positive number");
  }

  if (isNaN(discount) || discount <= 0) {
    console.error("[VOUCHERS] Discount amount is invalid:", discount);
    throw new Error("Discount amount must be a positive number");
  }

  // Normalize currency - default to $ if not provided
  const normalizedCurrency = (currency || "$").charAt(0);
  console.log("[VOUCHERS] Normalized currency:", normalizedCurrency);

  try {
    // Get current vouchers
    const vouchers = getVouchers();
    console.log("[VOUCHERS] Current vouchers:", vouchers);

    // Create new voucher object
    const newVoucher = {
      market,
      value: Number(value),
      discount: Number(discount),
      currency: normalizedCurrency,
    };
    console.log("[VOUCHERS] New voucher to add:", newVoucher);

    // Add to array
    vouchers.push(newVoucher);
    console.log("[VOUCHERS] Vouchers after push:", vouchers);

    // Save to localStorage
    saveVouchers(vouchers);
    console.log("[VOUCHERS] Vouchers saved to localStorage");

    // Refresh the table display
    renderVouchersTable();
    console.log("[VOUCHERS] Table rendered");

    return true;
  } catch (error) {
    console.error("[VOUCHERS] Error in addVoucher:", error);
    // Show error in alert and visible error box
    alert("Add voucher failed: " + error.message);
    const form = document.getElementById("addVoucherForm");
    if (form) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "alert alert-danger mt-3";
      errorMessage.innerHTML = `<i class='fas fa-exclamation-triangle me-2'></i> ${error.message}`;
      form.appendChild(errorMessage);
      setTimeout(() => {
        if (errorMessage.parentNode === form) {
          form.removeChild(errorMessage);
        }
      }, 4000);
    }
    throw new Error("Failed to add voucher: " + error.message);
  }
}

function deleteVoucher(idx) {
  let vouchers = getVouchers();
  vouchers.splice(idx, 1);
  saveVouchers(vouchers);
  renderVouchersTable();
}

function setupAddVoucherForm() {
  const form = document.getElementById("addVoucherForm");
  if (!form) {
    console.error("Voucher form not found in the DOM");
    return;
  }

  // Prevent attaching multiple listeners
  if (form._voucherListenerAttached) return;
  form._voucherListenerAttached = true;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("[VOUCHERS] Voucher form submitted");

    // Get form elements
    const marketInput = document.getElementById("voucherMarket");
    const valueInput = document.getElementById("voucherValue");
    const discountInput = document.getElementById("voucherDiscount");
    const currencyInput = document.getElementById("voucherCurrency");

    // Check if elements exist
    if (!marketInput || !valueInput || !discountInput || !currencyInput) {
      console.error("[VOUCHERS] One or more form elements not found", {
        marketInput,
        valueInput,
        discountInput,
        currencyInput,
      });
      alert(
        "Form error: Some form fields could not be found. Please reload the page."
      );
      return;
    }

    // Get values
    const market = marketInput.value.trim();
    const valueStr = valueInput.value.trim();
    const discountStr = discountInput.value.trim();
    const currency = currencyInput.value.trim() || "$";

    console.log("[VOUCHERS] Form values:", {
      market,
      valueStr,
      discountStr,
      currency,
    });

    // Validate values
    if (!market) {
      alert("Please enter a market name.");
      marketInput.focus();
      return;
    }

    const value = parseInt(valueStr);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid positive number for points.");
      valueInput.focus();
      return;
    }

    const discount = parseFloat(discountStr);
    if (isNaN(discount) || discount <= 0) {
      alert("Please enter a valid positive number for discount amount.");
      discountInput.focus();
      return;
    }

    // All validation passed, add the voucher
    try {
      addVoucher(market, value, discount, currency);
      console.log("[VOUCHERS] Voucher added successfully:", {
        market,
        value,
        discount,
        currency,
      });

      // Reset form
      form.reset();

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "alert alert-success mt-3";
      successMessage.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Voucher for ${market} added successfully!
      `;
      form.appendChild(successMessage);

      // Remove success message after 3 seconds
      setTimeout(() => {
        if (successMessage.parentNode === form) {
          form.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error("[VOUCHERS] Error adding voucher:", error);
      alert("An error occurred while adding the voucher. Please try again.");
      // Show visible error
      const errorMessage = document.createElement("div");
      errorMessage.className = "alert alert-danger mt-3";
      errorMessage.innerHTML = `<i class='fas fa-exclamation-triangle me-2'></i> ${error.message}`;
      form.appendChild(errorMessage);
      setTimeout(() => {
        if (errorMessage.parentNode === form) {
          form.removeChild(errorMessage);
        }
      }, 4000);
    }
  });

  // Add keypress listener to submit on Enter in the last field
  const discountInput = document.getElementById("voucherDiscount");
  if (discountInput && !discountInput._voucherKeyListenerAttached) {
    discountInput._voucherKeyListenerAttached = true;
    discountInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
      }
    });
  }
}

function showVouchersSection() {
  console.log("Showing vouchers section");

  try {
    // Hide all content sections first
    document.querySelectorAll(".content-section").forEach((sec) => {
      sec.classList.add("d-none");
    });

    // Get the vouchers section
    const section = document.getElementById("vouchersSection");

    if (!section) {
      console.error("Vouchers section not found in DOM");
      return;
    }

    // Show the vouchers section
    section.classList.remove("d-none");

    // Update page title if it exists
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = "Vouchers";
    }

    // Update sidebar active state
    document.querySelectorAll(".sidebar-menu a").forEach((link) => {
      link.classList.remove("active");
    });

    const nav = document.getElementById("vouchersNavLink");
    if (nav) {
      nav.classList.add("active");
    } else {
      console.warn("Vouchers nav link not found");
    }

    // Check form elements are present and set up
    const form = document.getElementById("addVoucherForm");
    if (!form) {
      console.warn("Voucher form not found when showing section");
      // Try to set it up again just in case
      setupAddVoucherForm();
    }

    // Render vouchers table
    renderVouchersTable();

    // Update URL hash without reload
    if (history && history.pushState) {
      history.pushState(null, null, "#vouchers");
    } else {
      window.location.hash = "vouchers";
    }

    console.log("Vouchers section displayed successfully");
  } catch (error) {
    console.error("Error showing vouchers section:", error);
  }
}

function setupVouchersNav() {
  const nav = document.getElementById("vouchersNavLink");
  if (nav) {
    nav.addEventListener("click", function (e) {
      e.preventDefault();
      showVouchersSection();
    });
  }
}

// Initialize on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVouchersModule);
} else {
  // If DOM is already loaded, initialize immediately
  initVouchersModule();
}

function initVouchersModule() {
  console.log("Initializing vouchers module");

  try {
    // Initialize vouchers data in localStorage
    initializeVouchers();

    // Set up form after a slight delay to ensure DOM is fully processed
    setTimeout(() => {
      setupAddVoucherForm();
    }, 100);

    // Setup navigation
    setupVouchersNav();

    // If hash is #vouchers, show vouchers section
    if (window.location.hash === "#vouchers") {
      // Use a timeout to ensure DOM is ready
      setTimeout(showVouchersSection, 200);
    }

    // Add a click listener to the sidebar menu item as a fallback
    const sidebarLink = document.querySelector(
      '.sidebar-menu a[href="#vouchers"]'
    );
    if (sidebarLink) {
      sidebarLink.addEventListener("click", function (e) {
        e.preventDefault();
        showVouchersSection();
      });
    }

    console.log("Vouchers module initialized successfully");
  } catch (error) {
    console.error("Error initializing vouchers module:", error);
  }
}

// Expose useful functions for debugging
window.renderVouchersTable = renderVouchersTable;
window.addVoucher = addVoucher;
window.showVouchersSection = showVouchersSection;
