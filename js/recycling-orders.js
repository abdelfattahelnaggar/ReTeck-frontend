/**
 * RETECH - Recycling Company Orders JavaScript
 *
 * This file contains the logic for the recycling company orders,
 * including order listing, filtering, and order details.
 */

// Global variables
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 10;

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the orders page
  initializeOrdersPage();

  // Set up event listeners
  setupEventListeners();

  // Display toast notification if redirected from cart or dashboard page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("success") && urlParams.has("message")) {
    showNotification(urlParams.get("message"), "Success");
  }
});

/**
 * Initialize the orders page with data and setup
 */
function initializeOrdersPage() {
  // Load orders from localStorage
  loadOrders();

  // Apply initial filters
  applyFilters();

  // Render the orders list
  renderOrdersList();

  // Update cart count
  updateCartCount();
}

/**
 * Load orders from localStorage
 */
function loadOrders() {
  const savedOrders = localStorage.getItem("recyclingOrders");
  if (savedOrders) {
    allOrders = JSON.parse(savedOrders);

    // Sort orders by date (newest first)
    allOrders.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  } else {
    // Create sample orders if none exist
    createSampleOrders();
  }
}

/**
 * Create sample orders for testing
 */
function createSampleOrders() {
  // Sample orders data
  const sampleOrders = [
    {
      id: "REC-123456-7890",
      dateCreated: "2023-06-20T14:30:00",
      status: "completed",
      items: [
        {
          id: 101,
          name: "Apple iPhone 11 Pro",
          type: "phone",
          image: "../images/placeholder-image.jpg",
          brand: "Apple",
          model: "iPhone 11 Pro",
          condition: "Good - Minor wear",
          storage: "64GB",
          accessories: ["Charger"],
          customer: {
            name: "John Smith",
            email: "john.smith@example.com",
            phone: "555-123-4567",
          },
          shippingMethod: "pickup",
          location: "123 Main St, Eco City, EC 12345",
          dateReceived: "2023-06-18T10:30:00",
          status: "received",
        },
        {
          id: 102,
          name: "Samsung Galaxy S20",
          type: "phone",
          image: "../images/placeholder-image.jpg",
          brand: "Samsung",
          model: "Galaxy S20",
          condition: "Excellent - Like new",
          storage: "128GB",
          accessories: ["Charger", "Earbuds"],
          customer: {
            name: "Jane Williams",
            email: "jane.williams@example.com",
            phone: "555-987-6543",
          },
          shippingMethod: "visit",
          location: "RETECH Service Center",
          dateReceived: "2023-06-19T11:15:00",
          status: "received",
        },
      ],
      itemCount: 2,
      pickupCount: 1,
      dropoffCount: 1,
      pickupDate: "2023-06-21",
      pickupNotes: "Please call before arrival",
      events: [
        {
          type: "order_created",
          date: "2023-06-20T14:30:00",
          description: "Order created and processing started",
        },
        {
          type: "pickup_scheduled",
          date: "2023-06-20T14:35:00",
          description: "Pickup scheduled for June 21, 2023",
        },
        {
          type: "processing_started",
          date: "2023-06-21T10:15:00",
          description: "Device processing started",
        },
        {
          type: "order_completed",
          date: "2023-06-22T16:20:00",
          description: "Order completed and all devices processed",
        },
      ],
    },
    {
      id: "REC-234567-8901",
      dateCreated: "2023-06-15T09:45:00",
      status: "processing",
      items: [
        {
          id: 201,
          name: "Dell Inspiron 15",
          type: "laptop",
          image: "../images/placeholder-image.jpg",
          brand: "Dell",
          model: "Inspiron 15",
          condition: "Fair - Works but has issues",
          storage: "1TB HDD",
          processor: "Intel i5",
          ram: "8GB",
          accessories: ["Charger"],
          customer: {
            name: "Robert Johnson",
            email: "robert.johnson@example.com",
            phone: "555-222-3333",
          },
          shippingMethod: "pickup",
          location: "456 Oak St, Eco City, EC 12345",
          dateReceived: "2023-06-14T13:45:00",
          status: "received",
        },
      ],
      itemCount: 1,
      pickupCount: 1,
      dropoffCount: 0,
      pickupDate: "2023-06-16",
      pickupNotes: "Leave at the front door if no one answers",
      events: [
        {
          type: "order_created",
          date: "2023-06-15T09:45:00",
          description: "Order created and processing started",
        },
        {
          type: "pickup_scheduled",
          date: "2023-06-15T09:50:00",
          description: "Pickup scheduled for June 16, 2023",
        },
        {
          type: "processing_started",
          date: "2023-06-16T14:20:00",
          description: "Device processing started",
        },
      ],
    },
    {
      id: "REC-345678-9012",
      dateCreated: "2023-06-10T16:15:00",
      status: "canceled",
      items: [
        {
          id: 301,
          name: 'LG 55" Smart TV',
          type: "electronics",
          image: "../images/placeholder-image.jpg",
          brand: "LG",
          model: '55" Smart TV',
          condition: "Good - Works well",
          accessories: ["Remote", "Power Cable"],
          customer: {
            name: "Emily Davis",
            email: "emily.davis@example.com",
            phone: "555-444-5555",
          },
          shippingMethod: "visit",
          location: "RETECH Service Center",
          dateReceived: "2023-06-09T11:30:00",
          status: "received",
        },
      ],
      itemCount: 1,
      pickupCount: 0,
      dropoffCount: 1,
      events: [
        {
          type: "order_created",
          date: "2023-06-10T16:15:00",
          description: "Order created and processing started",
        },
        {
          type: "processing_started",
          date: "2023-06-11T09:30:00",
          description: "Device processing started",
        },
        {
          type: "order_canceled",
          date: "2023-06-11T14:45:00",
          description: "Order canceled due to device incompatibility",
        },
      ],
    },
  ];

  // Set as all orders
  allOrders = sampleOrders;

  // Save to localStorage
  localStorage.setItem("recyclingOrders", JSON.stringify(allOrders));
}

