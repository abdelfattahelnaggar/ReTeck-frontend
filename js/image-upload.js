// Handle image upload and preview
document.addEventListener("DOMContentLoaded", function () {
  const imageUpload = document.getElementById("deviceImages");
  const previewContainer = document.getElementById("imagePreviewContainer");

  if (imageUpload && previewContainer) {
    imageUpload.addEventListener("change", function () {
      // Clear previous previews
      previewContainer.innerHTML = "";

      // Check if files were selected
      if (this.files && this.files.length > 0) {
        // Limit to 5 images
        const filesToPreview = Array.from(this.files).slice(0, 5);

        filesToPreview.forEach((file) => {
          if (!file.type.match("image.*")) {
            return; // Skip non-image files
          }

          const reader = new FileReader();

          reader.onload = function (e) {
            // Compress image before preview and storage
            compressImage(e.target.result, 800, 0.7).then((compressedImage) => {
              const previewDiv = document.createElement("div");
              previewDiv.className = "position-relative";

              const img = document.createElement("img");
              img.src = compressedImage;
              img.className = "img-thumbnail";
              img.style.width = "100px";
              img.style.height = "100px";
              img.style.objectFit = "cover";
              img.loading = "lazy";
              img.dataset.imageData = compressedImage; // Store compressed image data

              const removeBtn = document.createElement("button");
              removeBtn.type = "button";
              removeBtn.className =
                "btn btn-sm btn-danger position-absolute top-0 end-0";
              removeBtn.innerHTML = "&times;";
              removeBtn.style.fontSize = "12px";
              removeBtn.style.padding = "0 5px";

              removeBtn.addEventListener("click", function () {
                previewDiv.remove();
              });

              previewDiv.appendChild(img);
              previewDiv.appendChild(removeBtn);
              previewContainer.appendChild(previewDiv);
            });
          };

          reader.readAsDataURL(file);
        });

        // Add a message if more than 5 files were selected
        if (this.files.length > 5) {
          const message = document.createElement("p");
          message.className = "text-danger small mt-2";
          message.textContent =
            "Note: Only the first 5 images will be uploaded.";
          previewContainer.appendChild(message);
        }
      }
    });
  }

  // Handle form submissions
  const recycleForms = [
    document.getElementById("recyclePhoneForm"),
    document.getElementById("recycleLaptopForm"),
    document.getElementById("recycleKitchenForm"),
    document.getElementById("recycleElectronicsForm"),
  ];

  recycleForms.forEach((form) => {
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Collect image data before modal shows
        const imageData = [];
        if (previewContainer) {
          const images = previewContainer.querySelectorAll("img");
          images.forEach((img) => {
            if (img.dataset.imageData) {
              imageData.push(img.dataset.imageData);
            }
          });
        }

        // Show warning/confirmation dialog before submitting
        const warningBackdrop = document.createElement("div");
        warningBackdrop.className = "modal-backdrop fade show";
        document.body.appendChild(warningBackdrop);

        // Get device type for the message
        let deviceType = "device";
        if (form.id === "recyclePhoneForm") deviceType = "phone";
        else if (form.id === "recycleLaptopForm") deviceType = "laptop";
        else if (form.id === "recycleKitchenForm")
          deviceType = "kitchen appliance";
        else if (form.id === "recycleElectronicsForm")
          deviceType = "electronic device";

        // Create warning modal HTML
        const warningModalHTML = `
          <div class="modal fade show" id="warningModal" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                  <h5 class="modal-title">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Important Notice
                  </h5>
                  <button type="button" class="btn-close" id="closeWarningBtn" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-4">
                    <h5 class="mb-3">Please confirm your submission</h5>
                    <div class="alert alert-warning">
                      <i class="fas fa-exclamation-circle me-2"></i>
                      <strong>Warning:</strong> If the actual condition of your ${deviceType} does not match the information provided, we reserve the right to reject the device or provide a revised quote.
                    </div>
                    <p>By proceeding, you confirm that:</p>
                    <ul>
                      <li>All information provided about your ${deviceType} is accurate and truthful</li>
                      <li>The condition description matches the actual state of your device</li>
                      <li>You understand that misrepresentation may result in your device being returned or a reduced offer</li>
                    </ul>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" id="cancelSubmitBtn">Cancel</button>
                  <button type="button" class="btn btn-success" id="confirmSubmitBtn">
                    <i class="fas fa-check me-2"></i>Confirm & Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        const warningContainer = document.createElement("div");
        warningContainer.innerHTML = warningModalHTML;
        document.body.appendChild(warningContainer);
        document.body.classList.add("modal-open");

        // Handle cancel button click
        document
          .getElementById("cancelSubmitBtn")
          .addEventListener("click", function () {
            document.body.removeChild(warningContainer);
            document.body.removeChild(warningBackdrop);
            document.body.classList.remove("modal-open");
          });

        // Handle close button click
        document
          .getElementById("closeWarningBtn")
          .addEventListener("click", function () {
            document.body.removeChild(warningContainer);
            document.body.removeChild(warningBackdrop);
            document.body.classList.remove("modal-open");
          });

        // Handle confirm button click
        document
          .getElementById("confirmSubmitBtn")
          .addEventListener("click", function () {
            // Remove warning modal
            document.body.removeChild(warningContainer);
            document.body.removeChild(warningBackdrop);

            // Continue with submission process
            // Create modal backdrop
            const backdropEl = document.createElement("div");
            backdropEl.className = "modal-backdrop fade show";
            document.body.appendChild(backdropEl);

            // Create modal dialog
            const modalHTML = `
            <div class="modal fade show" id="successModal" tabindex="-1" style="display: block;">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-check-circle me-2"></i>
                      Request Submitted
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="text-center mb-4">
                      <div class="bg-light p-3 rounded-circle d-inline-block mb-3">
                        <i class="fas fa-envelope fa-3x text-success"></i>
                      </div>
                      <h4>Thank you for your submission!</h4>
                      <p>Your request has been received. We will review your information and send you a quote via email soon.</p>
                      <div class="alert alert-info mt-3">
                        <i class="fas fa-info-circle me-2"></i>
                        Please check your email inbox within the next 24-48 hours. Be sure to check your spam folder if you don't receive our email.
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-success" id="closeModalBtn">Close</button>
                  </div>
                </div>
              </div>
            </div>
          `;

            const modalContainer = document.createElement("div");
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);
            document.body.classList.add("modal-open");

            // Save data to localStorage
            saveQuoteRequestToLocalStorage(form, imageData);

            // Handle close button click
            document
              .getElementById("closeModalBtn")
              .addEventListener("click", function () {
                document.body.removeChild(modalContainer);
                document.body.removeChild(backdropEl);
                document.body.classList.remove("modal-open");
                form.reset(); // Reset the form

                // Clear image previews
                if (previewContainer) {
                  previewContainer.innerHTML = "";
                }

                // Redirect to home page
                setTimeout(() => {
                  window.location.href = "profile.html";
                }, 500);
              });

            // Also close when clicking the X button
            modalContainer
              .querySelector(".btn-close")
              .addEventListener("click", function () {
                document.body.removeChild(modalContainer);
                document.body.removeChild(backdropEl);
                document.body.classList.remove("modal-open");
                form.reset(); // Reset the form

                // Clear image previews
                if (previewContainer) {
                  previewContainer.innerHTML = "";
                }
              });
          });
      });
    }
  });
});

// Function to save quote request to local storage
function saveQuoteRequestToLocalStorage(form, imageData) {
  // Get user email from localStorage
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    showToast("Please log in to submit a recycling request", "warning");
    return;
  }

  // Get current user data
  let userData = JSON.parse(
    localStorage.getItem(`userData_${userEmail}`) || "{}"
  );

  // Initialize user data if not exists
  if (!userData.recycleRequests) {
    userData.recycleRequests = [];
  }

  // Determine form type and extract relevant data
  let type = "";
  let device = "";
  let condition = "";

  if (form.id === "recyclePhoneForm") {
    type = "Phone";
    const brandSelect = document.getElementById("brand");
    const brand = brandSelect.options[brandSelect.selectedIndex].text;
    const model = document.getElementById("model").value;
    device = `${brand} ${model}`;

    const conditionSelect = document.getElementById("condition");
    condition = conditionSelect.options[conditionSelect.selectedIndex].text;
  } else if (form.id === "recycleLaptopForm") {
    type = "Laptop";
    const brandSelect = document.getElementById("brand");
    const brand = brandSelect.options[brandSelect.selectedIndex].text;
    const model = document.getElementById("model").value;
    device = `${brand} ${model}`;

    const conditionSelect = document.getElementById("condition");
    condition = conditionSelect.options[conditionSelect.selectedIndex].text;
  } else if (form.id === "recycleKitchenForm") {
    type = "Kitchen";
    const applianceTypeSelect = document.getElementById("applianceType");
    const applianceType =
      applianceTypeSelect.options[applianceTypeSelect.selectedIndex].text;
    const brand = document.getElementById("brand").value;
    device = `${brand} ${applianceType}`;

    const conditionSelect = document.getElementById("condition");
    condition = conditionSelect.options[conditionSelect.selectedIndex].text;
  } else if (form.id === "recycleElectronicsForm") {
    type = "Electronics";
    const deviceTypeSelect = document.getElementById("deviceType");
    const deviceType =
      deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
    const brand = document.getElementById("brand").value;
    device = `${brand} ${deviceType}`;

    const conditionSelect = document.getElementById("condition");
    condition = conditionSelect.options[conditionSelect.selectedIndex].text;
  }

  // Create quote request object with unique ID
  const quoteRequest = {
    id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: type,
    device: device,
    date: new Date().toISOString(),
    status: "Pending",
    quote: null,
    details: {
      condition: condition,
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      zipCode: document.getElementById("zipCode").value,
      description: document.getElementById("description").value,
      images: imageData,
    },
  };

  // Add to user data
  userData.recycleRequests.unshift(quoteRequest); // Add to beginning of array

  // Update profile data if email matches or profile email is empty
  if (
    !userData.profile ||
    !userData.profile.email ||
    userData.profile.email === quoteRequest.details.email
  ) {
    if (!userData.profile) {
      userData.profile = {};
    }
    userData.profile.email = quoteRequest.details.email;
    userData.profile.phone = quoteRequest.details.phone;

    // Parse name
    const fullNameParts = quoteRequest.details.fullName.split(" ");
    if (fullNameParts.length > 1) {
      userData.profile.firstName = fullNameParts[0];
      userData.profile.lastName = fullNameParts.slice(1).join(" ");
    } else {
      userData.profile.firstName = fullNameParts[0];
    }
  }

  // Save to local storage
  localStorage.setItem(`userData_${userEmail}`, JSON.stringify(userData));

  // Show success message
  showToast("Recycling request submitted successfully!", "success");
}

/**
 * Compress image to reduce file size
 * @param {string} src - Image data URL
 * @param {number} maxWidth - Maximum width of the compressed image
 * @param {number} quality - Image quality (0 to 1)
 * @returns {Promise<string>} - Compressed image data URL
 */
function compressImage(src, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Get compressed image data
      const compressedImage = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedImage);
    };

    img.onerror = (error) => reject(error);
  });
}
