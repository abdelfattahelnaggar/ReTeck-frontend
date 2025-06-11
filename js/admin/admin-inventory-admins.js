// Inventory Administrators Management Functions

// Add notification styles
const notificationStyle = document.createElement("style");
notificationStyle.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    padding: 16px;
    z-index: 1050;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
    opacity: 0;
    border-left: 4px solid transparent;
  }
  
  .notification-visible {
    transform: translateX(0);
    opacity: 1;
  }
  
  .notification-hiding {
    transform: translateX(120%);
    opacity: 0;
  }
  
  .notification-icon {
    margin-right: 15px;
    font-size: 22px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  
  .notification-content {
    flex-grow: 1;
  }
  
  .notification-content .title {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 15px;
  }

  .notification-content .message {
    font-size: 14px;
    color: #6c757d;
  }
  
  .notification-close {
    background: transparent;
    border: none;
    color: #adb5bd;
    cursor: pointer;
    font-size: 18px;
    transition: color 0.2s;
    align-self: flex-start;
  }
  
  .notification-close:hover {
    color: #495057;
  }

  .notification-warning {
    background-color: #fffaf0;
    border-left-color: #ffc107;
  }
  .notification-warning .notification-icon {
    color: #ffc107;
  }
  .notification-warning .notification-content .title {
    color: #856404;
  }
  .notification-warning .notification-content .message {
    color: #9e8130;
  }
  
  .notification-success {
    background-color: #f0fff4;
    border-left-color: #28a745;
  }
  .notification-success .notification-icon {
    color: #28a745;
  }
  .notification-success .notification-content .title {
    color: #155724;
  }
  .notification-success .notification-content .message {
    color: #1b6d2e;
  }
  
  .selected-device-info {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
  }
  
  .selected-device-info h6 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 8px;
  }
  
  .selected-device-info .badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
    margin-bottom: 10px;
  }
`;
document.head.appendChild(notificationStyle);

function initInventoryAdmins() {
  console.log("Inventory Admins section initialized.");

  const addDeviceModalEl = document.getElementById("addDeviceModal");
  if (addDeviceModalEl) {
    addDeviceModalEl.addEventListener("show.bs.modal", () => {
      // Reset common form elements first
      const form = document.getElementById("addDeviceForm");
      if (form) form.reset();
      document.getElementById("marketSpecificationsContainer").innerHTML = "";
      document.getElementById("marketImagePreviewContainer").innerHTML = "";

      // Check if the modal was triggered with a specific device
      const deviceData = addDeviceModalEl.dataset.device;
      if (deviceData) {
        // If yes, set up the modal for that specific device
        const device = JSON.parse(deviceData);
        setupModalForSpecificDevice(device);
      } else {
        // If no, set up the modal for a generic "add" with a dropdown
        setupModalForGenericAdd();
      }
    });

    addDeviceModalEl.addEventListener("hidden.bs.modal", () => {
      // Clean up the modal state after it's closed to ensure it's fresh for next time
      delete addDeviceModalEl.dataset.device;

      const deviceSelectContainer = document.querySelector(
        "#addDeviceForm .col-12:first-child"
      );
      if (
        deviceSelectContainer &&
        !deviceSelectContainer.querySelector("select")
      ) {
        deviceSelectContainer.innerHTML = `
              <label for="inventoryDeviceSelect" class="form-label">Select Device from Inventory</label>
              <select id="inventoryDeviceSelect" class="form-select" required>
                <option selected disabled value="">Loading inventory...</option>
              </select>
          `;
      }

      // Restore modal title and button text to their defaults
      const modalTitle = document.querySelector("#addDeviceModal .modal-title");
      if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-store me-2"></i>Add Device to Market`;
      }
      const submitButton = document.querySelector(
        '#addDeviceModal .modal-footer button[type="submit"]'
      );
      if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save me-1"></i>Save Device';
      }
    });
  }

  // Add event listener for the "Add Specification" button in the market modal
  const addMarketSpecBtn = document.getElementById("addMarketSpecButton");
  if (addMarketSpecBtn) {
    addMarketSpecBtn.addEventListener("click", () =>
      addSpecificationField("marketSpecificationsContainer")
    );
  }

  // Event listeners for market image upload
  const addMarketImageButton = document.getElementById("addMarketImageButton");
  const marketImageInput = document.getElementById("marketImageInput");

  if (addMarketImageButton && marketImageInput) {
    addMarketImageButton.addEventListener("click", () => {
      marketImageInput.click();
    });

    marketImageInput.addEventListener("change", handleMarketImageUpload);
  }

  const addDeviceForm = document.getElementById("addDeviceForm");
  if (addDeviceForm) {
    addDeviceForm.addEventListener("submit", handleAddMarketDeviceSubmit);
  }

  const editDeviceForm = document.getElementById("editDeviceForm");
  if (editDeviceForm) {
    editDeviceForm.addEventListener("submit", handleEditMarketDeviceSubmit);
  }

  // Load both market inventory and recycled devices tables
  loadMarketInventory();
  loadRecycledDevices();

  // Initialize recycled devices filters
  initializeRecycledDevicesFilters();
}