/**
 * Set up event listeners for the orders page
 */
function setupEventListeners() {
  // Status filter buttons
  document.querySelectorAll(".status-filter").forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all status filters
      document.querySelectorAll(".status-filter").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Apply filters
      applyFilters();
    });
  });

  // Date range filters
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (startDateInput && endDateInput) {
    // Set max date to today
    const today = new Date().toISOString().split("T")[0];
    startDateInput.setAttribute("max", today);
    endDateInput.setAttribute("max", today);

    // Add event listeners
    startDateInput.addEventListener("change", applyFilters);
    endDateInput.addEventListener("change", applyFilters);
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }

  // Order details modal event
  const orderDetailsModal = document.getElementById("orderDetailsModal");
  if (orderDetailsModal) {
    orderDetailsModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const orderId = button.getAttribute("data-order-id");

      if (orderId) {
        populateOrderModal(orderId);
      }
    });
  }

  // Print order button
  const printOrderBtn = document.getElementById("printOrderBtn");
  if (printOrderBtn) {
    printOrderBtn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-order-id");
      printOrder(orderId);
    });
  }

  // Update order status button
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  if (updateStatusBtn) {
    updateStatusBtn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-order-id");
      const newStatus = document.getElementById("orderStatusSelect").value;
      updateOrderStatus(orderId, newStatus);
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

/**
 * Apply filters to the orders list
 */
function applyFilters() {
  // Get selected status
  const activeStatusFilter = document.querySelector(".status-filter.active");
  const statusFilter = activeStatusFilter
    ? activeStatusFilter.getAttribute("data-status")
    : "all";

  // Get date range
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  let startDate = null;
  let endDate = null;

  if (startDateInput && startDateInput.value) {
    startDate = new Date(startDateInput.value);
    startDate.setHours(0, 0, 0, 0);
  }

  if (endDateInput && endDateInput.value) {
    endDate = new Date(endDateInput.value);
    endDate.setHours(23, 59, 59, 999);
  }

  // Filter orders
  filteredOrders = allOrders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Date range filter
    const orderDate = new Date(order.dateCreated);

    if (startDate && orderDate < startDate) {
      return false;
    }

    if (endDate && orderDate > endDate) {
      return false;
    }

    return true;
  });

  // Reset to first page and render
  currentPage = 1;
  renderOrdersList();
}

/**
 * Clear all filters
 */
