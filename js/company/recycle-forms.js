// Handle form submission for recycling forms
document.addEventListener("DOMContentLoaded", function () {
  // Setup shipping options for all forms on page load
  if (document.querySelector('input[name="shippingMethod"]')) {
    setupShippingOptions();
  }

  // Initialize location buttons
  setupLocationButtons();

  // Initialize tooltips
  initTooltips();

  // Initialize Google Maps if pickup section exists
  if (document.querySelector(".pickup-details")) {
    initializeMaps();
  }

  // Get all recycling forms
  const recyclePhoneForm = document.getElementById("recyclePhoneForm");
  const recycleLaptopForm = document.getElementById("recycleLaptopForm");
  const recycleKitchenForm = document.getElementById("recycleKitchenForm");
  const recycleElectronicsForm = document.getElementById(
    "recycleElectronicsForm"
  );

  // Global variable to store map instances
  let mapInstances = {};

  // Initialize Google Maps in all forms
  function initializeMaps() {
    const mapContainers = document.querySelectorAll(".location-map-container");

    if (mapContainers.length === 0) return;

    // Load Google Maps API script if not already loaded
    if (typeof google === "undefined" || typeof google.maps === "undefined") {
      const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your actual API key
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapsCallback`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Define the callback function globally
      window.initMapsCallback = function () {
        initializeMapContainers(mapContainers);
      };
    } else {
      // If API is already loaded, initialize maps directly
      initializeMapContainers(mapContainers);
    }
  }

  // Initialize each map container
  function initializeMapContainers(mapContainers) {
    mapContainers.forEach((container, index) => {
      const mapDiv = container.querySelector(".map-canvas");
      const latInput = container.querySelector(".map-lat");
      const lngInput = container.querySelector(".map-lng");
      const addressInput =
        container.parentElement.querySelector("#pickupAddress");
      const locationDisplay = container.querySelector(
        ".selected-location-display"
      );
      const formId = container.closest("form").id;

      // Default location (center of Cairo, Egypt)
      const defaultLat = 30.0444;
      const defaultLng = 31.2357;

      // Use existing values if available
      const initialLat = latInput.value
        ? parseFloat(latInput.value)
        : defaultLat;
      const initialLng = lngInput.value
        ? parseFloat(lngInput.value)
        : defaultLng;

      // Create map
      const mapOptions = {
        center: { lat: initialLat, lng: initialLng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      };

      const map = new google.maps.Map(mapDiv, mapOptions);

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Store map instance
      mapInstances[formId] = {
        map: map,
        marker: marker,
        latInput: latInput,
        lngInput: lngInput,
        locationDisplay: locationDisplay,
      };

      // Update inputs when marker is dragged
      google.maps.event.addListener(marker, "dragend", function () {
        const position = marker.getPosition();
        latInput.value = position.lat().toFixed(6);
        lngInput.value = position.lng().toFixed(6);

        // Update location display
        updateLocationDisplay(locationDisplay, position.lat(), position.lng());

        // Try to get address from coordinates
        geocodePosition(position, addressInput, locationDisplay);
      });

      // Allow clicking on map to move marker
      google.maps.event.addListener(map, "click", function (event) {
        marker.setPosition(event.latLng);
        latInput.value = event.latLng.lat().toFixed(6);
        lngInput.value = event.latLng.lng().toFixed(6);

        // Update location display
        updateLocationDisplay(
          locationDisplay,
          event.latLng.lat(),
          event.latLng.lng()
        );

        // Try to get address from coordinates
        geocodePosition(event.latLng, addressInput, locationDisplay);
      });

      // Center map on marker when container becomes visible
      // This fixes the gray map issue when the container was initially hidden
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.target.style.display !== "none" &&
            !mutation.target.classList.contains("d-none")
          ) {
            google.maps.event.trigger(map, "resize");
            map.setCenter(marker.getPosition());
          }
        });
      });

      observer.observe(container.closest(".pickup-details"), {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // Initialize location display
      updateLocationDisplay(locationDisplay, initialLat, initialLng);

      // Add current location button
      const locationButton = container.querySelector(".get-current-location");
      if (locationButton) {
        locationButton.addEventListener("click", function () {
          if (navigator.geolocation) {
            // Show loading state
            locationButton.innerHTML =
              '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            locationButton.disabled = true;

            navigator.geolocation.getCurrentPosition(
              function (position) {
                // Success callback
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Update map and marker
                const newPosition = new google.maps.LatLng(lat, lng);
                marker.setPosition(newPosition);
                map.setCenter(newPosition);
                map.setZoom(16);

                // Update inputs
                latInput.value = lat.toFixed(6);
                lngInput.value = lng.toFixed(6);

                // Update location display
                updateLocationDisplay(locationDisplay, lat, lng);

                // Try to get address from coordinates
                geocodePosition(newPosition, addressInput, locationDisplay);

                // Reset button state
                locationButton.innerHTML =
                  '<i class="fas fa-location-arrow"></i>';
                locationButton.disabled = false;
              },
              function (error) {
                // Error callback
                console.error("Geolocation error:", error);

                // Reset button state
                locationButton.innerHTML =
                  '<i class="fas fa-location-arrow"></i>';
                locationButton.disabled = false;

                // Show error message
                alert(
                  "Could not get your location. Please select it manually on the map."
                );
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          } else {
            // Geolocation not supported
            alert("Geolocation is not supported by this browser.");
          }
        });
      }

      // If address input exists, add geocoding on blur
      if (addressInput) {
        addressInput.addEventListener("blur", function () {
          if (addressInput.value.trim() !== "") {
            geocodeAddress(
              addressInput.value,
              map,
              marker,
              latInput,
              lngInput,
              locationDisplay
            );
          }
        });
      }
    });
  }

  // Update the location display with formatted coordinates
  function updateLocationDisplay(displayElement, lat, lng) {
    if (displayElement) {
      displayElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      displayElement.classList.remove("text-muted");
      displayElement.classList.add("text-success");
    }
  }

  // Get address from coordinates (reverse geocoding)
  function geocodePosition(position, addressInput, displayElement) {
    if (!google.maps.Geocoder) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: position }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const address = results[0].formatted_address;

        // Update address input if it exists and is empty or if the user allows overwriting
        if (
          addressInput &&
          (addressInput.value.trim() === "" ||
            confirm("Update the address field with the selected location?"))
        ) {
          addressInput.value = address;
        }

        // Add address to the location display
        if (displayElement) {
          displayElement.innerHTML = `<strong>${address}</strong><br>${displayElement.textContent}`;
        }
      }
    });
  }

  // Get coordinates from address (forward geocoding)
  function geocodeAddress(
    address,
    map,
    marker,
    latInput,
    lngInput,
    displayElement
  ) {
    if (!google.maps.Geocoder) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: address }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;

        // Update map and marker
        map.setCenter(location);
        map.setZoom(16);
        marker.setPosition(location);

        // Update inputs
        latInput.value = location.lat().toFixed(6);
        lngInput.value = location.lng().toFixed(6);

        // Update location display
        updateLocationDisplay(displayElement, location.lat(), location.lng());
      }
    });
  }

  // Initialize shipping options on all forms that have the shipping method selectors
  function setupShippingOptions() {
    const shippingMethods = document.querySelectorAll(
      'input[name="shippingMethod"]'
    );
    if (!shippingMethods.length) return;

    // Set initial state based on selected option
    toggleShippingDetails();

    // Add event listeners to all shipping method radios
    shippingMethods.forEach((method) => {
      method.addEventListener("change", toggleShippingDetails);
    });
  }

  // Toggle visibility of pickup and visit details based on selected method
  function toggleShippingDetails() {
    const pickupSelected = document.querySelector(
      'input[name="shippingMethod"][value="pickup"]'
    ).checked;
    const pickupDetails = document.querySelector(".pickup-details");
    const visitDetails = document.querySelector(".visit-details");

    if (pickupSelected) {
      pickupDetails.classList.remove("d-none");
      visitDetails.classList.add("d-none");

      // Make pickup fields required
      document
        .querySelectorAll(
          ".pickup-details input:not(.optional), .pickup-details .map-required"
        )
        .forEach((input) => {
          input.setAttribute("required", "");
        });

      // Resize map if it exists (fixes map rendering issues when container was hidden)
      if (Object.keys(mapInstances).length > 0) {
        setTimeout(() => {
          for (const formId in mapInstances) {
            google.maps.event.trigger(mapInstances[formId].map, "resize");
            mapInstances[formId].map.setCenter(
              mapInstances[formId].marker.getPosition()
            );
          }
        }, 100);
      }
    } else {
      pickupDetails.classList.add("d-none");
      visitDetails.classList.remove("d-none");

      // Remove required attribute from pickup fields
      document
        .querySelectorAll(
          ".pickup-details input, .pickup-details .map-required"
        )
        .forEach((input) => {
          input.removeAttribute("required");
        });
    }
  }

  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      // Save the form data to localStorage to pre-fill after login
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());
      localStorage.setItem(
        "pendingRecycleRequest",
        JSON.stringify({
          formId: form.id,
          data: formObject,
        })
      );

      // Redirect to login page
      window.location.href = "login.html?reason=quote_required";
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
    submitButton.disabled = true;

    // Simulate form submission delay
    setTimeout(() => {
      // Here you would normally send the data to a server
      console.log("Form submitted:", form.id);

      // Reset button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;

      // Show success message
      showSuccessMessage(form.id);

      // Optional: Reset the form
      form.reset();

      // Reset any specific UI elements if needed
      if (form.id === "recyclePhoneForm") {
        // e.g., reset specific select pickers or previews
      }
    }, 1500);
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
  }

  // Show success message after form submission
  function showSuccessMessage(formId) {
    // Get the form type from the form ID
    const formType = formId
      .replace("recycle", "")
      .replace("Form", "")
      .toLowerCase();

    // Get the selected shipping method
    const shippingMethod =
      document.querySelector('input[name="shippingMethod"]:checked')?.value ||
      "visit";
    const shippingText =
      shippingMethod === "pickup"
        ? "pickup from your location"
        : "drop-off at our service center";

    // Create the modal if it doesn't exist
    let modal = document.getElementById("successModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal fade";
      modal.id = "successModal";
      modal.tabIndex = "-1";
      modal.setAttribute("aria-labelledby", "successModalLabel");
      modal.setAttribute("aria-hidden", "true");

      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="successModalLabel">Request Submitted!</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="text-center mb-4">
                <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
              </div>
              <p id="successMessage" class="lead text-center"></p>
              <p id="shippingMessage" class="text-center"></p>
              <p class="text-center mt-3">You will receive a confirmation email shortly.</p>
              </div>
              <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }

    // Update modal content based on form type
    const successMessageEl = modal.querySelector("#successMessage");
    const shippingMessageEl = modal.querySelector("#shippingMessage");

    // Set the success message based on form type
    successMessageEl.textContent = `Your ${formType} recycling request has been submitted successfully!`;

    // Set the shipping message
    shippingMessageEl.textContent = `We've received your request for ${shippingText}.`;

    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  // Initialize location buttons
  function setupLocationButtons() {
    const locationButtons = document.querySelectorAll("#getCurrentLocation");

    locationButtons.forEach((button) => {
      button.addEventListener("click", function () {
        if (navigator.geolocation) {
          // Show loading state
          button.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
          button.disabled = true;

          navigator.geolocation.getCurrentPosition(
            function (position) {
              // Success callback
              const latInput = button
                .closest(".input-group")
                .querySelector("#locationLat");
              const lngInput = button
                .closest(".input-group")
                .querySelector("#locationLng");

              if (latInput && lngInput) {
                latInput.value = position.coords.latitude.toFixed(6);
                lngInput.value = position.coords.longitude.toFixed(6);
              }

              // Reset button state
              button.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
              button.disabled = false;

              // Show success feedback
              const feedbackEl = document.createElement("div");
              feedbackEl.className = "text-success mt-1 small";
              feedbackEl.innerHTML =
                '<i class="fas fa-check-circle me-1"></i>Location successfully captured';

              const existingFeedback = button
                .closest(".mb-3")
                .querySelector(".text-success, .text-danger");
              if (existingFeedback) {
                existingFeedback.remove();
              }

              button.closest(".mb-3").appendChild(feedbackEl);

              // Remove feedback after 3 seconds
              setTimeout(() => {
                feedbackEl.remove();
              }, 3000);
            },
            function (error) {
              // Error callback
              console.error("Geolocation error:", error);

              // Reset button state
              button.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
              button.disabled = false;

              // Show error feedback
              const feedbackEl = document.createElement("div");
              feedbackEl.className = "text-danger mt-1 small";

              switch (error.code) {
                case error.PERMISSION_DENIED:
                  feedbackEl.innerHTML =
                    '<i class="fas fa-exclamation-circle me-1"></i>Location permission denied';
                  break;
                case error.POSITION_UNAVAILABLE:
                  feedbackEl.innerHTML =
                    '<i class="fas fa-exclamation-circle me-1"></i>Location information unavailable';
                  break;
                case error.TIMEOUT:
                  feedbackEl.innerHTML =
                    '<i class="fas fa-exclamation-circle me-1"></i>Location request timed out';
                  break;
                default:
                  feedbackEl.innerHTML =
                    '<i class="fas fa-exclamation-circle me-1"></i>Unknown error occurred';
              }

              const existingFeedback = button
                .closest(".mb-3")
                .querySelector(".text-success, .text-danger");
              if (existingFeedback) {
                existingFeedback.remove();
              }

              button.closest(".mb-3").appendChild(feedbackEl);

              // Remove feedback after 3 seconds
              setTimeout(() => {
                feedbackEl.remove();
              }, 3000);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } else {
          // Geolocation not supported
          alert("Geolocation is not supported by this browser.");
        }
      });
    });
  }

  // Initialize Bootstrap tooltips
  function initTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
});