async function populateInventoryDropdown() {
  const selectElement = document.getElementById("inventoryDeviceSelect");
  selectElement.innerHTML =
    '<option selected disabled value="">Loading...</option>';

  // Use the getDevices function which should be available globally
  const inventoryDevices = typeof getDevices === "function" ? getDevices() : [];

  if (inventoryDevices.length === 0) {
    selectElement.innerHTML =
      '<option selected disabled value="">No devices in inventory</option>';
    return;
  }

  // Get market devices to filter out already listed items
  const marketDevices = getMarketDevices();
  const marketDeviceIds = new Set(marketDevices.map((d) => d.id));

  const availableDevices = inventoryDevices.filter(
    (d) => !marketDeviceIds.has(d.id)
  );

  if (availableDevices.length === 0) {
    selectElement.innerHTML =
      '<option selected disabled value="">All inventory items are already in the market</option>';
    return;
  }

  selectElement.innerHTML =
    '<option selected disabled value="">Choose a device...</option>';
  availableDevices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = `${device.brand} ${device.model} - ${device.condition} (ID: ${device.id})`;
    selectElement.appendChild(option);
  });
}

function handleAddMarketDeviceSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const price = form.elements.devicePrice.value;
  const description = form.elements.deviceDescription.value;
  const deviceId = form.elements.inventoryDeviceSelect.value;
  const quantity = form.elements.deviceQuantity.value;

  const allDevices = getDevices();
  const selectedDevice = allDevices.find((d) => d.id === deviceId);

  if (!selectedDevice) {
    alert("Selected device not found in inventory.");
    return;
  }

  // Collect additional specifications
  const additionalSpecs = {};
  document
    .querySelectorAll("#marketSpecificationsContainer .spec-row")
    .forEach((row) => {
      const key = row.querySelector(".spec-key").value.trim();
      const value = row.querySelector(".spec-value").value.trim();
      if (key && value) {
        additionalSpecs[key] = value;
      }
    });

  // Collect new image URLs from previews
  const newImages = [];
  document
    .querySelectorAll("#marketImagePreviewContainer img")
    .forEach((img) => {
      newImages.push(img.src);
    });

  // Create a new market device object
  const newMarketDevice = {
    ...selectedDevice, // Copy all details from the original device
    id: `MKT_${Date.now()}_${selectedDevice.id}`, // Create a unique market ID
    price: parseFloat(price),
    description: description,
    quantity: parseInt(quantity, 10),
    status: "Available", // Initial status for a market item
    originalId: selectedDevice.id, // Keep track of the original inventory item
    specs: {
      ...selectedDevice.specs,
      ...additionalSpecs, // Merge original specs with additional ones
    },
    images: [...(selectedDevice.images || []), ...newImages],
  };

  // Add to market inventory
  const marketDevices = getMarketDevices();
  marketDevices.push(newMarketDevice);
  localStorage.setItem("marketInventory", JSON.stringify(marketDevices));

  // Close modal and refresh table
  const addDeviceModal = bootstrap.Modal.getInstance(
    document.getElementById("addDeviceModal")
  );
  addDeviceModal.hide();

  // Show success notification
  showNotification(
    "success",
    "Device Added",
    `${selectedDevice.brand} ${selectedDevice.model} has been added to the market.`
  );

  // Refresh both tables
  loadMarketInventory();
  loadRecycledDevices();
}