function clearFilters() {
  // Reset status filter to 'All'
  document.querySelectorAll(".status-filter").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector('[data-status="all"]').classList.add("active");

  // Clear date inputs
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (startDateInput) startDateInput.value = "";
  if (endDateInput) endDateInput.value = "";

  // Apply filters
  applyFilters();
}

/**
 * Render the orders list with pagination
 */
function renderOrdersList() {
  const ordersList = document.getElementById("ordersList");
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const ordersToShow = filteredOrders.slice(startIndex, endIndex);

  // Clear the list
  ordersList.innerHTML = "";

  // If no orders match the filters
  if (ordersToShow.length === 0) {
    ordersList.innerHTML = `
      <div class="text-center py-5">
        <div class="display-6 text-muted mb-3">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h4>No orders found</h4>
        <p class="text-muted">Try adjusting your filters or create new orders</p>
        <button type="button" class="btn btn-outline-primary" id="clearFiltersBtn">
          <i class="fas fa-undo me-2"></i>Clear Filters
        </button>
      </div>
    `;

    // Re-attach event listener for the clear filters button
    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearFilters);
    }

    return;
  }

  // Create and append order cards
  ordersToShow.forEach((order) => {
    const orderCard = createOrderCard(order);
    ordersList.appendChild(orderCard);
  });

  // Update pagination
  updatePagination();
}

/**
 * Create an order card element
 */
