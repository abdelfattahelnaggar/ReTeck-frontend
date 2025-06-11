// Customer Market Management Functions

function initCustomerMarket() {
  console.log("Customer Market section initialized.");

  loadMarketProducts();

  // Set up event listeners for search and filtering
  const searchInput = document.getElementById("marketProductSearch");
  if (searchInput) {
    searchInput.addEventListener("keyup", () =>
      loadMarketProducts(
        document.querySelector("#marketCategoryFilter .active")?.dataset
          ?.category || "all"
      )
    );
  }

  const categoryFilter = document.getElementById("marketCategoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("click", (e) => {
      if (e.target.matches("a.dropdown-item")) {
        e.preventDefault();
        const category = e.target.getAttribute("data-category");
        const activeLink = categoryFilter.querySelector(".active");
        if (activeLink) activeLink.classList.remove("active");
        e.target.classList.add("active");
        loadMarketProducts(category);

        // Update dropdown button text
        const dropdownButton = categoryFilter.previousElementSibling;
        dropdownButton.innerHTML = `<i class="fas fa-filter me-1"></i> ${e.target.textContent}`;
      }
    });
  }

  // Handle product actions using event delegation
  const productContainer = document.getElementById(
    "customerMarketProductsContainer"
  );
  if (productContainer) {
    productContainer.addEventListener("click", (event) => {
      console.log("Product container clicked", event.target);

      // Find the button that was clicked (or a child of the button)
      const editBtn = event.target.closest(".edit-product-btn");
      const deleteBtn = event.target.closest(".delete-product-btn");

      if (!editBtn && !deleteBtn) {
        console.log("No action button found in click target");
        return;
      }

      // Find the product card containing the button
      const productCard = (editBtn || deleteBtn).closest("[data-product-id]");
      if (!productCard) {
        console.error(
          "Could not find product card with data-product-id attribute"
        );
        return;
      }

      // Get the product ID from the card
      const productId = parseInt(productCard.dataset.productId, 10);
      if (isNaN(productId)) {
        console.error("Invalid product ID:", productCard.dataset.productId);
        return;
      }

      console.log("Processing action for product ID:", productId);

      try {
        if (editBtn) {
          console.log("Edit button clicked for product:", productId);
          const products = getCustomerMarketProducts();
          const productToEdit = products.find((p) => p.id === productId);
          if (productToEdit) {
            openEditProductModal(productToEdit);
          } else {
            console.error("Product not found in database:", productId);
            showNotification(
              "warning",
              "Error",
              "Could not find product data to edit."
            );
          }
        } else if (deleteBtn) {
          console.log("Delete button clicked for product:", productId);
          handleDeleteProduct(productId);
        }
      } catch (error) {
        console.error("Error processing button action:", error);
        showNotification(
          "warning",
          "Error",
          "An error occurred while processing your request."
        );
      }
    });
  } else {
    console.error("Product container element not found! Buttons won't work.");
  }

  const addProductForm = document.getElementById("addMarketProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProductSubmit);
  }

  const editProductForm = document.getElementById("editMarketProductForm");
  if (editProductForm) {
    editProductForm.addEventListener("submit", handleEditProductSubmit);
  }

  const productImageInput = document.getElementById("productImage");
  if (productImageInput) {
    productImageInput.addEventListener("change", function (e) {
      handleImagePreview(e, "productImagePreview");
    });
  }

  const editProductImageInput = document.getElementById("editProductImage");
  if (editProductImageInput) {
    editProductImageInput.addEventListener("change", function (e) {
      handleImagePreview(e, "editProductImagePreview");
    });
  }
}

function loadMarketProducts(selectedCategory = "all") {
  let products = getCustomerMarketProducts();
  // Permanently remove voucher category products
  const initialCount = products.length;
  products = products.filter((p) => p.category !== "Vouchers");
  if (products.length < initialCount) {
    saveCustomerMarketProducts(products);
  }

  const container = document.getElementById("customerMarketProductsContainer");
  if (!container) return;

  const searchTerm =
    document.getElementById("marketProductSearch")?.value.toLowerCase() || "";

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  container.innerHTML = "";
  if (filteredProducts.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center text-muted mt-4">No products found matching your criteria.</p></div>';
  } else {
    filteredProducts.forEach((product) => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
  }

  updateMarketStats(products);
  populateCategoryFilter(products);
}

function createProductCard(product) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 col-xl-3 mb-4 d-flex align-items-stretch";
  col.dataset.productId = product.id;

  let stockBadgeClass = "in-stock";
  let stockText = `In Stock (${product.stock})`;
  if (product.stock === 0) {
    stockBadgeClass = "out-of-stock";
    stockText = "Out of Stock";
  } else if (product.stock < 10) {
    stockBadgeClass = "low-stock";
    stockText = `Low Stock (${product.stock})`;
  }

  col.innerHTML = `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${
                  product.image ||
                  "https://placehold.co/600x400/cccccc/ffffff?text=No+Image"
                }" alt="${product.name}" class="product-image">
                <div class="product-stock-badge ${stockBadgeClass}">${stockText}</div>
            </div>
            <div class="product-details">
                <div class="product-category">${product.category}</div>
                <h6 class="product-name">${product.name}</h6>
                <p class="product-description">${
                  product.description || "No description available."
                }</p>
                <div class="product-price">EGP ${product.price.toLocaleString()}</div>
            </div>
            <div class="product-actions">
                <button class="btn btn-sm btn-primary edit-product-btn"><i class="fas fa-edit me-1"></i>Edit</button>
                <button class="btn btn-sm btn-danger delete-product-btn"><i class="fas fa-trash me-1"></i>Delete</button>
            </div>
        </div>
    `;

  // Event listeners are now handled by delegation in initCustomerMarket
  return col;
}

