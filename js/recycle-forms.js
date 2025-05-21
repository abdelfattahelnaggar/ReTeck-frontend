// Handle form submission for recycling forms
document.addEventListener("DOMContentLoaded", function () {
  // Get all recycling forms
  const recyclePhoneForm = document.getElementById("recyclePhoneForm");
  const recycleLaptopForm = document.getElementById("recycleLaptopForm");
  const recycleKitchenForm = document.getElementById("recycleKitchenForm");
  const recycleElectronicsForm = document.getElementById(
    "recycleElectronicsForm"
  );

  // Form submission handler
  function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const formObject = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      formObject[key] = value;
    }

    // Get checkboxes data (they won't appear in FormData if not checked)
    const checkboxes = event.target.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox.id !== "termsAgreed") {
        // Exclude terms agreement checkbox
        formObject[checkbox.id] = checkbox.checked;
      }
    });

    // Log form data (would be sent to server in production)
    console.log("Form data:", formObject);

    // Show success message
    const formType = event.target.id.replace("recycle", "").replace("Form", "");
    showSuccessMessage(formType);
  }

  // Register form submit handlers if form exists on page
  if (recyclePhoneForm) {
    recyclePhoneForm.addEventListener("submit", handleFormSubmit);
  }

  if (recycleLaptopForm) {
    recycleLaptopForm.addEventListener("submit", handleFormSubmit);
  }

  if (recycleKitchenForm) {
    recycleKitchenForm.addEventListener("submit", handleFormSubmit);
  }

  if (recycleElectronicsForm) {
    recycleElectronicsForm.addEventListener("submit", handleFormSubmit);

    // Additional for electronics form: handle pickup/dropoff toggle
    const pickupRadio = document.getElementById("pickup");
    const dropOffRadio = document.getElementById("dropOff");
    const pickupDetails = document.getElementById("pickupDetails");

    if (pickupRadio && dropOffRadio && pickupDetails) {
      function togglePickupDetails() {
        if (pickupRadio.checked) {
          pickupDetails.classList.remove("d-none");
          document.querySelectorAll("#pickupDetails input").forEach((input) => {
            if (input.id !== "addressLine2") {
              input.required = true;
            }
          });
        } else {
          pickupDetails.classList.add("d-none");
          document.querySelectorAll("#pickupDetails input").forEach((input) => {
            input.required = false;
          });
        }
      }

      pickupRadio.addEventListener("change", togglePickupDetails);
      dropOffRadio.addEventListener("change", togglePickupDetails);
    }
  }

  // Show success message after form submission
  function showSuccessMessage(deviceType) {
    // Create modal if it doesn't exist
    if (!document.getElementById("successModal")) {
      const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="successModalLabel">Recycling Request Submitted</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="text-center mb-4">
                  <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                  <h4>Thank You!</h4>
                  <p id="successMessage">Your recycling request has been submitted successfully.</p>
                </div>
                <p>What happens next?</p>
                <ul>
                  <li>You'll receive a confirmation email shortly</li>
                  <li>Our team will review your submission</li>
                  <li>We'll contact you within 1-2 business days with next steps</li>
                </ul>
              </div>
              <div class="modal-footer">
                <a href="index.html" class="btn btn-secondary">Return to Home</a>
                <button type="button" class="btn btn-success" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
    }

    // Update message based on device type
    const successMessage = document.getElementById("successMessage");
    if (successMessage) {
      switch (deviceType) {
        case "Phone":
          successMessage.textContent =
            "Your phone recycling request has been submitted successfully. We will send you a quote shortly.";
          break;
        case "Laptop":
          successMessage.textContent =
            "Your laptop recycling request has been submitted successfully. We will send you a quote shortly.";
          break;
        case "Kitchen":
          successMessage.textContent =
            "Your kitchen appliance recycling request has been submitted successfully. We will contact you to arrange pickup.";
          break;
        case "Electronics":
          successMessage.textContent =
            "Your electronics recycling request has been submitted successfully. We will process your request shortly.";
          break;
        default:
          successMessage.textContent =
            "Your recycling request has been submitted successfully.";
      }
    }

    // Show the modal
    const successModal = new bootstrap.Modal(
      document.getElementById("successModal")
    );
    successModal.show();
  }
});
