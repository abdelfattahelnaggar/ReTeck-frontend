/**
 * RETECH - Recycling Company Cart JavaScript
 *
 * This file contains the logic for the recycling company cart,
 * including cart management, order processing, and pickup scheduling.
 */

// Global variables
let cart = [];
let pickupItems = [];
let dropoffItems = [];

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Load cart from localStorage
  loadCart();

  // Update cart UI
  updateCartUI();

  // Set up event listeners
  setupEventListeners();

  // Display toast notification if redirected from dashboard or orders page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("success") && urlParams.has("message")) {
    showNotification(urlParams.get("message"), "Success");
  }
});

/**
 * Set up event listeners for the cart page
 */
function setupEventListeners() {
  // Remove item buttons using event delegation
  document
    .getElementById("cartItemsList")
    .addEventListener("click", function (event) {
      if (
        event.target.classList.contains("remove-from-cart-btn") ||
        event.target.closest(".remove-from-cart-btn")
      ) {
        const button = event.target.classList.contains("remove-from-cart-btn")
          ? event.target
          : event.target.closest(".remove-from-cart-btn");

        const deviceId = button.getAttribute("data-device-id");
        if (deviceId) {
          removeFromCart(parseInt(deviceId));
        }
      }
    });

  // Clear cart button
  const clearCartBtn = document.getElementById("clearCartBtn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  // Process order button (renamed from checkoutBtn in HTML)
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        showNotification(
          "Your cart is empty. Please add items before proceeding.",
          "Warning"
        );
        return;
      }
      openOrderModal();
    });
  }

  // Confirm order button
  const confirmOrderBtn = document.getElementById("confirmOrderBtn");
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", processOrder);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Date picker initialization for the preferred pickup date
  const pickupDateInput = document.getElementById("pickupDate");
  if (pickupDateInput) {
    // Set min date to today
    const today = new Date().toISOString().split("T")[0];
    pickupDateInput.setAttribute("min", today);

    // Set default value to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    pickupDateInput.value = tomorrow.toISOString().split("T")[0];
  }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
  const savedCart = localStorage.getItem("recyclingCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);

    // Separate pickup and dropoff items
    pickupItems = cart.filter((item) => item.shippingMethod === "pickup");
    dropoffItems = cart.filter((item) => item.shippingMethod === "visit");
  }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
  localStorage.setItem("recyclingCart", JSON.stringify(cart));
}

/**
 * Update the cart UI based on current cart contents
 */
function updateCartUI() {
  // Update cart count in navbar
  updateCartCount();

  // Get the cart items container
  const cartItemsList = document.getElementById("cartItemsList");
  const emptyCartView = document.getElementById("emptyCartView");
  const cartContent = document.getElementById("cartContent");

  // Check if cart is empty
  if (cart.length === 0) {
    if (emptyCartView) emptyCartView.classList.remove("d-none");
    if (cartContent) cartContent.classList.add("d-none");
    return;
  } else {
    if (emptyCartView) emptyCartView.classList.add("d-none");
    if (cartContent) cartContent.classList.remove("d-none");
  }

  // Clear existing items
  cartItemsList.innerHTML = "";

  // Add items to the cart table
  cart.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "cart-item-row";

    // Format date
    const dateReceived = new Date(item.dateReceived);
    const formattedDate = dateReceived.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Add the row content
    row.innerHTML = `
      <td>
        <img src="${item.image || "../images/placeholder-image.jpg"}" alt="${
      item.name
    }" class="device-img">
      </td>
      <td>
        <div class="device-title">${item.name}</div>
        <div class="device-type">${item.condition}</div>
      </td>
      <td>${capitalizeFirstLetter(item.type)}</td>
      <td>
        <span class="badge ${
          item.shippingMethod === "pickup" ? "badge-pickup" : "badge-dropoff"
        }">
          ${item.shippingMethod === "pickup" ? "Pickup" : "Drop-off"}
        </span>
      </td>
      <td>
        <div class="device-location">${item.location}</div>
      </td>
      <td>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm remove-from-cart-btn"
          data-device-id="${item.id}"
        >
          <i class="fas fa-trash"></i>
          <span class="visually-hidden">Remove</span>
        </button>
      </td>
    `;

    // Add to container
    cartItemsList.appendChild(row);
  });

  // Update order summary
  updateOrderSummary();

  // Update pickup details section visibility
  const pickupScheduleCard = document.querySelector(".order-summary-card.mt-3");
  if (pickupScheduleCard) {
    if (pickupItems.length > 0) {
      pickupScheduleCard.classList.remove("d-none");
    } else {
      pickupScheduleCard.classList.add("d-none");
    }
  }
}