function updateMarketStats(products) {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const categories = new Set(products.map((p) => p.category)).size;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  if (document.getElementById("marketTotalProducts"))
    animateCounter(
      document.getElementById("marketTotalProducts"),
      0,
      totalProducts
    );
  if (document.getElementById("marketTotalValue"))
    document.getElementById("marketTotalValue").textContent = `${Math.round(
      totalValue / 1000
    )}k`;
  if (document.getElementById("marketCategoriesCount"))
    animateCounter(
      document.getElementById("marketCategoriesCount"),
      0,
      categories
    );
  if (document.getElementById("marketOutOfStock"))
    animateCounter(document.getElementById("marketOutOfStock"), 0, outOfStock);
}

function populateCategoryFilter(products) {
  const filterMenu = document.getElementById("marketCategoryFilter");
  if (!filterMenu) return;
  const existingCategories = new Set(
    [...filterMenu.querySelectorAll("a.dropdown-item")].map(
      (a) => a.dataset.category
    )
  );
  const newCategories = new Set(products.map((p) => p.category));

  newCategories.forEach((category) => {
    if (!existingCategories.has(category)) {
      const li = document.createElement("li");
      li.innerHTML = `<a class="dropdown-item" href="#" data-category="${category}">${category}</a>`;
      filterMenu.appendChild(li);
    }
  });
}

function getCustomerMarketProducts() {
  const dummyProducts = [
    {
      id: 3,
      name: "Wireless Mouse",
      category: "Accessories",
      price: 450,
      stock: 50,
      description: "Ergonomic wireless mouse with long battery life.",
      image: "../images/mouse.png",
    },
    {
      id: 4,
      name: "Bluetooth Speaker",
      category: "Electronics",
      price: 800,
      stock: 30,
      description: "Portable and waterproof Bluetooth speaker with rich bass.",
      image: "../images/speaker.png",
    },
    {
      id: 5,
      name: "Ergonomic Keyboard",
      category: "Accessories",
      price: 1200,
      stock: 20,
      description: "Split ergonomic keyboard for comfortable typing.",
      image: "../images/keyboard.png",
    },
    {
      id: 6,
      name: "10,000mAh Power Bank",
      category: "Accessories",
      price: 600,
      stock: 40,
      description: "Slim and fast-charging power bank for all your devices.",
      image: "../images/powerbank.png",
    },
    {
      id: 7,
      name: "HD Webcam",
      category: "Electronics",
      price: 950,
      stock: 18,
      description: "1080p HD webcam with built-in microphone for clear calls.",
      image: "../images/webcam.png",
    },
    {
      id: 8,
      name: "Laptop Stand",
      category: "Accessories",
      price: 400,
      stock: 35,
      description: "Adjustable aluminum laptop stand to improve posture.",
      image: "../images/laptopstand.png",
    },
  ];

  try {
    const storedProducts = localStorage.getItem("customerMarketProducts");
    return storedProducts ? JSON.parse(storedProducts) : dummyProducts;
  } catch (e) {
    return dummyProducts;
  }
}

function saveCustomerMarketProducts(products) {
  localStorage.setItem("customerMarketProducts", JSON.stringify(products));
}

function handleAddProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const newProduct = {
    id: Date.now(),
    name: form.elements.productName.value,
    category: form.elements.productCategory.value,
    price: parseFloat(form.elements.productPrice.value),
    stock: parseInt(form.elements.productStock.value),
    description: form.elements.productDescription.value,
    image: document.getElementById("productImagePreview").src,
  };

  const products = getCustomerMarketProducts();
  products.push(newProduct);
  saveCustomerMarketProducts(products);

  loadMarketProducts();
  bootstrap.Modal.getInstance(
    document.getElementById("addMarketProductModal")
  ).hide();
  showNotification(
    "success",
    "Product Added",
    `${newProduct.name} has been successfully added.`
  );
}

function handleEditProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const productId = parseInt(form.elements.editProductId.value);
  const products = getCustomerMarketProducts();
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex > -1) {
    products[productIndex] = {
      ...products[productIndex],
      name: form.elements.editProductName.value,
      category: form.elements.editProductCategory.value,
      price: parseFloat(form.elements.editProductPrice.value),
      stock: parseInt(form.elements.editProductStock.value),
      description: form.elements.editProductDescription.value,
      image: document.getElementById("editProductImagePreview").src,
    };
    saveCustomerMarketProducts(products);
    loadMarketProducts();
    bootstrap.Modal.getInstance(
      document.getElementById("editMarketProductModal")
    ).hide();
    showNotification(
      "success",
      "Product Updated",
      `Product details have been saved.`
    );
  }
}