function loadMarketInventory() {
  const tableBody = document.getElementById("marketInventoryTableBody");
  if (!tableBody) return;

  const devices = getMarketDevices();
  tableBody.innerHTML = ""; // Clear existing rows

  if (devices.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No devices currently in the market.</td></tr>`;
    return;
  }

  devices.forEach((device) => {
    const row = document.createElement("tr");
    const statusBadgeClass =
      device.status === "Available" ? "bg-success" : "bg-warning";

    row.innerHTML = `
      <td>
        <div class="fw-bold">${device.brand} ${device.model}</div>
        <div class="small text-muted">${device.specs.storage || "N/A"}</div>
      </td>
      <td><span class="badge ${getCategoryBadgeClass(device.type)}">${
      device.type
    }</span></td>
      <td>${device.quantity}</td>
      <td>${device.price ? `EGP ${device.price.toLocaleString()}` : "N/A"}</td>
      <td><span class="badge ${statusBadgeClass}">${device.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1 edit-market-btn" data-device-id="${
          device.id
        }"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-market-btn" data-device-id="${
          device.id
        }"><i class="fas fa-trash"></i> Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-market-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const deviceId = e.currentTarget.getAttribute("data-device-id");
      handleDeleteMarketDevice(deviceId);
    });
  });

  // Add event listeners to edit buttons
  document.querySelectorAll(".edit-market-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const deviceId = e.currentTarget.getAttribute("data-device-id");
      openEditMarketDeviceModal(deviceId);
    });
  });
}

function handleDeleteMarketDevice(deviceId) {
  showDeleteConfirmationModal(deviceId, () => {
    let marketDevices = getMarketDevices();
    const updatedMarketDevices = marketDevices.filter(
      (device) => device.id !== deviceId
    );

    localStorage.setItem(
      "marketInventory",
      JSON.stringify(updatedMarketDevices)
    );

    // Refresh the market table to show the change
    loadMarketInventory();
  });
}

