// Customer Market Management Functions

function initCustomerMarket() {
  console.log("Customer Market section initialized.");
  loadCustomerMarketProducts();

  const addMarketProductForm = document.getElementById("addMarketProductForm");
  if (addMarketProductForm) {
    addMarketProductForm.addEventListener(
      "submit",
      handleAddMarketProductSubmit
    );
  }

  const productImageInput = document.getElementById("productImage");
  const productImagePreview = document.getElementById("productImagePreview");

  if (productImageInput && productImagePreview) {
    productImageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          productImagePreview.src = e.target.result;
          productImagePreview.style.display = "block";
        };
        reader.readAsDataURL(this.files[0]);
      } else {
        productImagePreview.src = "#";
        productImagePreview.style.display = "none";
      }
    });
  }

  const addMarketProductModal = document.getElementById(
    "addMarketProductModal"
  );
  if (addMarketProductModal) {
    addMarketProductModal.addEventListener("hidden.bs.modal", function () {
      if (addMarketProductForm) {
        addMarketProductForm.reset();
      }
      if (productImagePreview) {
        productImagePreview.src = "#";
        productImagePreview.style.display = "none";
      }
    });
  }
}

function loadCustomerMarketProducts() {
  const tableBody = document.getElementById("customerMarketTableBody");
  if (!tableBody) return;

  const products = getCustomerMarketProducts();
  tableBody.innerHTML = ""; // Clear existing rows

  if (products.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">No products found in the customer market.</td></tr>';
    return;
  }

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${
                      product.image || "https://placehold.co/60x60?text=Product"
                    }" class="me-3" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;" alt="${
      product.name
    }">
                    <div>
                        <div class="fw-bold">${product.name}</div>
                        <div class="small text-muted">${(
                          product.description || ""
                        ).substring(0, 30)}...</div>
                    </div>
                </div>
            </td>
            <td>${product.category}</td>
            <td><i class="fas fa-tag text-success me-1"></i>EGP ${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editMarketProduct('${
                  product.id
                }')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMarketProduct('${
                  product.id
                }')"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function getCustomerMarketProducts() {
  const products = localStorage.getItem("customerMarketProducts");
  if (products) {
    return JSON.parse(products);
  }

  // Dummy data if nothing in localStorage
  const dummyProducts = [
    {
      id: "CMP_1",
      name: "HyperOne 100 EGP Voucher",
      category: "Vouchers",
      price: 1000,
      stock: 50,
      description: "A 100 EGP voucher for any HyperOne store.",
      image: "../images/hyperone-logo.png",
    },
    {
      id: "CMP_2",
      name: "Premium Phone Case",
      category: "Accessories",
      price: 500,
      stock: 100,
      description: "A high-quality protective case for smartphones.",
      image: "https://placehold.co/400x400?text=Phone+Case",
    },
    {
      id: "CMP_3",
      name: "Wireless Earbuds",
      category: "Electronics",
      price: 2500,
      stock: 30,
      description: "Bluetooth 5.2 earbuds with noise cancellation.",
      image: "https://placehold.co/400x400?text=Earbuds",
    },
  ];
  localStorage.setItem("customerMarketProducts", JSON.stringify(dummyProducts));
  return dummyProducts;
}

function handleAddMarketProductSubmit(event) {
  event.preventDefault();
  const form = event.target;

  const productImagePreview = document.getElementById("productImagePreview");
  let imageSrc = "../images/placeholder-product.png"; // Default placeholder
  if (
    productImagePreview &&
    productImagePreview.src &&
    !productImagePreview.src.endsWith("#")
  ) {
    imageSrc = productImagePreview.src;
  }

  const newProduct = {
    id: `CMP_${Date.now()}`,
    name: form.elements.productName.value,
    category: form.elements.productCategory.value,
    price: parseInt(form.elements.productPrice.value),
    stock: parseInt(form.elements.productStock.value),
    description: form.elements.productDescription.value,
    image: imageSrc,
  };

  const products = getCustomerMarketProducts();
  products.push(newProduct);
  localStorage.setItem("customerMarketProducts", JSON.stringify(products));

  loadCustomerMarketProducts(); // Refresh table

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addMarketProductModal")
  );
  modal.hide();
  form.reset();
}

// Placeholder for edit/delete
function editMarketProduct(productId) {
  const products = getCustomerMarketProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    console.error("Product not found for editing:", productId);
    return;
  }

  // Populate the modal with product data
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductCategory").value = product.category;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock;
  document.getElementById("editProductDescription").value = product.description;

  const imagePreview = document.getElementById("editProductImagePreview");
  imagePreview.src = product.image || "#";
  imagePreview.style.display = product.image ? "block" : "none";

  // Show the modal
  const editModal = new bootstrap.Modal(
    document.getElementById("editMarketProductModal")
  );
  editModal.show();

  // Handle image preview for the edit modal
  const editImageInput = document.getElementById("editProductImage");
  editImageInput.onchange = function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(this.files[0]);
    }
  };
}

// Handle the submission of the edit form
const editMarketProductForm = document.getElementById("editMarketProductForm");
if (editMarketProductForm) {
  editMarketProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const productId = document.getElementById("editProductId").value;
    const products = getCustomerMarketProducts();
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      console.error("Product to update not found:", productId);
      return;
    }

    const imagePreview = document.getElementById("editProductImagePreview");

    // Update product details
    products[productIndex].name =
      document.getElementById("editProductName").value;
    products[productIndex].category = document.getElementById(
      "editProductCategory"
    ).value;
    products[productIndex].price = parseInt(
      document.getElementById("editProductPrice").value
    );
    products[productIndex].stock = parseInt(
      document.getElementById("editProductStock").value
    );
    products[productIndex].description = document.getElementById(
      "editProductDescription"
    ).value;
    if (imagePreview.src && !imagePreview.src.endsWith("#")) {
      products[productIndex].image = imagePreview.src;
    }

    // Save back to localStorage
    localStorage.setItem("customerMarketProducts", JSON.stringify(products));

    // Refresh the table and hide the modal
    loadCustomerMarketProducts();
    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editMarketProductModal")
    );
    editModal.hide();
  });
}

function deleteMarketProduct(productId) {
  const products = getCustomerMarketProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const title = "Confirm Deletion";
  const message = `Are you sure you want to delete the product: <strong>${product.name}</strong>? This action cannot be undone.`;

  showConfirmationModal(title, message, () => {
    const updatedProducts = getCustomerMarketProducts().filter(
      (p) => p.id !== productId
    );
    localStorage.setItem(
      "customerMarketProducts",
      JSON.stringify(updatedProducts)
    );
    loadCustomerMarketProducts(); // Refresh table
  });
}

window.initCustomerMarket = initCustomerMarket;
window.editMarketProduct = editMarketProduct;
window.deleteMarketProduct = deleteMarketProduct;