function openEditProductModal(product) {
  try {
    console.log("Opening edit modal for product:", product);

    const modalElement = document.getElementById("editMarketProductModal");
    if (!modalElement) {
      console.error("Edit modal element not found");
      showNotification(
        "warning",
        "Error",
        "Could not open edit form. Please refresh the page."
      );
      return;
    }

    const form = document.getElementById("editMarketProductForm");
    if (!form) {
      console.error("Edit form not found");
      showNotification(
        "warning",
        "Error",
        "Could not find edit form. Please refresh the page."
      );
      return;
    }

    // Set form values
    form.elements.editProductId.value = product.id;
    form.elements.editProductName.value = product.name || "";
    form.elements.editProductCategory.value = product.category || "Other"; // Default to Other if empty
    form.elements.editProductPrice.value = product.price || 0;
    form.elements.editProductStock.value = product.stock || 0;
    form.elements.editProductDescription.value = product.description || "";

    // Handle image preview
    const preview = document.getElementById("editProductImagePreview");
    if (preview) {
      preview.src = product.image || "";
      preview.style.display = product.image ? "block" : "none";
    }

    // Create and show the modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    console.log("Edit modal opened successfully");
  } catch (error) {
    console.error("Error opening edit modal:", error);
    showNotification(
      "warning",
      "Error",
      "An error occurred while opening the edit form."
    );
  }
}

function handleDeleteProduct(productId) {
  try {
    console.log("Handling delete for product ID:", productId);

    if (!productId) {
      console.error("Invalid product ID for deletion");
      showNotification("warning", "Error", "Invalid product ID");
      return;
    }

    // Get product information
    let products = getCustomerMarketProducts();
    const productToDelete = products.find((p) => p.id === productId);

    if (!productToDelete) {
      console.warn("Product not found for deletion:", productId);
      showNotification(
        "warning",
        "Warning",
        "Product was not found in the database."
      );
      return;
    }

    // Create or get deletion confirmation modal
    let deleteModal = document.getElementById("deleteProductModal");

    // If modal doesn't exist, create it
    if (!deleteModal) {
      deleteModal = document.createElement("div");
      deleteModal.className = "modal fade";
      deleteModal.id = "deleteProductModal";
      deleteModal.setAttribute("tabindex", "-1");
      deleteModal.setAttribute("aria-hidden", "true");

      deleteModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-trash-alt me-2"></i>
                <span id="deleteModalTitle">Confirm Deletion</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-3">
                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
              </div>
              <p class="text-center" id="deleteModalMessage">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div class="alert alert-secondary mt-3">
                <div class="d-flex align-items-center">
                  <div class="product-mini-image me-3">
                    <img id="deleteModalImage" src="" alt="Product" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                  </div>
                  <div>
                    <div id="deleteModalProductName" class="fw-bold"></div>
                    <div id="deleteModalProductCategory" class="small text-muted"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-1"></i>Cancel
              </button>
              <button type="button" id="confirmDeleteBtn" class="btn btn-danger">
                <i class="fas fa-trash-alt me-1"></i>Delete Product
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(deleteModal);
    }

    // Set modal content for current product
    document.getElementById("deleteModalProductName").textContent =
      productToDelete.name;
    document.getElementById("deleteModalProductCategory").textContent =
      productToDelete.category;

    const modalImage = document.getElementById("deleteModalImage");
    modalImage.src =
      productToDelete.image ||
      "https://placehold.co/60x60/cccccc/ffffff?text=No+Image";

    // Initialize the modal
    const bsModal = new bootstrap.Modal(deleteModal);

    // Remove any existing event listener on the delete button
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add click event to the confirm button
    newConfirmBtn.addEventListener("click", () => {
      // Filter out the product to delete
      const filteredProducts = products.filter((p) => p.id !== productId);

      // Save the updated products list
      saveCustomerMarketProducts(filteredProducts);

      // Hide the modal
      bsModal.hide();

      // Reload the products display
      loadMarketProducts();

      // Show success notification
      showNotification(
        "success",
        "Product Deleted",
        `${productToDelete.name} has been removed from the market.`
      );
    });

    // Show the modal
    bsModal.show();
  } catch (error) {
    console.error("Error during product deletion:", error);
    showNotification(
      "warning",
      "Error",
      "An error occurred while deleting the product."
    );
  }
}

// Generic function to handle image preview for both add and edit modals
function handleImagePreview(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);

  if (file && file.type.match("image.*")) {
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };

    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}

window.initCustomerMarket = initCustomerMarket;

// Helper function to show notifications if not available globally
function showNotification(type, title, message) {
  if (typeof window.showNotification === "function") {
    // Use the global function if it exists
    window.showNotification(type, title, message);
  } else {
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
          if (document.body.contains(notificationEl)) {
            notificationEl.remove();
          }
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
}