function showDeleteConfirmationModal(deviceId, onDelete) {
  // Add CSS for the modal dynamically
  const styleId = "delete-confirm-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        .delete-confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .delete-confirm-dialog {
          background: white;
          border-radius: 12px;
          width: 380px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: dialogAppear 0.3s forwards;
          transform: scale(0.9);
          opacity: 0;
        }
        .delete-confirm-header {
          background: linear-gradient(135deg, #ff5a5f, #f72585);
          color: white;
          padding: 15px 20px;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
         .delete-confirm-header i {
           margin-right: 10px;
         }
        .delete-confirm-body {
          padding: 25px;
          text-align: center;
        }
        .delete-confirm-icon {
          font-size: 3.5rem;
          color: #f72585;
          margin-bottom: 15px;
          animation: pulse-danger 1.5s infinite;
        }
        .delete-confirm-footer {
          display: flex;
          justify-content: flex-end;
          padding: 15px 20px;
          background: #f8f9fa;
          gap: 10px;
        }
        .delete-confirm-footer button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-delete-cancel {
          background: #e9ecef;
          color: #495057;
        }
        .btn-delete-cancel:hover {
          background: #dee2e6;
        }
        .btn-delete-confirm {
          background: linear-gradient(135deg, #ff5a5f, #f72585);
          color: white;
        }
         .btn-delete-confirm:hover {
           filter: brightness(1.1);
           transform: translateY(-2px);
           box-shadow: 0 4px 8px rgba(247, 37, 133, 0.3);
         }
        @keyframes dialogAppear { to { transform: scale(1); opacity: 1; } }
        @keyframes pulse-danger {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `;
    document.head.appendChild(style);
  }

  // Create confirmation overlay
  const overlay = document.createElement("div");
  overlay.className = "delete-confirm-overlay";

  // Create confirmation dialog
  const dialog = document.createElement("div");
  dialog.className = "delete-confirm-dialog";

  // Dialog header
  const header = document.createElement("div");
  header.className = "delete-confirm-header";
  header.innerHTML =
    '<span><i class="fas fa-exclamation-triangle"></i>Confirm Deletion</span>';

  // Dialog body
  const body = document.createElement("div");
  body.className = "delete-confirm-body";
  body.innerHTML = `
      <div class="delete-confirm-icon">
        <i class="fas fa-trash-alt"></i>
      </div>
      <h5>Are you sure?</h5>
      <p class="text-muted">This will permanently remove the device from the market. This action cannot be undone.</p>
    `;

  // Dialog footer with buttons
  const footer = document.createElement("div");
  footer.className = "delete-confirm-footer";

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-delete-cancel";
  cancelBtn.innerHTML = '<i class="fas fa-times me-1"></i>Cancel';
  cancelBtn.addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete-confirm";
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i>Delete';
  deleteBtn.addEventListener("click", () => {
    onDelete();
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  });

  // Add buttons to footer
  footer.appendChild(cancelBtn);
  footer.appendChild(deleteBtn);

  // Build dialog structure
  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);

  // Add overlay to the page
  document.body.appendChild(overlay);

  // Fade in the overlay
  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 10);
}

function openEditMarketDeviceModal(deviceId) {
  const marketDevices = getMarketDevices();
  const device = marketDevices.find((d) => d.id === deviceId);

  if (!device) {
    console.error("Device not found for editing:", deviceId);
    return;
  }

  document.getElementById("editDeviceId").value = device.id;
  document.getElementById(
    "editDeviceName"
  ).value = `${device.brand} ${device.model}`;
  document.getElementById("editDevicePrice").value = device.price || "";
  document.getElementById("editDeviceQuantity").value = device.quantity || "";
  document.getElementById("editDeviceDescription").value =
    device.description || "";

  const editModal = new bootstrap.Modal(
    document.getElementById("editDeviceModal")
  );
  editModal.show();
}

function handleEditMarketDeviceSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const deviceId = form.elements.editDeviceId.value;
  const price = parseFloat(form.elements.editDevicePrice.value);
  const description = form.elements.editDeviceDescription.value;
  const quantity = parseInt(form.elements.editDeviceQuantity.value, 10);

  if (!deviceId || isNaN(price) || isNaN(quantity) || quantity < 1) {
    alert("Invalid data. Please check the price and quantity.");
    return;
  }

  let marketDevices = getMarketDevices();
  const deviceIndex = marketDevices.findIndex((d) => d.id === deviceId);

  if (deviceIndex === -1) {
    alert("Device not found. Could not update.");
    return;
  }

  // Update device details
  marketDevices[deviceIndex].price = price;
  marketDevices[deviceIndex].description = description;
  marketDevices[deviceIndex].quantity = quantity;

  localStorage.setItem("marketInventory", JSON.stringify(marketDevices));

  const editModal = bootstrap.Modal.getInstance(
    document.getElementById("editDeviceModal")
  );
  editModal.hide();

  loadMarketInventory();
}

// Gets devices listed in the market
function getMarketDevices() {
  const storedMarketInventory = localStorage.getItem("marketInventory");
  if (storedMarketInventory) {
    try {
      return JSON.parse(storedMarketInventory);
    } catch (e) {
      console.error("Error parsing market inventory from localStorage", e);
      return [];
    }
  }
  return []; // Return empty array if nothing is in storage
}

// This function is defined in admin-inventory.js but we need it here.
// In a real app, this would be in a shared utility file.
function getDevices() {
  const storedInventory = localStorage.getItem("inventory");
  if (storedInventory) {
    try {
      const devices = JSON.parse(storedInventory);
      if (Array.isArray(devices)) {
        return devices;
      }
    } catch (e) {
      console.error("Error parsing inventory from localStorage", e);
    }
  }
  const dummyDevices = getDummyDevices();
  localStorage.setItem("inventory", JSON.stringify(dummyDevices));
  return dummyDevices;
}

function getDummyDevices() {
  // Keeping this for fallback
  return [
    {
      id: "REC12345",
      type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13 Pro",
      condition: "Excellent",
      receivedDate: "2023-10-15",
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      },
      specs: {
        color: "Sierra Blue",
        storage: "256GB",
      },
    },
    {
      id: "REC12346",
      type: "Laptop",
      brand: "Dell",
      model: "XPS 15",
      condition: "Good",
      receivedDate: "2023-09-28",
      user: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
      },
      specs: {
        storage: "512GB SSD",
      },
    },
  ];
}

function getCategoryBadgeClass(type) {
  switch (type) {
    case "Smartphone":
      return "bg-primary";
    case "Laptop":
      return "bg-info";
    case "Tablet":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}

function handleMarketImageUpload(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById(
    "marketImagePreviewContainer"
  );

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const previewWrapper = document.createElement("div");
        previewWrapper.className = "position-relative";
        previewWrapper.innerHTML = `
          <img src="${imageUrl}" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" style="padding: 2px 5px; line-height: 1;" onclick="this.parentElement.remove();">
            <i class="fas fa-times"></i>
          </button>
        `;
        previewContainer.appendChild(previewWrapper);
      };
      reader.readAsDataURL(file);
    }
  }
  // Reset the input so the user can select the same file again if they want
  event.target.value = null;
}

function addSpecificationField(containerId, key = "", value = "") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const newSpecRow = document.createElement("div");
  newSpecRow.className = "row g-3 spec-row mb-2";
  newSpecRow.innerHTML = `
    <div class="col-md-5">
      <input type="text" class="form-control spec-key" placeholder="Specification Name" value="${key}">
    </div>
    <div class="col-md-5">
      <input type="text" class="form-control spec-value" placeholder="Value" value="${value}">
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button type="button" class="btn btn-outline-danger btn-sm remove-spec-btn">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  container.appendChild(newSpecRow);

  newSpecRow
    .querySelector(".remove-spec-btn")
    .addEventListener("click", (e) => {
      e.target.closest(".spec-row").remove();
    });
}

// Function to load and display recycled devices
function loadRecycledDevices() {
  const tableBody = document.getElementById("recycledDevicesTableBody");
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get all devices (using the same function as the inventory table)
  const devices = getDevices();

  if (devices.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4">No recycled devices found.</td></tr>`;
    return;
  }

  // Add rows to table
  devices.forEach((device) => {
    const row = createRecycledDeviceTableRow(device);
    tableBody.appendChild(row);
  });

  // Update recycled devices statistics
  updateRecycledDevicesStats(devices);

  // Initialize DataTable if jQuery is available
  if (typeof $ !== "undefined") {
    if ($.fn.dataTable.isDataTable("#recycledDevicesTable")) {
      $("#recycledDevicesTable").DataTable().destroy();
    }

    $("#recycledDevicesTable").DataTable({
      order: [[3, "desc"]], // Order by received date
      responsive: true,
      language: {
        search: "<i class='fas fa-search'></i>",
        searchPlaceholder: "Search devices...",
        paginate: {
          next: '<i class="fas fa-chevron-right"></i>',
          previous: '<i class="fas fa-chevron-left"></i>',
        },
      },
    });
  }
}

// Create table row for a recycled device
function createRecycledDeviceTableRow(device) {
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
    day: "numeric",
  });

  row.innerHTML = `
    <td>
      <div class="d-flex align-items-center">
        <i class="${deviceIcon} me-2 text-primary"></i>
        <div>
          <div class="fw-bold">${device.brand} ${device.model}</div>
          <div class="small text-muted">${device.specs.storage || "N/A"}</div>
        </div>
      </div>
    </td>
    <td><span class="badge ${categoryBadgeClass}">${device.type}</span></td>
    <td><span class="badge ${conditionBadgeClass}">${
    device.condition
  }</span></td>
    <td>${formattedDate}</td>
    <td>
      <div class="d-flex align-items-center">
        <div class="user-avatar small me-2">
          <div class="avatar-text">${device.user.firstName.charAt(
            0
          )}${device.user.lastName.charAt(0)}</div>
        </div>
        <div>
          <div class="small fw-bold">${device.user.firstName} ${
    device.user.lastName
  }</div>
          <div class="small text-muted">${device.user.email}</div>
        </div>
      </div>
    </td>
    <td>
      <span class="badge bg-success">${device.pointsAwarded || 0}</span>
    </td>
    <td>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-primary" onclick="showDeviceDetails('${
          device.id
        }')">
          <i class="fas fa-eye me-1"></i>View
        </button>
        <button class="btn btn-sm btn-outline-success" onclick="addRecycledDeviceToMarket('${
          device.id
        }')">
          <i class="fas fa-store me-1"></i>Add to Market
        </button>
      </div>
    </td>
  `;

  return row;
}

// Initialize recycled devices filters
function initializeRecycledDevicesFilters() {
  const filterButtons = document.querySelectorAll(".recycled-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filterValue = this.getAttribute("data-filter");

      // Update active state
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Apply the filter
      applyRecycledDevicesFilter(filterValue);
    });
  });

  // Set "All" filter as active by default
  const allFilterBtn = document.querySelector(
    '.recycled-filter[data-filter="all"]'
  );
  if (allFilterBtn) {
    allFilterBtn.classList.add("active");
  }
}