/**
 * Update the order summary card
 */
function updateOrderSummary() {
  // Update item counts
  document.getElementById("totalItems").textContent = cart.length;
  document.getElementById("pickupItems").textContent = pickupItems.length;
  document.getElementById("dropoffItems").textContent = dropoffItems.length;
  document.getElementById("totalDevices").textContent = cart.length;

  // Update process button state
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
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
 * Remove an item from the cart
 */
function removeFromCart(deviceId) {
  // Find the index of the item in the cart
  const itemIndex = cart.findIndex((item) => item.id === deviceId);

  if (itemIndex !== -1) {
    // Remove the item
    const removedItem = cart.splice(itemIndex, 1)[0];

    // Save cart to localStorage
    saveCart();

    // Update pickup and dropoff arrays
    if (removedItem.shippingMethod === "pickup") {
      pickupItems = pickupItems.filter((item) => item.id !== deviceId);
    } else {
      dropoffItems = dropoffItems.filter((item) => item.id !== deviceId);
    }

    // Update cart UI
    updateCartUI();

    // Show notification
    showNotification("Item removed from cart", "Success");
  }
}

/**
 * Clear all items from the cart
 */
function clearCart() {
  // Check if cart is empty
  if (cart.length === 0) {
    showNotification("Your cart is already empty", "Info");
    return;
  }

  // Confirm before clearing
  if (confirm("Are you sure you want to clear all items from your cart?")) {
    // Clear cart arrays
    cart = [];
    pickupItems = [];
    dropoffItems = [];

    // Save empty cart to localStorage
    saveCart();

    // Update cart UI
    updateCartUI();

    // Show notification
    showNotification("Cart has been cleared", "Success");
  }
}

/**
 * Open the order confirmation modal
 */
function openOrderModal() {
  // If cart is empty, don't proceed
  if (cart.length === 0) {
    showNotification(
      "Your cart is empty. Please add items before proceeding.",
      "Warning"
    );
    return;
  }

  // Create order summary list
  const orderSummaryList = document.getElementById("orderSummaryList");
  orderSummaryList.innerHTML = "";

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (${
      item.shippingMethod === "pickup" ? "Pickup" : "Drop-off"
    })`;
    orderSummaryList.appendChild(li);
  });

  // Get pickup date if applicable
  let pickupDateText = "N/A";
  if (pickupItems.length > 0) {
    const pickupDateInput = document.getElementById("pickupDate");
    if (pickupDateInput && pickupDateInput.value) {
      const selectedDate = new Date(pickupDateInput.value);
      pickupDateText = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Generate a random order ID
  const orderId = generateOrderId();

  // Set scheduled date in success modal
  document.getElementById("scheduledDate").textContent = pickupDateText;
  document.getElementById("orderNumber").textContent = orderId;

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("orderConfirmationModal")
  );
  modal.show();
}

/**
 * Process the order and create a new order record
 */
function processOrder() {
  // If cart is empty, don't proceed
  if (cart.length === 0) {
    showNotification(
      "Your cart is empty. Please add items before proceeding.",
      "Warning"
    );
    return;
  }

  // Get current date and time
  const now = new Date();

  // Generate a new order ID
  const orderId = generateOrderId();

  // Get pickup date and notes if applicable
  let pickupDate = null;
  let pickupNotes = null;

  if (pickupItems.length > 0) {
    const pickupDateInput = document.getElementById("pickupDate");
    if (pickupDateInput && pickupDateInput.value) {
      pickupDate = pickupDateInput.value;
    }

    const pickupNotesInput = document.getElementById("pickupNotes");
    if (pickupNotesInput) {
      pickupNotes = pickupNotesInput.value.trim();
    }
  }

  // Create the order object
  const newOrder = {
    id: orderId,
    dateCreated: now.toISOString(),
    status: "processing",
    items: [...cart],
    itemCount: cart.length,
    pickupCount: pickupItems.length,
    dropoffCount: dropoffItems.length,
    pickupDate: pickupDate,
    pickupNotes: pickupNotes,
    events: [
      {
        type: "order_created",
        date: now.toISOString(),
        description: "Order created and processing started",
      },
    ],
  };

  // Add pickup scheduled event if applicable
  if (pickupDate) {
    newOrder.events.push({
      type: "pickup_scheduled",
      date: now.toISOString(),
      description: `Pickup scheduled for ${new Date(
        pickupDate
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    });
  }

  // Get existing orders from localStorage
  let orders = [];
  const savedOrders = localStorage.getItem("recyclingOrders");
  if (savedOrders) {
    orders = JSON.parse(savedOrders);
  }

  // Add the new order
  orders.push(newOrder);

  // Save orders to localStorage
  localStorage.setItem("recyclingOrders", JSON.stringify(orders));

  // Update the available devices list by removing the ordered items and marking them as ordered
  updateAvailableDevices(orderId);

  // Clear the cart
  cart = [];
  pickupItems = [];
  dropoffItems = [];
  saveCart();

  // Close the confirmation modal
  const confirmationModal = bootstrap.Modal.getInstance(
    document.getElementById("orderConfirmationModal")
  );
  if (confirmationModal) {
    confirmationModal.hide();
  }

  // Set the order ID in the success modal
  document.getElementById("orderNumber").textContent = orderId;

  // Set pickup date in success modal if applicable
  if (pickupDate) {
    const formattedPickupDate = new Date(pickupDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
    document.getElementById("scheduledDate").textContent = formattedPickupDate;

    // Show pickup info
    const pickupInfo = document.querySelector("#orderSuccessModal .alert-info");
    if (pickupInfo) {
      pickupInfo.classList.remove("d-none");
    }
  } else {
    // Hide pickup info if no pickup items
    const pickupInfo = document.querySelector("#orderSuccessModal .alert-info");
    if (pickupInfo) {
      pickupInfo.classList.add("d-none");
    }
  }

  // Show the success modal
  const successModal = new bootstrap.Modal(
    document.getElementById("orderSuccessModal")
  );
  successModal.show();

  // Reset the cart UI
  updateCartUI();
}

/**
 * Update the available devices in localStorage by removing the ordered items
 */
function updateAvailableDevices(orderId) {
  // Get all devices from localStorage
  const storedDevices = localStorage.getItem("recyclingDevices");
  if (!storedDevices) return;

  let allDevices = JSON.parse(storedDevices);

  // Get the IDs of items in the cart
  const cartItemIds = cart.map((item) => item.id);

  // Filter out the devices that are in the cart
  const availableDevices = allDevices.filter(
    (device) => !cartItemIds.includes(device.id)
  );

  // Mark the ordered devices as unavailable/sold
  const orderedDevices = allDevices.filter((device) =>
    cartItemIds.includes(device.id)
  );
  orderedDevices.forEach((device) => {
    device.status = "ordered";
    device.orderInfo = {
      orderId: orderId,
      orderDate: new Date().toISOString(),
    };
  });

  // Combine available and ordered devices
  allDevices = [...availableDevices, ...orderedDevices];

  // Save the updated devices list to localStorage
  localStorage.setItem("recyclingDevices", JSON.stringify(allDevices));
}

/**
 * Generate a random order ID
 */
function generateOrderId() {
  const prefix = "REC";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Navigate to the orders page
 */
function goToOrders() {
  window.location.href =
    "recycling-orders.html?success=true&message=Order created successfully";
}

/**
 * Return to the dashboard
 */
function returnToDashboard() {
  window.location.href =
    "recycling-dashboard.html?success=true&message=Order created successfully";
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