function createOrderCard(order) {
  // Create the card container
  const card = document.createElement("div");
  card.className = "col-12 mb-4";

  // Format date for display
  const orderDate = new Date(order.dateCreated);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = orderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine status badge class
  let statusBadgeClass = "";
  switch (order.status) {
    case "processing":
      statusBadgeClass = "bg-info";
      break;
    case "completed":
      statusBadgeClass = "bg-success";
      break;
    case "canceled":
      statusBadgeClass = "bg-danger";
      break;
    default:
      statusBadgeClass = "bg-secondary";
  }

  // Set the HTML content
  card.innerHTML = `
    <div class="card order-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">Order #${order.id}</h5>
        <span class="badge ${statusBadgeClass}">${capitalizeFirstLetter(
    order.status
  )}</span>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-3 mb-md-0">
            <div class="order-info-label">Date Created:</div>
            <div class="order-info-value">${formattedDate} - ${formattedTime}</div>
          </div>
          <div class="col-md-3 mb-3 mb-md-0">
            <div class="order-info-label">Total Items:</div>
            <div class="order-info-value">${order.itemCount} items</div>
          </div>
          <div class="col-md-3 mb-3 mb-md-0">
            <div class="order-info-label">Pickup Items:</div>
            <div class="order-info-value">${order.pickupCount} items</div>
          </div>
          <div class="col-md-3">
            <div class="order-info-label">Drop-off Items:</div>
            <div class="order-info-value">${order.dropoffCount} items</div>
          </div>
        </div>
        
        ${
          order.pickupDate
            ? `
        <div class="mt-3">
          <div class="order-info-label">Pickup Date:</div>
          <div class="order-info-value">${new Date(
            order.pickupDate
          ).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</div>
        </div>
        `
            : ""
        }
        
        <div class="d-flex justify-content-between align-items-center mt-4">
          <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#orderDetailsModal" data-order-id="${
            order.id
          }">
            <i class="fas fa-info-circle me-1"></i>View Details
          </button>
          <button type="button" class="btn btn-outline-secondary print-order-btn" data-order-id="${
            order.id
          }">
            <i class="fas fa-print me-1"></i>Print Order
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listener to the print button
  const printBtn = card.querySelector(".print-order-btn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      printOrder(order.id);
    });
  }

  return card;
}

/**
 * Update the pagination controls
 */
function updatePagination() {
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // If there's only one page, hide pagination
  if (totalPages <= 1) {
    document
      .querySelector('nav[aria-label="Orders pagination"]')
      .classList.add("d-none");
    return;
  } else {
    document
      .querySelector('nav[aria-label="Orders pagination"]')
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
      renderOrdersList();
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
      renderOrdersList();
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
      renderOrdersList();
    }
  });
  pagination.appendChild(nextItem);
}

/**
 * Populate the order details modal
 */
function populateOrderModal(orderId) {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  // Set modal title
  document.getElementById(
    "orderDetailsModalLabel"
  ).textContent = `Order #${order.id}`;

  // Set order information
  document.getElementById("modalOrderId").textContent = order.id;
  document.getElementById("modalOrderStatus").innerHTML = `
    <span class="badge ${getStatusBadgeClass(
      order.status
    )}">${capitalizeFirstLetter(order.status)}</span>
  `;

  // Format and set date
  const orderDate = new Date(order.dateCreated);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = orderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  document.getElementById(
    "modalOrderDate"
  ).textContent = `${formattedDate} - ${formattedTime}`;
  document.getElementById("modalTotalItems").textContent = order.itemCount;

  // Set pickup information if applicable
  const pickupInfoContainer = document.getElementById("pickupInfoContainer");
  if (order.pickupCount > 0 && order.pickupDate) {
    pickupInfoContainer.classList.remove("d-none");

    const pickupDate = new Date(order.pickupDate);
    const formattedPickupDate = pickupDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    document.getElementById("modalPickupDate").textContent =
      formattedPickupDate;
    document.getElementById("modalPickupNotes").textContent =
      order.pickupNotes || "No special instructions";
  } else {
    pickupInfoContainer.classList.add("d-none");
  }

  // Populate order items with responsive classes
  const orderItemsContainer = document.getElementById("orderItemsContainer");
  orderItemsContainer.innerHTML = "";

  order.items.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "order-item-row";

    // Add the row content with mobile-friendly structure
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center flex-wrap">
          <img src="${item.image}" alt="${
      item.name
    }" class="order-item-img me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <p class="text-muted mb-0">${item.brand} ${item.model}</p>
          </div>
        </div>
      </td>
      <td class="d-none d-md-table-cell">${capitalizeFirstLetter(
        item.type
      )}</td>
      <td>
        <span class="badge ${
          item.shippingMethod === "pickup" ? "badge-pickup" : "badge-dropoff"
        }">
          ${item.shippingMethod === "pickup" ? "Pickup" : "Drop-off"}
        </span>
      </td>
      <td class="d-none d-md-table-cell">${item.customer.name}</td>
      <td class="d-none d-md-table-cell">${item.condition}</td>
    `;

    // Add to container
    orderItemsContainer.appendChild(row);
  });

  // Populate order timeline
  const orderTimelineContainer = document.getElementById(
    "orderTimelineContainer"
  );
  orderTimelineContainer.innerHTML = "";

  if (order.events && order.events.length > 0) {
    order.events.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const formattedEventDate = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const formattedEventTime = eventDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const timelineItem = document.createElement("div");
      timelineItem.className = "timeline-item";

      // Determine icon based on event type
      let iconClass = "fa-clipboard-list";
      switch (event.type) {
        case "order_created":
          iconClass = "fa-clipboard-list";
          break;
        case "pickup_scheduled":
          iconClass = "fa-calendar-alt";
          break;
        case "processing_started":
          iconClass = "fa-tools";
          break;
        case "order_completed":
          iconClass = "fa-check-circle";
          break;
        case "order_canceled":
          iconClass = "fa-times-circle";
          break;
      }

      timelineItem.innerHTML = `
        <div class="timeline-icon">
          <i class="fas ${iconClass}"></i>
        </div>
        <div class="timeline-content">
          <p class="timeline-date">${formattedEventDate} at ${formattedEventTime}</p>
          <p class="timeline-text">${event.description}</p>
        </div>
      `;

      orderTimelineContainer.appendChild(timelineItem);
    });
  } else {
    orderTimelineContainer.innerHTML =
      '<p class="text-muted text-center">No event history available</p>';
  }

  // Set up status update dropdown
  const orderStatusSelect = document.getElementById("orderStatusSelect");
  if (orderStatusSelect) {
    orderStatusSelect.value = order.status;
  }

  // Set up update status button
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  if (updateStatusBtn) {
    updateStatusBtn.setAttribute("data-order-id", order.id);
  }

  // Set up print order button
  const printOrderBtn = document.getElementById("printOrderBtn");
  if (printOrderBtn) {
    printOrderBtn.setAttribute("data-order-id", order.id);
  }
}

/**
 * Update an order's status
 */
function updateOrderStatus(orderId, newStatus) {
  // Find the order
  const orderIndex = allOrders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return;

  const order = allOrders[orderIndex];

  // Skip if status is the same
  if (order.status === newStatus) {
    return;
  }

  // Update the status
  order.status = newStatus;

  // Add an event to the order history
  const now = new Date();
  const eventDescription = getStatusChangeDescription(newStatus);

  if (!order.events) {
    order.events = [];
  }

  order.events.push({
    type: `status_${newStatus}`,
    date: now.toISOString(),
    description: eventDescription,
  });

  // Save to localStorage
  localStorage.setItem("recyclingOrders", JSON.stringify(allOrders));

  // Close the modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("orderDetailsModal")
  );
  if (modal) {
    modal.hide();
  }

  // Show notification
  showNotification("Order status updated successfully", "Success");

  // Refresh the orders list
  applyFilters();
}

/**
 * Get the description for a status change event
 */
function getStatusChangeDescription(status) {
  switch (status) {
    case "processing":
      return "Order processing started";
    case "completed":
      return "Order completed successfully";
    case "canceled":
      return "Order canceled";
    default:
      return `Order status changed to ${status}`;
  }
}

/**
 * Get the appropriate badge class for an order status
 */
function getStatusBadgeClass(status) {
  switch (status) {
    case "processing":
      return "bg-info";
    case "completed":
      return "bg-success";
    case "canceled":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

/**
 * Print an order
 */
function printOrder(orderId) {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");

  // Format order date
  const orderDate = new Date(order.dateCreated);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create the print content
  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.id} - Print</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .print-header h1 {
          color: #4CAF50;
          margin-bottom: 5px;
        }
        .order-info {
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 200px;
        }
        .info-value {
          flex: 1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #777;
        }
      </style>
    </head>
    <body onload="window.print(); window.setTimeout(function() { window.close(); }, 500)">
      <div class="print-header">
        <h1>RETECH Recycling</h1>
        <p>123 Eco Street, Green City, GC 12345</p>
        <p>Phone: (555) 123-4567 | Email: recycling@retech.com</p>
      </div>
      
      <div class="order-info">
        <h2>Order #${order.id}</h2>
        
        <div class="info-row">
          <div class="info-label">Date Created:</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Status:</div>
          <div class="info-value">${capitalizeFirstLetter(order.status)}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Total Items:</div>
          <div class="info-value">${order.itemCount}</div>
        </div>
  `;

  // Add pickup information if applicable
  if (order.pickupCount > 0 && order.pickupDate) {
    const pickupDate = new Date(order.pickupDate);
    const formattedPickupDate = pickupDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printContent += `
        <div class="info-row">
          <div class="info-label">Pickup Date:</div>
          <div class="info-value">${formattedPickupDate}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Pickup Notes:</div>
          <div class="info-value">${
            order.pickupNotes || "No special instructions"
          }</div>
        </div>
    `;
  }

  // Close order info section
  printContent += `
      </div>
      
      <h3>Order Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Condition</th>
            <th>Customer</th>
            <th>Collection Method</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add items to the table
  order.items.forEach((item) => {
    printContent += `
          <tr>
            <td>${item.name} (${item.brand} ${item.model})</td>
            <td>${capitalizeFirstLetter(item.type)}</td>
            <td>${item.condition}</td>
            <td>${item.customer.name}</td>
            <td>${item.shippingMethod === "pickup" ? "Pickup" : "Drop-off"}</td>
          </tr>
    `;
  });

  // Close table and add footer
  printContent += `
        </tbody>
      </table>
      
      <div class="footer">
        <p>Thank you for choosing RETECH for your recycling needs!</p>
        <p>For any questions about this order, please contact our customer service.</p>
        <p>www.retech-recycling.com</p>
      </div>
    </body>
    </html>
  `;

  // Write to the new window and close it after printing
  printWindow.document.write(printContent);
  printWindow.document.close();
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
  // Load cart from localStorage
  let cart = [];
  const savedCart = localStorage.getItem("recyclingCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  // Update cart count elements
  const cartCountElements = document.querySelectorAll(".cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = cart.length;
  });
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