// Apply filter to recycled devices table
function applyRecycledDevicesFilter(filterValue) {
  const rows = document.querySelectorAll("#recycledDevicesTableBody tr");

  rows.forEach((row) => {
    const deviceType = row.getAttribute("data-device-type");

    if (
      filterValue === "all" ||
      deviceType === filterValue ||
      (filterValue === "Other" &&
        !["Smartphone", "Laptop", "Tablet"].includes(deviceType))
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Update recycled devices statistics
function updateRecycledDevicesStats(devices) {
  // Count devices by type
  const phonesCount = devices.filter((d) => d.type === "Smartphone").length;
  const laptopsCount = devices.filter((d) => d.type === "Laptop").length;
  const tabletsCount = devices.filter((d) => d.type === "Tablet").length;
  const otherCount = devices.filter(
    (d) => !["Smartphone", "Laptop", "Tablet"].includes(d.type)
  ).length;

  // Update count elements with animation
  const phoneCountEl = document.getElementById("recycledPhonesCount");
  const laptopCountEl = document.getElementById("recycledLaptopsCount");
  const tabletCountEl = document.getElementById("recycledTabletsCount");
  const otherCountEl = document.getElementById("recycledOtherCount");

  if (phoneCountEl) animateCounter(phoneCountEl, 0, phonesCount);
  if (laptopCountEl) animateCounter(laptopCountEl, 0, laptopsCount);
  if (tabletCountEl) animateCounter(tabletCountEl, 0, tabletsCount);
  if (otherCountEl) animateCounter(otherCountEl, 0, otherCount);
}

// Helper function for device icons
function getDeviceIcon(type) {
  switch (type) {
    case "Smartphone":
      return "fas fa-mobile-alt";
    case "Laptop":
      return "fas fa-laptop";
    case "Tablet":
      return "fas fa-tablet-alt";
    default:
      return "fas fa-microchip";
  }
}

// Helper function for condition badges
function getConditionBadgeClass(condition) {
  switch (condition) {
    case "Excellent":
      return "bg-success";
    case "Good":
      return "bg-info";
    case "Fair":
      return "bg-warning";
    case "Poor":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

// Function to add recycled device to market
function addRecycledDeviceToMarket(deviceId) {
  // Find the device in the inventory
  const devices = getDevices();
  const device = devices.find((d) => d.id === deviceId);

  if (!device) {
    console.error("Device not found:", deviceId);
    return;
  }

  // Check if the device is already in the market
  const marketDevices = getMarketDevices();
  const isAlreadyInMarket = marketDevices.some(
    (md) => md.originalId === deviceId
  );

  if (isAlreadyInMarket) {
    showNotification(
      "warning",
      "Already in Market",
      "This device is already listed in the market inventory."
    );
    return;
  }

  // Attach device data to the modal and show it
  const modalEl = document.getElementById("addDeviceModal");
  modalEl.dataset.device = JSON.stringify(device);

  const modal = new bootstrap.Modal(modalEl);
  if (modal) modal.show();
}

function setupModalForGenericAdd() {
  // This function prepares the modal for adding a new device from the inventory list
  populateInventoryDropdown();
}

// Open the modal for adding a device to the market with prefilled data
function setupModalForSpecificDevice(device) {
  // This function prepares the modal for a specific device, hiding the dropdown

  // Replace the dropdown with device info display
  const deviceSelectContainer = document.querySelector(
    "#addDeviceForm .col-12:first-child"
  );
  if (deviceSelectContainer) {
    deviceSelectContainer.innerHTML = `
      <div class="selected-device-info mb-3">
        <h6 class="mb-3">Device Information</h6>
        <div class="d-flex align-items-center mb-2">
          <i class="${getDeviceIcon(device.type)} text-primary me-2 fa-lg"></i>
          <div class="fw-bold">${device.brand} ${device.model}</div>
        </div>
        <div class="d-flex justify-content-between">
          <span class="badge ${getCategoryBadgeClass(device.type)}">${
      device.type
    }</span>
          <span class="badge ${getConditionBadgeClass(device.condition)}">${
      device.condition
    }</span>
          <span class="text-muted small">${device.specs.storage || ""}</span>
        </div>
        <input type="hidden" id="inventoryDeviceSelect" value="${device.id}">
      </div>
    `;
  }

  // Set a suggested price based on device condition and type
  const priceInput = document.getElementById("devicePrice");
  if (priceInput) {
    let suggestedPrice = 0;

    switch (device.type) {
      case "Smartphone":
        suggestedPrice =
          device.condition === "Excellent"
            ? 2500
            : device.condition === "Good"
            ? 1800
            : device.condition === "Fair"
            ? 1200
            : 800;
        break;
      case "Laptop":
        suggestedPrice =
          device.condition === "Excellent"
            ? 6000
            : device.condition === "Good"
            ? 4500
            : device.condition === "Fair"
            ? 3000
            : 1500;
        break;
      case "Tablet":
        suggestedPrice =
          device.condition === "Excellent"
            ? 3500
            : device.condition === "Good"
            ? 2500
            : device.condition === "Fair"
            ? 1800
            : 1000;
        break;
      default:
        suggestedPrice =
          device.condition === "Excellent"
            ? 1500
            : device.condition === "Good"
            ? 1000
            : device.condition === "Fair"
            ? 800
            : 500;
    }

    if (device.pointsAwarded) {
      suggestedPrice = Math.max(suggestedPrice, device.pointsAwarded * 2);
    }

    priceInput.value = suggestedPrice;
  }

  // Set quantity to 1 by default
  const quantityInput = document.getElementById("deviceQuantity");
  if (quantityInput) {
    quantityInput.value = 1;
  }

  // Add some default description
  const descriptionInput = document.getElementById("deviceDescription");
  if (descriptionInput) {
    descriptionInput.value = `Recycled ${device.brand} ${
      device.model
    } in ${device.condition.toLowerCase()} condition. All functionality has been tested and verified.`;
  }

  // Update the modal title and submit button for this context
  const modalTitle = document.querySelector("#addDeviceModal .modal-title");
  if (modalTitle) {
    modalTitle.innerHTML = `<i class="fas fa-store me-2"></i>Add Recycled Device to Market`;
  }
  const submitButton = document.querySelector(
    '#addDeviceModal .modal-footer button[type="submit"]'
  );
  if (submitButton) {
    submitButton.innerHTML =
      '<i class="fas fa-check-circle me-1"></i>Add to Market';
  }
}

// Helper function to show notifications
function showNotification(type, title, message) {
  // Create notification element
  const notificationEl = document.createElement("div");
  notificationEl.className = `notification notification-${type}`;
  notificationEl.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "warning"
          ? "exclamation-triangle"
          : "info-circle"
      }"></i>
    </div>
    <div class="notification-content">
      <div class="title">${title}</div>
      <div class="message">${message}</div>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;

  // Add to document
  document.body.appendChild(notificationEl);

  // Add event listener to close button
  notificationEl
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notificationEl.classList.add("notification-hiding");
      setTimeout(() => {
        notificationEl.remove();
      }, 300);
    });

  // Add the visible class to trigger animation
  setTimeout(() => {
    notificationEl.classList.add("notification-visible");
  }, 10);

  // Auto-close after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notificationEl)) {
      notificationEl.classList.add("notification-hiding");
      setTimeout(() => {
        if (document.body.contains(notificationEl)) {
          notificationEl.remove();
        }
      }, 300);
    }
  }, 5000);
}
